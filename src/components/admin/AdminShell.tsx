"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";

type Item = { label: string; href: string; ready: boolean };

// Only pages that actually exist are links. The rest are shown disabled
// with the phase in which they will be built.
const ITEMS: Item[] = [
  { label: "الرئيسية", href: "/admin", ready: true },
  { label: "البازارات", href: "/admin/bazaars", ready: false },
  { label: "البوثات", href: "/admin/booths", ready: false },
  { label: "المتاجر", href: "/admin/stores", ready: false },
  { label: "تقييم المتاجر", href: "/admin/store-ratings", ready: false },
  { label: "تقييم الزوار", href: "/admin/visitor-ratings", ready: false },
  { label: "QR Codes", href: "/admin/qr", ready: false },
  { label: "إحصائيات الزوار والتفاعل", href: "/admin/analytics", ready: false },
  { label: "التقارير", href: "/admin/reports", ready: false },
  { label: "الإعدادات", href: "/admin/settings", ready: false },
];

export function AdminShell({
  name,
  email,
  children,
}: {
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const nav = (
    <nav aria-label="القائمة الرئيسية" className="mt-8 space-y-1">
      {ITEMS.map((item) =>
        item.ready ? (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={pathname === item.href ? "page" : undefined}
            className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              pathname === item.href
                ? "bg-gold text-navy-900"
                : "text-navy-100 hover:bg-navy-700"
            }`}
          >
            {item.label}
          </Link>
        ) : (
          <div
            key={item.href}
            aria-disabled="true"
            className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm text-navy-100/40"
          >
            <span>{item.label}</span>
            <span className="rounded bg-navy-700 px-2 py-0.5 text-[10px] text-navy-100/60">قريبًا</span>
          </div>
        )
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-navy-50 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-navy-900 p-5 lg:block">
        <Logo light />
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy-950/60"
          />
          <aside className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-navy-900 p-5">
            <Logo light />
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 sm:px-8">
          <button
            onClick={() => setOpen(true)}
            aria-label="فتح القائمة"
            className="rounded-lg p-2 text-navy-800 hover:bg-navy-50 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <div className="hidden text-sm text-navy-600 lg:block">
            مرحبًا، <span className="font-bold text-navy-800">{name || email}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-navy-100 px-4 py-2 text-sm font-medium text-navy-800 hover:bg-navy-50"
            >
              تسجيل الخروج
            </button>
          </form>
        </header>
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
