"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { MasterListPage } from "@/components/masters/master-list-page";
import { countriesApi } from "@/lib/queries/countries";
import { Country } from "@/lib/types";

const columns: ColumnDef<Country, unknown>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Country",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="relative h-4 w-6 shrink-0 overflow-hidden rounded-sm bg-muted">
          {row.original.flag && <Image src={row.original.flag} alt="" fill className="object-cover" unoptimized />}
        </div>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  { id: "iso2", accessorKey: "iso2", header: "ISO2", enableSorting: false },
];

export default function CountriesPage() {
  return (
    <MasterListPage
      title="Countries"
      description="Manage the countries available for companies."
      addHref="/masters/countries/new"
      searchPlaceholder="Search countries..."
      api={countriesApi}
      columns={columns}
      getLabel={(item) => item.name}
      defaultSort={{ id: "name", desc: false }}
    />
  );
}
