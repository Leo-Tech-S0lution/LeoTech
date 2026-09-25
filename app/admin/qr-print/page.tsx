import { requireAdmin } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { getTeamMembersByIdsAdmin } from "@/lib/db/queries/team";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { profileUrl } from "@/lib/team/profile";
import { qrSvg } from "@/lib/team/qr";
import { PrintToolbar } from "./print-toolbar";

interface PrintPageProps {
  searchParams: Promise<{ ids?: string; layout?: string }>;
}

/**
 * Printer-friendly QR output. "card" = one block per page sized for the back of a
 * CR80 ID card (54 × 85.6 mm); "sheet" = an A4 grid of blocks for bulk printing.
 */
export default async function QrPrintPage({ searchParams }: PrintPageProps) {
  const user = await requireAdmin();
  if (!can(user, "qr.view")) return <p className="p-8 text-sm">You don&apos;t have permission to print QR codes.</p>;

  const { ids = "", layout = "card" } = await searchParams;
  const idList = ids
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[0-9a-f-]{36}$/i.test(s))
    .slice(0, 200);

  const [members, settings] = await Promise.all([getTeamMembersByIdsAdmin(idList), getSiteSettings()]);
  const printable = members.filter((m) => m.qrEnabled);
  const blocks = await Promise.all(
    printable.map(async (m) => ({
      member: m,
      url: profileUrl(m.slug),
      svg: await qrSvg(profileUrl(m.slug), { idSuffix: m.id.slice(0, 8) }),
    })),
  );
  const isSheet = layout === "sheet";

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <style>{`
        @page { size: A4; margin: ${isSheet ? "10mm" : "12mm"}; }
        .qr-svg > svg { width: 100%; height: auto; display: block; }
        @media print {
          .qr-block { break-inside: avoid; }
          .qr-card-page { break-after: page; }
          .qr-card-page:last-child { break-after: auto; }
        }
      `}</style>

      <PrintToolbar count={blocks.length} layout={isSheet ? "sheet" : "card"} />

      {blocks.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500">No QR-enabled members selected.</p>
      ) : (
        <main
          className={
            isSheet
              ? "mx-auto grid max-w-[210mm] grid-cols-3 gap-[6mm] bg-white p-[10mm] print:max-w-none print:p-0"
              : "mx-auto flex max-w-[210mm] flex-col items-center gap-8 p-8 print:gap-0 print:p-0"
          }
        >
          {blocks.map(({ member, url, svg }) => (
            <div key={member.id} className={isSheet ? "qr-block" : "qr-card-page flex w-full justify-center"}>
              <article className="qr-block flex h-[85.6mm] w-[54mm] flex-col items-center justify-between border border-slate-300 bg-white px-[4mm] py-[4mm] text-center text-black">
                <div className="flex items-center gap-[1.5mm]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/leotech-logo.svg" alt="" className="h-[7mm] w-[7mm]" />
                  <span className="text-[8pt] font-semibold tracking-wide">{settings.companyName}</span>
                </div>

                <div className="qr-svg w-[38mm]" dangerouslySetInnerHTML={{ __html: svg }} />

                <div className="w-full">
                  <p className="text-[9pt] font-bold leading-tight">{member.name}</p>
                  {member.position && <p className="text-[7pt] leading-tight">{member.position}</p>}
                  {member.employeeId && <p className="mt-[0.5mm] font-mono text-[6.5pt]">{member.employeeId}</p>}
                  <p className="mt-[1.5mm] text-[6.5pt] font-medium">Scan to view digital profile</p>
                  <p className="break-all font-mono text-[5pt] leading-tight text-slate-600">
                    {url.replace(/^https?:\/\//, "")}
                  </p>
                </div>
              </article>
            </div>
          ))}
        </main>
      )}
    </div>
  );
}
