import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";

const app = createApp();

describe("GET /api/health", () => {
  it("returns the API health payload", async () => {
    const response = await request(app)
      .get("/api/health")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: "ok",
        service: "sajilomart-api",
        environment: "test",
      },
    });
    expect(typeof response.body.data.timestamp).toBe("string");
    expect(typeof response.body.data.uptime).toBe("number");
  });
});
