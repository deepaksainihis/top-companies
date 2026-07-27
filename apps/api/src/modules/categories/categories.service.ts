import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { generateUniqueSlug, slugifyText } from "@/lib/slug";
import { buildMeta, parsePagination } from "@/lib/pagination";
import { attachAuditNames } from "@/lib/audit";
import { CreateCategoryInput, UpdateCategoryInput } from "@/modules/categories/categories.validation";

const SORTABLE_FIELDS = ["name", "createdAt", "updatedAt", "displayOrder"] as const;

const categoryInclude = {
  parent: { select: { id: true, name: true, slug: true } },
  faqs: { orderBy: { sortOrder: "asc" as const } },
  companies: {
    orderBy: { displayOrder: "asc" as const },
    include: { company: { select: { id: true, name: true, slug: true, logo: true, status: true } } },
  },
};

const slugExists = (excludeId?: number) => async (slug: string) => {
  const existing = await prisma.category.findFirst({ where: { slug, deletedAt: null } });
  return Boolean(existing && existing.id !== excludeId);
};

export const listCategories = async (query: Record<string, unknown>) => {
  const { page, limit, skip, take } = parsePagination(query);
  const sortBy = SORTABLE_FIELDS.includes(query.sortBy as (typeof SORTABLE_FIELDS)[number])
    ? (query.sortBy as string)
    : "displayOrder";
  const sortOrder = String(query.sortOrder ?? "asc").toLowerCase() === "desc" ? "desc" : "asc";

  const where: Record<string, unknown> = {};

  if (query.status === "DELETED") {
    where.deletedAt = { not: null };
  } else {
    where.deletedAt = null;
    if (query.status === "ACTIVE" || query.status === "INACTIVE") where.status = query.status;
  }

  if (query.featured !== undefined) where.featured = query.featured === "true" || query.featured === true;
  if (query.parentId) where.parentId = Number(query.parentId);

  if (query.search && String(query.search).trim()) {
    where.name = { contains: String(query.search).trim() };
  }

  const [data, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: { parent: { select: { id: true, name: true, slug: true } }, _count: { select: { companies: true, faqs: true } } },
    }),
    prisma.category.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

export const getCategoryById = async (id: number) => {
  const category = await prisma.category.findFirst({ where: { id }, include: categoryInclude });
  if (!category) throw new NotFoundError("Category not found");
  return attachAuditNames(category);
};

const assertNotOwnAncestor = async (categoryId: number, parentId: number) => {
  if (categoryId === parentId) {
    throw new ValidationError("A category cannot be its own parent", { parentId: ["A category cannot be its own parent"] });
  }

  let current = await prisma.category.findUnique({ where: { id: parentId }, select: { id: true, parentId: true } });
  while (current) {
    if (current.parentId === categoryId) {
      throw new ValidationError("This would create a circular category hierarchy", {
        parentId: ["This would create a circular category hierarchy"],
      });
    }
    if (!current.parentId) break;
    current = await prisma.category.findUnique({ where: { id: current.parentId }, select: { id: true, parentId: true } });
  }
};

export const createCategory = async (input: CreateCategoryInput, adminId: number) => {
  const { faqs, companies, ...rest } = input;
  const slug = await generateUniqueSlug(input.slug || input.name, slugExists());

  const category = await prisma.$transaction(async (tx) => {
    const created = await tx.category.create({
      data: { ...rest, slug, createdById: adminId, updatedById: adminId },
    });

    if (faqs?.length) {
      await tx.categoryFaq.createMany({
        data: faqs.map((faq) => ({ ...faq, categoryId: created.id })),
      });
    }

    if (companies?.length) {
      await tx.categoryCompany.createMany({
        data: companies.map((c) => ({ categoryId: created.id, companyId: c.companyId, displayOrder: c.displayOrder })),
      });
    }

    return created;
  });

  return getCategoryById(category.id);
};

