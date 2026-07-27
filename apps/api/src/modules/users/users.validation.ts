import { z } from "zod";
import { optionalUrl } from "@/lib/validation";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(150),
  email: z.string().email("Enter a valid email address").max(190),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  avatar: optionalUrl(),
});

// Password is intentionally left out of `.partial()`'s scope for the "leave
// unchanged" contract: the admin frontend simply omits the key entirely when
// the password field is left blank, so `undefined` (which Prisma treats as
// "don't touch this column") is exactly the right semantics here - unlike
// optionalUrl's empty-string-means-null behavior, blank never means "clear
// the password".
export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(150).optional(),
  email: z.string().email("Enter a valid email address").max(190).optional(),
  avatar: optionalUrl(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
