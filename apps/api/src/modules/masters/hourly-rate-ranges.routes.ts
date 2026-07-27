import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudModule, statusEnum } from "@/modules/masters/crudFactory";

export const createHourlyRateRangeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  status: statusEnum.default("ACTIVE"),
});

export const updateHourlyRateRangeSchema = createHourlyRateRangeSchema.partial();

const router = createCrudModule({
  delegate: prisma.hourlyRateRange,
  searchableFields: ["title"],
  createSchema: createHourlyRateRangeSchema,
  updateSchema: updateHourlyRateRangeSchema,
  defaultSortField: "title",
});

export default router;
