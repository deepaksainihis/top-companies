import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import { validate } from "@/middlewares/validate";
import * as usersController from "@/modules/users/users.controller";
import { createUserSchema, updateUserSchema } from "@/modules/users/users.validation";

const router = Router();

router.use(authenticate);

router.get("/", usersController.list);
router.get("/:id", usersController.getById);
router.post("/", validate(createUserSchema), usersController.create);
router.patch("/:id", validate(updateUserSchema), usersController.update);
router.delete("/:id", usersController.remove);

export default router;
