"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AuditFooter } from "@/components/shared/audit-footer";
import { ImageUpload } from "@/components/shared/image-upload";
import { SlugField } from "@/components/shared/slug-field";
import { techStackFormSchema, TechStackFormInput, TechStackFormValues } from "@/lib/schemas/masters";
import { techStacksApi } from "@/lib/queries/tech-stacks";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { TechStack, Status, STATUS_LABELS } from "@/lib/types";

const BACK_HREF = "/masters/tech-stacks";

export function TechStackForm({ techStack }: { techStack?: TechStack }) {
  const router = useRouter();
  const isEdit = !!techStack;

  const createTechStack = techStacksApi.useCreate();
  const updateTechStack = techStacksApi.useUpdate(techStack?.id ?? 0);

  const form = useForm<TechStackFormInput, unknown, TechStackFormValues>({
    resolver: zodResolver(techStackFormSchema),
    defaultValues: {
      name: techStack?.name ?? "",
      slug: techStack?.slug ?? "",
      icon: techStack?.icon ?? "",
      status: techStack?.status ?? "ACTIVE",
    },
  });

  const onSubmit = async (values: TechStackFormValues) => {
    try {
      if (isEdit) {
        await updateTechStack.mutateAsync(values);
        toast.success("Tech stack updated");
      } else {
        await createTechStack.mutateAsync(values);
        toast.success("Tech stack created");
      }
      router.push(BACK_HREF);
    } catch (error) {
      applyFieldErrors(getFieldErrors(error), form.setError);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
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
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="max-w-xs">
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
          </CardContent>
        </Card>

        {techStack && <AuditFooter record={techStack} />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(BACK_HREF)}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {isEdit ? "Save Changes" : "Create Tech Stack"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
