import { HomeStats } from "@/lib/types";

const LABELS: { key: keyof HomeStats; label: string }[] = [
  { key: "totalCompanies", label: "Companies Listed" },
  { key: "totalCategories", label: "Categories" },
  { key: "totalCountries", label: "Countries" },
  { key: "totalTechStacks", label: "Technologies" },
];

export function StatsBar({ stats }: { stats: HomeStats }) {
  return (
    <dl className="mx-auto grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
      {LABELS.map(({ key, label }) => (
        <div key={key} className="text-center">
          <dd className="text-3xl font-bold tabular-nums">{stats[key]}+</dd>
          <dt className="mt-1 text-sm text-muted-foreground">{label}</dt>
        </div>
      ))}
    </dl>
  );
}
