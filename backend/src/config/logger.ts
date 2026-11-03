import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import winston from "winston";

import { env } from "./env.js";

const backendRoot = fileURLToPath(new URL("../..", import.meta.url));
const logsDirectory = path.join(backendRoot, "logs");

if (!env.isTest) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleFormat = env.isProduction
  ? fileFormat
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf((info) => {
        const stack = info.stack ? `\n${String(info.stack)}` : "";
        return `${String(info.timestamp)} [${info.level}] ${String(info.message)}${stack}`;
      }),
    );

const transports: winston.transport[] = [
  new winston.transports.Console({ format: consoleFormat }),
];

if (!env.isTest) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDirectory, "error.log"),
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, "combined.log"),
      format: fileFormat,
    }),
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? (env.isProduction ? "info" : "debug"),
  defaultMeta: { service: "sajilomart-api" },
  silent: env.isTest,
  transports,
});
