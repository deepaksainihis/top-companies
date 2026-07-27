import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublicCategories } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const categories = await getPublicCategories();
  const totalCompanies = categories.reduce((sum, c) => sum + c._count.companies, 0);

  return buildMetadata({
    // No dedicated CMS entity for this page's SEO (only Home/About have
    // one) - every field falls back to a value computed from live data.
    seo: { metaTitle: null, metaDescription: null, canonicalUrl: null, ogTitle: null, ogDescription: null, ogImage: null, robots: null },
    path: "/categories",
    fallbackTitle: `All ${categories.length} Categories`,
    fallbackDescription: `Browse ${totalCompanies} reviewed software companies across ${categories.length} categories, ranked by delivery track record.`,
    siteName: "Top Companies",
  });
}

export default async function CategoriesPage() {
  const categories = await getPublicCategories();
  const totalCompanies = categories.reduce((sum, c) => sum + c._count.companies, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold tracking-wide text-primary uppercase">Directory</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        All {categories.length} categories
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        {totalCompanies} reviewed companies, organized by the type of work they specialize in. Pick a category to see
        its ranked list.
      </p>

      {categories.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No categories are available yet.</p>
      ) : (
        <div className="mt-12 divide-y divide-border">
          {categories.map((category) => (
            <section key={category.id} className="py-8 first:pt-0">
              <div className="flex items-start gap-4">
                <div className="relative hidden size-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                  {category.image && (
                    <Image src={category.image} alt={category.name} fill className="object-cover" unoptimized />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <Link href={`/categories/${category.slug}`} className="group flex items-center gap-1.5">
                      <h2 className="text-xl font-semibold group-hover:text-primary">{category.name}</h2>
                      <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    <span className="text-sm text-muted-foreground">{category._count.companies} companies</span>
                  </div>
                  {category.children && category.children.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/categories/${child.slug}`}
                          className="rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary"
                        >
                          {child.name} <span className="text-xs">({child._count.companies})</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
