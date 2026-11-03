import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { AppError } from "../src/errors/AppError.js";
import { errorHandler } from "../src/middleware/error.middleware.js";

function createErrorTestApp(): express.Express {
  const app = express();

  app.use(express.json());

  app.get("/boom", () => {
    throw new Error("database exploded");
  });

  app.get("/bad-request", () => {
    throw new AppError("Invalid request", 400);
  });

  app.post("/json", (_request, response) => {
    response.json({ received: true });
  });

  app.use(errorHandler);

  return app;
}

const app = createErrorTestApp();

describe("centralized error handling", () => {
  it("hides unexpected error details behind a safe 500 response", async () => {
    const response = await request(app)
      .get("/boom")
      .expect("Content-Type", /json/)
      .expect(500);

    expect(response.body).toEqual({
      success: false,
      error: {
        message: "Internal server error",
        detail: "database exploded",
      },
    });
  });

  it("returns operational error messages and status codes", async () => {
    const response = await request(app)
      .get("/bad-request")
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      error: {
        message: "Invalid request",
      },
    });
  });

  it("returns a safe 400 for malformed JSON bodies", async () => {
    const response = await request(app)
      .post("/json")
      .set("Content-Type", "application/json")
      .send('{"broken":')
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      error: {
        message: "Invalid JSON payload",
      },
    });
  });
});
