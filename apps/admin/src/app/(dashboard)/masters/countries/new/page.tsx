import { CountryForm } from "@/components/forms/country-form";

export default function NewCountryPage() {
  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Add Country</h1>
        <p className="text-sm text-muted-foreground">Create a new country.</p>
      </div>
      <CountryForm />
    </div>
  );
}
