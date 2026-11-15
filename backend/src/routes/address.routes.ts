import { Router } from "express";

import {
  createAddressHandler,
  listAddressesHandler,
} from "../controllers/address.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createAddressSchema } from "../validation/address.schema.js";

export const addressRouter = Router();

addressRouter.use(authenticateToken);

addressRouter.get("/", listAddressesHandler);
addressRouter.post("/", validateBody(createAddressSchema), createAddressHandler);
