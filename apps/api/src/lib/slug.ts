// A hand-rolled slugify instead of the `slugify` package's `strict` mode,
// which strips underscores - admins want slugs like "my_category" to stay
// exactly that, not become "mycategory" or "my-category".
export const slugifyText = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Generates a unique slug for a model by appending -2, -3, ... when the base
 * slug collides. `checkExists` should return true if the slug is taken
 * (excluding the record currently being updated, if any).
 */
export const generateUniqueSlug = async (
  base: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> => {
  const baseSlug = slugifyText(base) || "item";
  let candidate = baseSlug;
  let suffix = 2;

  while (await checkExists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};
