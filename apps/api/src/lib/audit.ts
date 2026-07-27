import { prisma } from "@/lib/prisma";

export interface AuditStamped {
  createdById?: number | null;
  updatedById?: number | null;
  deletedById?: number | null;
}

export interface AuditUser {
  id: number;
  name: string;
  email: string;
}

/**
 * Attaches `createdBy`/`updatedBy`/`deletedBy` (name + email) to a record for
 * display on an edit form's audit footer. Deliberately only called from
 * single-record `getById` handlers, never list queries - a footer note
 * doesn't need this in tables, and skipping it there avoids an extra lookup
 * on every list page load.
 */
export const attachAuditNames = async <T extends AuditStamped>(
  record: T
): Promise<T & { createdBy: AuditUser | null; updatedBy: AuditUser | null; deletedBy: AuditUser | null }> => {
  const ids = [record.createdById, record.updatedById, record.deletedById].filter(
    (id): id is number => typeof id === "number"
  );

  if (!ids.length) {
    return { ...record, createdBy: null, updatedBy: null, deletedBy: null };
  }

  const admins = await prisma.admin.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, email: true },
  });
  const byId = new Map(admins.map((admin) => [admin.id, admin]));

  return {
    ...record,
    createdBy: record.createdById ? (byId.get(record.createdById) ?? null) : null,
    updatedBy: record.updatedById ? (byId.get(record.updatedById) ?? null) : null,
    deletedBy: record.deletedById ? (byId.get(record.deletedById) ?? null) : null,
  };
};
