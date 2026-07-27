import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";

// Every authenticated admin has full access - there is no role/permission
// model in this system (see PRD: "Multiple Admin accounts only (no RBAC)").
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing access token"));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.admin = { id: payload.adminId };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
};
