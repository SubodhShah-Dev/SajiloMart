import { describe, expect, it } from "vitest";

import { AppError } from "../src/errors/AppError.js";
import { assertCardMinimum } from "../src/utils/card-payment.util.js";

describe("assertCardMinimum", () => {
  it("rejects an amount below the minimum and explains the shortfall", () => {
    let thrown: unknown;

    try {
      assertCardMinimum(3999, 100);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AppError);
    expect((thrown as AppError).statusCode).toBe(400);
    expect((thrown as AppError).message).toContain("NPR 100.00");
    expect((thrown as AppError).message).toContain("NPR 60.01");
  });

  it("rejects the two totals that originally slipped through to Stripe", () => {
    expect(() => assertCardMinimum(4998, 100)).toThrow(AppError);
    expect(() => assertCardMinimum(3999, 100)).toThrow(AppError);
  });

  it("accepts a total exactly at the minimum", () => {
    expect(() => assertCardMinimum(10000, 100)).not.toThrow();
  });

  it("accepts a total above the minimum", () => {
    expect(() => assertCardMinimum(12000, 100)).not.toThrow();
  });

  it("honours a lowered threshold", () => {
    expect(() => assertCardMinimum(7300, 73)).not.toThrow();
    expect(() => assertCardMinimum(7299, 73)).toThrow(AppError);
  });
});
