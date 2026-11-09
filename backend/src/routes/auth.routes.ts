import { Router } from "express";

import {
  getMe,
  googleCallback,
  googleLogin,
  login,
  logout,
  refresh,
  register,
  updateMe,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../validation/auth.schema.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

authRouter.get("/google", googleLogin);
authRouter.get("/google/callback", googleCallback);

authRouter.get("/me", authenticateToken, getMe);
authRouter.patch("/me", authenticateToken, validateBody(updateProfileSchema), updateMe);
