"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuditFooter } from "@/components/shared/audit-footer";
import { ImageUpload } from "@/components/shared/image-upload";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { SlugField } from "@/components/shared/slug-field";
import { SeoAccordion } from "@/components/shared/seo-accordion";
import { FaqRepeater } from "@/components/shared/faq-repeater";
import { CompanyMultiSelect } from "@/components/shared/company-multi-select";
import { categoryFormSchema, CategoryFormInput, CategoryFormValues } from "@/lib/schemas/category";
import { useAllCategoriesQuery, useCreateCategory, useUpdateCategory } from "@/lib/queries/categories";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { Category, Status, STATUS_LABELS } from "@/lib/types";

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const isEdit = !!category;

  const { data: parentOptions } = useAllCategoriesQuery(category?.id);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory(category?.id ?? 0);

  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      parentId: category?.parentId ? String(category.parentId) : "",
      heroDescription: category?.heroDescription ?? "",
      description: category?.description ?? "",
      image: category?.image ?? "",
      icon: category?.icon ?? "",
      featured: category?.featured ?? false,
      status: category?.status ?? "ACTIVE",
      displayOrder: category?.displayOrder ?? 0,
      metaTitle: category?.metaTitle ?? "",
      metaDescription: category?.metaDescription ?? "",
      canonicalUrl: category?.canonicalUrl ?? "",
      ogTitle: category?.ogTitle ?? "",
      ogDescription: category?.ogDescription ?? "",
      ogImage: category?.ogImage ?? "",
      robots: category?.robots ?? "index, follow",
      faqs: category?.faqs?.map((f) => ({ question: f.question, answer: f.answer, sortOrder: f.sortOrder })) ?? [],
      companies:
        category?.companies?.map((c) => ({
          companyId: c.companyId,
          displayOrder: c.displayOrder,
          name: c.company.name,
          logo: c.company.logo,
        })) ?? [],
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    const payload = {
      ...values,
      parentId: values.parentId ? Number(values.parentId) : null,
      displayOrder: Number(values.displayOrder) || 0,
      faqs: values.faqs.map((f, index) => ({ question: f.question, answer: f.answer, sortOrder: index })),
      companies: values.companies.map((c, index) => ({ companyId: c.companyId, displayOrder: index })),
    };

    try {
      if (isEdit) {
        await updateCategory.mutateAsync(payload);
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync(payload);
        toast.success("Category created");
      }
      router.push("/categories");
    } catch (error) {
      applyFieldErrors(getFieldErrors(error), form.setError);
      toast.error(getErrorMessage(error));
    }
  };

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <SlugField value={field.value ?? ""} onChange={field.onChange} deriveFrom={form.watch("name")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="None (top-level)">
                            {(value: string) =>
                              value === "none" ? "None (top-level)" : parentOptions?.find((c) => String(c.id) === value)?.name
                            }
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (top-level)</SelectItem>
                        {parentOptions?.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? 0} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>{(value: Status) => STATUS_LABELS[value]}</SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="heroDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hero Description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:w-64">
                  <FormLabel className="!mt-0">Featured</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload label="Image" value={field.value} onChange={field.onChange} aspect="wide" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload label="Icon" value={field.value} onChange={field.onChange} aspect="square" />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent>
            <SeoAccordion defaultOpen={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <FaqRepeater />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyMultiSelect />
          </CardContent>
        </Card>

        {category && <AuditFooter record={category} />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/categories")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
