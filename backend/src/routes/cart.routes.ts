import { Router } from "express";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  addItemSchema,
  updateQtySchema,
} from "../validation/cart.schema.js";
import {
  addCartItemHandler,
  clearCartHandler,
  getCartHandler,
  mergeAnonymousCartHandler,
  removeCartItemHandler,
  updateCartQtyHandler,
} from "../controllers/cart.controller.js";

export const cartRouter = Router();

cartRouter.use(authenticateToken);

cartRouter.get("/", getCartHandler);

cartRouter.post("/", validateBody(addItemSchema), addCartItemHandler);

cartRouter.post("/merge", mergeAnonymousCartHandler);

cartRouter.patch("/:productId", validateBody(updateQtySchema), updateCartQtyHandler);

cartRouter.delete("/:productId", removeCartItemHandler);

cartRouter.delete("/", clearCartHandler);