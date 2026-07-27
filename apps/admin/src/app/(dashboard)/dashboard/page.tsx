"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, FolderTree, Globe2, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDashboardQuery } from "@/lib/queries/dashboard";

const STAT_CARDS = [
  { key: "totalCompanies" as const, label: "Total Companies", icon: Building2 },
  { key: "totalCategories" as const, label: "Total Categories", icon: FolderTree },
  { key: "totalCountries" as const, label: "Total Countries", icon: Globe2 },
  { key: "totalTechStacks" as const, label: "Total Tech Stacks", icon: Layers },
];

export default function DashboardPage() {
  const { data, isLoading } = useDashboardQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your Top Companies directory.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-8 w-16" />
                ) : (
                  <p className="mt-1 text-2xl font-semibold">{data?.totals[key] ?? 0}</p>
                )}
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            {!isLoading && data?.recentCompanies.length === 0 && (
              <p className="text-sm text-muted-foreground">No companies yet.</p>
            )}
            {data?.recentCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted"
              >
                <div className="relative size-9 shrink-0 overflow-hidden rounded-md bg-muted">
                  {company.logo && <Image src={company.logo} alt="" fill className="object-cover" unoptimized />}
                </div>
                <span className="flex-1 truncate text-sm font-medium">{company.name}</span>
                <StatusBadge status={company.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            {!isLoading && data?.recentCategories.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            )}
            {data?.recentCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted"
              >
                <span className="flex-1 truncate text-sm font-medium">{category.name}</span>
                <StatusBadge status={category.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
