import { TechStackForm } from "@/components/forms/tech-stack-form";

export default function NewTechStackPage() {
  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Add Tech Stack</h1>
        <p className="text-sm text-muted-foreground">Create a new tech stack.</p>
      </div>
      <TechStackForm />
    </div>
  );
}
