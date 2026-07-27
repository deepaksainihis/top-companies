import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { optionalUrl } from "@/lib/validation";
import { createCrudModule, statusEnum } from "@/modules/masters/crudFactory";

export const createCountrySchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  iso2: z
    .string()
    .length(2, "ISO2 code must be exactly 2 characters")
    .transform((val) => val.toUpperCase()),
  flag: optionalUrl("Flag must be a valid URL"),
  status: statusEnum.default("ACTIVE"),
});

export const updateCountrySchema = createCountrySchema.partial();

const router = createCrudModule({
  delegate: prisma.country,
  searchableFields: ["name", "iso2"],
  createSchema: createCountrySchema,
  updateSchema: updateCountrySchema,
  defaultSortField: "name",
});

export default router;
