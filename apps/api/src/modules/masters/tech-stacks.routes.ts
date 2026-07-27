import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug, slugifyText } from "@/lib/slug";
import { optionalUrl } from "@/lib/validation";
import { createCrudModule, statusEnum } from "@/modules/masters/crudFactory";

export const createTechStackSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  slug: z.string().max(180).optional(),
  icon: optionalUrl("Icon must be a valid URL"),
  status: statusEnum.default("ACTIVE"),
});

export const updateTechStackSchema = createTechStackSchema.partial();

const slugExists = (excludeId?: number) => async (slug: string) => {
  const existing = await prisma.techStack.findFirst({ where: { slug, deletedAt: null } });
  return Boolean(existing && existing.id !== excludeId);
};

const router = createCrudModule({
  delegate: prisma.techStack,
  searchableFields: ["name", "slug"],
  createSchema: createTechStackSchema,
  updateSchema: updateTechStackSchema,
  defaultSortField: "name",
  beforeCreate: async (body) => {
    const base = (body.slug as string | undefined) || (body.name as string);
    body.slug = await generateUniqueSlug(base, slugExists());
  },
  beforeUpdate: async (body, id) => {
    if (body.slug) {
      body.slug = await generateUniqueSlug(slugifyText(body.slug as string), slugExists(id));
    }
  },
});

export default router;
