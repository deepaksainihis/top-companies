"use client";

import { TitleStatusForm } from "@/components/forms/title-status-form";
import { employeeRangesApi } from "@/lib/queries/employee-ranges";

export default function NewEmployeeRangePage() {
  const createEmployeeRange = employeeRangesApi.useCreate();

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Add Employee Range</h1>
        <p className="text-sm text-muted-foreground">Create a new employee range.</p>
      </div>
      <TitleStatusForm
        backHref="/masters/employee-ranges"
        entityLabel="Employee Range"
        onSubmit={(values) => createEmployeeRange.mutateAsync(values)}
      />
    </div>
  );
}
