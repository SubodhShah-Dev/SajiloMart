import { Router } from "express";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  adminRejectStoreSchema,
  adminSuspendStoreSchema,
  adminVerifyStoreSchema,
} from "../validation/store.schema.js";
import {
  listStoresHandler,
  rejectStoreHandler,
  suspendStoreHandler,
  unsuspendStoreHandler,
  verifyStoreHandler,
} from "../controllers/admin-store.controller.js";

export const adminRouter = Router();

adminRouter.use(authenticateToken);
adminRouter.use(requireRole("ADMIN"));

adminRouter.get("/stores", listStoresHandler);
adminRouter.post("/stores/:id/suspend", validateBody(adminSuspendStoreSchema), suspendStoreHandler);
adminRouter.post("/stores/:id/unsuspend", unsuspendStoreHandler);
adminRouter.post("/stores/:id/verify", validateBody(adminVerifyStoreSchema), verifyStoreHandler);
adminRouter.post("/stores/:id/reject-verification", validateBody(adminRejectStoreSchema), rejectStoreHandler);