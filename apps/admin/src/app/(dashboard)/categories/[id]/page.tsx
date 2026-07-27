"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryForm } from "@/components/forms/category-form";
import { useCategoryQuery } from "@/lib/queries/categories";

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const { data: category, isLoading } = useCategoryQuery(Number(params.id));

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Category</h1>
        <p className="text-sm text-muted-foreground">Update this category&apos;s details.</p>
      </div>
      {isLoading || !category ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <CategoryForm category={category} />
      )}
    </div>
  );
}
