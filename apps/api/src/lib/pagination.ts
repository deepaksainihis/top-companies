import { PaginationMeta } from "@/lib/apiResponse";

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export const parsePagination = (query: Record<string, unknown>): ParsedPagination => {
  const page = Math.max(1, parseInt(String(query.page ?? DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const rawLimit = parseInt(String(query.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT);

  return { page, limit, skip: (page - 1) * limit, take: limit };
};

export const buildMeta = (page: number, limit: number, total: number): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

export const parseSort = <T extends string>(
  query: Record<string, unknown>,
  allowedFields: readonly T[],
  fallback: T
): { field: T; order: "asc" | "desc" } => {
  const requested = String(query.sortBy ?? "");
  const field = (allowedFields as readonly string[]).includes(requested) ? (requested as T) : fallback;
  const order = String(query.sortOrder ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";
  return { field, order };
};
