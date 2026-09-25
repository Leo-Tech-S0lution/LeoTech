# Leo Tech Solution

The official website and CMS for **Leo Tech Solution** — a technology company and training academy. Built with Next.js (App Router), TypeScript, Tailwind CSS, GSAP, Drizzle ORM, and Neon PostgreSQL.

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
- **Media:** Cloudinary, abstracted behind `lib/media/storage.ts` for an easy swap to S3 / Vercel Blob later if needed

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
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (see below) |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret — keep this private, it's server-only |

**Never commit `.env.local`.** It's already git-ignored.

### 3. Set up Neon

1. Create a project at [console.neon.tech](https://console.neon.tech).
2. Copy the connection string from the dashboard (it looks like `postgresql://user:password@host/dbname?sslmode=require`).
3. Paste it into `DATABASE_URL` in `.env.local`.

### 4. Set up Cloudinary

1. Create a free account at [console.cloudinary.com](https://console.cloudinary.com).
2. On the dashboard home page, copy your **Cloud name**, **API Key**, and **API Secret**.
3. Paste them into `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `.env.local`.

Uploads made through the admin Media Library land in a `leotech-solution/` folder in your Cloudinary account. Cloudinary blocks delivery of uploaded SVGs by default (an XSS precaution, since an SVG can embed a script), so if you need to upload SVGs through the Media Library, look under your Cloudinary account's Settings → Security for the option to allow SVG delivery — skip this if you won't be uploading SVGs.

### 5. Run database migrations

Migrations are generated with Drizzle Kit and checked into `/drizzle`. To apply them to your database:

```bash
npm run db:migrate
```

If you change the schema (`lib/db/schema/*.ts`), generate a new migration first:

```bash
npm run db:generate
npm run db:migrate
```

Migration `0002_team_digital_profiles` (Team Digital ID + QR) is additive: it adds columns and two new tables, backfills a profile slug for every existing team member from their name, and marks their QR as generated. No existing rows are deleted or overwritten. Run it against production with `npm run db:migrate` — never `db:push` against production.

To load the current Leo Tech Solution roster without touching anything already entered in the admin:

```bash
npm run db:seed-team
```

It matches existing members by slug or name and only fills in empty fields; missing members are created.

`npm run db:studio` opens Drizzle Studio, a GUI for browsing/editing the database directly — useful for debugging.

### 6. Seed demo content

```bash
npm run db:seed
```

This populates realistic starter content (services, projects, training courses, team, testimonials, blog posts, job openings, etc.) and creates one **owner** admin account. The seed script prints the admin email and a randomly generated temporary password to the console — **copy it immediately, it is never shown again.** Log in at `/admin/login` and change the password right away (Users → your account).

Re-running the seed script is safe for the admin user (it skips creation if that email already exists) but will insert duplicate content rows for everything else — it's meant for first-time setup, not repeated resets.

### 7. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin` for the CMS. Use `npm run dev` (not `npm run build && npm run start`) for day-to-day content work — see the Troubleshooting note below on why.

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
  media/               Upload storage abstraction (Cloudinary)
  validation/          Zod schemas for admin forms
  seo/                 Metadata + JSON-LD helpers
  utils/               cn(), slugify, date/reading-time helpers
  icons.ts              String-key → lucide-react icon map, used by CMS icon pickers

drizzle/                Generated SQL migrations (checked into git)
public/
  brand/                The real Leo Tech Solution logo (dark + light variants), used verbatim across the site
```

Admin-uploaded media lives in Cloudinary, not in this repo — nothing under `public/` is runtime-writable.

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
- **QR Management** → Digital ID QR codes for every team member (see below)
- **SEO → SEO Health** → Configuration checklist (titles, canonical, sitemap, schema, OG image, verification)

Content changes are reflected on the public site via `revalidatePath()` — no redeploy needed.

### Team Digital ID + QR

Every team member has a permanent public profile at `/team/{slug}` (e.g. `/team/suraj-kumar-sah`). The QR printed on the back of their ID card encodes **only that URL** — no name, phone or other personal data — so profile details can change in the admin at any time without reprinting cards.

- **Creating a member** (Team → New Team Member) generates the slug from the name (editable, checked for uniqueness) and the QR automatically.
- **Changing a slug** keeps the old one in `team_member_slug_history`; the old URL permanently redirects to the new one, so printed cards keep working.
- **Regenerate QR** only issues a new file/version number — the encoded URL never changes.
- **Public / Private**: private profiles still open from the QR but are hidden from the team directory, sitemap and search engines (`noindex`).
- **Active / Inactive**: inactive profiles show “Profile Unavailable” instead of any details.
- **QR Management** (`/admin/qr-management`): search/filter, preview, PNG (1024px) / SVG download, single ID-card print (CR80, 54 × 85.6 mm) and bulk A4 print sheets. Print at 100% scale.
- **Analytics**: anonymous profile views (device class, browser family, OS, referrer host — no IP or raw user agent); bots and signed-in admins are excluded.
- **Roles**: owners can do everything; editors can edit profile content and view/download/print QR codes, but can't change slugs, visibility, verification, activation, regenerate QR codes or delete members.

---

## Google Search Console

Code can make the site crawlable and understandable; it can't force Google to index or rank it. Indexing takes days to weeks after these steps, and search placement is up to Google.

After deploying with `NEXT_PUBLIC_SITE_URL=https://leotechsolution.com.np`:

1. Open [Google Search Console](https://search.google.com/search-console) and **Add property → Domain**, entering `leotechsolution.com.np`.
2. Verify ownership by adding the TXT record Google shows to the domain's DNS. (Alternatively use a URL-prefix property with the HTML tag method: put the token in `GOOGLE_SITE_VERIFICATION` and redeploy.)
3. Open **URL Inspection**, inspect `https://leotechsolution.com.np/`, and click **Request indexing** if it isn't indexed yet.
4. Go to **Sitemaps** and submit `https://leotechsolution.com.np/sitemap.xml`.
5. Inspect a few important pages the same way: `/about`, `/services`, `/team`, `/contact` and a couple of team profiles. Don't re-submit the same URL repeatedly.
6. Check **Pages** (indexing) over the following days and fix anything reported as excluded, blocked or erroring.
7. Watch **Performance** for the query “Leo Tech Solution”.

Before submitting, sanity-check production:

- `https://leotechsolution.com.np/robots.txt` allows `/` and lists the sitemap.
- `https://www.leotechsolution.com.np/*` and `http://leotechsolution.com.np/*` both permanently redirect to `https://leotechsolution.com.np/*` in one hop. `next.config.ts` redirects the www host; on Vercel also set **Settings → Domains**: `leotechsolution.com.np` as the primary domain and `www.leotechsolution.com.np` → *Redirect to* `leotechsolution.com.np` (308). Never configure the reverse (apex → www) or the two rules will loop. Vercel redirects HTTP → HTTPS automatically.
- Site Settings contain the real company email, phone, address and official social profile URLs (these feed the Organization schema), and the default OG image is a 1200×630 PNG/JPG.
- Admin → SEO → SEO Health shows no failures.
- Validate structured data with the [Rich Results Test](https://search.google.com/test/rich-results) for the homepage and a team profile.

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

The app is a standard Next.js app and deploys cleanly to any Next.js-compatible host (Vercel, a Node server, etc.). Set the same environment variables from `.env.local` — including the three `CLOUDINARY_*` ones — in your hosting provider's dashboard. Never commit them. Because media lives in Cloudinary rather than on local disk, there's nothing extra to configure for serverless/read-only-filesystem hosts (this was the reason the storage layer was moved off local disk in the first place).

If you ever need a different provider (S3, Vercel Blob, etc.), `lib/media/storage.ts` is the single integration point for uploads — swap its two functions without touching any calling code.

## Troubleshooting

- **`DATABASE_URL is not set`** — make sure `.env.local` exists and is filled in (not just `.env.example`).
- **Migration fails with a permissions/SSL error** — confirm your Neon connection string includes `?sslmode=require`.
- **"Cloudinary is not configured" on upload** — fill in `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `.env.local` and restart the server.
- **Uploaded images don't show up** — if you're running `npm run start` (a production build) rather than `npm run dev`, restart the server: Next's production server only discovers new files under `public/` at startup, and there's no `public/` involvement in the Cloudinary path anyway once it's configured — this specific issue only applied when media briefly lived on local disk. If it recurs, check the browser console/network tab for the actual failing request (a 4xx from `res.cloudinary.com` usually means the account's SVG-delivery or security settings are blocking that file type).
- **Locked out of `/admin`** — connect to the database (`npm run db:studio` or the Neon SQL editor) and inspect the `admin_users` table, or re-run `npm run db:seed` after deleting your row to get a fresh temporary password.
- **Stale content after an admin edit** — content is revalidated automatically; a hard refresh (Ctrl/Cmd+Shift+R) rules out browser caching if something still looks old.
