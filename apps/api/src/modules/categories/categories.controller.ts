import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/apiResponse";
import * as categoriesService from "@/modules/categories/categories.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { data, meta } = await categoriesService.listCategories(req.query as Record<string, unknown>);
  return sendSuccess(res, data, { meta });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoriesService.getCategoryById(Number(req.params.id));
  return sendSuccess(res, category);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoriesService.createCategory(req.body, req.admin!.id);
  return sendSuccess(res, category, { statusCode: 201, message: "Category created successfully" });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoriesService.updateCategory(Number(req.params.id), req.body, req.admin!.id);
  return sendSuccess(res, category, { message: "Category updated successfully" });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.deleteCategory(Number(req.params.id), req.admin!.id);
  return sendSuccess(res, null, { message: "Category deleted successfully" });
});

export const restore = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.restoreCategory(Number(req.params.id), req.admin!.id);
  return sendSuccess(res, null, { message: "Category restored successfully" });
});

export const permanentDelete = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.permanentlyDeleteCategory(Number(req.params.id));
  return sendSuccess(res, null, { message: "Category permanently deleted" });
});

export const bulkDelete = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.bulkDeleteCategories(req.body.ids, req.admin!.id);
  return sendSuccess(res, null, { message: "Selected categories deleted" });
});

export const bulkRestore = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.bulkRestoreCategories(req.body.ids, req.admin!.id);
  return sendSuccess(res, null, { message: "Selected categories restored" });
});

export const bulkPermanentDelete = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.bulkPermanentlyDeleteCategories(req.body.ids);
  return sendSuccess(res, null, { message: "Selected categories permanently deleted" });
});

export const bulkStatus = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.bulkUpdateCategoryStatus(req.body.ids, req.body.status, req.admin!.id);
  return sendSuccess(res, null, { message: "Status updated" });
});
