# Top Companies — Platform

Production-ready admin panel + REST API + public directory site for a "Top
Companies" style listing (companies, categories, masters, settings)..

## Stack

- **Admin panel:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, React Hook Form + Zod, TanStack Table, TanStack Query
- **Public site:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, hand-built components (no shadcn — different visual language), ISR
- **Backend (api):** Node.js, Express, TypeScript
- **Database:** MySQL 8 + Prisma ORM
- **Auth:** JWT access token (15m, in-memory) + rotating refresh token (30d, httpOnly cookie) — admin panel only, the public site has no auth

## Monorepo layout

```
apps/
  api/     Express + Prisma REST API (port 4000)
  web/     Next.js public directory site - the public-facing port (3000)
  admin/   Next.js admin panel (port 3002, reverse-proxied under /admin by apps/web)
```

**Everything is reachable on one port, 3000**: the public site owns the root
paths (`/`, `/categories`, `/categories/:slug`, `/about`), and the admin
panel lives under `/admin/*`. This is Next.js's "Multi Zones" pattern —
`apps/admin` sets `basePath: "/admin"` and runs on its own internal port
(3002); `apps/web`'s `next.config.ts` rewrites any `/admin/*` request to
that internal server, so the browser only ever sees `http://localhost:3000`.
`apps/admin` on :3002 is still reachable directly while developing (e.g. for
faster reloads without the proxy hop), but :3000 is the one URL to use.

## Getting started

### 1. Prerequisites

- Node.js 18.18+
- A running MySQL 8 server (default assumed: `localhost:3306`, user `root`, no password)

### 2. Install dependencies

```bash
npm install
```

This installs all three workspaces (`apps/api`, `apps/admin`, `apps/web`) from the root.

### 3. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/admin/.env.local.example apps/admin/.env.local
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/api/.env` if your MySQL credentials differ from the default
`DATABASE_URL="mysql://root:@localhost:3306/top_companies"`. The database
itself does not need to exist beforehand — `prisma migrate dev` creates it.

### 4. Run migrations and seed data

```bash
npm run db:migrate
npm run db:seed
```

This creates the schema and seeds:

- 1 admin account — **email:** `admin@topdevelopmentcompany.com`, **password:** `Admin@12345`
- 10 countries, 15 tech stacks, 5 employee ranges, 5 hourly rate ranges
- ~24 companies with randomized relations and a randomized 0-10 `score`
- 8 categories (with parent/child nesting, FAQs, and attached companies)
- Default Settings (incl. About page content) + Home/About SEO rows

### 5. Run the dev servers

```bash
npm run dev
```

Runs the API (`http://localhost:4000`), the admin panel (internally on
`http://localhost:3002`) and the public site (`http://localhost:3000`)
together via `concurrently`. Browse the public site at
`http://localhost:3000`; log in to the admin panel at
`http://localhost:3000/admin/login` with the seeded credentials above (both
served from the same port — see "Monorepo layout" above).

Other root scripts: `npm run dev:api`, `npm run dev:admin`, `npm run dev:web`,
`npm run build`, `npm run db:studio` (Prisma Studio).

## Authentication model

- Every authenticated admin has **full access** — there is no role/permission
  system (multiple admin accounts, no RBAC, per spec).
- Access tokens are short-lived (15 min) and kept only in memory on the
  client (never localStorage) to limit XSS exposure.
- Refresh tokens are httpOnly, rotated on every use, and hashed at rest so a
  compromised database dump can't be replayed as a live session.
- `POST /api/auth/forgot-password` always returns the same generic response
  regardless of whether the email exists (no user enumeration). In
  development, no real email is sent — the reset link is logged to the API
  console (`npm run dev:api` output). Set `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`
  in `apps/api/.env` to send real email via Nodemailer instead.

## API reference

Base URL: `http://localhost:4000/api`. All `/admin/*` routes require
`Authorization: Bearer <accessToken>`. List endpoints accept `page`, `limit`,
`search`, `sortBy`, `sortOrder`, and entity-specific filters, returning
`{ success, data, meta: { page, limit, total, totalPages } }`.

