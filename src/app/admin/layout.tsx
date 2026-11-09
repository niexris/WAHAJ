import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Logo } from "@/components/brand/Logo";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, admin } = await getAdminContext();

  if (!user) redirect("/login");

  if (!admin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-6 text-center">
        <Logo light />
        <h1 className="mt-8 text-xl font-extrabold text-white">لا تملك صلاحية الدخول</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-navy-100">
          الحساب <span dir="ltr">{user.email}</span> غير مسجّل كمالك للمنصة.
        </p>
        <form action="/auth/signout" method="post" className="mt-6">
          <button type="submit" className="rounded-lg bg-gold px-6 py-2.5 font-bold text-navy-900">
            تسجيل الخروج
          </button>
        </form>
      </main>
    );
  }

  return (
    <AdminShell name={admin.full_name ?? ""} email={user.email ?? ""}>
      {children}
    </AdminShell>
  );
}
