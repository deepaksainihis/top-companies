import type { Metadata } from "next";
import { SeoBlock } from "@/lib/types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const absoluteUrl = (path: string): string => new URL(path, SITE_URL).toString();

interface BuildMetadataOptions {
  seo: SeoBlock;
  /** Page path, e.g. "/", "/about", "/categories/web-development" - used to build the self-referencing canonical fallback. */
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackImage?: string | null;
  siteName: string;
}

/**
 * Every public page pulls the same shape of SEO data from the backend
 * (meta title/description, canonical, OG title/description/image, robots)
 * and needs the same fallback behavior - most importantly a
 * self-referencing canonical URL when the admin hasn't set one explicitly,
 * which prevents duplicate-content issues rather than emitting no canonical
 * tag at all.
 */
export function buildMetadata({
  seo,
  path,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
  siteName,
}: BuildMetadataOptions): Metadata {
  const title = seo.metaTitle ?? fallbackTitle;
  const description = seo.metaDescription ?? fallbackDescription;
  const canonical = seo.canonicalUrl ?? absoluteUrl(path);
  const ogImage = seo.ogImage ?? fallbackImage ?? undefined;
  const ogTitle = seo.ogTitle ?? title;
  const ogDescription = seo.ogDescription ?? description;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: seo.robots ?? "index, follow",
  };
}
