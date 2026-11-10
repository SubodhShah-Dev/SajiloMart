import { Router } from "express";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { addWishlistItemSchema } from "../validation/wishlist.schema.js";
import {
  addWishlistItemHandler,
  clearWishlistHandler,
  getWishlistHandler,
  removeWishlistItemHandler,
} from "../controllers/wishlist.controller.js";

export const wishlistRouter = Router();

wishlistRouter.use(authenticateToken);

wishlistRouter.get("/", getWishlistHandler);

wishlistRouter.post(
  "/",
  validateBody(addWishlistItemSchema),
  addWishlistItemHandler,
);

wishlistRouter.delete("/:productId", removeWishlistItemHandler);

wishlistRouter.delete("/", clearWishlistHandler);
