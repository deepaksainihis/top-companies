import { z } from "zod";

/**
 * Optional URL field that treats an empty string as "clear this field".
 * Plain `z.string().url().optional()` still rejects `""` (optional only
 * means the key can be omitted, not that an empty value is acceptable) -
 * every admin form leaves fields like this blank routinely, so without this
 * the whole request 422s the moment one optional URL field is empty.
 *
 * Preprocessing "" to `null` (not `undefined`) matters here: Prisma's
 * `update()` silently *skips* fields whose value is `undefined`, but writes
 * `null` - so `null` is what actually clears a previously-set value instead
 * of leaving the old one in place.
 */
export const optionalUrl = (message = "Must be a valid URL", maxLength = 500) =>
  z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().url(message).max(maxLength).optional().nullable()
  );

/** Same empty-string footgun as `optionalUrl`, for optional email fields. */
export const optionalEmail = (message = "Enter a valid email", maxLength = 190) =>
  z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().email(message).max(maxLength).optional().nullable()
  );
