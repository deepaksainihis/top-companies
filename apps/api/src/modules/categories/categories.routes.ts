import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import { validate } from "@/middlewares/validate";
import * as categoriesController from "@/modules/categories/categories.controller";
import {
  bulkDeleteCategoriesSchema,
  bulkStatusCategoriesSchema,
  createCategorySchema,
  updateCategorySchema,
} from "@/modules/categories/categories.validation";

const router = Router();

router.use(authenticate);

router.get("/", categoriesController.list);
router.post("/bulk-delete", validate(bulkDeleteCategoriesSchema), categoriesController.bulkDelete);
router.post("/bulk-restore", validate(bulkDeleteCategoriesSchema), categoriesController.bulkRestore);
router.post(
  "/bulk-permanent-delete",
  validate(bulkDeleteCategoriesSchema),
  categoriesController.bulkPermanentDelete
);
router.post("/bulk-status", validate(bulkStatusCategoriesSchema), categoriesController.bulkStatus);
router.get("/:id", categoriesController.getById);
router.post("/", validate(createCategorySchema), categoriesController.create);
router.patch("/:id", validate(updateCategorySchema), categoriesController.update);
router.post("/:id/restore", categoriesController.restore);
router.delete("/:id/permanent", categoriesController.permanentDelete);
router.delete("/:id", categoriesController.remove);

export default router;
