import { randomInt } from "node:crypto";
import type { EntityManager } from "typeorm";
import { QueryFailedError } from "typeorm";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entities/User.js";

const userRepository = AppDataSource.getRepository(User);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
}

function ensureStartsWithLetter(username: string): string {
  return /^[a-z]/.test(username) ? username : `user${username}`;
}

function generateBase({ firstName, lastName, email }: { firstName: string; lastName: string; email: string }): string {
  const nameBase = [firstName, lastName].filter(Boolean).join("");
  let base = slugify(nameBase);

  if (!base) {
    base = slugify(email.split("@")[0]);
  }

  return ensureStartsWithLetter(base);
}

export async function generateUniqueUsername(
  params: { firstName: string; lastName: string; email: string },
  manager?: EntityManager,
): Promise<string> {
  const repo = manager?.getRepository(User) ?? userRepository;
  const base = generateBase(params);
  const maxBaseLength = 30 - 4;

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = randomInt(1000, 9999).toString();
    const username = `${base.slice(0, maxBaseLength)}${suffix}`;

    try {
      const existing = await repo.findOne({
        where: { userName: username },
        select: { id: true },
      });

      if (!existing) {
        return username;
      }
    } catch {
      // ignore and retry
    }
  }

  // Final fallback: user + 8 random digits
  const fallback = `user${randomInt(10_000_000, 99_999_999).toString()}`;
  const existing = await repo.findOne({
    where: { userName: fallback },
    select: { id: true },
  });

  if (!existing) {
    return fallback;
  }

  // Extremely unlikely, but use a longer random suffix
  return `user${randomInt(100_000_000, 999_999_999).toString()}`;
}

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string } | undefined)?.code === "ER_DUP_ENTRY"
  );
}