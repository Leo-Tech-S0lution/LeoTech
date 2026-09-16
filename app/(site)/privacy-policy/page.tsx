import { PageHeader } from "@/components/sections/page-header";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata("/privacy-policy");
}

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const updated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <PageHeader eyebrow="LEGAL" title="Privacy Policy" description={`Last updated: ${updated}`} pattern="grid" />

      <section className="py-20 lg:py-24">
        <div className="container-tech prose prose-slate max-w-3xl prose-headings:font-display prose-headings:text-navy-900 prose-a:text-blue-600">
          <p>
            This Privacy Policy explains how {settings.companyName} (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;) collects, uses, and protects information when you use our website
            and services.
          </p>

          <h2>Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li>Contact details submitted through our contact form (name, email, phone, company, and message content)</li>
            <li>Information submitted when applying for training courses, internships, or job openings</li>
            <li>Email addresses submitted for our newsletter</li>
          </ul>
          <p>
            We also collect limited technical information automatically, such as browser type
            and general usage patterns, to help us maintain and improve the site.
          </p>

          <h2>How We Use Information</h2>
          <ul>
            <li>To respond to inquiries and provide requested information</li>
            <li>To process applications for training courses, internships, and job openings</li>
            <li>To send updates you&apos;ve opted into, such as newsletters</li>
            <li>To maintain the security and functionality of our website</li>
          </ul>

          <h2>How We Protect Information</h2>
          <p>
            We use industry-standard safeguards to protect information submitted to us, including
            encrypted connections, hashed credentials for any accounts, and restricted internal
            access to stored data. No method of transmission or storage is completely secure, and
            we cannot guarantee absolute security.
          </p>

          <h2>Sharing of Information</h2>
          <p>
            We do not sell personal information. We may share information with service providers
            who help us operate our website and business (such as hosting and email delivery
            providers), under obligations to protect that information, or when required by law.
          </p>

          <h2>Your Choices</h2>
          <p>
            You may request access to, correction of, or deletion of your personal information by
            contacting us at {settings.email}. You can unsubscribe from newsletter emails at any
            time using the link in those emails.
          </p>

          <h2>Cookies</h2>
          <p>
            We use minimal cookies necessary for core site functionality, such as maintaining an
            admin session for authorized staff. We do not use third-party advertising trackers.
          </p>

          <h2>Contact Us</h2>
          <p>
            Questions about this policy can be sent to{" "}
            <a href={`mailto:${settings.email}`}>{settings.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
