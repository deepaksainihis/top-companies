import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import { validate } from "@/middlewares/validate";
import * as companiesController from "@/modules/companies/companies.controller";
import {
  bulkDeleteCompaniesSchema,
  bulkStatusCompaniesSchema,
  createCompanySchema,
  updateCompanySchema,
} from "@/modules/companies/companies.validation";

const router = Router();

router.use(authenticate);

router.get("/", companiesController.list);
router.post("/bulk-delete", validate(bulkDeleteCompaniesSchema), companiesController.bulkDelete);
router.post("/bulk-restore", validate(bulkDeleteCompaniesSchema), companiesController.bulkRestore);
router.post("/bulk-permanent-delete", validate(bulkDeleteCompaniesSchema), companiesController.bulkPermanentDelete);
router.post("/bulk-status", validate(bulkStatusCompaniesSchema), companiesController.bulkStatus);
router.get("/:id", companiesController.getById);
router.post("/", validate(createCompanySchema), companiesController.create);
router.patch("/:id", validate(updateCompanySchema), companiesController.update);
router.post("/:id/restore", companiesController.restore);
router.delete("/:id/permanent", companiesController.permanentDelete);
router.delete("/:id", companiesController.remove);

export default router;
