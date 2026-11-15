import { Router } from "express";

import { listDistrictsHandler } from "../controllers/district.controller.js";

export const districtRouter = Router();

// Reference data for the address form; public.
districtRouter.get("/", listDistrictsHandler);
