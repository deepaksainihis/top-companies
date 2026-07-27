import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, Gauge, RefreshCw, ScanSearch, ShieldCheck, Sparkles, Users } from "lucide-react";
import { CategoryCard } from "@/components/category-card";
import { CompanyRankCard } from "@/components/company-rank-card";
import { StatsBar } from "@/components/stats-bar";
import { getHomeData } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomeData();
  return buildMetadata({
    seo: home.seo,
    path: "/",
    fallbackTitle: home.general.siteName ?? "Top Companies",
    fallbackDescription:
      "A hand-reviewed directory of software companies, ranked by real delivery track record - not by who pays the most.",
    fallbackImage: home.general.logo,
    siteName: home.general.siteName ?? "Top Companies",
  });
}

const HOW_IT_WORKS = [
  {
    icon: ScanSearch,
    title: "We source the companies",
    body: "Agencies, studios and dev shops are added to the directory - either by application or nomination from clients who've worked with them.",
  },
  {
    icon: ClipboardCheck,
    title: "Our team reviews the work",
    body: "Portfolios, delivery history and client feedback are checked by hand before a company earns a place in any category.",
  },
  {
    icon: Gauge,
    title: "Each company gets a score",
    body: "Companies are scored 0-10 on expertise, delivery track record and client satisfaction - not on how much they pay us.",
  },
  {
    icon: RefreshCw,
    title: "Rankings stay current",
    body: "As new companies are reviewed and existing ones are re-checked, category rankings are re-ordered to reflect it.",
  },
];

const WHY_US = [
  { icon: ShieldCheck, text: "No pay-to-rank - placement is earned, not purchased" },
  { icon: Users, text: "Reviewed by a real team, not just scraped and sorted" },
  { icon: Sparkles, text: "Categories and scores are kept up to date as companies are re-reviewed" },
];

export default async function HomePage() {
  const home = await getHomeData();
  const spotlight = home.spotlightCategory;

  return (
    <div>
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find software companies <span className="text-primary italic">worth hiring</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {home.seo.metaDescription ??
              "A hand-reviewed directory of software companies, ranked by real delivery track record - not by who pays the most."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Browse Categories <ArrowRight className="size-4" />
            </Link>
            {spotlight && (
              <Link
                href={`/categories/${spotlight.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted"
              >
                See a live ranking
              </Link>
            )}
          </div>

          <div className="mt-14">
            <StatsBar stats={home.stats} />
          </div>
        </div>
      </section>

      {spotlight && spotlight.companies.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Spotlight category</p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold">Top {spotlight.name} Companies</h2>
            <Link
              href={`/categories/${spotlight.slug}`}
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              View full ranking
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {spotlight.companies.map((company, index) => (
              <CompanyRankCard key={company.id} company={company} rank={index + 1} />
            ))}
          </div>
        </section>
      )}

      {home.featuredCategories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold">Explore by Category</h2>
            <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
              See all categories
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {home.featuredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">How the ranking works</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, index) => (
              <div key={step.title}>
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </div>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">STEP {index + 1}</p>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-semibold sm:text-3xl">Why Top Companies</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Most directories rank whoever pays for the top spot. We built this one to work the other way around.
        </p>
        <ul className="mx-auto mt-8 flex max-w-xl flex-col gap-4 text-left">
          {WHY_US.map((item) => (
            <li key={item.text} className="flex items-start gap-3 rounded-xl border border-border p-4">
              <item.icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="text-sm">{item.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
