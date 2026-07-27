"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { MasterListPage } from "@/components/masters/master-list-page";
import { techStacksApi } from "@/lib/queries/tech-stacks";
import { TechStack } from "@/lib/types";

const columns: ColumnDef<TechStack, unknown>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Tech Stack",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="relative size-6 shrink-0 overflow-hidden rounded bg-muted">
          {row.original.icon && <Image src={row.original.icon} alt="" fill className="object-cover" unoptimized />}
        </div>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  { id: "slug", accessorKey: "slug", header: "Slug", enableSorting: false },
];

export default function TechStacksPage() {
  return (
    <MasterListPage
      title="Tech Stacks"
      description="Manage the technologies companies can be tagged with."
      addHref="/masters/tech-stacks/new"
      searchPlaceholder="Search tech stacks..."
      api={techStacksApi}
      columns={columns}
      getLabel={(item) => item.name}
      defaultSort={{ id: "name", desc: false }}
    />
  );
}
