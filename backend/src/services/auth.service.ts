import { randomUUID } from "node:crypto";
import type { EntityManager } from "typeorm";
import { QueryFailedError } from "typeorm";

import { AppDataSource } from "../config/data-source.js";
import { RefreshSession } from "../entities/RefreshSession.js";
import { User } from "../entities/User.js";
import { AppError } from "../errors/AppError.js";
import type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "../validation/auth.schema.js";
import { bcryptCompare, bcryptHash, sha256Hash } from "../utils/hash.util.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "./token.service.js";
import type { UserRole } from "../types/user.js";

const sessionRepository = AppDataSource.getRepository(RefreshSession);
const userRepository = AppDataSource.getRepository(User);

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  profileImageUrl: string | null;
}

export function toSafeUser(user: User): SafeUser {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: fullName || user.userName,
    email: user.email,
    role: user.role,
    phone: user.phone ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
  };
}

export async function createSession(
  manager: EntityManager,
  user: User,
): Promise<{ accessToken: string; refreshToken: string }> {
  const sessionId = randomUUID();
  const refreshToken = createRefreshToken(user.id, sessionId);
  const accessToken = createAccessToken({ id: user.id, role: user.role });

  await manager.save(
    manager.create(RefreshSession, {
      id: sessionId,
      userId: user.id,
      tokenHash: sha256Hash(refreshToken.token),
      expiresAt: refreshToken.expiresAt,
      revokedAt: null,
    }),
  );

  return { accessToken, refreshToken: refreshToken.token };
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string } | undefined)?.code === "ER_DUP_ENTRY"
  );
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().replace(/\s+/g, " ").split(" ");
  const firstName = parts[0] ?? "User";
  const lastName = parts.slice(1).join(" ");

  return { firstName, lastName };
}

function usernameFromEmail(email: string): string {
  const base = email.split("@")[0]?.replace(/[^a-zA-Z0-9._-]/g, "") || "user";

  return base.slice(0, 90);
}

export async function registerUser(input: RegisterInput): Promise<User> {
  const email = input.email.toLowerCase();

  const existing = await userRepository.findOne({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const { firstName, lastName } = splitName(input.name);
  const passwordHash = await bcryptHash(input.password);

  const user = userRepository.create({
    firstName,
    lastName,
    userName: usernameFromEmail(email),
    email,
    passwordHash,
    role: "CUSTOMER",
    status: "ACTIVE",
  });

  try {
    return await userRepository.save(user);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError("An account with this email already exists", 409);
    }

    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<User> {
  const user = await userRepository.findOne({
    where: { email: input.email.toLowerCase(), isRemoved: false },
  });

  if (!user || user.passwordHash.length === 0) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcryptCompare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("This account is not active", 403);
  }

  return user;
}

export async function getUserById(id: string): Promise<User> {
  const user = await userRepository.findOne({
    where: { id, isRemoved: false },
  });

  if (!user) {
    throw new AppError("Authentication required", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("This account is not active", 403);
  }

  return user;
}

export async function rotateSession(
  token: string,
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const payload = verifyRefreshToken(token);

  return AppDataSource.transaction(async (manager) => {
    const session = await manager.findOne(RefreshSession, {
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        isRemoved: false,
      },
    });

    if (!session || session.revokedAt !== null) {
      throw new AppError("Invalid refresh token", 401);
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new AppError("Refresh token has expired", 401);
    }

    const user = await manager.findOne(User, {
      where: { id: payload.sub, isRemoved: false },
    });

    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("This account is not active", 403);
    }

    session.revokedAt = new Date();
    await manager.save(session);

    const tokens = await createSession(manager, user);

    return { user, ...tokens };
  });
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!token) {
    return;
  }

  let payload: ReturnType<typeof verifyRefreshToken>;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    return;
  }

  const session = await sessionRepository.findOne({
    where: {
      id: payload.sessionId,
      userId: payload.sub,
      isRemoved: false,
    },
  });

  if (session && session.revokedAt === null) {
    session.revokedAt = new Date();
    await sessionRepository.save(session);
  }
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<User> {
  const user = await getUserById(userId);

  if (input.name !== undefined) {
    const { firstName, lastName } = splitName(input.name);
    user.firstName = firstName;
    user.lastName = lastName;
  }

  if (input.phone !== undefined) {
    user.phone = input.phone.trim() === "" ? undefined : input.phone.trim();
  }

  return userRepository.save(user);
}
