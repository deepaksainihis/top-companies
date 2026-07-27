"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ColumnDef, RowSelectionState, SortingState } from "@tanstack/react-table";
import { Plus, RotateCcw, Star, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { StatusSwitch } from "@/components/shared/status-switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  useBulkDeleteCompanies,
  useBulkPermanentlyDeleteCompanies,
  useBulkRestoreCompanies,
  useBulkUpdateCompanyStatus,
  useCompaniesQuery,
  useDeleteCompany,
  usePermanentlyDeleteCompany,
  useRestoreCompany,
  useUpdateCompany,
} from "@/lib/queries/companies";
import { Company, statusFilterLabel } from "@/lib/types";
import { getErrorMessage } from "@/lib/api-client";

function CompanyStatusCell({ company }: { company: Company }) {
  const update = useUpdateCompany(company.id);
  return <StatusSwitch status={company.status} onToggle={(next) => update.mutateAsync({ status: next })} />;
}

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Company | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPermanentDeleteOpen, setBulkPermanentDeleteOpen] = useState(false);

  const isDeletedView = status === "DELETED";

  const sort = sorting[0];
  const { data, isLoading } = useCompaniesQuery({
    page,
    limit: 50,
    search,
    status: status || undefined,
    sortBy: sort?.id,
    sortOrder: sort ? (sort.desc ? "desc" : "asc") : undefined,
  });

  const deleteCompany = useDeleteCompany();
  const restoreCompany = useRestoreCompany();
  const permanentlyDeleteCompany = usePermanentlyDeleteCompany();
  const bulkDelete = useBulkDeleteCompanies();
  const bulkRestore = useBulkRestoreCompanies();
  const bulkPermanentlyDelete = useBulkPermanentlyDeleteCompanies();
  const bulkStatus = useBulkUpdateCompanyStatus();

  const columns = useMemo<ColumnDef<Company, unknown>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Company",
        cell: ({ row }) => (
          <Link href={`/companies/${row.original.id}`} className="flex items-center gap-2.5">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-md bg-muted">
              {row.original.logo && (
                <Image src={row.original.logo} alt="" fill className="object-cover" unoptimized />
              )}
            </div>
            <span className="max-w-56 truncate font-medium hover:underline">{row.original.name}</span>
            {row.original.featured && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />}
          </Link>
        ),
      },
      {
        id: "country",
        header: "Country",
        cell: ({ row }) => row.original.country?.name ?? "—",
        enableSorting: false,
      },
      {
        id: "techStacks",
        header: "Tech Stacks",
        cell: ({ row }) => (
          <div className="flex max-w-48 flex-wrap gap-1">
            {row.original.techStacks.slice(0, 3).map((t) => (
              <span key={t.techStackId} className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {t.techStack.name}
              </span>
            ))}
            {row.original.techStacks.length > 3 && (
              <span className="text-xs text-muted-foreground">+{row.original.techStacks.length - 3}</span>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        id: "verified",
        header: "Verified",
        cell: ({ row }) =>
          row.original.verified ? (
            <CheckCircle2 className="size-4 text-emerald-500" />
          ) : (
            <XCircle className="size-4 text-muted-foreground/40" />
          ),
        enableSorting: false,
      },
      {
        id: "score",
        accessorKey: "score",
        header: "Score",
        cell: ({ row }) => row.original.score ?? "—",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) =>
          isDeletedView ? (
            <span className="text-xs font-medium text-muted-foreground">Deleted</span>
          ) : (
            <CompanyStatusCell company={row.original} />
          ),
        enableSorting: false,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          isDeletedView ? (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    await restoreCompany.mutateAsync(row.original.id);
                    toast.success("Company restored");
                  } catch (error) {
                    toast.error(getErrorMessage(error));
                  }
                }}
              >
                <RotateCcw className="size-3.5" /> Restore
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setPermanentDeleteTarget(row.original)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href={`/companies/${row.original.id}`} />}
              >
                Edit
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(row.original)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ),
        enableSorting: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDeletedView, restoreCompany]
  );

  const handleBulkStatus = async (newStatus: "ACTIVE" | "INACTIVE") => {
    const ids = Object.keys(rowSelection).filter((id) => rowSelection[id]).map(Number);
    try {
      await bulkStatus.mutateAsync({ ids, status: newStatus });
      setRowSelection({});
      toast.success("Status updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(rowSelection).filter((id) => rowSelection[id]).map(Number);
    try {
      await bulkDelete.mutateAsync(ids);
      setRowSelection({});
      setBulkDeleteOpen(false);
      toast.success("Companies deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleBulkRestore = async () => {
    const ids = Object.keys(rowSelection).filter((id) => rowSelection[id]).map(Number);
    try {
      await bulkRestore.mutateAsync(ids);
      setRowSelection({});
      toast.success("Companies restored");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleBulkPermanentDelete = async () => {
    const ids = Object.keys(rowSelection).filter((id) => rowSelection[id]).map(Number);
    try {
      await bulkPermanentlyDelete.mutateAsync(ids);
      setRowSelection({});
      setBulkPermanentDeleteOpen(false);
      toast.success("Companies permanently deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-sm text-muted-foreground">Manage companies listed on the platform.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search companies..."
        page={page}
        onPageChange={setPage}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        emptyMessage="No companies found."
        filtersSlot={
          <Select
            value={status || "all"}
            onValueChange={(v) => {
              setStatus(!v || v === "all" ? "" : v);
              setRowSelection({});
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status">{statusFilterLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="DELETED">Deleted</SelectItem>
            </SelectContent>
          </Select>
        }
        toolbarRight={
          !isDeletedView && (
            <Button nativeButton={false} render={<Link href="/companies/new" />}>
              <Plus className="size-4" /> Add Company
            </Button>
          )
        }
        bulkActionsSlot={() =>
          isDeletedView ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkRestore}>
                <RotateCcw className="size-3.5" /> Restore
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBulkPermanentDeleteOpen(true)}>
                <Trash2 className="size-3.5" /> Delete Permanently
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkStatus("ACTIVE")}>
                Activate
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkStatus("INACTIVE")}>
                Deactivate
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </div>
          )
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete company"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? You can restore it later from the Deleted filter.`}
        isLoading={deleteCompany.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteCompany.mutateAsync(deleteTarget.id);
            toast.success("Company deleted");
            setDeleteTarget(null);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected companies"
        description="Are you sure you want to delete the selected companies? You can restore them later from the Deleted filter."
        isLoading={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
      />

      <ConfirmDialog
        open={!!permanentDeleteTarget}
        onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
        title="Permanently delete company"
        description={`This cannot be undone. Permanently delete "${permanentDeleteTarget?.name}"?`}
        confirmLabel="Delete Permanently"
        isLoading={permanentlyDeleteCompany.isPending}
        onConfirm={async () => {
          if (!permanentDeleteTarget) return;
          try {
            await permanentlyDeleteCompany.mutateAsync(permanentDeleteTarget.id);
            toast.success("Company permanently deleted");
            setPermanentDeleteTarget(null);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={bulkPermanentDeleteOpen}
        onOpenChange={setBulkPermanentDeleteOpen}
        title="Permanently delete selected companies"
        description="This cannot be undone. Permanently delete the selected companies?"
        confirmLabel="Delete Permanently"
        isLoading={bulkPermanentlyDelete.isPending}
        onConfirm={handleBulkPermanentDelete}
      />
    </div>
  );
}
