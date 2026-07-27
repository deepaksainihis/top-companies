import { CategoryForm } from "@/components/forms/category-form";

export default function NewCategoryPage() {
  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Add Category</h1>
        <p className="text-sm text-muted-foreground">Create a new category.</p>
      </div>
      <CategoryForm />
    </div>
  );
}
