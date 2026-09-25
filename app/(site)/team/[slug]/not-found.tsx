import { PageHeader } from "@/components/sections/page-header";
import { Button } from "@/components/ui/button";

export default function ProfileNotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404 / TEAM"
        title="Profile Not Found"
        description="The requested LeoTech Solution team profile could not be found."
        pattern="grid"
      />
      <section className="py-20 text-center lg:py-28">
        <div className="container-tech">
          <Button href="/team" variant="primary" size="md">
            View Our Team
          </Button>
        </div>
      </section>
    </>
  );
}
