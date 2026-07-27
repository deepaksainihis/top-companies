"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { TitleStatusForm } from "@/components/forms/title-status-form";
import { employeeRangesApi } from "@/lib/queries/employee-ranges";

export default function EditEmployeeRangePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: employeeRange, isLoading } = employeeRangesApi.useOne(id);
  const updateEmployeeRange = employeeRangesApi.useUpdate(id);

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Employee Range</h1>
        <p className="text-sm text-muted-foreground">Update this employee range.</p>
      </div>
      {isLoading || !employeeRange ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <TitleStatusForm
          item={employeeRange}
          backHref="/masters/employee-ranges"
          entityLabel="Employee Range"
          onSubmit={(values) => updateEmployeeRange.mutateAsync(values)}
        />
      )}
    </div>
  );
}
