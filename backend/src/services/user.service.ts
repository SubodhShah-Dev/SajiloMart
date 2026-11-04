import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import bcrypt from "bcrypt";
import users from "../db/users.js";

const secret = env.jwtAccessTokenSecret;
const expiresIn = env.jwtRefreshTokenExpiry;

export const signIn = async function (email: string, password: string) {
  let matchedUser = null;

  for (const user of users) {
    if (user.email === email) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (isValid) {
        matchedUser = user;
        break;
      }
    }
  }

  if (!matchedUser) return false;

  try {
    return jwt.sign(
      { sub: matchedUser.id, role: matchedUser.role },
      secret as string,
      { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] },
    );
  } catch (error: any) {
    logger.error(error.message);
    throw error;
  }
};

export const signOut = function (id: number) {};

export const signUp = function (
  userName: string,
  email: string,
  password: string,
) {};
