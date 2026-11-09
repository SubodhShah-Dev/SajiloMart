import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import {
  createProduct,
  deleteProduct,
  getVendorProductById,
  getVendorProducts,
  updateProduct,
} from "../services/product-seller.service.js";
import { validateBody, validateQuery } from "../middleware/validate.middleware.js";
import type { SellerProductQueryInput } from "../validation/product-seller.schema.js";
import {
  createProductSchema,
  updateProductSchema,
  sellerProductQuerySchema,
} from "../validation/product-seller.schema.js";

function getVendorId(request: Request): string {
  const vendorId = request.auth?.userId;
  if (!vendorId) {
    throw new AppError("Authentication required", 401);
  }
  return vendorId;
}

function getProductId(request: Request): string {
  const productId = request.params.id;
  if (typeof productId !== "string") {
    throw new AppError("Invalid product ID", 400);
  }
  return productId;
}

export async function createProductHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const vendorId = getVendorId(request);
  const product = await createProduct(vendorId, request.body);

  response.status(201).json({
    success: true,
    data: { product },
  });
}

export async function getVendorProductsHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const vendorId = getVendorId(request);
  const validatedQuery = (request as Request & { validatedQuery: SellerProductQueryInput }).validatedQuery;
  const result = await getVendorProducts(vendorId, validatedQuery);

  response.status(200).json({
    success: true,
    data: result,
  });
}

export async function getVendorProductByIdHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const vendorId = getVendorId(request);
  const productId = getProductId(request);

  const product = await getVendorProductById(vendorId, productId);

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

export async function updateProductHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const vendorId = getVendorId(request);
  const productId = getProductId(request);

  const product = await updateProduct(vendorId, productId, request.body);

  response.status(200).json({
    success: true,
    data: { product },
  });
}

export async function deleteProductHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const vendorId = getVendorId(request);
  const productId = getProductId(request);

  await deleteProduct(vendorId, productId);

  response.status(200).json({
    success: true,
    data: { message: "Product deleted" },
  });
}

export const validateCreateProduct = validateBody(createProductSchema);
export const validateUpdateProduct = validateBody(updateProductSchema);
export const validateSellerProductQuery = validateQuery(sellerProductQuerySchema);