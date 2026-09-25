import { Hero } from "@/components/sections/hero";
import { AboutPreview } from "@/components/sections/about-preview";
import { ServicesGrid } from "@/components/sections/services-grid";
import { TechStack } from "@/components/sections/tech-stack";
import { ProjectsShowcase } from "@/components/sections/projects-showcase";
import { TrainingPreview } from "@/components/sections/training-preview";
import { WhyLeotech } from "@/components/sections/why-leotech";
import { Process } from "@/components/sections/process";
import { TestimonialsCarousel } from "@/components/sections/testimonials-carousel";
import { TeamPreview } from "@/components/sections/team-preview";
import { BlogPreview } from "@/components/sections/blog-preview";
import { CtaSection } from "@/components/sections/cta-section";

import { getHomepageSectionsMap, getActiveHeroSlides, getStatistics, getProcessSteps, getWhyLeotechItems } from "@/lib/db/queries/content";
import { getFeaturedServices } from "@/lib/db/queries/services";
import { getTechnologiesByCategory } from "@/lib/db/queries/technologies";
import { getFeaturedProjects } from "@/lib/db/queries/projects";
import { getFeaturedCourses } from "@/lib/db/queries/training";
import { getPublishedTestimonials } from "@/lib/db/queries/testimonials";
import { getPublishedTeamMembers } from "@/lib/db/queries/team";
import { getFeaturedBlogPosts } from "@/lib/db/queries/blog";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/seo/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata() {
  return buildPageMetadata("/");
}

export default async function HomePage() {
  const [
    sections,
    heroSlides,
    statistics,
    processSteps,
    whyItems,
    services,
    techCategories,
    projects,
    courses,
    testimonials,
    team,
    posts,
    settings,
  ] = await Promise.all([
    getHomepageSectionsMap(),
    getActiveHeroSlides(),
    getStatistics(),
    getProcessSteps(),
    getWhyLeotechItems(),
    getFeaturedServices(),
    getTechnologiesByCategory(),
    getFeaturedProjects(),
    getFeaturedCourses(),
    getPublishedTestimonials(),
    getPublishedTeamMembers(),
    getFeaturedBlogPosts(),
    getSiteSettings(),
  ]);

  const siteUrl = getSiteUrl();
  const isEnabled = (key: string) => sections[key]?.enabled !== false;
  const sectionTitle = (key: string, fallback: string) => sections[key]?.title || fallback;
  const sectionDesc = (key: string, fallback: string | null) =>
    sections[key]?.description ?? fallback;

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(settings, siteUrl)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd(settings, siteUrl)) }}
      />

      {isEnabled("hero") && (
        <Hero
          slides={heroSlides}
          fallbackTitle={"Engineering Software,\nSystems & Skills for What's Next"}
          fallbackDescription={
            settings.tagline ??
            "LeoTech Solution designs and builds custom software, AI/ML, IoT, and cloud systems — and trains the engineers who run them."
          }
        />
      )}

      {isEnabled("about") && (
        <AboutPreview
          title={sectionTitle("about", "Who We Are")}
          description={sectionDesc("about", "A technology partner built on engineering rigor.")}
          statistics={statistics}
        />
      )}

      {isEnabled("services") && (
        <ServicesGrid
          title={sectionTitle("services", "What We Build")}
          description={sectionDesc("services", "End-to-end technology services, from first architecture sketch to long-term support.")}
          services={services}
        />
      )}

      {isEnabled("technologies") && (
        <TechStack
          title={sectionTitle("technologies", "Our Technology Stack")}
          description={sectionDesc("technologies", "The languages, frameworks, and platforms we build on every day.")}
          categories={techCategories}
        />
      )}

      {isEnabled("projects") && (
        <ProjectsShowcase
          title={sectionTitle("projects", "Selected Work")}
          description={sectionDesc("projects", "A sample of systems we've designed, built, and shipped.")}
          projects={projects}
        />
      )}

      {isEnabled("training") && (
        <TrainingPreview
          title={sectionTitle("training", "Technology Training Academy")}
          description={sectionDesc("training", "Hands-on courses that take students from fundamentals to production-ready projects.")}
          courses={courses}
        />
      )}

      {isEnabled("why_leotech") && (
        <WhyLeotech
          title={sectionTitle("why_leotech", "Why LeoTech")}
          description={sectionDesc("why_leotech", null)}
          items={whyItems}
        />
      )}

      {isEnabled("process") && (
        <Process
          title={sectionTitle("process", "How We Work")}
          description={sectionDesc("process", "A disciplined process from discovery through long-term support.")}
          steps={processSteps}
        />
      )}

      {isEnabled("testimonials") && (
        <TestimonialsCarousel
          title={sectionTitle("testimonials", "What Clients Say")}
          description={sectionDesc("testimonials", null)}
          testimonials={testimonials}
        />
      )}

      {isEnabled("team") && (
        <TeamPreview
          title={sectionTitle("team", "The People Behind It")}
          description={sectionDesc("team", null)}
          members={team}
        />
      )}

      {isEnabled("blog") && (
        <BlogPreview
          title={sectionTitle("blog", "Latest Insights")}
          description={sectionDesc("blog", null)}
          posts={posts}
        />
      )}

      {isEnabled("cta") && <CtaSection />}
    </>
  );
}
