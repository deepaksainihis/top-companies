"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { TitleStatusForm } from "@/components/forms/title-status-form";
import { hourlyRateRangesApi } from "@/lib/queries/hourly-rate-ranges";

export default function EditHourlyRateRangePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: hourlyRateRange, isLoading } = hourlyRateRangesApi.useOne(id);
  const updateHourlyRateRange = hourlyRateRangesApi.useUpdate(id);

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Hourly Rate Range</h1>
        <p className="text-sm text-muted-foreground">Update this hourly rate range.</p>
      </div>
      {isLoading || !hourlyRateRange ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <TitleStatusForm
          item={hourlyRateRange}
          backHref="/masters/hourly-rate-ranges"
          entityLabel="Hourly Rate Range"
          onSubmit={(values) => updateHourlyRateRange.mutateAsync(values)}
        />
      )}
    </div>
  );
}
