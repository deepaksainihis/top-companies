# Top Companies Platform PRD for Claude Code

## Role

You are a Principal Full Stack Engineer. Build a production-ready
application https://topdevelopmentcompany.com (do not copy
branding or assets).

## Stack

-   Frontend: Next.js 15 (App Router), React, TypeScript, Tailwind CSS,
    shadcn/ui, React Hook Form, Zod, TanStack Table, React Query.
-   Backend: Node.js, Express.js, TypeScript.
-   Database: MySQL 8 with Prisma ORM.
-   Auth: JWT Access + Refresh Tokens.
-   Multiple Admin accounts only (no RBAC). Every authenticated admin
    has full access.

## UI

-   Inspect the reference site and use the same font family if publicly
    available, otherwise the closest free alternative via next/font.
-   Match typography, spacing and visual hierarchy.
-   Modern responsive admin panel.

## Modules

### Authentication

-   Login
-   Logout
-   Forgot/Reset Password
-   Change Password
-   Profile

### Dashboard

Cards: - Total Companies - Total Categories - Total Countries - Total
Tech Stacks

Recent Companies Recent Categories

### Companies CRUD

Fields: - Name - Slug (auto-generated & editable, unique) - Website - Logo - Cover Image - Short Description -
Description (Rich Text) - Founded Year - Head Office - Country -
Employee Range - Hourly Rate Range - Multiple Tech Stacks - Verified -
Featured - Status

No SEO section on Company.

### Categories CRUD (Primary SEO Entity)

Fields - Name - Slug (auto-generated & editable, unique) - Parent
Category - Hero Title - Hero Description - Description (Rich Text) -
Image - Icon - Featured - Status - Display Order

SEO - Meta Title - Meta Description - Canonical URL - OG Title - OG
Description - OG Image - Robots

FAQ - Unlimited Question/Answer - Sort Order

Companies - Admin can search and select multiple companies. - Company
ordering within category. - Store displayOrder in pivot table.

### Masters

Country - name - iso2 - flag - status

Tech Stack - name - slug - icon - status

Employee Range - title - status

Hourly Rate Range - title - status

### Settings

General - Site Name - Logo - Favicon - Contact Email - Phone - Address -
Social Links

SEO - Home Page SEO - About Page SEO

## Database

Many-to-many: - CategoryCompany - CompanyTechStack

Audit columns: - createdAt - updatedAt - deletedAt (soft delete)

CategoryCompany: - categoryId - companyId - displayOrder

## APIs

/auth/login /auth/logout /auth/profile

/admin/companies /admin/categories /admin/countries /admin/tech-stacks
/admin/employee-ranges /admin/hour-rate-ranges /admin/settings

Support: - Pagination - Search - Filtering - Sorting

## Validation

-   Zod
-   Central error handler

## Admin UI

-   Sidebar
-   Header
-   Breadcrumbs
-   Responsive
-   Dark mode ready

Tables: - Search - Pagination - Bulk delete - Bulk status update

Forms: - Image upload - Rich text editor - Slug preview - SEO
accordion - FAQ repeater - Searchable multi-select companies

## Prisma Models

Create optimized Prisma schema with indexes and foreign keys.

## Deliverables

Generate in order: 1. Folder structure 2. Prisma schema 3. Express
backend 4. Authentication 5. CRUD APIs 6. Next.js Admin 7. Dashboard 8.
Settings 9. Seed data 10. README

Write production-quality, modular, enterprise-grade code with comments
where necessary.
