import { Router } from "express";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createProductHandler,
  deleteProductHandler,
  getVendorProductByIdHandler,
  getVendorProductsHandler,
  updateProductHandler,
  validateCreateProduct,
  validateSellerProductQuery,
  validateUpdateProduct,
} from "../controllers/product-seller.controller.js";

export const sellerRouter = Router();

// All seller routes require authentication and VENDOR or ADMIN role
sellerRouter.use(authenticateToken);
sellerRouter.use(requireRole("VENDOR", "ADMIN"));

sellerRouter.post("/products", validateCreateProduct, createProductHandler);
sellerRouter.get("/products", validateSellerProductQuery, getVendorProductsHandler);
sellerRouter.get("/products/:id", getVendorProductByIdHandler);
sellerRouter.patch("/products/:id", validateUpdateProduct, updateProductHandler);
sellerRouter.delete("/products/:id", deleteProductHandler);