import { AuditFields } from "@/lib/types";

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export function AuditFooter({
  record,
}: {
  record: AuditFields & { createdAt?: string; updatedAt?: string };
}) {
  if (!record.createdBy && !record.updatedBy) return null;

  return (
    <p className="text-xs text-muted-foreground">
      {record.createdBy && (
        <>
          Created by {record.createdBy.name}
          {record.createdAt && ` on ${formatDate(record.createdAt)}`}
        </>
      )}
      {record.createdBy && record.updatedBy && " · "}
      {record.updatedBy && (
        <>
          Last updated by {record.updatedBy.name}
          {record.updatedAt && ` on ${formatDate(record.updatedAt)}`}
        </>
      )}
    </p>
  );
}
