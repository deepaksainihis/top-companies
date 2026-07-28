import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import slugify from "slugify";

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = "admin@topdevelopmentcompany.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@12345";

const COUNTRIES = [
  { name: "United States", iso2: "US" },
  { name: "United Kingdom", iso2: "GB" },
  { name: "India", iso2: "IN" },
  { name: "Canada", iso2: "CA" },
  { name: "Australia", iso2: "AU" },
  { name: "Germany", iso2: "DE" },
  { name: "Ukraine", iso2: "UA" },
  { name: "Poland", iso2: "PL" },
  { name: "Brazil", iso2: "BR" },
  { name: "Singapore", iso2: "SG" },
];

const TECH_STACKS = [
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Laravel",
  "Django",
  "Ruby on Rails",
  "Flutter",
  "React Native",
  "Swift",
  "Kotlin",
  "Unity",
  "Unreal Engine",
  "WordPress",
];

const EMPLOYEE_RANGES = ["1 - 10", "11 - 50", "51 - 200", "201 - 500", "500+"];

const HOURLY_RATE_RANGES = ["$10 - $25 / hr", "$25 - $50 / hr", "$50 - $75 / hr", "$75 - $100 / hr", "$100+ / hr"];

const CATEGORY_TREE = [
  {
    name: "Web Development",
    children: ["React Development", "WordPress Development"],
  },
  {
    name: "Mobile App Development",
    children: ["iOS Development", "Android Development"],
  },
  { name: "Game Development", children: [] as string[] },
  { name: "AI & Machine Learning", children: [] as string[] },
];

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
  await prisma.admin.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    create: { name: "Super Admin", email: DEFAULT_ADMIN_EMAIL, password: hashedPassword },
    update: {},
  });

  const countries = await Promise.all(
    COUNTRIES.map((c) =>
      prisma.country.upsert({
        where: { iso2: c.iso2 },
        create: { ...c, flag: `https://flagcdn.com/w80/${c.iso2.toLowerCase()}.png` },
        update: {},
      })
    )
  );

  const techStacks = await Promise.all(
    TECH_STACKS.map((name) =>
      prisma.techStack.upsert({
        where: { slug: slugify(name, { lower: true, strict: true }) },
        create: { name, slug: slugify(name, { lower: true, strict: true }) },
        update: {},
      })
    )
  );

  const employeeRanges = await Promise.all(
    EMPLOYEE_RANGES.map((title) =>
      prisma.employeeRange.findFirst({ where: { title } }).then(
        (existing) => existing ?? prisma.employeeRange.create({ data: { title } })
      )
    )
  );

  const hourlyRateRanges = await Promise.all(
    HOURLY_RATE_RANGES.map((title) =>
      prisma.hourlyRateRange.findFirst({ where: { title } }).then(
        (existing) => existing ?? prisma.hourlyRateRange.create({ data: { title } })
      )
    )
  );

  const companies = [];
  for (let i = 0; i < 24; i += 1) {
    const name = `${faker.company.name()} ${faker.company.buzzNoun()}`.replace(/[,.]/g, "");
    const slug = slugify(`${name}-${i}`, { lower: true, strict: true });
    const shuffledStacks = faker.helpers.arrayElements(techStacks, { min: 2, max: 5 });

    const existing = await prisma.company.findUnique({ where: { slug } });
    if (existing) {
      companies.push(existing);
      continue;
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        website: faker.internet.url(),
        logo: faker.image.urlPicsumPhotos({ width: 200, height: 200 }),
        coverImage: faker.image.urlPicsumPhotos({ width: 1200, height: 400 }),
        shortDescription: faker.company.catchPhrase(),
        description: `<p>${faker.lorem.paragraphs(3, "</p><p>")}</p>`,
        foundedYear: faker.number.int({ min: 1998, max: 2023 }),
        headOffice: `${faker.location.city()}, ${faker.location.country()}`,
        countryId: faker.helpers.arrayElement(countries).id,
        employeeRangeId: faker.helpers.arrayElement(employeeRanges).id,
        hourlyRateRangeId: faker.helpers.arrayElement(hourlyRateRanges).id,
        verified: faker.datatype.boolean(),
        featured: faker.datatype.boolean({ probability: 0.3 }),
        status: "ACTIVE",
        score: faker.number.float({ min: 5, max: 9.8, fractionDigits: 1 }),
        techStacks: { create: shuffledStacks.map((ts) => ({ techStackId: ts.id })) },
      },
    });
    companies.push(company);
  }

  for (const parentDef of CATEGORY_TREE) {
    const parentSlug = slugify(parentDef.name, { lower: true, strict: true });
    const assignedCompanies = faker.helpers.arrayElements(companies, { min: 4, max: 8 });

    const parent = await prisma.category.upsert({
      where: { slug: parentSlug },
      create: {
        name: parentDef.name,
        slug: parentSlug,
        heroDescription: faker.lorem.sentence(),
        description: `<p>${faker.lorem.paragraphs(2, "</p><p>")}</p>`,
        image: faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
        featured: true,
        status: "ACTIVE",
        displayOrder: CATEGORY_TREE.indexOf(parentDef),
        metaTitle: `Top ${parentDef.name} Companies | Top Companies`,
        metaDescription: faker.lorem.sentence(),
        robots: "index, follow",
        faqs: {
          create: Array.from({ length: 3 }).map((_, idx) => ({
            question: faker.lorem.sentence().replace(".", "?"),
            answer: faker.lorem.paragraph(),
            sortOrder: idx,
          })),
        },
        companies: {
          create: assignedCompanies.map((c, idx) => ({ companyId: c.id, displayOrder: idx })),
        },
      },
      update: {},
    });

    for (const [childIdx, childName] of parentDef.children.entries()) {
      const childSlug = slugify(childName, { lower: true, strict: true });
      const childCompanies = faker.helpers.arrayElements(companies, { min: 3, max: 6 });

      await prisma.category.upsert({
        where: { slug: childSlug },
        create: {
          name: childName,
          slug: childSlug,
          parentId: parent.id,
          heroDescription: faker.lorem.sentence(),
          description: `<p>${faker.lorem.paragraphs(2, "</p><p>")}</p>`,
          status: "ACTIVE",
          displayOrder: childIdx,
          metaTitle: `Top ${childName} Companies | Top Companies`,
          metaDescription: faker.lorem.sentence(),
          robots: "index, follow",
          faqs: {
            create: Array.from({ length: 2 }).map((_, idx) => ({
              question: faker.lorem.sentence().replace(".", "?"),
              answer: faker.lorem.paragraph(),
              sortOrder: idx,
            })),
          },
          companies: {
            create: childCompanies.map((c, idx) => ({ companyId: c.id, displayOrder: idx })),
          },
        },
        update: {},
      });
    }
  }

  await prisma.settings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      siteName: "Top Companies",
      contactEmail: "hello@topcompanies.dev",
      phone: "+1 555 0100",
      address: "123 Market Street, San Francisco, CA",
      aboutContent: `<p>Top Companies helps you discover and compare the best software agencies, developers and studios around the world.</p><p>We rank every company using a transparent, data-driven score based on verified reviews, portfolio quality and delivery track record, so you can hire with confidence.</p>`,
      socialLinks: {
        facebook: "https://facebook.com/topcompanies",
        twitter: "https://twitter.com/topcompanies",
        linkedin: "https://linkedin.com/company/topcompanies",
      },
    },
    update: {},
  });

  await prisma.seoMeta.upsert({
    where: { page: "HOME" },
    create: {
      page: "HOME",
      metaTitle: "Top Companies - Find the Best Agencies & Developers",
      metaDescription: "Discover and compare top-rated software companies, agencies and developers.",
      robots: "index, follow",
    },
    update: {},
  });

  await prisma.seoMeta.upsert({
    where: { page: "ABOUT" },
    create: {
      page: "ABOUT",
      metaTitle: "About Top Companies",
      metaDescription: "Learn more about how Top Companies ranks and reviews software companies.",
      robots: "index, follow",
    },
    update: {},
  });

  console.log("\nSeed complete.");
  console.log(`Admin login -> email: ${DEFAULT_ADMIN_EMAIL}  password: ${DEFAULT_ADMIN_PASSWORD}\n`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
