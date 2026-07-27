import path from "path";
import { Request, Response, Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import { upload, UPLOADS_ROOT } from "@/config/multer";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/apiResponse";
import { ValidationError } from "@/lib/errors";
import { env } from "@/config/env";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ValidationError("No file was uploaded", { file: ["No file was uploaded"] });
    }

    const relativePath = path.relative(UPLOADS_ROOT, req.file.path).split(path.sep).join("/");
    const url = `${env.API_BASE_URL}/uploads/${relativePath}`;

    return sendSuccess(res, { url }, { statusCode: 201, message: "File uploaded successfully" });
  })
);

export default router;
