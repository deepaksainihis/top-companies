import { z } from "zod";

export const categoryFaqSchema = z.object({
  question: z.string().min(1, "Question is required").max(500),
  answer: z.string().min(1, "Answer is required"),
  sortOrder: z.number().default(0),
});

export const categoryCompanySchema = z.object({
  companyId: z.number(),
  displayOrder: z.number().default(0),
  name: z.string(),
  logo: z.string().nullable().optional(),
});

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().max(220).optional().nullable(),
  parentId: z.string().optional().nullable(),
  heroDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  // union of string|number (not z.coerce) keeps input/output types aligned -
  // see the comment in schemas/company.ts for why.
  displayOrder: z.union([z.string(), z.number()]).default(0),

  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  ogTitle: z.string().max(255).optional().nullable(),
  ogDescription: z.string().max(500).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  robots: z.string().max(100).optional().nullable(),

  faqs: z.array(categoryFaqSchema).default([]),
  companies: z.array(categoryCompanySchema).default([]),
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormValues = z.output<typeof categoryFormSchema>;
