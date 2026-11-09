import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import { getProducts, getProductById } from "../services/product.service.js";
import { productQuerySchema } from "../validation/product.schema.js";

export async function getProductsHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const parsed = productQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join("; ");

    throw new AppError(message, 400);
  }

  const result = await getProducts(parsed.data);

  response.status(200).json({
    success: true,
    data: result,
  });
}

export async function getProductByIdHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const id =
    typeof request.params.id === "string"
      ? request.params.id
      : String(request.params.id);

  const product = await getProductById(id);

  if (!product) {
    response.status(404).json({
      success: false,
      error: { message: "Product not found" },
    });
    return;
  }

  response.status(200).json({
    success: true,
    data: { product },
  });
}
