import { z } from "zod";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required").max(500),
  answer: z.string().min(1, "Answer is required"),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

const companyPivotSchema = z.object({
  companyId: z.coerce.number().int().positive(),
  displayOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().max(220).optional(),
  parentId: z.coerce.number().int().positive().optional().nullable(),
  heroDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().max(500).optional().nullable(),
  icon: z.string().max(500).optional().nullable(),
  featured: z.coerce.boolean().optional().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  displayOrder: z.coerce.number().int().min(0).optional().default(0),

  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().max(500).optional().nullable(),
  ogTitle: z.string().max(255).optional().nullable(),
  ogDescription: z.string().max(500).optional().nullable(),
  ogImage: z.string().max(500).optional().nullable(),
  robots: z.string().max(100).optional().nullable(),

  faqs: z.array(faqSchema).optional().default([]),
  companies: z.array(companyPivotSchema).optional().default([]),
});

export const updateCategorySchema = createCategorySchema.partial();

export const bulkDeleteCategoriesSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1, "Select at least one category"),
});

export const bulkStatusCategoriesSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1, "Select at least one category"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
