import { Router } from "express";

import { healthRouter } from "./health.routes.js";
import { authRouter } from "./auth.routes.js";
import { productRouter } from "./product.routes.js";
import { sellerRouter } from "./seller.routes.js";
import { adminRouter } from "./admin.routes.js";
import { cartRouter } from "./cart.routes.js";
import { wishlistRouter } from "./wishlist.routes.js";
import { orderRouter } from "./order.routes.js";
import { paymentRouter } from "./payment.routes.js";
import { addressRouter } from "./address.routes.js";
import { districtRouter } from "./district.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/seller", sellerRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/addresses", addressRouter);
apiRouter.use("/districts", districtRouter);