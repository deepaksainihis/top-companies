import { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/apiResponse";
import { env } from "@/config/env";
import { REFRESH_TOKEN_COOKIE } from "@/lib/jwt";
import * as authService from "@/modules/auth/auth.service";

const REFRESH_COOKIE_PATH = "/auth";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax" as const,
  path: REFRESH_COOKIE_PATH,
  maxAge: env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
};

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_TOKEN_COOKIE, token, refreshCookieOptions);
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: REFRESH_COOKIE_PATH });
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { admin, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  return sendSuccess(res, { admin, accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { admin, accessToken, refreshToken } = await authService.refreshSession(
    req.cookies?.[REFRESH_TOKEN_COOKIE]
  );
  setRefreshCookie(res, refreshToken);
  return sendSuccess(res, { admin, accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.cookies?.[REFRESH_TOKEN_COOKIE]);
  clearRefreshCookie(res);
  return sendSuccess(res, null, { message: "Logged out" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body);
  return sendSuccess(res, null, {
    message: "If an account exists for that email, a password reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body);
  return sendSuccess(res, null, { message: "Password has been reset. Please log in." });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const admin = await authService.getProfile(req.admin!.id);
  return sendSuccess(res, admin);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const admin = await authService.updateProfile(req.admin!.id, req.body);
  return sendSuccess(res, admin, { message: "Profile updated" });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.admin!.id, req.body);
  return sendSuccess(res, null, { message: "Password changed successfully" });
});
