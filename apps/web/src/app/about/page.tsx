import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { getPublicAbout } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getPublicAbout();
  return buildMetadata({
    seo: about.seo,
    path: "/about",
    fallbackTitle: "About - Top Companies",
    fallbackDescription: "How Top Companies reviews, scores and ranks software companies.",
    siteName: "Top Companies",
  });
}

const PRINCIPLES = [
  {
    label: "P/01",
    title: "Earned, not bought",
    body: "A company's position in a category reflects its review, not its ad spend. There is no paid placement.",
  },
  {
    label: "P/02",
    title: "Reviewed by people",
    body: "Every listing is checked by our team - portfolio, delivery history, client feedback - before it earns a score.",
  },
  {
    label: "P/03",
    title: "Always current",
    body: "Companies are re-reviewed over time, so a ranking reflects how a company is doing now, not just when it joined.",
  },
  {
    label: "P/04",
    title: "Built for both sides",
    body: "Useful whether you're comparing companies to hire, or you run one and want to be found.",
  },
];

export default async function AboutPage() {
  const about = await getPublicAbout();
  const { general } = about;
  const hasContactInfo = general.contactEmail || general.phone || general.address;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold tracking-wide text-primary uppercase">About</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        A directory built to be trusted, <span className="italic text-primary">not sold</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Top Companies exists to make finding a good software company as easy as reading a well-organized list -
        curated by hand, scored consistently, and never for sale.
      </p>

      <div className="mt-14 border-t border-border pt-10">
        <p className="text-xs font-semibold text-muted-foreground">01 — Our story</p>
        {about.aboutContent ? (
          <div className="prose-content mt-4 text-foreground" dangerouslySetInnerHTML={{ __html: about.aboutContent }} />
        ) : (
          <p className="mt-4 text-muted-foreground">More information coming soon.</p>
        )}
      </div>

      <div className="mt-14 border-t border-border pt-10">
        <p className="text-xs font-semibold text-muted-foreground">02 — What we believe</p>
        <h2 className="mt-2 text-2xl font-semibold">The rules we hold ourselves to</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <div key={principle.label} className="rounded-xl border border-border p-5">
              <p className="text-xs font-semibold text-primary">{principle.label}</p>
              <h3 className="mt-2 font-semibold">{principle.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{principle.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 border-t border-border pt-10">
        <p className="text-xs font-semibold text-muted-foreground">03 — How it works</p>
        <h2 className="mt-2 text-2xl font-semibold">Scoring, in plain terms</h2>
        <p className="mt-4 text-muted-foreground">
          Every company is scored from 0 to 10 across three things: technical expertise, delivery track record, and
          value for money. Companies are grouped into categories - some with subcategories - so you can compare like
          with like instead of scrolling through everything at once.
        </p>
      </div>

      <div className="mt-14 border-t border-border pt-10">
        <p className="text-xs font-semibold text-muted-foreground">04 — Who it&apos;s for</p>
        <h2 className="mt-2 text-2xl font-semibold">Two audiences, one directory</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">If you&apos;re hiring:</span> browse a category, compare
            scores and details side by side, and go straight to a company&apos;s own site when you&apos;re ready to
            reach out.
          </p>
          <p>
            <span className="font-medium text-foreground">If you run a company:</span> get in touch using the details
            below to be considered for a category that fits your work.
          </p>
        </div>
      </div>

      {hasContactInfo && (
        <div className="mt-14 rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold">Get in touch</h2>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            {general.contactEmail && (
              <p className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" />
                <a href={`mailto:${general.contactEmail}`} className="hover:text-foreground">
                  {general.contactEmail}
                </a>
              </p>
            )}
            {general.phone && (
              <p className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" /> {general.phone}
              </p>
            )}
            {general.address && (
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" /> {general.address}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
