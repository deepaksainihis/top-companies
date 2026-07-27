import { Request, Response, Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";

const router = Router();

router.get(
  "/",
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const activeFilter = { deletedAt: null };

    const [totalCompanies, totalCategories, totalCountries, totalTechStacks, recentCompanies, recentCategories] =
      await Promise.all([
        prisma.company.count({ where: activeFilter }),
        prisma.category.count({ where: activeFilter }),
        prisma.country.count({ where: activeFilter }),
        prisma.techStack.count({ where: activeFilter }),
        prisma.company.findMany({
          where: activeFilter,
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, slug: true, logo: true, status: true, createdAt: true },
        }),
        prisma.category.findMany({
          where: activeFilter,
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, slug: true, image: true, status: true, createdAt: true },
        }),
      ]);

    return sendSuccess(res, {
      totals: { totalCompanies, totalCategories, totalCountries, totalTechStacks },
      recentCompanies,
      recentCategories,
    });
  })
);

export default router;
