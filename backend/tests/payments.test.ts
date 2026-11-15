import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";

const app = createApp();

describe("POST /api/payments/webhook", () => {
  it("rejects a request without a Stripe signature", async () => {
    const response = await request(app)
      .post("/api/payments/webhook")
      .send({ type: "checkout.session.completed" })
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      error: { message: "Missing Stripe signature header" },
    });
  });

  it("rejects a payload that does not match the signature", async () => {
    const response = await request(app)
      .post("/api/payments/webhook")
      .set("stripe-signature", "t=1,v1=deadbeef")
      .send({ type: "checkout.session.completed" })
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      error: { message: "Invalid Stripe webhook signature" },
    });
  });
});

describe("payment routes require authentication", () => {
  it("blocks unauthenticated Stripe session creation", async () => {
    await request(app)
      .post("/api/payments/stripe/00000000-0000-0000-0000-000000000000/session")
      .expect(401);
  });

  it("blocks unauthenticated COD completion", async () => {
    await request(app)
      .post("/api/payments/cod/00000000-0000-0000-0000-000000000000/complete")
      .expect(401);
  });
});
