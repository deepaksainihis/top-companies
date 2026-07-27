import { z } from "zod";
import { optionalEmail, optionalUrl } from "@/lib/validation";

const seoSchema = z.object({
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().max(500).optional().nullable(),
  ogTitle: z.string().max(255).optional().nullable(),
  ogDescription: z.string().max(500).optional().nullable(),
  ogImage: z.string().max(500).optional().nullable(),
  robots: z.string().max(100).optional().nullable(),
});

export const updateSettingsSchema = z.object({
  general: z.object({
    siteName: z.string().max(200).optional().nullable(),
    logo: z.string().max(500).optional().nullable(),
    favicon: z.string().max(500).optional().nullable(),
    contactEmail: optionalEmail(),
    phone: z.string().max(50).optional().nullable(),
    address: z.string().optional().nullable(),
    // Visible body copy for the public About page (rich text HTML).
    aboutContent: z.string().optional().nullable(),
    socialLinks: z
      .object({
        facebook: optionalUrl(),
        twitter: optionalUrl(),
        linkedin: optionalUrl(),
        instagram: optionalUrl(),
        youtube: optionalUrl(),
      })
      .partial()
      .optional()
      .nullable(),
  }),
  seo: z.object({
    home: seoSchema,
    about: seoSchema,
  }),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
