import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  options?: { message?: string; meta?: PaginationMeta; statusCode?: number }
) => {
  return res.status(options?.statusCode ?? 200).json({
    success: true,
    message: options?.message,
    data,
    meta: options?.meta,
  });
};
