import { z } from "zod";

export const countryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  iso2: z.string().length(2, "ISO2 code must be exactly 2 characters"),
  flag: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
export type CountryFormInput = z.input<typeof countryFormSchema>;
export type CountryFormValues = z.output<typeof countryFormSchema>;

export const techStackFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  slug: z.string().max(180).optional().nullable(),
  icon: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
export type TechStackFormInput = z.input<typeof techStackFormSchema>;
export type TechStackFormValues = z.output<typeof techStackFormSchema>;

export const titleStatusFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
export type TitleStatusFormInput = z.input<typeof titleStatusFormSchema>;
export type TitleStatusFormValues = z.output<typeof titleStatusFormSchema>;
