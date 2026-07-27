import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((val) => !val || /^https?:\/\//.test(val), { message: "Must be a valid URL" });

export const companyFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().max(220).optional().nullable(),
  website: optionalUrl,
  logo: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  // z.coerce's INPUT type is `unknown` by design, which doesn't play well
  // with react-hook-form's typed field values - a plain string|number union
  // (both identity-typed) keeps input/output aligned; the numeric range is
  // enforced again server-side regardless.
  foundedYear: z.union([z.string(), z.number()]).optional().nullable(),
  headOffice: z.string().max(255).optional().nullable(),
  countryId: z.string().optional().nullable(),
  employeeRangeId: z.string().optional().nullable(),
  hourlyRateRangeId: z.string().optional().nullable(),
  techStackIds: z.array(z.number()).default([]),
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  // Same string|number union as foundedYear, for the same reason.
  score: z.union([z.string(), z.number()]).optional().nullable(),
});

// Fields with `.default()` make the parsed OUTPUT required even though the
// INPUT (what react-hook-form holds before submit) still has them optional -
// useForm needs both: input for defaultValues/register, output for onSubmit.
export type CompanyFormInput = z.input<typeof companyFormSchema>;
export type CompanyFormValues = z.output<typeof companyFormSchema>;
