import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { generateUniqueSlug, slugifyText } from "@/lib/slug";
import { buildMeta, parsePagination } from "@/lib/pagination";
import { attachAuditNames } from "@/lib/audit";
import { CreateCompanyInput, UpdateCompanyInput } from "@/modules/companies/companies.validation";

const SORTABLE_FIELDS = ["name", "createdAt", "updatedAt", "foundedYear", "score"] as const;

const companyInclude = {
  country: { select: { id: true, name: true, iso2: true, flag: true } },
  employeeRange: { select: { id: true, title: true } },
  hourlyRateRange: { select: { id: true, title: true } },
  techStacks: { include: { techStack: { select: { id: true, name: true, slug: true, icon: true } } } },
};

const slugExists = (excludeId?: number) => async (slug: string) => {
  const existing = await prisma.company.findFirst({ where: { slug, deletedAt: null } });
  return Boolean(existing && existing.id !== excludeId);
};

export const listCompanies = async (query: Record<string, unknown>) => {
  const { page, limit, skip, take } = parsePagination(query);
  const sortBy = SORTABLE_FIELDS.includes(query.sortBy as (typeof SORTABLE_FIELDS)[number])
    ? (query.sortBy as string)
    : "createdAt";
  const sortOrder = String(query.sortOrder ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";

  const where: Record<string, unknown> = {};

  if (query.status === "DELETED") {
    where.deletedAt = { not: null };
  } else {
    where.deletedAt = null;
    if (query.status === "ACTIVE" || query.status === "INACTIVE") where.status = query.status;
  }

  if (query.countryId) where.countryId = Number(query.countryId);
  if (query.employeeRangeId) where.employeeRangeId = Number(query.employeeRangeId);
  if (query.hourlyRateRangeId) where.hourlyRateRangeId = Number(query.hourlyRateRangeId);
  if (query.featured !== undefined) where.featured = query.featured === "true" || query.featured === true;
  if (query.verified !== undefined) where.verified = query.verified === "true" || query.verified === true;
  if (query.techStackId) {
    where.techStacks = { some: { techStackId: Number(query.techStackId) } };
  }

  if (query.search && String(query.search).trim()) {
    const search = String(query.search).trim();
    where.OR = [
      { name: { contains: search } },
      { shortDescription: { contains: search } },
      { headOffice: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: companyInclude,
    }),
    prisma.company.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

export const getCompanyById = async (id: number) => {
  const company = await prisma.company.findFirst({
    where: { id },
    include: companyInclude,
  });
  if (!company) throw new NotFoundError("Company not found");
  return attachAuditNames(company);
};

export const createCompany = async (input: CreateCompanyInput, adminId: number) => {
  const { techStackIds, ...rest } = input;
  const slug = await generateUniqueSlug(input.slug || input.name, slugExists());

  const company = await prisma.$transaction(async (tx) => {
    const created = await tx.company.create({
      data: {
        ...rest,
        slug,
        createdById: adminId,
        updatedById: adminId,
        techStacks: techStackIds?.length
          ? { create: techStackIds.map((techStackId) => ({ techStackId })) }
          : undefined,
      },
    });
    return created;
  });

  return getCompanyById(company.id);
};

export const updateCompany = async (id: number, input: UpdateCompanyInput, adminId: number) => {
  const existing = await prisma.company.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError("Company not found");

  const { techStackIds, ...rest } = input;

  let slug: string | undefined;
  if (rest.slug) {
    slug = await generateUniqueSlug(slugifyText(rest.slug), slugExists(id));
  }

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id },
      data: { ...rest, ...(slug ? { slug } : {}), updatedById: adminId },
    });

    if (techStackIds !== undefined) {
      await tx.companyTechStack.deleteMany({ where: { companyId: id } });
      if (techStackIds.length) {
        await tx.companyTechStack.createMany({
          data: techStackIds.map((techStackId) => ({ companyId: id, techStackId })),
        });
      }
    }
  });

  return getCompanyById(id);
};

export const deleteCompany = async (id: number, adminId: number) => {
  const existing = await prisma.company.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new NotFoundError("Company not found");
  await prisma.company.update({ where: { id }, data: { deletedAt: new Date(), deletedById: adminId } });
};

export const restoreCompany = async (id: number, adminId: number) => {
  const existing = await prisma.company.findFirst({ where: { id, deletedAt: { not: null } } });
  if (!existing) throw new NotFoundError("Deleted company not found");
  await prisma.company.update({
    where: { id },
    data: { deletedAt: null, deletedById: null, updatedById: adminId },
  });
};

export const permanentlyDeleteCompany = async (id: number) => {
  const existing = await prisma.company.findFirst({ where: { id, deletedAt: { not: null } } });
  if (!existing) throw new NotFoundError("Deleted company not found");
  await prisma.company.delete({ where: { id } });
};

export const bulkDeleteCompanies = async (ids: number[], adminId: number) => {
  await prisma.company.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date(), deletedById: adminId },
  });
};

export const bulkRestoreCompanies = async (ids: number[], adminId: number) => {
  await prisma.company.updateMany({
    where: { id: { in: ids }, deletedAt: { not: null } },
    data: { deletedAt: null, deletedById: null, updatedById: adminId },
  });
};

export const bulkPermanentlyDeleteCompanies = async (ids: number[]) => {
  await prisma.company.deleteMany({ where: { id: { in: ids }, deletedAt: { not: null } } });
};

export const bulkUpdateCompanyStatus = async (ids: number[], status: "ACTIVE" | "INACTIVE", adminId: number) => {
  await prisma.company.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { status, updatedById: adminId },
  });
};
