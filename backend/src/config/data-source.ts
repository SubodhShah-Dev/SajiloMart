import { DataSource } from "typeorm";
import { env } from "./env.js";
import fs from "node:fs";
import path from "node:path";

const backendRoot = path.resolve(import.meta.dirname, "../..");

function requireDbEnv(value: string | undefined, name: string): string {
  if (value === undefined || value === "") {
    throw new Error(`${name} is required to connect to the database.`);
  }

  return value;
}

function buildSslOptions():
  | { rejectUnauthorized: true; ca: Buffer }
  | undefined {
  if (!env.dbSsl) {
    return undefined;
  }

  if (env.dbSslCaPath === undefined || env.dbSslCaPath === "") {
    throw new Error("DB_SSL_CA_PATH is required when DB_SSL is enabled.");
  }

  const caPath = path.resolve(backendRoot, env.dbSslCaPath);
  return { rejectUnauthorized: true, ca: fs.readFileSync(caPath) };
}

const entitiesPath = path.join(
  backendRoot,
  env.isProduction ? "dist/entities/**/*.js" : "src/entities/**/*.ts",
);
const migrationsPath = path.join(
  backendRoot,
  env.isProduction ? "dist/migrations/**/*.js" : "src/migrations/**/*.ts",
);

export const AppDataSource = new DataSource({
  type: "mysql",
  host: requireDbEnv(env.dbHost, "DB_HOST"),
  port: env.dbPort,
  username: requireDbEnv(env.dbUsername, "DB_USERNAME"),
  password: requireDbEnv(env.dbPassword, "DB_PASSWORD"),
  database: requireDbEnv(env.dbName, "DB_NAME"),
  ssl: buildSslOptions(),
  synchronize: false,
  migrationsRun: false,
  logging: env.nodeEnv === "development" ? ["error", "warn"] : ["error"],
  entities: [entitiesPath],
  migrations: [migrationsPath],
  timezone: "Z",
});
