"use client";

import { TitleStatusForm } from "@/components/forms/title-status-form";
import { hourlyRateRangesApi } from "@/lib/queries/hourly-rate-ranges";

export default function NewHourlyRateRangePage() {
  const createHourlyRateRange = hourlyRateRangesApi.useCreate();

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Add Hourly Rate Range</h1>
        <p className="text-sm text-muted-foreground">Create a new hourly rate range.</p>
      </div>
      <TitleStatusForm
        backHref="/masters/hourly-rate-ranges"
        entityLabel="Hourly Rate Range"
        onSubmit={(values) => createHourlyRateRange.mutateAsync(values)}
      />
    </div>
  );
}
