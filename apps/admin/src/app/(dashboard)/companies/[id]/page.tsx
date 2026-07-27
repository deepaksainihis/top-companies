"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyForm } from "@/components/forms/company-form";
import { useCompanyQuery } from "@/lib/queries/companies";

export default function EditCompanyPage() {
  const params = useParams<{ id: string }>();
  const { data: company, isLoading } = useCompanyQuery(Number(params.id));

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Company</h1>
        <p className="text-sm text-muted-foreground">Update this company&apos;s details.</p>
      </div>
      {isLoading || !company ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <CompanyForm company={company} />
      )}
    </div>
  );
}
