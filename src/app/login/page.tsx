import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { user, admin } = await getAdminContext();
  if (user && admin) redirect("/admin");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,162,75,0.22) 0%, rgba(201,162,75,0) 65%)" }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" light />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <h1 className="text-xl font-extrabold text-navy-800">دخول المالك</h1>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
