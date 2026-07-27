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
import { countryFormSchema, CountryFormInput, CountryFormValues } from "@/lib/schemas/masters";
import { countriesApi } from "@/lib/queries/countries";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { Country, Status, STATUS_LABELS } from "@/lib/types";

const BACK_HREF = "/masters/countries";

export function CountryForm({ country }: { country?: Country }) {
  const router = useRouter();
  const isEdit = !!country;

  const createCountry = countriesApi.useCreate();
  const updateCountry = countriesApi.useUpdate(country?.id ?? 0);

  const form = useForm<CountryFormInput, unknown, CountryFormValues>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: {
      name: country?.name ?? "",
      iso2: country?.iso2 ?? "",
      flag: country?.flag ?? "",
      status: country?.status ?? "ACTIVE",
    },
  });

  const onSubmit = async (values: CountryFormValues) => {
    try {
      if (isEdit) {
        await updateCountry.mutateAsync(values);
        toast.success("Country updated");
      } else {
        await createCountry.mutateAsync(values);
        toast.success("Country created");
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                name="iso2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISO2 Code</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={2} className="uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="flag"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload label="Flag" value={field.value} onChange={field.onChange} aspect="wide" />
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

        {country && <AuditFooter record={country} />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(BACK_HREF)}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {isEdit ? "Save Changes" : "Create Country"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
