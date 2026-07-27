import type { MetadataRoute } from "next";
import { getPublicCategories } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getPublicCategories();

  const categoryEntries: MetadataRoute.Sitemap = categories.flatMap((category) => [
    {
      url: `${SITE_URL}/categories/${category.slug}`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...(category.children ?? []).map((child) => ({
      url: `${SITE_URL}/categories/${child.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ]);

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/categories`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...categoryEntries,
  ];
}
