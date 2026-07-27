"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MasterListPage } from "@/components/masters/master-list-page";
import { hourlyRateRangesApi } from "@/lib/queries/hourly-rate-ranges";
import { HourlyRateRange } from "@/lib/types";

const columns: ColumnDef<HourlyRateRange, unknown>[] = [
  { id: "title", accessorKey: "title", header: "Title" },
];

export default function HourlyRateRangesPage() {
  return (
    <MasterListPage
      title="Hourly Rate Ranges"
      description="Manage hourly rate ranges used on company profiles."
      addHref="/masters/hourly-rate-ranges/new"
      searchPlaceholder="Search hourly rate ranges..."
      api={hourlyRateRangesApi}
      columns={columns}
      getLabel={(item) => item.title}
      defaultSort={{ id: "title", desc: false }}
    />
  );
}
