import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source.js";

const userRepository = AppDataSource.getRepository("User");

const secret = env.jwtAccessTokenSecret;
const expiresIn = env.jwtRefreshTokenExpiry;

export const signIn = async function (email: string, password: string) {};

export const signOut = function (id: number) {};

export const signUp = function (
  userName: string,
  email: string,
  password: string,
) {};
