import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cursor } from "@/components/animations/cursor";
import { PageLoader } from "@/components/animations/page-loader";
import { PageTransition } from "@/components/animations/page-transition";
import { ScrollProgress } from "@/components/animations/scroll-progress";
import { getPublishedServices } from "@/lib/db/queries/services";
import { getPublishedCourses } from "@/lib/db/queries/training";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [services, courses] = await Promise.all([
    getPublishedServices(),
    getPublishedCourses(),
  ]);

  const navServices = services.map((s) => ({
    slug: s.slug,
    title: s.title,
    icon: s.icon,
  }));
  const navCourses = courses.map((c) => ({ slug: c.slug, title: c.title }));

  return (
    <>
      <PageLoader />
      <ScrollProgress />
      <Cursor />
      <Navbar services={navServices} courses={navCourses} />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
