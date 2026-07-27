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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuditFooter } from "@/components/shared/audit-footer";
import { ImageUpload } from "@/components/shared/image-upload";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { SlugField } from "@/components/shared/slug-field";
import { MultiSelectBadges } from "@/components/shared/multi-select-badges";
import { companyFormSchema, CompanyFormInput, CompanyFormValues } from "@/lib/schemas/company";
import { useCreateCompany, useUpdateCompany } from "@/lib/queries/companies";
import { countriesApi } from "@/lib/queries/countries";
import { employeeRangesApi } from "@/lib/queries/employee-ranges";
import { hourlyRateRangesApi } from "@/lib/queries/hourly-rate-ranges";
import { techStacksApi } from "@/lib/queries/tech-stacks";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { Company, Status, STATUS_LABELS } from "@/lib/types";

export function CompanyForm({ company }: { company?: Company }) {
  const router = useRouter();
  const isEdit = !!company;

  const { data: countries } = countriesApi.useList({ limit: 200, status: "ACTIVE" });
  const { data: employeeRanges } = employeeRangesApi.useList({ limit: 200, status: "ACTIVE" });
  const { data: hourlyRateRanges } = hourlyRateRangesApi.useList({ limit: 200, status: "ACTIVE" });
  const { data: techStacks } = techStacksApi.useList({ limit: 200, status: "ACTIVE" });

  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany(company?.id ?? 0);

  const form = useForm<CompanyFormInput, unknown, CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company?.name ?? "",
      slug: company?.slug ?? "",
      website: company?.website ?? "",
      logo: company?.logo ?? "",
      coverImage: company?.coverImage ?? "",
      shortDescription: company?.shortDescription ?? "",
      description: company?.description ?? "",
      foundedYear: company?.foundedYear ?? undefined,
      headOffice: company?.headOffice ?? "",
      countryId: company?.countryId ? String(company.countryId) : "",
      employeeRangeId: company?.employeeRangeId ? String(company.employeeRangeId) : "",
      hourlyRateRangeId: company?.hourlyRateRangeId ? String(company.hourlyRateRangeId) : "",
      techStackIds: company?.techStacks.map((t) => t.techStackId) ?? [],
      verified: company?.verified ?? false,
      featured: company?.featured ?? false,
      status: company?.status ?? "ACTIVE",
      score: company?.score ?? undefined,
    },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    const payload = {
      ...values,
      foundedYear: values.foundedYear === "" || values.foundedYear === undefined ? null : Number(values.foundedYear),
      countryId: values.countryId ? Number(values.countryId) : null,
      employeeRangeId: values.employeeRangeId ? Number(values.employeeRangeId) : null,
      hourlyRateRangeId: values.hourlyRateRangeId ? Number(values.hourlyRateRangeId) : null,
      score: values.score === "" || values.score === undefined ? null : Number(values.score),
    };

    try {
      if (isEdit) {
        await updateCompany.mutateAsync(payload);
        toast.success("Company updated");
      } else {
        await createCompany.mutateAsync(payload);
        toast.success("Company created");
      }
      router.push("/companies");
    } catch (error) {
      applyFieldErrors(getFieldErrors(error), form.setError);
      toast.error(getErrorMessage(error));
    }
  };

  const isSubmitting = createCompany.isPending || updateCompany.isPending;

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="foundedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founded Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="headOffice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Head Office</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Country" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
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
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload label="Logo" value={field.value} onChange={field.onChange} aspect="square" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload label="Cover Image" value={field.value} onChange={field.onChange} aspect="wide" />
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
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} maxLength={500} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>Max 500 characters. Shown in listing cards.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
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
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="countryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select country">
                            {(value: string) => countries?.data.find((c) => String(c.id) === value)?.name}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries?.data.map((c) => (
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
                name="employeeRangeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Range</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select range">
                            {(value: string) => employeeRanges?.data.find((r) => String(r.id) === value)?.title}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employeeRanges?.data.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.title}
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
                name="hourlyRateRangeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate Range</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select range">
                            {(value: string) => hourlyRateRanges?.data.find((r) => String(r.id) === value)?.title}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hourlyRateRanges?.data.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="techStackIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stacks</FormLabel>
                  <FormControl>
                    <MultiSelectBadges
                      options={techStacks?.data ?? []}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Select tech stacks..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
              <FormField
                control={form.control}
                name="verified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <FormLabel className="!mt-0">Verified</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <FormLabel className="!mt-0">Featured</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score (0-10)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={10} step={0.1} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Shown on the public site&apos;s ranked listings.</FormDescription>
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
          </CardContent>
        </Card>

        {company && <AuditFooter record={company} />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/companies")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Company"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
