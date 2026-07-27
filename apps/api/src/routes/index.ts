import { Router } from "express";
import authRoutes from "@/modules/auth/auth.routes";
import dashboardRoutes from "@/modules/dashboard/dashboard.routes";
import companiesRoutes from "@/modules/companies/companies.routes";
import categoriesRoutes from "@/modules/categories/categories.routes";
import mastersRoutes from "@/modules/masters/masters.routes";
import settingsRoutes from "@/modules/settings/settings.routes";
import uploadsRoutes from "@/modules/uploads/uploads.routes";
import publicRoutes from "@/modules/public/public.routes";
import usersRoutes from "@/modules/users/users.routes";

const router = Router();

router.use("/public", publicRoutes);
router.use("/auth", authRoutes);
router.use("/admin/dashboard", dashboardRoutes);
router.use("/admin/companies", companiesRoutes);
router.use("/admin/categories", categoriesRoutes);
router.use("/admin/settings", settingsRoutes);
router.use("/admin/uploads", uploadsRoutes);
router.use("/admin/users", usersRoutes);
// Countries, tech-stacks, employee-ranges, hour-rate-ranges
router.use("/admin", mastersRoutes);

export default router;
