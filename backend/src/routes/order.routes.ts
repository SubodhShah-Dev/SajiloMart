import { Router } from "express";

import {
  createOrderHandler,
  getOrderHandler,
  listOrdersHandler,
} from "../controllers/order.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { checkoutSchema } from "../validation/order.schema.js";

export const orderRouter = Router();

orderRouter.use(authenticateToken);

orderRouter.post("/", validateBody(checkoutSchema), createOrderHandler);
orderRouter.get("/", listOrdersHandler);
orderRouter.get("/:orderId", getOrderHandler);
