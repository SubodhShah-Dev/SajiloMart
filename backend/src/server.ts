import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(
    `SajiloMart API listening on http://localhost:${env.port} (${env.nodeEnv})`,
  );
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info(`${signal} received; shutting down`);

  server.close((error) => {
    if (error) {
      logger.error(`Failed to close HTTP server: ${error.message}`);
      process.exit(1);
    }

    logger.info("HTTP server closed");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
