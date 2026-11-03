import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";

const app = createApp();

describe("unknown routes", () => {
  it("returns a structured 404 response", async () => {
    const response = await request(app)
      .get("/api/does-not-exist")
      .expect("Content-Type", /json/)
      .expect(404);

    expect(response.body).toEqual({
      success: false,
      error: {
        message: "Route GET /api/does-not-exist not found",
      },
    });
  });
});
