"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MasterListPage } from "@/components/masters/master-list-page";
import { employeeRangesApi } from "@/lib/queries/employee-ranges";
import { EmployeeRange } from "@/lib/types";

const columns: ColumnDef<EmployeeRange, unknown>[] = [
  { id: "title", accessorKey: "title", header: "Title" },
];

export default function EmployeeRangesPage() {
  return (
    <MasterListPage
      title="Employee Ranges"
      description="Manage employee headcount ranges used on company profiles."
      addHref="/masters/employee-ranges/new"
      searchPlaceholder="Search employee ranges..."
      api={employeeRangesApi}
      columns={columns}
      getLabel={(item) => item.title}
      defaultSort={{ id: "title", desc: false }}
    />
  );
}
