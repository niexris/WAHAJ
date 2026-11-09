import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-6 text-center">
      <Logo size="lg" light />
      <p className="mt-8 max-w-md text-lg leading-8 text-navy-100">
        منصة إدارة البازارات وقياس أداء المتاجر ورضا الزوار.
      </p>
      <p className="mt-2 text-sm text-navy-100/60">صفحات التقييم للزوار ستُفعَّل في مراحل التطوير القادمة.</p>
      <Link
        href="/login"
        className="mt-10 rounded-lg bg-gold px-8 py-3 font-bold text-navy-900 transition hover:bg-gold-light"
      >
        دخول المالك
      </Link>
    </main>
  );
}
