import Link from "next/link";
import { PageHeader } from "@/components/sections/page-header";
import { Button } from "@/components/ui/button";

export default function SiteNotFound() {
  return (
    <>
      <PageHeader eyebrow="404" title="Page not found" description="The page you're looking for doesn't exist or has moved." pattern="grid" />
      <section className="py-20 text-center lg:py-28">
        <div className="container-tech">
          <Button href="/" variant="primary" size="md">
            Back to Home
          </Button>
          <p className="mt-6 text-sm text-slate-500">
            Or explore{" "}
            <Link href="/services" className="text-blue-600 hover:text-blue-700">
              services
            </Link>
            ,{" "}
            <Link href="/projects" className="text-blue-600 hover:text-blue-700">
              projects
            </Link>
            , or{" "}
            <Link href="/blog" className="text-blue-600 hover:text-blue-700">
              the blog
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
