import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import {
  refreshTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { generateRawToken, hashToken } from "@/lib/tokenHash";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { env } from "@/config/env";
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "@/modules/auth/auth.validation";

const BCRYPT_ROUNDS = 12;

const publicAdmin = (admin: { id: number; name: string; email: string; avatar: string | null; createdAt: Date }) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  avatar: admin.avatar,
  createdAt: admin.createdAt,
});

const issueTokenPair = async (adminId: number) => {
  const accessToken = signAccessToken({ adminId });
  const jti = randomUUID();
  const refreshToken = signRefreshToken({ adminId, jti });

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      adminId,
      expiresAt: refreshTokenExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
};

export const login = async ({ email, password }: LoginInput) => {
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const tokens = await issueTokenPair(admin.id);
  return { admin: publicAdmin(admin), ...tokens };
};

export const refreshSession = async (refreshToken: string | undefined) => {
  if (!refreshToken) {
    throw new UnauthorizedError("Missing refresh token");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.adminId !== payload.adminId) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  // Rotate: revoke the used token and issue a fresh pair.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

  const admin = await prisma.admin.findUnique({ where: { id: payload.adminId } });
  if (!admin) {
    throw new UnauthorizedError("Admin account no longer exists");
  }

  const tokens = await issueTokenPair(admin.id);
  return { admin: publicAdmin(admin), ...tokens };
};

export const logout = async (refreshToken: string | undefined) => {
  if (!refreshToken) return;

  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const forgotPassword = async ({ email }: ForgotPasswordInput) => {
  const admin = await prisma.admin.findUnique({ where: { email } });

  // Always behave the same whether or not the email exists, to avoid
  // leaking which addresses have admin accounts.
  if (!admin) return;

  const rawToken = generateRawToken();
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_IN_MINUTES * 60 * 1000);

  await prisma.passwordReset.create({
    data: { tokenHash: hashToken(rawToken), adminId: admin.id, expiresAt },
  });

  const resetUrl = `${env.ADMIN_RESET_PASSWORD_URL}?token=${rawToken}&email=${encodeURIComponent(admin.email)}`;
  await sendPasswordResetEmail(admin.email, resetUrl);
};

export const resetPassword = async ({ email, token, password }: ResetPasswordInput) => {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new ValidationError("Invalid or expired reset link");
  }

  const tokenHash = hashToken(token);
  const resetRecord = await prisma.passwordReset.findUnique({ where: { tokenHash } });

  if (
    !resetRecord ||
    resetRecord.adminId !== admin.id ||
    resetRecord.usedAt ||
    resetRecord.expiresAt < new Date()
  ) {
    throw new ValidationError("Invalid or expired reset link");
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.admin.update({ where: { id: admin.id }, data: { password: hashedPassword } }),
    prisma.passwordReset.update({ where: { id: resetRecord.id }, data: { usedAt: new Date() } }),
    // Force re-login on every device after a password reset.
    prisma.refreshToken.updateMany({
      where: { adminId: admin.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
};

export const getProfile = async (adminId: number) => {
  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId } });
  return publicAdmin(admin);
};

export const updateProfile = async (adminId: number, input: UpdateProfileInput) => {
  const admin = await prisma.admin.update({ where: { id: adminId }, data: input });
  return publicAdmin(admin);
};

export const changePassword = async (adminId: number, { currentPassword, newPassword }: ChangePasswordInput) => {
  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId } });

  if (!(await bcrypt.compare(currentPassword, admin.password))) {
    throw new ValidationError("Current password is incorrect", { currentPassword: ["Current password is incorrect"] });
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.admin.update({ where: { id: adminId }, data: { password: hashedPassword } }),
    // Force re-login everywhere except we let the current session continue
    // naturally via the access token it already holds until it expires.
    prisma.refreshToken.updateMany({
      where: { adminId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
};