```
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/profile
PATCH  /auth/profile
PATCH  /auth/change-password

GET    /admin/dashboard

GET|POST /admin/companies                 GET|PATCH|DELETE /admin/companies/:id
POST     /admin/companies/bulk-delete      POST /admin/companies/bulk-status

GET|POST /admin/categories                 GET|PATCH|DELETE /admin/categories/:id
POST     /admin/categories/bulk-delete      POST /admin/categories/bulk-status

GET|POST /admin/countries                  GET|PATCH|DELETE /admin/countries/:id (+ bulk-delete/bulk-status)
GET|POST /admin/tech-stacks                GET|PATCH|DELETE /admin/tech-stacks/:id (+ bulk-delete/bulk-status)
GET|POST /admin/employee-ranges            GET|PATCH|DELETE /admin/employee-ranges/:id (+ bulk-delete/bulk-status)
GET|POST /admin/hour-rate-ranges           GET|PATCH|DELETE /admin/hour-rate-ranges/:id (+ bulk-delete/bulk-status)

GET|PUT  /admin/settings                   # { general, seo: { home, about } }

POST     /admin/uploads                    # multipart/form-data, field "file" -> { url }
```

Uploaded files are served statically from `http://localhost:4000/uploads/...`.

### Public API (no auth, rate-limited ~120 req/min/IP)

Consumed by `apps/web`. Only `ACTIVE`, non-deleted records are ever
returned, with a public-safe field subset (no internal IDs beyond what's
needed for links, no timestamps).

```
GET /public/home                # general site info, home SEO, featured categories/companies
GET /public/categories          # all top-level categories + their active children + company counts
GET /public/categories/:slug     # category detail: SEO, FAQs, ranked companies, parent/children
GET /public/about                # contact info, about SEO, about page content (rich text)
```

## Architecture notes

- **Soft delete**: Company/Category/Country/TechStack/EmployeeRange/HourlyRateRange
  use a `deletedAt` column filtered explicitly in every query (no global
  Prisma middleware/magic) for clarity and easier debugging.
- **Masters CRUD factory** (`apps/api/src/modules/masters/crudFactory.ts`):
  Country/TechStack/EmployeeRange/HourlyRateRange share an identical shape
  (entity + status + soft delete + search + bulk ops), so one generic factory
  builds all four route stacks instead of duplicating four modules. The same
  reuse idea is mirrored on the frontend (`lib/queries/masters.ts`,
  `components/masters/master-list-page.tsx`).
- **FAQs and category↔company pivots** are replace-all-on-save (delete +
  recreate inside a transaction) rather than diffed, matching how a
  repeater/multi-select form actually submits.
- **Category self-relation**: creating/updating a category's `parentId` is
  checked server-side against circular hierarchies (a category can't become
  its own ancestor).
- **`optionalUrl`/`optionalEmail`** (`apps/api/src/lib/validation.ts`): plain
  `z.string().url().optional()` still rejects `""` — optional only means the
  *key* can be omitted, not that an empty value passes — so any admin form
  left with a blank Website/Avatar/Flag/Icon/social-link field 422'd the
  *entire* request. These helpers preprocess `""` to `null` (not
  `undefined`, since Prisma silently skips `undefined` fields on update but
  writes `null` — the difference between ignoring a cleared field and
  actually clearing it) before the format check runs.
