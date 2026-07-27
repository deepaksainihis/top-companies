import { Request, Response, Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/apiResponse";
import { publicRateLimiter } from "@/middlewares/rateLimiters";
import * as publicService from "@/modules/public/public.service";

const router = Router();

router.use(publicRateLimiter);

router.get(
  "/home",
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await publicService.getHomeData();
    return sendSuccess(res, data);
  })
);

router.get(
  "/categories",
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await publicService.getPublicCategories();
    return sendSuccess(res, data);
  })
);

router.get(
  "/categories/:slug",
  asyncHandler(async (req: Request, res: Response) => {
    const data = await publicService.getPublicCategoryBySlug(req.params.slug);
    return sendSuccess(res, data);
  })
);

router.get(
  "/about",
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await publicService.getPublicAbout();
    return sendSuccess(res, data);
  })
);

export default router;
