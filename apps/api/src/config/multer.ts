import fs from "fs";
import path from "path";
import multer from "multer";
import { randomUUID } from "crypto";
import { env } from "@/config/env";

export const UPLOADS_ROOT = path.join(__dirname, "..", "..", "uploads");

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const monthFolder = new Date().toISOString().slice(0, 7); // yyyy-MM
    const dest = path.join(UPLOADS_ROOT, monthFolder);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, WEBP, GIF or SVG images are allowed"));
      return;
    }
    cb(null, true);
  },
});
