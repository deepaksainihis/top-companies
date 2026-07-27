import { CompanyForm } from "@/components/forms/company-form";

export default function NewCompanyPage() {
  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Add Company</h1>
        <p className="text-sm text-muted-foreground">Create a new company listing.</p>
      </div>
      <CompanyForm />
    </div>
  );
}
