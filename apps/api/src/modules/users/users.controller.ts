import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/apiResponse";
import * as usersService from "@/modules/users/users.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { data, meta } = await usersService.listUsers(req.query as Record<string, unknown>);
  return sendSuccess(res, data, { meta });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getUserById(Number(req.params.id));
  return sendSuccess(res, user);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.createUser(req.body, req.admin!.id);
  return sendSuccess(res, user, { statusCode: 201, message: "User created successfully" });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.updateUser(Number(req.params.id), req.body, req.admin!.id);
  return sendSuccess(res, user, { message: "User updated successfully" });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await usersService.deleteUser(Number(req.params.id), req.admin!.id);
  return sendSuccess(res, null, { message: "User deleted successfully" });
});
