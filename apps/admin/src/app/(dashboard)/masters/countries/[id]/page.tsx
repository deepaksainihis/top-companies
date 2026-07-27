"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CountryForm } from "@/components/forms/country-form";
import { countriesApi } from "@/lib/queries/countries";

export default function EditCountryPage() {
  const params = useParams<{ id: string }>();
  const { data: country, isLoading } = countriesApi.useOne(Number(params.id));

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Country</h1>
        <p className="text-sm text-muted-foreground">Update this country&apos;s details.</p>
      </div>
      {isLoading || !country ? <Skeleton className="h-64 w-full" /> : <CountryForm country={country} />}
    </div>
  );
}
