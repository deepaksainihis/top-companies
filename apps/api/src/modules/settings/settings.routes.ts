import { Request, Response, Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import { validate } from "@/middlewares/validate";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/apiResponse";
import * as settingsService from "@/modules/settings/settings.service";
import { updateSettingsSchema } from "@/modules/settings/settings.validation";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.getSettings();
    return sendSuccess(res, settings);
  })
);

router.put(
  "/",
  validate(updateSettingsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.updateSettings(req.body, req.admin!.id);
    return sendSuccess(res, settings, { message: "Settings updated successfully" });
  })
);

export default router;
