import { Router } from "express";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  createStoreHandler,
  getMyStoreHandler,
  requestVerificationHandler,
  updateStoreHandler,
} from "../controllers/seller-store.controller.js";
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
import {
  createStoreSchema,
  updateStoreSchema,
} from "../validation/store.schema.js";

export const sellerRouter = Router();

sellerRouter.use(authenticateToken);

// Store endpoints - accessible to CUSTOMER (for creation) and VENDOR/ADMIN
sellerRouter.get("/store", getMyStoreHandler);
sellerRouter.post("/store", validateBody(createStoreSchema), createStoreHandler);
sellerRouter.patch("/store", validateBody(updateStoreSchema), updateStoreHandler);
sellerRouter.post("/store/verification", requestVerificationHandler);

// Product endpoints - require VENDOR or ADMIN role
sellerRouter.use(requireRole("VENDOR", "ADMIN"));

sellerRouter.post("/products", validateCreateProduct, createProductHandler);
sellerRouter.get("/products", validateSellerProductQuery, getVendorProductsHandler);
sellerRouter.get("/products/:id", getVendorProductByIdHandler);
sellerRouter.patch("/products/:id", validateUpdateProduct, updateProductHandler);
sellerRouter.delete("/products/:id", deleteProductHandler);