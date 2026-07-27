"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { TechStackForm } from "@/components/forms/tech-stack-form";
import { techStacksApi } from "@/lib/queries/tech-stacks";

export default function EditTechStackPage() {
  const params = useParams<{ id: string }>();
  const { data: techStack, isLoading } = techStacksApi.useOne(Number(params.id));

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Tech Stack</h1>
        <p className="text-sm text-muted-foreground">Update this tech stack&apos;s details.</p>
      </div>
      {isLoading || !techStack ? <Skeleton className="h-64 w-full" /> : <TechStackForm techStack={techStack} />}
    </div>
  );
}
