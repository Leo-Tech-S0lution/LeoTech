# LeoTech Solution

The official website and CMS for **LeoTech Solution** — a technology company and training academy. Built with Next.js (App Router), TypeScript, Tailwind CSS, GSAP, Drizzle ORM, and Neon PostgreSQL.

The public site is fully database-driven: hero slides, services, projects, training courses, internships, team, testimonials, blog, careers, FAQs, SEO metadata, and site settings are all managed through a custom admin dashboard at `/admin` — nothing important is hardcoded.

---

## Stack

- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** GSAP + ScrollTrigger
- **Database:** Neon PostgreSQL via Drizzle ORM (`pg` driver)
- **Auth:** Self-contained cookie/session auth (bcrypt password hashing, hashed session tokens) — no third-party auth provider
- **Rich text:** Tiptap (blog editor)
- **Media:** Local-disk storage under `public/uploads`, abstracted behind `lib/media/storage.ts` for an easy swap to S3 / Vercel Blob / Cloudinary later

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (see below) |
| `AUTH_SECRET` | Any long random string — used to strengthen session handling. Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | The public URL of the site (used for SEO metadata, sitemap, OG tags) |

**Never commit `.env.local`.** It's already git-ignored.

### 3. Set up Neon

1. Create a project at [console.neon.tech](https://console.neon.tech).
2. Copy the connection string from the dashboard (it looks like `postgresql://user:password@host/dbname?sslmode=require`).
3. Paste it into `DATABASE_URL` in `.env.local`.

### 4. Run database migrations

Migrations are generated with Drizzle Kit and checked into `/drizzle`. To apply them to your database:

```bash
npm run db:migrate
```

If you change the schema (`lib/db/schema/*.ts`), generate a new migration first:

```bash
npm run db:generate
npm run db:migrate
```

`npm run db:studio` opens Drizzle Studio, a GUI for browsing/editing the database directly — useful for debugging.

### 5. Seed demo content

```bash
npm run db:seed
```

This populates realistic starter content (services, projects, training courses, team, testimonials, blog posts, job openings, etc.) and creates one **owner** admin account. The seed script prints the admin email and a randomly generated temporary password to the console — **copy it immediately, it is never shown again.** Log in at `/admin/login` and change the password right away (Users → your account).

Re-running the seed script is safe for the admin user (it skips creation if that email already exists) but will insert duplicate content rows for everything else — it's meant for first-time setup, not repeated resets.

### 6. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin` for the CMS.

---

## Project Structure

```
app/
  (site)/            Public marketing site (shares Navbar/Footer/Cursor/PageLoader via layout)
  admin/              Admin CMS — protected routes, own layout/design system
  sitemap.ts          Dynamic sitemap generation
  robots.ts           robots.txt generation

components/
  ui/                 Small shared primitives (Button, Logo, SectionLabel, EmptyState)
  layout/              Navbar, MobileNav, Footer
  animations/          GSAP-powered primitives (Reveal, AnimatedCounter, MagneticButton, Cursor, PageLoader, ScrollProgress)
  patterns/            TechBackground engine + NetworkPattern (logo-inspired animated network)
  sections/            Homepage/interior page sections (Hero, ServicesGrid, Process, etc.)
  admin/               Admin-only components (sidebar, data tables, media picker, forms)

lib/
  db/
    schema/            Drizzle schema, one file per domain, barrel-exported from index.ts
    queries/           Read queries, split into public ("published only") and *Admin (all rows) variants
    index.ts            Drizzle client (server-only)
    migrate.ts          Migration runner
    seed.ts              Seed script
  auth/                Session management, password hashing, requireAdmin() guard
  media/               Upload storage abstraction
  validation/          Zod schemas for admin forms
  seo/                 Metadata + JSON-LD helpers
  utils/               cn(), slugify, date/reading-time helpers
  icons.ts              String-key → lucide-react icon map, used by CMS icon pickers

drizzle/                Generated SQL migrations (checked into git)
public/
  brand/                The real LeoTech Solution logo (dark + light variants), used verbatim across the site
  uploads/               Admin-uploaded media (git-ignored — this is runtime data, not source)
```

---

## CMS Usage

Log in at `/admin/login`. The sidebar covers every content type described in the project brief:

- **Website** → Homepage section toggles, Hero slides, About stats, Services, Technologies, Projects, Training, Testimonials, Team, FAQ, Contact
- **Blog** → Posts (rich text via Tiptap) and Categories/Tags
- **Projects**, **Training** (Courses + Internships), **Team**, **Testimonials**, **Careers** — full CRUD with draft/published/archived states where applicable
- **Messages** → Contact form submissions, with status tracking (new/contacted/closed)
- **Media Library** → Upload, preview, copy URL, delete. Every image field elsewhere in the admin opens this same picker rather than asking for a raw URL.
- **SEO** → Per-page title/description/OG image overrides for static routes
- **Site Settings** → Company info, contact details, social links, default SEO
- **Users** → Manage other admin accounts (owner/editor roles)

Content changes are reflected on the public site via `revalidatePath()` — no redeploy needed.

---

## Security Notes

- Passwords are hashed with bcrypt; plaintext passwords are never stored or logged (the seed script's one-time console output is the only exception, by design, for initial setup).
- Sessions are opaque random tokens stored in an httpOnly, secure (in production), `SameSite=Lax` cookie. The database only stores a SHA-256 hash of the token, not the token itself.
- Every admin page and every mutating server action independently calls `requireAdmin()` — authorization isn't only enforced at the layout level.
- All admin inputs are validated server-side with Zod, even though forms also validate client-side.
- Rich text from the blog editor is sanitized with DOMPurify both before it's stored and again before it's rendered.
- `DATABASE_URL` and all secrets stay server-side only — verify this yourself with `grep -r "DATABASE_URL" components/` if you're auditing.

---

## Production Build

```bash
npm run build
npm run start
```

## Deployment

The app is a standard Next.js app and deploys cleanly to any Next.js-compatible host (Vercel, a Node server, etc.). Set the same environment variables from `.env.local` in your hosting provider's dashboard — never commit them.

If you deploy to a serverless/read-only-filesystem platform, swap `lib/media/storage.ts` for an external storage provider (S3, Vercel Blob, Cloudinary) — it's the single integration point for uploads, so nothing else needs to change.

## Troubleshooting

- **`DATABASE_URL is not set`** — make sure `.env.local` exists and is filled in (not just `.env.example`).
- **Migration fails with a permissions/SSL error** — confirm your Neon connection string includes `?sslmode=require`.
- **Images not showing after upload** — confirm `public/uploads` exists and is writable; on serverless hosts, switch to external storage (see above), since their filesystems are typically read-only or ephemeral.
- **Locked out of `/admin`** — connect to the database (`npm run db:studio` or the Neon SQL editor) and inspect the `admin_users` table, or re-run `npm run db:seed` after deleting your row to get a fresh temporary password.
- **Stale content after an admin edit** — content is revalidated automatically; a hard refresh (Ctrl/Cmd+Shift+R) rules out browser caching if something still looks old.
