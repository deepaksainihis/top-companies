"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ColumnDef, RowSelectionState, SortingState } from "@tanstack/react-table";
import { Plus, Trash2, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteUser, useUsersQuery } from "@/lib/queries/users";
import { useAuthStore } from "@/lib/auth-store";
import { AdminUser } from "@/lib/types";
import { getErrorMessage } from "@/lib/api-client";

export default function UsersPage() {
  const currentAdminId = useAuthStore((state) => state.admin?.id);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const sort = sorting[0];
  const { data, isLoading } = useUsersQuery({
    page,
    limit: 50,
    search,
    sortBy: sort?.id,
    sortOrder: sort ? (sort.desc ? "desc" : "asc") : undefined,
  });

  const deleteUser = useDeleteUser();

  const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link href={`/users/${row.original.id}`} className="flex items-center gap-2.5">
            <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              {row.original.avatar ? (
                <Image src={row.original.avatar} alt="" fill className="object-cover" unoptimized />
              ) : (
                <UserCircle2 className="size-5 text-muted-foreground" />
              )}
            </div>
            <span className="max-w-56 truncate font-medium hover:underline">{row.original.name}</span>
            {row.original.id === currentAdminId && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">You</span>
            )}
          </Link>
        ),
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/users/${row.original.id}`} />}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={row.original.id === currentAdminId}
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [currentAdminId]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage admin accounts with access to this panel.</p>
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
        searchPlaceholder="Search users..."
        page={page}
        onPageChange={setPage}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        emptyMessage="No users found."
        toolbarRight={
          <Button nativeButton={false} render={<Link href="/users/new" />}>
            <Plus className="size-4" /> Add User
          </Button>
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete user"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteUser.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteUser.mutateAsync(deleteTarget.id);
            toast.success("User deleted");
            setDeleteTarget(null);
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />
    </div>
  );
}
