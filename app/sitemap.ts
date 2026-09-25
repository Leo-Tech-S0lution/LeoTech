import type { MetadataRoute } from "next";
import { getPublishedServices } from "@/lib/db/queries/services";
import { getPublishedProjects } from "@/lib/db/queries/projects";
import { getPublishedCourses } from "@/lib/db/queries/training";
import { getPublishedBlogPosts } from "@/lib/db/queries/blog";
import { getOpenJobs } from "@/lib/db/queries/careers";
import { getPublishedTeamMembers } from "@/lib/db/queries/team";
import { getSiteUrl } from "@/lib/seo/site";
import { profilePath } from "@/lib/team/profile";

const STATIC_ROUTES = [
  "",
  "/about",
  "/team",
  "/services",
  "/solutions",
  "/projects",
  "/training",
  "/internships",
  "/blog",
  "/careers",
  "/contact",
  "/privacy-policy",
  "/terms",
];

// Refresh at least hourly; admin team/content actions also revalidate it on change.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  // Only listed + active team profiles are included; private/inactive ones drop out automatically.
  const [services, projects, courses, posts, jobs, team] = await Promise.all([
    getPublishedServices(),
    getPublishedProjects(),
    getPublishedCourses(),
    getPublishedBlogPosts(),
    getOpenJobs(),
    getPublishedTeamMembers(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route || "/"}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...services.map((s) => ({ url: `${siteUrl}/services/${s.slug}`, lastModified: s.updatedAt, priority: 0.6 })),
    ...projects.map((p) => ({ url: `${siteUrl}/projects/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...courses.map((c) => ({ url: `${siteUrl}/training/${c.slug}`, lastModified: c.updatedAt, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${siteUrl}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
    ...jobs.map((j) => ({ url: `${siteUrl}/careers/${j.slug}`, lastModified: j.updatedAt, priority: 0.4 })),
    ...team.map((m) => ({ url: `${siteUrl}${profilePath(m.slug)}`, lastModified: m.updatedAt, priority: 0.5 })),
  ];

  return [...staticEntries, ...dynamicEntries];
}