- **SEO** (`apps/web/src/lib/seo.ts`): every public page's `generateMetadata`
  goes through one `buildMetadata()` helper — title/description/canonical/
  OG/Twitter/robots all pull from the backend's per-page SEO fields
  (Category's own fields, or the `HOME`/`ABOUT` `SeoMeta` rows), each with a
  sensible computed fallback (most importantly a *self-referencing canonical
  URL* when the admin hasn't set one, which avoids duplicate-content issues).
  `NEXT_PUBLIC_SITE_URL` backs the canonical/OG/sitemap URLs — set it to the
  real domain in production. Also included: `sitemap.ts` (every category and
  subcategory slug) and `robots.ts`; JSON-LD `Organization`/`WebSite` on
  every page (root layout) plus `BreadcrumbList`, `ItemList` (the ranked
  companies) and `FAQPage` on each category page. The root layout
  deliberately has **no title template** — admin-authored titles and our
  fallbacks already include the site name, so a template would double-suffix
  it (caught while verifying: `"... | Top Companies | Top Companies"`).
- **Company `score`** (0-10, nullable, admin-editable) and **Settings
  `aboutContent`** (rich text, admin-editable via a "About Content" tab on
  the Settings page) exist solely to power the public site's ranked
  category listings and About page — the PRD's schema didn't originally
  include either.
- **Public site rendering**: Server Components fetch the public API with
  `next: { revalidate: 60 }` (ISR) rather than SSR-per-request or full
  static generation — right fit for SEO content that changes through the
  admin panel, not on every visit. `generateMetadata` per page sources
  meta/canonical/OG/robots from each endpoint's `seo` block.
- **Single-port setup (Multi Zones)**: `apps/admin` is a fully independent
  Next.js app with `basePath: "/admin"`; `apps/web`'s `rewrites()` proxies
  `/admin` and `/admin/:path*` to it. Because `basePath` prefixes every
  `Link`/`router.push`/asset URL automatically, none of the admin app's
  route code needed to change. The browser only ever talks to
  `http://localhost:3000`, so the API's CORS `ADMIN_ORIGIN` only needs that
  one origin (plus `:3002` for direct-to-admin access during development).

## Known upstream constraints (as of this build)

- `apps/admin` pins `zod` to `4.0.17` (not the latest 4.x) because
  `@hookform/resolvers@5.4.0`'s zod-v4 resolver typings are pinned to zod's
  `4.0.x` internal version marker; newer zod 4.x patch releases (4.4+) fail
  to typecheck against it until resolvers publishes an update. `apps/api`
  is unaffected — it uses zod v3 independently.
- `npm audit` reports a few advisories inherited from Next.js's own
  dependency tree (`postcss`, `sharp` — used by `next/image` optimization)
  and from the `shadcn` CLI's dependency tree (`@hono/node-server`, a
  dev-only tool never invoked in production). No fix is available upstream
  yet without downgrading Next itself; worth re-running `npm audit` after
  routine dependency updates.
- Prisma is pinned at `5.22.0` even though a newer major (7.x) is available,
  to avoid an unplanned major-version migration mid-build. Revisit via the
  official [Prisma upgrade guide](https://pris.ly/d/major-version-upgrade)
  when convenient. 
- `lucide-react` (the icon set used by shadcn/ui and both frontends) has
  dropped brand/logo icons entirely — `apps/web`'s footer social links use
  `react-icons/fa6` instead for Facebook/X/LinkedIn/Instagram/YouTube glyphs.

## Project structure

```
apps/api/src/
  config/       env validation, multer config
  lib/          prisma client, jwt, mailer, slug, pagination, error classes
  middlewares/  authenticate, validate, error handler, rate limiters
  modules/      auth, companies, categories, masters, settings, uploads, dashboard
  routes/       route aggregator (mounted under /api)

apps/admin/src/
  app/          (auth) and (dashboard) route groups
  components/
    forms/      per-entity form components (company, category, masters, ...)
    layout/     sidebar, header, breadcrumbs, theme toggle
    masters/    generic master list page
    shared/     data table, image upload, rich text editor, SEO accordion, FAQ repeater, ...
    ui/         shadcn/ui primitives
  lib/          axios client, zustand auth store, React Query hooks, Zod schemas

apps/web/src/
  app/          page.tsx (Home), categories/, categories/[slug]/, about/
  components/   header, footer, theme-toggle, category-card, company-rank-card, faq-accordion
  lib/          api.ts (typed fetch wrapper with ISR), types.ts, cn() util
```
#   t o p - c o m p a n i e s 
 
 