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
import {
  titleStatusFormSchema,
  TitleStatusFormInput,
  TitleStatusFormValues,
} from "@/lib/schemas/masters";
import { AuditFooter } from "@/components/shared/audit-footer";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { AuditFields, Status, STATUS_LABELS } from "@/lib/types";

interface TitleStatusFormProps {
  item?: AuditFields & { title: string; status: Status; createdAt?: string; updatedAt?: string };
  backHref: string;
  entityLabel: string;
  onSubmit: (values: TitleStatusFormValues) => Promise<unknown>;
}

export function TitleStatusForm({ item, backHref, entityLabel, onSubmit }: TitleStatusFormProps) {
  const router = useRouter();
  const isEdit = !!item;

  const form = useForm<TitleStatusFormInput, unknown, TitleStatusFormValues>({
    resolver: zodResolver(titleStatusFormSchema),
    defaultValues: {
      title: item?.title ?? "",
      status: item?.status ?? "ACTIVE",
    },
  });

  const handleSubmit = async (values: TitleStatusFormValues) => {
    try {
      await onSubmit(values);
      toast.success(`${entityLabel} ${isEdit ? "updated" : "created"}`);
      router.push(backHref);
    } catch (error) {
      applyFieldErrors(getFieldErrors(error), form.setError);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
          </CardContent>
        </Card>

        {item && <AuditFooter record={item} />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(backHref)}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {isEdit ? "Save Changes" : `Create ${entityLabel}`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
