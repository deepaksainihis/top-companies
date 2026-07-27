import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { attachAuditNames } from "@/lib/audit";
import { buildMeta, parsePagination } from "@/lib/pagination";
import { CreateUserInput, UpdateUserInput } from "@/modules/users/users.validation";

const BCRYPT_ROUNDS = 12;

// Never select `password` - these are the only fields a user-management
// response should ever carry.
const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
};

export const listUsers = async (query: Record<string, unknown>) => {
  const { page, limit, skip, take } = parsePagination(query);
  const where: Record<string, unknown> = {};

  if (query.search && String(query.search).trim()) {
    const search = String(query.search).trim();
    where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
  }

  const [data, total] = await Promise.all([
    prisma.admin.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, select: userSelect }),
    prisma.admin.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

export const getUserById = async (id: number) => {
  const user = await prisma.admin.findUnique({ where: { id }, select: userSelect });
  if (!user) throw new NotFoundError("User not found");
  return attachAuditNames(user);
};

export const createUser = async (input: CreateUserInput, adminId: number) => {
  const hashedPassword = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.admin.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      avatar: input.avatar,
      createdById: adminId,
      updatedById: adminId,
    },
    select: userSelect,
  });
  return user;
};

export const updateUser = async (id: number, input: UpdateUserInput, adminId: number) => {
  const existing = await prisma.admin.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("User not found");

  const { password, ...rest } = input;

  const user = await prisma.admin.update({
    where: { id },
    data: {
      ...rest,
      ...(password ? { password: await bcrypt.hash(password, BCRYPT_ROUNDS) } : {}),
      updatedById: adminId,
    },
    select: userSelect,
  });
  return user;
};

export const deleteUser = async (id: number, currentAdminId: number) => {
  if (id === currentAdminId) {
    throw new ValidationError("You cannot delete your own account");
  }

  const existing = await prisma.admin.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("User not found");

  const totalAdmins = await prisma.admin.count();
  if (totalAdmins <= 1) {
    throw new ValidationError("At least one admin account must remain");
  }

  await prisma.admin.delete({ where: { id } });
};
