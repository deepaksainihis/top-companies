import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "@/config/env";
import { UPLOADS_ROOT } from "@/config/multer";
import routes from "@/routes";
import { errorHandler, notFoundHandler } from "@/middlewares/errorHandler";

export const createApp = () => {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.ADMIN_ORIGINS,
      credentials: true,
    })
  );
  app.use(morgan(env.isProduction ? "combined" : "dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/uploads", express.static(UPLOADS_ROOT));

  app.get("/health", (_req, res) => res.json({ success: true, message: "OK" }));

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
