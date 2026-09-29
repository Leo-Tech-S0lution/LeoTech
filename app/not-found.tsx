import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#050a24] px-6 text-center font-sans text-white">
        <img src="/brand/leotech-logo-light.svg" alt="Leo Tech Solution" width={56} height={56} />
        <h1 className="mt-8 text-2xl font-bold">Page not found</h1>
        <p className="mt-3 max-w-sm text-sm text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center bg-[#1373e9] px-6 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-[#0451ae]"
        >
          Back To Home Page
        </Link>
      </body>
    </html>
  );
}
