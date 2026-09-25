import { PageHeader } from "@/components/sections/page-header";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata("/terms", {
    title: "Terms of Service",
    description:
      "Terms governing the use of the LeoTech Solution website and services.",
  });
}

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const updated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <PageHeader eyebrow="LEGAL" title="Terms of Service" description={`Last updated: ${updated}`} pattern="grid" />

      <section className="py-20 lg:py-24">
        <div className="container-tech prose prose-slate max-w-3xl prose-headings:font-display prose-headings:text-navy-900 prose-a:text-blue-600">
          <p>
            These Terms of Service govern your use of the {settings.companyName} website and the
            services we describe on it. By using this site, you agree to these terms.
          </p>

          <h2>Use of This Website</h2>
          <p>
            You may use this website for lawful purposes only. You agree not to misuse the site,
            attempt to gain unauthorized access to any part of it, or interfere with its normal
            operation.
          </p>

          <h2>Services &amp; Engagements</h2>
          <p>
            Descriptions of services, training courses, and internship programs on this site are
            informational. Specific scope, pricing, timelines, and deliverables for any client
            engagement or training enrollment are governed by a separate written agreement between
            {" "}{settings.companyName} and the client or student.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            The content on this website — including text, graphics, logos, and the LeoTech
            Solution brand mark — is the property of {settings.companyName} unless otherwise
            noted, and may not be reproduced without permission.
          </p>

          <h2>Training Courses &amp; Certificates</h2>
          <p>
            Course completion certificates are issued upon satisfactory completion of a course&apos;s
            required curriculum and final project, as determined by the instructor. Enrollment
            terms, including any refund policy, are provided at the time of registration.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            This website and its content are provided &ldquo;as is&rdquo; without warranties of
            any kind. {settings.companyName} is not liable for any indirect, incidental, or
            consequential damages arising from use of this site.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the site after changes
            are posted constitutes acceptance of the revised terms.
          </p>

          <h2>Contact Us</h2>
          <p>
            Questions about these terms can be sent to{" "}
            <a href={`mailto:${settings.email}`}>{settings.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
