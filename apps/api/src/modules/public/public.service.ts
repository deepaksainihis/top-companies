import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

const activeFilter = { status: "ACTIVE" as const, deletedAt: null };

const publicCompanySelect = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  coverImage: true,
  shortDescription: true,
  foundedYear: true,
  headOffice: true,
  website: true,
  verified: true,
  featured: true,
  score: true,
  country: { select: { name: true, iso2: true, flag: true } },
  employeeRange: { select: { title: true } },
  hourlyRateRange: { select: { title: true } },
  techStacks: { select: { techStack: { select: { name: true, slug: true, icon: true } } } },
};

export const getHomeData = async () => {
  const [
    settings,
    homeSeo,
    featuredCategories,
    featuredCompanies,
    totals,
    spotlightCategoryRow,
  ] = await Promise.all([
    prisma.settings.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} }),
    prisma.seoMeta.upsert({ where: { page: "HOME" }, create: { page: "HOME" }, update: {} }),
    prisma.category.findMany({
      where: { ...activeFilter, featured: true, parentId: null },
      orderBy: { displayOrder: "asc" },
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        icon: true,
        _count: { select: { companies: true } },
      },
    }),
    prisma.company.findMany({
      where: { ...activeFilter, featured: true },
      orderBy: [{ score: "desc" }, { id: "desc" }],
      take: 8,
      select: publicCompanySelect,
    }),
    Promise.all([
      prisma.company.count({ where: activeFilter }),
      prisma.category.count({ where: activeFilter }),
      prisma.country.count({ where: activeFilter }),
      prisma.techStack.count({ where: activeFilter }),
    ]),
    prisma.category.findFirst({
      where: { ...activeFilter, featured: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        companies: {
          where: { company: activeFilter },
          orderBy: { displayOrder: "asc" },
          take: 6,
          select: { company: { select: publicCompanySelect } },
        },
      },
    }),
  ]);

  const [totalCompanies, totalCategories, totalCountries, totalTechStacks] = totals;

  const spotlightCategory = spotlightCategoryRow
    ? {
        id: spotlightCategoryRow.id,
        name: spotlightCategoryRow.name,
        slug: spotlightCategoryRow.slug,
        companies: spotlightCategoryRow.companies.map((c) => c.company),
      }
    : null;

  return {
    general: { siteName: settings.siteName, logo: settings.logo, socialLinks: settings.socialLinks },
    seo: homeSeo,
    stats: { totalCompanies, totalCategories, totalCountries, totalTechStacks },
    featuredCategories,
    featuredCompanies,
    spotlightCategory,
  };
};

export const getPublicCategories = async () => {
  return prisma.category.findMany({
    where: { ...activeFilter, parentId: null },
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      icon: true,
      _count: { select: { companies: true } },
      children: {
        where: activeFilter,
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { companies: true } },
        },
      },
    },
  });
};

export const getPublicCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findFirst({
    where: { slug, ...activeFilter },
    select: {
      id: true,
      name: true,
      slug: true,
      heroDescription: true,
      description: true,
      image: true,
      icon: true,
      metaTitle: true,
      metaDescription: true,
      canonicalUrl: true,
      ogTitle: true,
      ogDescription: true,
      ogImage: true,
      robots: true,
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        where: activeFilter,
        orderBy: { displayOrder: "asc" },
        select: { id: true, name: true, slug: true },
      },
      faqs: {
        orderBy: { sortOrder: "asc" },
        select: { question: true, answer: true },
      },
      companies: {
        where: { company: activeFilter },
        orderBy: { displayOrder: "asc" },
        select: { company: { select: publicCompanySelect } },
      },
    },
  });

  if (!category) throw new NotFoundError("Category not found");

  return { ...category, companies: category.companies.map((c) => c.company) };
};

export const getPublicAbout = async () => {
  const [settings, aboutSeo] = await Promise.all([
    prisma.settings.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} }),
    prisma.seoMeta.upsert({ where: { page: "ABOUT" }, create: { page: "ABOUT" }, update: {} }),
  ]);

  return {
    general: {
      contactEmail: settings.contactEmail,
      phone: settings.phone,
      address: settings.address,
      socialLinks: settings.socialLinks,
    },
    seo: aboutSeo,
    aboutContent: settings.aboutContent,
  };
};
