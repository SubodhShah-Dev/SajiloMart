import { createHash } from "node:crypto";
import bcrypt from "bcrypt";

import { env } from "../config/env.js";

export function sha256Hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function bcryptHash(password: string): Promise<string> {
  return bcrypt.hash(password, env.bcryptRounds);
}

export function bcryptCompare(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
