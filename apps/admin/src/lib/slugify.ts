// Lightweight client-side slug preview. The API is the source of truth for
// uniqueness (appending -2, -3, ...); this only mirrors its basic shape so
// the admin sees a live preview while typing.
export const slugifyPreview = (text: string): string =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
