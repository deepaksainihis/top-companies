import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/apiResponse";
import * as companiesService from "@/modules/companies/companies.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { data, meta } = await companiesService.listCompanies(req.query as Record<string, unknown>);
  return sendSuccess(res, data, { meta });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const company = await companiesService.getCompanyById(Number(req.params.id));
  return sendSuccess(res, company);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const company = await companiesService.createCompany(req.body, req.admin!.id);
  return sendSuccess(res, company, { statusCode: 201, message: "Company created successfully" });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const company = await companiesService.updateCompany(Number(req.params.id), req.body, req.admin!.id);
  return sendSuccess(res, company, { message: "Company updated successfully" });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await companiesService.deleteCompany(Number(req.params.id), req.admin!.id);
  return sendSuccess(res, null, { message: "Company deleted successfully" });
});

export const restore = asyncHandler(async (req: Request, res: Response) => {
  await companiesService.restoreCompany(Number(req.params.id), req.admin!.id);
  return sendSuccess(res, null, { message: "Company restored successfully" });
});

export const permanentDelete = asyncHandler(async (req: Request, res: Response) => {
  await companiesService.permanentlyDeleteCompany(Number(req.params.id));
  return sendSuccess(res, null, { message: "Company permanently deleted" });
});

export const bulkDelete = asyncHandler(async (req: Request, res: Response) => {
  await companiesService.bulkDeleteCompanies(req.body.ids, req.admin!.id);
  return sendSuccess(res, null, { message: "Selected companies deleted" });
});

export const bulkRestore = asyncHandler(async (req: Request, res: Response) => {
  await companiesService.bulkRestoreCompanies(req.body.ids, req.admin!.id);
  return sendSuccess(res, null, { message: "Selected companies restored" });
});

export const bulkPermanentDelete = asyncHandler(async (req: Request, res: Response) => {
  await companiesService.bulkPermanentlyDeleteCompanies(req.body.ids);
  return sendSuccess(res, null, { message: "Selected companies permanently deleted" });
});

export const bulkStatus = asyncHandler(async (req: Request, res: Response) => {
  await companiesService.bulkUpdateCompanyStatus(req.body.ids, req.body.status, req.admin!.id);
  return sendSuccess(res, null, { message: "Status updated" });
});
