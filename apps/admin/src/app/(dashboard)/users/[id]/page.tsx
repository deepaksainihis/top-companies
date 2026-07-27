"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { UserForm } from "@/components/forms/user-form";
import { useUserQuery } from "@/lib/queries/users";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const { data: user, isLoading } = useUserQuery(Number(params.id));

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit User</h1>
        <p className="text-sm text-muted-foreground">Update this admin user&apos;s details.</p>
      </div>
      {isLoading || !user ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <UserForm user={user} />
      )}
    </div>
  );
}
