import { PageHeader } from "@/components/sections/page-header";
import { SectionWrapper } from "@/components/sections/section-wrapper";
import { WhyLeotech } from "@/components/sections/why-leotech";
import { TeamGrid } from "@/components/sections/team-grid";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/animations/reveal";
import { AnimatedCounter } from "@/components/animations/animated-counter";
import { TechBackground } from "@/components/patterns/tech-background";
import { EmptyState } from "@/components/ui/empty-state";
import { getStatistics, getWhyLeotechItems } from "@/lib/db/queries/content";
import { getPublishedTeamMembers } from "@/lib/db/queries/team";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata("/about", {
    title: "About Us",
    description:
      "Leo Tech Solution is a technology company that designs and builds custom software, AI/ML, IoT and cloud systems — and trains the engineers who run them.",
  });
}

export default async function AboutPage() {
  const [statistics, whyItems, team] = await Promise.all([
    getStatistics(),
    getWhyLeotechItems(),
    getPublishedTeamMembers(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="01 / ABOUT"
        title="A technology company built on engineering rigor"
        description="Leo Tech Solution designs and builds custom software, AI/ML, IoT, and cloud systems — and trains the engineers who run them."
        pattern="network"
      />

      <SectionWrapper index="01" label="Who We Are" title="Software, systems, and the people behind them">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="space-y-6 text-base leading-relaxed text-slate-600">
            <p>
              Leo Tech Solution was founded on a simple premise: technology companies too often
              separate the people who design systems from the people who teach others to build
              them. We don&apos;t. Our engineers work on client systems and teach in our training
              academy, which keeps both sides honest — curriculum stays grounded in real
              production work, and client projects benefit from people who think carefully about
              how to explain a decision, not just make one.
            </p>
            <p>
              We work across custom software, AI/ML, IoT, cloud infrastructure, cybersecurity,
              and networking — not because we chase every trend, but because most real systems
              touch more than one of these domains, and we&apos;d rather own that complexity than
              hand clients off between disconnected vendors.
            </p>
          </Reveal>

          <Reveal className="space-y-6">
            <div className="border-l-2 border-blue-500/30 pl-5">
              <h3 className="font-display text-lg font-semibold text-navy-900">Mission</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Build software and systems that are maintainable and secure by default, and train
                the next generation of engineers to do the same.
              </p>
            </div>
            <div className="border-l-2 border-blue-500/30 pl-5">
              <h3 className="font-display text-lg font-semibold text-navy-900">Vision</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                A technology industry where the line between &ldquo;built it&rdquo; and
                &ldquo;can teach it&rdquo; keeps getting thinner.
              </p>
            </div>
          </Reveal>
        </div>

        {statistics.length > 0 && (
          <Reveal stagger className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-10 sm:grid-cols-4">
            {statistics.map((stat) => (
              <div key={stat.id}>
                <div className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix ?? ""} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </Reveal>
        )}
      </SectionWrapper>

      <section className="relative overflow-hidden bg-navy-900 py-20 lg:py-24">
        <TechBackground type="blueprint" dark className="opacity-60" />
        <div className="container-tech relative grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">Our Approach</span>
            <h2 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
              Understand the problem before touching the stack
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Every engagement starts with discovery — understanding constraints, existing
              systems, and what &ldquo;done&rdquo; actually means for the business — before any
              architecture decision gets made. Technology choices follow the problem; they never
              lead it.
            </p>
          </Reveal>
          <Reveal className="flex flex-col justify-center gap-4 text-sm text-slate-400">
            <p>
              We work in short, reviewable increments so progress stays visible and course
              corrections stay cheap. Nothing ships to production without testing, monitoring,
              and a rollback plan already in place.
            </p>
            <p>
              And we stay engaged after launch — a system we&apos;ve handed off is still a system
              we&apos;re accountable for.
            </p>
          </Reveal>
        </div>
      </section>

      {whyItems.length > 0 && <WhyLeotech title="Why LeoTech" description={null} items={whyItems} />}

      <section id="team" className="scroll-mt-24">
        <SectionWrapper index="02" label="Our Team" title="The people building and teaching">
          {team.length === 0 ? (
            <EmptyState message="Team members will appear here once they're published from the admin dashboard." />
          ) : (
            <TeamGrid members={team} />
          )}
        </SectionWrapper>
      </section>

      <CtaSection />
    </>
  );
}
