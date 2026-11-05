import { createApp } from "./app.js";
import { type Server } from "node:http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import "reflect-metadata";
import { AppDataSource } from "./config/data-source.js";

const app = createApp();
let server: Server | undefined;
let isShuttingDown = false;

async function startServer(): Promise<void> {
  try {
    await AppDataSource.initialize();
    logger.info("Database connection established.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error starting the server: ${errorMessage}`, {
      error: error instanceof Error ? error.stack : String(error),
    });
    process.exitCode = 1;
    return;
  }

  server = app.listen(env.port, () => {
    logger.info(
      `SajiloMart API listening on http://localhost:${env.port} (${env.nodeEnv})`,
    );
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  logger.info(`${signal} received; shutting down`);
  const httpServer = server;
  if (httpServer !== undefined) {
    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);

      logger.error(`Failed to close HTTP server: ${message}`);
    });
  }

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy().catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unknown database error";

      logger.error(`Failed to close database connection: ${message}`);
    });
  }

  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

void startServer();