export const updateCategory = async (id: number, input: UpdateCategoryInput, adminId: number) => {
  const existing = await prisma.category.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError("Category not found");

  const { faqs, companies, ...rest } = input;

  if (rest.parentId) {
    await assertNotOwnAncestor(id, rest.parentId);
  }

  let slug: string | undefined;
  if (rest.slug) {
    slug = await generateUniqueSlug(slugifyText(rest.slug), slugExists(id));
  }

  await prisma.$transaction(async (tx) => {
    await tx.category.update({
      where: { id },
      data: { ...rest, ...(slug ? { slug } : {}), updatedById: adminId },
    });

    if (faqs !== undefined) {
      await tx.categoryFaq.deleteMany({ where: { categoryId: id } });
      if (faqs.length) {
        await tx.categoryFaq.createMany({ data: faqs.map((faq) => ({ ...faq, categoryId: id })) });
      }
    }

    if (companies !== undefined) {
      await tx.categoryCompany.deleteMany({ where: { categoryId: id } });
      if (companies.length) {
        await tx.categoryCompany.createMany({
          data: companies.map((c) => ({ categoryId: id, companyId: c.companyId, displayOrder: c.displayOrder })),
        });
      }
    }
  });

  return getCategoryById(id);
};

export const deleteCategory = async (id: number, adminId: number) => {
  const existing = await prisma.category.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError("Category not found");

  const childCount = await prisma.category.count({ where: { parentId: id, deletedAt: null } });
  if (childCount > 0) {
    throw new ValidationError("Cannot delete a category that has subcategories. Reassign or delete them first.");
  }

  await prisma.category.update({ where: { id }, data: { deletedAt: new Date(), deletedById: adminId } });
};

export const restoreCategory = async (id: number, adminId: number) => {
  const existing = await prisma.category.findFirst({ where: { id, deletedAt: { not: null } } });
  if (!existing) throw new NotFoundError("Deleted category not found");
  await prisma.category.update({
    where: { id },
    data: { deletedAt: null, deletedById: null, updatedById: adminId },
  });
};

export const permanentlyDeleteCategory = async (id: number) => {
  const existing = await prisma.category.findFirst({ where: { id, deletedAt: { not: null } } });
  if (!existing) throw new NotFoundError("Deleted category not found");

  // No cascade on the self-relation (parent/children), so a permanent delete
  // must check for ANY child (deleted or not) - a soft-deleted child would
  // otherwise be orphaned with a dangling parentId FK violation.
  const childCount = await prisma.category.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw new ValidationError(
      "Cannot permanently delete a category that still has subcategories, even deleted ones. Permanently delete or reassign them first."
    );
  }

  await prisma.category.delete({ where: { id } });
};

export const bulkDeleteCategories = async (ids: number[], adminId: number) => {
  await prisma.category.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date(), deletedById: adminId },
  });
};

export const bulkRestoreCategories = async (ids: number[], adminId: number) => {
  await prisma.category.updateMany({
    where: { id: { in: ids }, deletedAt: { not: null } },
    data: { deletedAt: null, deletedById: null, updatedById: adminId },
  });
};

export const bulkPermanentlyDeleteCategories = async (ids: number[]) => {
  // Silently skip any category in the batch that still has children -
  // an all-or-nothing transaction would be surprising for a bulk action;
  // deleting only what's safe and letting the admin retry the rest is not.
  const withChildren = await prisma.category.findMany({
    where: { parentId: { in: ids } },
    select: { parentId: true },
    distinct: ["parentId"],
  });
  const blockedIds = new Set(withChildren.map((c) => c.parentId));
  const deletableIds = ids.filter((id) => !blockedIds.has(id));

  if (deletableIds.length) {
    await prisma.category.deleteMany({ where: { id: { in: deletableIds }, deletedAt: { not: null } } });
  }
};

export const bulkUpdateCategoryStatus = async (ids: number[], status: "ACTIVE" | "INACTIVE", adminId: number) => {
  await prisma.category.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { status, updatedById: adminId },
  });
};
