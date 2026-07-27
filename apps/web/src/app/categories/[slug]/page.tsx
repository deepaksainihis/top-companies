import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CompanyRankCard } from "@/components/company-rank-card";
import { FaqAccordion } from "@/components/faq-accordion";
import { getPublicCategoryBySlug } from "@/lib/api";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublicCategoryBySlug(slug);
  if (!category) return {};

  return buildMetadata({
    seo: category,
    path: `/categories/${category.slug}`,
    fallbackTitle: `${category.name} - Top Companies`,
    fallbackDescription:
      category.heroDescription ?? `Compare the top-reviewed ${category.name.toLowerCase()} companies, ranked 0-10.`,
    fallbackImage: category.image,
    siteName: "Top Companies",
  });
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getPublicCategoryBySlug(slug);

  if (!category) notFound();

  const breadcrumbItems = [
    { name: "Home", url: absoluteUrl("/") },
    { name: "Categories", url: absoluteUrl("/categories") },
    ...(category.parent ? [{ name: category.parent.name, url: absoluteUrl(`/categories/${category.parent.slug}`) }] : []),
    { name: category.name, url: absoluteUrl(`/categories/${category.slug}`) },
  ];

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Top ${category.name} Companies`,
    itemListElement: category.companies.map((company, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: company.name,
      url: company.website ?? undefined,
    })),
  };

  const faqJsonLd = category.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: category.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/categories" className="hover:text-foreground">
          Categories
        </Link>
        {category.parent && (
          <>
            <ChevronRight className="size-3.5" />
            <Link href={`/categories/${category.parent.slug}`} className="hover:text-foreground">
              {category.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{category.name}</h1>
      {category.heroDescription && <p className="mt-3 max-w-2xl text-muted-foreground">{category.heroDescription}</p>}

      {category.children.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.slug}`}
              className="rounded-full border border-border px-3 py-1 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      {category.description && (
        <div
          className="prose-content mt-8 max-w-2xl text-sm text-foreground"
          dangerouslySetInnerHTML={{ __html: category.description }}
        />
      )}

      <div className="mt-10 space-y-4">
        {category.companies.length === 0 ? (
          <p className="text-muted-foreground">No companies are listed in this category yet.</p>
        ) : (
          category.companies.map((company, index) => (
            <CompanyRankCard key={company.id} company={company} rank={index + 1} />
          ))
        )}
      </div>

      {category.faqs.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="mt-5">
            <FaqAccordion faqs={category.faqs} />
          </div>
        </div>
      )}
    </div>
  );
}
