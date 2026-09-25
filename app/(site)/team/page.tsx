import { PageHeader } from "@/components/sections/page-header";
import { SectionWrapper } from "@/components/sections/section-wrapper";
import { TeamGrid } from "@/components/sections/team-grid";
import { CtaSection } from "@/components/sections/cta-section";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublishedTeamMembers } from "@/lib/db/queries/team";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { getSiteUrl } from "@/lib/seo/site";

export async function generateMetadata() {
  return buildPageMetadata("/team", {
    title: "Our Team",
    description:
      "Meet the LeoTech Solution team — the engineers, instructors and leaders behind our software, AI, IoT, robotics and technology training work.",
  });
}

export default async function TeamPage() {
  const team = await getPublishedTeamMembers();
  const siteUrl = getSiteUrl();

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: `${siteUrl}/` },
              { name: "Team", url: `${siteUrl}/team` },
            ]),
          ),
        }}
      />

      <PageHeader
        eyebrow="TEAM"
        title="The people behind LeoTech Solution"
        description="Every LeoTech Solution team member has a verified digital profile — the same one linked from the QR code on their company ID card."
        pattern="network"
      />

      <SectionWrapper index="01" label="Our Team" title="Meet the team">
        {team.length === 0 ? (
          <EmptyState message="Team members will appear here once they're published from the admin dashboard." />
        ) : (
          <TeamGrid members={team} showDepartment />
        )}
      </SectionWrapper>

      <CtaSection />
    </>
  );
}
