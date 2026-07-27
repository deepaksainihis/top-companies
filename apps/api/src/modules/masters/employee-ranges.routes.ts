import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createCrudModule, statusEnum } from "@/modules/masters/crudFactory";

export const createEmployeeRangeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  status: statusEnum.default("ACTIVE"),
});

export const updateEmployeeRangeSchema = createEmployeeRangeSchema.partial();

const router = createCrudModule({
  delegate: prisma.employeeRange,
  searchableFields: ["title"],
  createSchema: createEmployeeRangeSchema,
  updateSchema: updateEmployeeRangeSchema,
  defaultSortField: "title",
});

export default router;
