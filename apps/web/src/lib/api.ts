import { AboutData, HomeData, PublicCategoryDetail, PublicCategorySummary } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Public pages are SEO-facing but backed by admin-edited data, not
// request-time state - ISR (revalidate every 60s) is the right fit rather
// than fully static or fully dynamic rendering.
const REVALIDATE_SECONDS = 60;

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

async function fetchPublicApi<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Public API request failed: ${path} (${res.status})`);

  const json: ApiEnvelope<T> = await res.json();
  return json.data;
}

export const getHomeData = async (): Promise<HomeData> => {
  const data = await fetchPublicApi<HomeData>("/public/home");
  if (!data) throw new Error("Failed to load home data");
  return data;
};

export const getPublicCategories = async (): Promise<PublicCategorySummary[]> => {
  const data = await fetchPublicApi<PublicCategorySummary[]>("/public/categories");
  return data ?? [];
};

export const getPublicCategoryBySlug = async (slug: string): Promise<PublicCategoryDetail | null> =>
  fetchPublicApi<PublicCategoryDetail>(`/public/categories/${encodeURIComponent(slug)}`);

export const getPublicAbout = async (): Promise<AboutData> => {
  const data = await fetchPublicApi<AboutData>("/public/about");
  if (!data) throw new Error("Failed to load about data");
  return data;
};
