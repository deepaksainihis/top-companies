import { Request, Response, Router } from "express";
import { z } from "zod";
import { attachAuditNames } from "@/lib/audit";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/apiResponse";
import { buildMeta, parsePagination } from "@/lib/pagination";
import { NotFoundError } from "@/lib/errors";
import { authenticate } from "@/middlewares/authenticate";
import { validate } from "@/middlewares/validate";

export const statusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const bulkDeleteSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1, "Select at least one record"),
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1, "Select at least one record"),
  status: statusEnum,
});

// Method shorthand + `any` deliberately loosens Prisma's precise per-model
// arg types: this factory is a thin, dynamic wrapper shared across four
// differently-shaped delegates, and threading exact Prisma generics through
// it would add significant complexity for no real safety gain (the public
// contract callers rely on is the Zod schema, not this internal type).
type PrismaDelegate = {
  findMany(args: any): Promise<any[]>;
  count(args: any): Promise<number>;
  findFirst(args: any): Promise<any>;
  create(args: any): Promise<any>;
  update(args: any): Promise<any>;
  updateMany(args: any): Promise<any>;
  delete(args: any): Promise<any>;
  deleteMany(args: any): Promise<any>;
};

/**
 * The four masters (Country, TechStack, EmployeeRange, HourlyRateRange) are
 * identical in shape: a simple entity + status + soft delete + search +
 * bulk ops. Rather than hand-duplicate four near-identical module stacks,
 * this factory builds one router per entity from a small config object.
 */
export const createCrudModule = <TCreate, TUpdate>(config: {
  delegate: PrismaDelegate;
  searchableFields: string[];
  createSchema: z.ZodType<TCreate>;
  updateSchema: z.ZodType<TUpdate>;
  defaultSortField?: string;
  /** Runs after validation, before the row is created - e.g. slug generation. */
  beforeCreate?: (body: Record<string, unknown>) => Promise<void>;
  /** Runs after validation, before the row is updated - receives the record id. */
  beforeUpdate?: (body: Record<string, unknown>, id: number) => Promise<void>;
}) => {
  const { delegate, searchableFields, createSchema, updateSchema } = config;
  const defaultSortField = config.defaultSortField ?? "createdAt";

  const buildWhere = (query: Record<string, unknown>) => {
    const where: Record<string, unknown> = {};

    if (query.status === "DELETED") {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
      if (query.status && statusEnum.safeParse(query.status).success) {
        where.status = query.status;
      }
    }

    if (query.search && String(query.search).trim()) {
      where.OR = searchableFields.map((field) => ({
        [field]: { contains: String(query.search).trim() },
      }));
    }

    return where;
  };

  const list = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, take } = parsePagination(req.query as Record<string, unknown>);
    const where = buildWhere(req.query as Record<string, unknown>);
    const sortBy = String(req.query.sortBy ?? defaultSortField);
    const sortOrder = String(req.query.sortOrder ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";

    const [data, total] = await Promise.all([
      delegate.findMany({ where, skip, take, orderBy: { [sortBy]: sortOrder } }),
      delegate.count({ where }),
    ]);

    return sendSuccess(res, data, { meta: buildMeta(page, limit, total) });
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const record = await delegate.findFirst({ where: { id: Number(req.params.id) } });
    if (!record) throw new NotFoundError("Record not found");
    return sendSuccess(res, await attachAuditNames(record));
  });

  const create = asyncHandler(async (req: Request, res: Response) => {
    if (config.beforeCreate) await config.beforeCreate(req.body);
    const record = await delegate.create({
      data: { ...req.body, createdById: req.admin!.id, updatedById: req.admin!.id },
    });
    return sendSuccess(res, record, { statusCode: 201, message: "Created successfully" });
  });

  const update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const existing = await delegate.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError("Record not found");

    if (config.beforeUpdate) await config.beforeUpdate(req.body, id);
    const record = await delegate.update({
      where: { id },
      data: { ...req.body, updatedById: req.admin!.id },
    });
    return sendSuccess(res, record, { message: "Updated successfully" });
  });

  const remove = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const existing = await delegate.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError("Record not found");

    await delegate.update({ where: { id }, data: { deletedAt: new Date(), deletedById: req.admin!.id } });
    return sendSuccess(res, null, { message: "Deleted successfully" });
  });

  const restore = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const existing = await delegate.findFirst({ where: { id, deletedAt: { not: null } } });
    if (!existing) throw new NotFoundError("Deleted record not found");

    await delegate.update({
      where: { id },
      data: { deletedAt: null, deletedById: null, updatedById: req.admin!.id },
    });
    return sendSuccess(res, null, { message: "Restored successfully" });
  });

  const permanentDelete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const existing = await delegate.findFirst({ where: { id, deletedAt: { not: null } } });
    if (!existing) throw new NotFoundError("Deleted record not found");

    await delegate.delete({ where: { id } });
    return sendSuccess(res, null, { message: "Permanently deleted" });
  });

  const bulkDelete = asyncHandler(async (req: Request, res: Response) => {
    await delegate.updateMany({
      where: { id: { in: req.body.ids }, deletedAt: null },
      data: { deletedAt: new Date(), deletedById: req.admin!.id },
    });
    return sendSuccess(res, null, { message: "Selected records deleted" });
  });

  const bulkRestore = asyncHandler(async (req: Request, res: Response) => {
    await delegate.updateMany({
      where: { id: { in: req.body.ids }, deletedAt: { not: null } },
      data: { deletedAt: null, deletedById: null, updatedById: req.admin!.id },
    });
    return sendSuccess(res, null, { message: "Selected records restored" });
  });

  const bulkPermanentDelete = asyncHandler(async (req: Request, res: Response) => {
    await delegate.deleteMany({ where: { id: { in: req.body.ids }, deletedAt: { not: null } } });
    return sendSuccess(res, null, { message: "Selected records permanently deleted" });
  });

  const bulkStatus = asyncHandler(async (req: Request, res: Response) => {
    await delegate.updateMany({
      where: { id: { in: req.body.ids }, deletedAt: null },
      data: { status: req.body.status, updatedById: req.admin!.id },
    });
    return sendSuccess(res, null, { message: "Status updated" });
  });

  const router = Router();
  router.use(authenticate);
  router.get("/", list);
  router.post("/bulk-delete", validate(bulkDeleteSchema), bulkDelete);
  router.post("/bulk-restore", validate(bulkDeleteSchema), bulkRestore);
  router.post("/bulk-permanent-delete", validate(bulkDeleteSchema), bulkPermanentDelete);
  router.post("/bulk-status", validate(bulkStatusSchema), bulkStatus);
  router.get("/:id", getById);
  router.post("/", validate(createSchema), create);
  router.patch("/:id", validate(updateSchema), update);
  router.post("/:id/restore", restore);
  router.delete("/:id/permanent", permanentDelete);
  router.delete("/:id", remove);

  return router;
};
