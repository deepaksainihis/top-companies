export type Status = "ACTIVE" | "INACTIVE";

// Base UI's <Select.Value> shows the raw value (not the matching
// <Select.Item>'s label) unless given a resolver - every status dropdown
// in the app needs this to display "Active"/"Inactive" instead of
// "ACTIVE"/"INACTIVE".
export const STATUS_LABELS: Record<Status, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

// Same resolver, for the "all status" table filter dropdowns.
export const statusFilterLabel = (value: string): string =>
  value === "all" ? "All Status" : (STATUS_LABELS[value as Status] ?? value);

export interface AuditUser {
  id: number;
  name: string;
  email: string;
}

// Only present on single-record `getById` responses (see the backend's
// `attachAuditNames`), never on list rows - always optional here.
export interface AuditFields {
  createdBy?: AuditUser | null;
  updatedBy?: AuditUser | null;
  deletedBy?: AuditUser | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiItemResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface Country extends AuditFields {
  id: number;
  name: string;
  iso2: string;
  flag: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface TechStack extends AuditFields {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRange extends AuditFields {
  id: number;
  title: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface HourlyRateRange extends AuditFields {
  id: number;
  title: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Company extends AuditFields {
  id: number;
  name: string;
  slug: string;
  website: string | null;
  logo: string | null;
  coverImage: string | null;
  shortDescription: string | null;
  description: string | null;
  foundedYear: number | null;
  headOffice: string | null;
  countryId: number | null;
  country: Pick<Country, "id" | "name" | "iso2" | "flag"> | null;
  employeeRangeId: number | null;
  employeeRange: Pick<EmployeeRange, "id" | "title"> | null;
  hourlyRateRangeId: number | null;
  hourlyRateRange: Pick<HourlyRateRange, "id" | "title"> | null;
  verified: boolean;
  featured: boolean;
  status: Status;
  score: number | null;
  createdAt: string;
  updatedAt: string;
  techStacks: { companyId: number; techStackId: number; techStack: TechStack }[];
}

export interface CategoryFaq {
  id?: number;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface CategoryCompanyPivot {
  categoryId: number;
  companyId: number;
  displayOrder: number;
  company: Pick<Company, "id" | "name" | "slug" | "logo" | "status">;
}

export interface Category extends AuditFields {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parent: Pick<Category, "id" | "name" | "slug"> | null;
  heroDescription: string | null;
  description: string | null;
  image: string | null;
  icon: string | null;
  featured: boolean;
  status: Status;
  displayOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  robots: string | null;
  createdAt: string;
  updatedAt: string;
  faqs?: CategoryFaq[];
  companies?: CategoryCompanyPivot[];
  _count?: { companies: number; faqs: number };
}

export interface AdminUser extends AuditFields {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  totals: {
    totalCompanies: number;
    totalCategories: number;
    totalCountries: number;
    totalTechStacks: number;
  };
  recentCompanies: Pick<Company, "id" | "name" | "slug" | "logo" | "status" | "createdAt">[];
  recentCategories: (Pick<Category, "id" | "name" | "slug" | "status" | "createdAt"> & { image: string | null })[];
}

export interface SeoMetaFields {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  robots: string | null;
}

export interface SettingsData {
  general: AuditFields & {
    siteName: string | null;
    logo: string | null;
    favicon: string | null;
    contactEmail: string | null;
    phone: string | null;
    address: string | null;
    aboutContent: string | null;
    socialLinks: {
      facebook?: string | null;
      twitter?: string | null;
      linkedin?: string | null;
      instagram?: string | null;
      youtube?: string | null;
    } | null;
  };
  seo: {
    home: SeoMetaFields;
    about: SeoMetaFields;
  };
}
