import fs from "node:fs";
import type { IncomingMessage } from "node:http";
import path from "node:path";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { apiRouter } from "./routes/index.js";

const frontendDistPath = path.resolve(
  import.meta.dirname,
  "../../frontend/dist",
);
const frontendIndexPath = path.join(frontendDistPath, "index.html");

// Same output as morgan's "combined", but without the query string so
// credentials (e.g. the Google OAuth `code`) never reach the logs.
const productionLogFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :safeUrl HTTP/:http-version" ' +
  ':status :res[content-length] ":referrer" ":user-agent"';

function requestPath(request: IncomingMessage): string {
  const url =
    "originalUrl" in request && typeof request.originalUrl === "string"
      ? request.originalUrl
      : request.url;

  return (url ?? "").split("?")[0] ?? "";
}

morgan.token("safeUrl", requestPath);

export function createApp(): express.Express {
  const app = express();

  app.disable("x-powered-by");

  if (env.isProduction) {
    // Render (and most PaaS) terminate TLS and forward plain HTTP internally.
    app.set("trust proxy", 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // Product images and Google avatars are external HTTPS URLs.
          "img-src": ["'self'", "data:", "https:"],
        },
      },
    }),
  );
  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    }),
  );
  app.use(
    "/api/payments/webhook",
    express.raw({ type: "application/json", limit: "1mb" }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());
  app.use(
    morgan(
      env.isProduction
        ? productionLogFormat
        : ":method :url :status :response-time ms - :res[content-length]",
      {
        stream: {
          write: (message: string) => {
            logger.info(message.trim());
          },
        },
        skip: () => env.isTest,
      },
    ),
  );

  app.use("/api", apiRouter);

  if (env.isProduction) {
    if (!fs.existsSync(frontendIndexPath)) {
      logger.warn(
        `Frontend build not found at ${frontendIndexPath}; client-side routes will return 404.`,
      );
    }

    // Serve the built SPA from the API's own origin so auth cookies stay
    // first-party. Only `frontend/dist` is exposed, and dotfiles are denied.
    app.use(
      "/assets",
      express.static(path.join(frontendDistPath, "assets"), {
        dotfiles: "deny",
        maxAge: "1y",
        immutable: true,
      }),
    );
    app.use(
      express.static(frontendDistPath, {
        dotfiles: "deny",
        index: false,
        maxAge: "1h",
      }),
    );

    // Let React Router own client-side routes. `/api`, dotfiles, and file-like
    // paths are excluded so unknown endpoints keep returning JSON 404s and
    // probes for `.env`-style files don't answer 200.
    app.use((request, response, next) => {
      const isReadRequest =
        request.method === "GET" || request.method === "HEAD";
      const segments = request.path.split("/").filter(Boolean);
      const looksLikeFile =
        segments.some((segment) => segment.startsWith(".")) ||
        path.extname(request.path) !== "";

      if (
        !isReadRequest ||
        request.path.startsWith("/api") ||
        looksLikeFile ||
        !request.accepts("html")
      ) {
        next();
        return;
      }

      response.sendFile(frontendIndexPath, (error) => {
        if (error) {
          next(error);
        }
      });
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
