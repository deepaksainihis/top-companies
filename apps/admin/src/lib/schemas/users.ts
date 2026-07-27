import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(150),
  email: z.string().email("Enter a valid email address").max(190),
  avatar: z.string().optional().nullable(),
  // Required on create, optional on update - "leave blank to keep unchanged"
  // is enforced by the caller stripping an empty password before submit.
  password: z.string().min(8, "Password must be at least 8 characters").max(100).optional().or(z.literal("")),
});

export type UserFormInput = z.input<typeof userFormSchema>;
export type UserFormValues = z.output<typeof userFormSchema>;
