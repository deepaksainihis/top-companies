import { z } from "zod";

const seoSchema = z.object({
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  ogTitle: z.string().max(255).optional().nullable(),
  ogDescription: z.string().max(500).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  robots: z.string().max(100).optional().nullable(),
});

export const settingsFormSchema = z.object({
  general: z.object({
    siteName: z.string().max(200).optional().nullable(),
    logo: z.string().optional().nullable(),
    favicon: z.string().optional().nullable(),
    contactEmail: z.string().email("Enter a valid email").optional().nullable().or(z.literal("")),
    phone: z.string().max(50).optional().nullable(),
    address: z.string().optional().nullable(),
    aboutContent: z.string().optional().nullable(),
    socialLinks: z
      .object({
        facebook: z.string().optional().nullable(),
        twitter: z.string().optional().nullable(),
        linkedin: z.string().optional().nullable(),
        instagram: z.string().optional().nullable(),
        youtube: z.string().optional().nullable(),
      })
      .optional()
      .nullable(),
  }),
  seo: z.object({
    home: seoSchema,
    about: seoSchema,
  }),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
