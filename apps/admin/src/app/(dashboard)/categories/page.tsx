"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ColumnDef, RowSelectionState, SortingState } from "@tanstack/react-table";
import { Plus, RotateCcw, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { StatusSwitch } from "@/components/shared/status-switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  useBulkDeleteCategories,
  useBulkPermanentlyDeleteCategories,
  useBulkRestoreCategories,
  useBulkUpdateCategoryStatus,
  useCategoriesQuery,
  useDeleteCategory,
  usePermanentlyDeleteCategory,
  useRestoreCategory,
  useUpdateCategory,
} from "@/lib/queries/categories";
import { Category, statusFilterLabel } from "@/lib/types";
import { getErrorMessage } from "@/lib/api-client";

function CategoryStatusCell({ category }: { category: Category }) {
  const update = useUpdateCategory(category.id);
  return <StatusSwitch status={category.status} onToggle={(next) => update.mutateAsync({ status: next })} />;
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "displayOrder", desc: false }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Category | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPermanentDeleteOpen, setBulkPermanentDeleteOpen] = useState(false);

  const isDeletedView = status === "DELETED";

  const sort = sorting[0];
  const { data, isLoading } = useCategoriesQuery({
    page,
    limit: 50,
    search,
    status: status || undefined,
    sortBy: sort?.id,
    sortOrder: sort ? (sort.desc ? "desc" : "asc") : undefined,
  });

  const deleteCategory = useDeleteCategory();
  const restoreCategory = useRestoreCategory();
  const permanentlyDeleteCategory = usePermanentlyDeleteCategory();
  const bulkDelete = useBulkDeleteCategories();
  const bulkRestore = useBulkRestoreCategories();
  const bulkPermanentlyDelete = useBulkPermanentlyDeleteCategories();
  const bulkStatus = useBulkUpdateCategoryStatus();

  const columns = useMemo<ColumnDef<Category, unknown>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Category",
        cell: ({ row }) => (
          <Link href={`/categories/${row.original.id}`} className="flex items-center gap-2">
            <span className="max-w-56 truncate font-medium hover:underline">{row.original.name}</span>
            {row.original.featured && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />}
          </Link>
        ),
      },
      {
        id: "parent",
        header: "Parent",
        cell: ({ row }) => row.original.parent?.name ?? "—",
        enableSorting: false,
      },
      {
        id: "companies",
        header: "Companies",
        cell: ({ row }) => row.original._count?.companies ?? 0,
        enableSorting: false,
      },
      {
        id: "faqs",
        header: "FAQs",
        cell: ({ row }) => row.original._count?.faqs ?? 0,
        enableSorting: false,
      },
      {
        id: "displayOrder",
        accessorKey: "displayOrder",
        header: "Order",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) =>
          isDeletedView ? (
            <span className="text-xs font-medium text-muted-foreground">Deleted</span>
          ) : (
            <CategoryStatusCell category={row.original} />
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
                    await restoreCategory.mutateAsync(row.original.id);
                    toast.success("Category restored");
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
                render={<Link href={`/categories/${row.original.id}`} />}
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
    [isDeletedView, restoreCategory]
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
      toast.success("Categories deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleBulkRestore = async () => {
    const ids = Object.keys(rowSelection).filter((id) => rowSelection[id]).map(Number);
    try {
      await bulkRestore.mutateAsync(ids);
      setRowSelection({});
      toast.success("Categories restored");
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
      toast.success("Categories permanently deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage categories and their SEO content.</p>
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
        searchPlaceholder="Search categories..."
        page={page}
        onPageChange={setPage}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        emptyMessage="No categories found."
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
            <Button nativeButton={false} render={<Link href="/categories/new" />}>
              <Plus className="size-4" /> Add Category
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
        title="Delete category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Categories with subcategories cannot be deleted. You can restore it later from the Deleted filter.`}
        isLoading={deleteCategory.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteCategory.mutateAsync(deleteTarget.id);
            toast.success("Category deleted");
            setDeleteTarget(null);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected categories"
        description="Are you sure you want to delete the selected categories? You can restore them later from the Deleted filter."
        isLoading={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
      />

      <ConfirmDialog
        open={!!permanentDeleteTarget}
        onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
        title="Permanently delete category"
        description={`This cannot be undone. Permanently delete "${permanentDeleteTarget?.name}"? Categories that still have subcategories (even deleted ones) can't be permanently deleted.`}
        confirmLabel="Delete Permanently"
        isLoading={permanentlyDeleteCategory.isPending}
        onConfirm={async () => {
          if (!permanentDeleteTarget) return;
          try {
            await permanentlyDeleteCategory.mutateAsync(permanentDeleteTarget.id);
            toast.success("Category permanently deleted");
            setPermanentDeleteTarget(null);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={bulkPermanentDeleteOpen}
        onOpenChange={setBulkPermanentDeleteOpen}
        title="Permanently delete selected categories"
        description="This cannot be undone. Permanently delete the selected categories? Any with remaining subcategories will be skipped."
        confirmLabel="Delete Permanently"
        isLoading={bulkPermanentlyDelete.isPending}
        onConfirm={handleBulkPermanentDelete}
      />
    </div>
  );
}
