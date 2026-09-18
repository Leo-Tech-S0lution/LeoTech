import { Logo } from "@/components/ui/logo";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo variant="light" size={48} href={null} />
        <div className="text-center">
          <h1 className="font-display text-lg font-semibold text-white">LeoTech Admin</h1>
          <p className="text-sm text-slate-400">Sign in to manage the site</p>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur">
        <LoginForm />
      </div>
    </div>
  );
}
