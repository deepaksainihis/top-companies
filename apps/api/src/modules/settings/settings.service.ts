import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { attachAuditNames } from "@/lib/audit";
import { UpdateSettingsInput } from "@/modules/settings/settings.validation";

const SETTINGS_ID = 1;

export const getSettings = async () => {
  const [general, home, about] = await Promise.all([
    prisma.settings.upsert({ where: { id: SETTINGS_ID }, create: { id: SETTINGS_ID }, update: {} }),
    prisma.seoMeta.upsert({ where: { page: "HOME" }, create: { page: "HOME" }, update: {} }),
    prisma.seoMeta.upsert({ where: { page: "ABOUT" }, create: { page: "ABOUT" }, update: {} }),
  ]);

  return { general: await attachAuditNames(general), seo: { home, about } };
};

export const updateSettings = async (input: UpdateSettingsInput, adminId: number) => {
  await prisma.$transaction([
    prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        ...input.general,
        socialLinks: input.general.socialLinks as Prisma.InputJsonValue,
        updatedById: adminId,
      },
      update: { ...input.general, socialLinks: input.general.socialLinks as Prisma.InputJsonValue, updatedById: adminId },
    }),
    prisma.seoMeta.upsert({
      where: { page: "HOME" },
      create: { page: "HOME", ...input.seo.home, updatedById: adminId },
      update: { ...input.seo.home, updatedById: adminId },
    }),
    prisma.seoMeta.upsert({
      where: { page: "ABOUT" },
      create: { page: "ABOUT", ...input.seo.about, updatedById: adminId },
      update: { ...input.seo.about, updatedById: adminId },
    }),
  ]);

  return getSettings();
};
