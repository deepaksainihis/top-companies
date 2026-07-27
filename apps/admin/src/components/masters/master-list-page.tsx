"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ColumnDef, RowSelectionState, SortingState } from "@tanstack/react-table";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusSwitch } from "@/components/shared/status-switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getErrorMessage } from "@/lib/api-client";
import { ListParams } from "@/lib/list-params";
import { Status, statusFilterLabel } from "@/lib/types";

interface MasterEntity {
  id: number;
  status: Status;
}

interface MasterApi<T> {
  useList: (params: ListParams) => {
    data?: { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } };
    isLoading: boolean;
  };
  useUpdate: (id: number) => { mutateAsync: (payload: Record<string, unknown>) => Promise<unknown> };
  useRemove: () => { mutateAsync: (id: number) => Promise<void>; isPending: boolean };
  useRestore: () => { mutateAsync: (id: number) => Promise<void>; isPending: boolean };
  usePermanentlyDelete: () => { mutateAsync: (id: number) => Promise<void>; isPending: boolean };
  useBulkDelete: () => { mutateAsync: (ids: number[]) => Promise<void>; isPending: boolean };
  useBulkRestore: () => { mutateAsync: (ids: number[]) => Promise<void>; isPending: boolean };
  useBulkPermanentlyDelete: () => { mutateAsync: (ids: number[]) => Promise<void>; isPending: boolean };
  useBulkStatus: () => {
    mutateAsync: (args: { ids: number[]; status: "ACTIVE" | "INACTIVE" }) => Promise<void>;
    isPending: boolean;
  };
}

interface MasterListPageProps<T extends MasterEntity> {
  title: string;
  description: string;
  addHref: string;
  searchPlaceholder: string;
  api: MasterApi<T>;
  columns: ColumnDef<T, unknown>[];
  getLabel: (item: T) => string;
  defaultSort?: { id: string; desc: boolean };
}

export function MasterListPage<T extends MasterEntity>({
  title,
  description,
  addHref,
  searchPlaceholder,
  api,
  columns,
  getLabel,
  defaultSort,
}: MasterListPageProps<T>) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>(defaultSort ? [defaultSort] : []);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<T | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPermanentDeleteOpen, setBulkPermanentDeleteOpen] = useState(false);

  const isDeletedView = status === "DELETED";

  const sort = sorting[0];
  const { data, isLoading } = api.useList({
    page,
    limit: 50,
    search,
    status: status || undefined,
    sortBy: sort?.id,
    sortOrder: sort ? (sort.desc ? "desc" : "asc") : undefined,
  });

  const removeOne = api.useRemove();
  const restoreOne = api.useRestore();
  const permanentlyDeleteOne = api.usePermanentlyDelete();
  const bulkDelete = api.useBulkDelete();
  const bulkRestore = api.useBulkRestore();
  const bulkPermanentlyDelete = api.useBulkPermanentlyDelete();
  const bulkStatus = api.useBulkStatus();

  const allColumns = useMemo<ColumnDef<T, unknown>[]>(
    () => [
      ...columns,
      {
        id: "status",
        header: "Status",
        cell: ({ row }) =>
          isDeletedView ? (
            <span className="text-xs font-medium text-muted-foreground">Deleted</span>
          ) : (
            <MasterStatusCell api={api} entity={row.original} />
          ),
        enableSorting: false,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          isDeletedView ? (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => restoreRow(row.original)}>
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
                render={<Link href={`${addHref.replace(/\/new$/, "")}/${row.original.id}`} />}
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
    [columns, addHref, isDeletedView]
  );

  const selectedIds = () => Object.keys(rowSelection).filter((id) => rowSelection[id]).map(Number);

  const restoreRow = async (entity: T) => {
    try {
      await restoreOne.mutateAsync(entity.id);
      toast.success("Restored successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleBulkStatus = async (newStatus: "ACTIVE" | "INACTIVE") => {
    try {
      await bulkStatus.mutateAsync({ ids: selectedIds(), status: newStatus });
      setRowSelection({});
      toast.success("Status updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(selectedIds());
      setRowSelection({});
      setBulkDeleteOpen(false);
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestore.mutateAsync(selectedIds());
      setRowSelection({});
      toast.success("Restored successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleBulkPermanentDelete = async () => {
    try {
      await bulkPermanentlyDelete.mutateAsync(selectedIds());
      setRowSelection({});
      setBulkPermanentDeleteOpen(false);
      toast.success("Permanently deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <DataTable
        columns={allColumns}
        data={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder={searchPlaceholder}
        page={page}
        onPageChange={setPage}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        emptyMessage="No records found."
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
            <Button nativeButton={false} render={<Link href={addHref} />}>
              <Plus className="size-4" /> Add New
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
        title="Delete record"
        description={`Are you sure you want to delete "${deleteTarget ? getLabel(deleteTarget) : ""}"? You can restore it later from the Deleted filter.`}
        isLoading={removeOne.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await removeOne.mutateAsync(deleteTarget.id);
            toast.success("Deleted successfully");
            setDeleteTarget(null);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected records"
        description="Are you sure you want to delete the selected records? You can restore them later from the Deleted filter."
        isLoading={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
      />

      <ConfirmDialog
        open={!!permanentDeleteTarget}
        onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
        title="Permanently delete record"
        description={`This cannot be undone. Permanently delete "${permanentDeleteTarget ? getLabel(permanentDeleteTarget) : ""}"?`}
        confirmLabel="Delete Permanently"
        isLoading={permanentlyDeleteOne.isPending}
        onConfirm={async () => {
          if (!permanentDeleteTarget) return;
          try {
            await permanentlyDeleteOne.mutateAsync(permanentDeleteTarget.id);
            toast.success("Permanently deleted");
            setPermanentDeleteTarget(null);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={bulkPermanentDeleteOpen}
        onOpenChange={setBulkPermanentDeleteOpen}
        title="Permanently delete selected records"
        description="This cannot be undone. Permanently delete the selected records?"
        confirmLabel="Delete Permanently"
        isLoading={bulkPermanentlyDelete.isPending}
        onConfirm={handleBulkPermanentDelete}
      />
    </div>
  );
}

function MasterStatusCell<T extends MasterEntity>({ api, entity }: { api: MasterApi<T>; entity: T }) {
  const update = api.useUpdate(entity.id);
  return <StatusSwitch status={entity.status} onToggle={(next) => update.mutateAsync({ status: next })} />;
}
