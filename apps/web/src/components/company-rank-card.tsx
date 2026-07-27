import Image from "next/image";
import { ArrowUpRight, BadgeCheck, DollarSign, MapPin, Users } from "lucide-react";
import { PublicCompany } from "@/lib/types";

export function CompanyRankCard({ company, rank }: { company: PublicCompany; rank: number }) {
  const initials = company.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const stacks = company.techStacks.map((t) => t.techStack);
  const visibleStacks = stacks.slice(0, 4);
  const extraCount = stacks.length - visibleStacks.length;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-5 sm:flex-row sm:items-start">
      <span className="text-2xl font-bold tabular-nums text-muted-foreground/50 sm:w-10">
        {String(rank).padStart(2, "0")}
      </span>

      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {company.logo ? (
          <Image src={company.logo} alt={company.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex size-full items-center justify-center text-sm font-semibold text-muted-foreground">
            {initials}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{company.name}</h3>
          {company.verified && <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Verified" />}
          {company.score !== null && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {company.score.toFixed(1)} / 10
            </span>
          )}
        </div>

        {company.shortDescription && (
          <p className="mt-1 text-sm text-muted-foreground">{company.shortDescription}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {company.headOffice && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" /> {company.headOffice}
            </span>
          )}
          {company.employeeRange && (
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> {company.employeeRange.title}
            </span>
          )}
          {company.hourlyRateRange && (
            <span className="flex items-center gap-1">
              <DollarSign className="size-3.5" /> {company.hourlyRateRange.title}
            </span>
          )}
        </div>

        {visibleStacks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleStacks.map((stack) => (
              <span key={stack.slug} className="rounded-md bg-muted px-2 py-0.5 text-xs">
                {stack.name}
              </span>
            ))}
            {extraCount > 0 && <span className="text-xs text-muted-foreground">+{extraCount}</span>}
          </div>
        )}
      </div>

      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Visit Website <ArrowUpRight className="size-3.5" />
        </a>
      )}
    </div>
  );
}
