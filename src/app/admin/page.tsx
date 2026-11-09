import { getAdminContext } from "@/lib/auth";
import { StatCard } from "@/components/admin/StatCard";

export default async function AdminHome() {
  const { supabase } = await getAdminContext();
  const head = { count: "exact", head: true } as const;

  const [bazaars, active, stores, booths, storeRatings, visitorRatings] = await Promise.all([
    supabase.from("bazaars").select("*", head),
    supabase.from("bazaars").select("*", head).eq("status", "active"),
    supabase.from("stores").select("*", head),
    supabase.from("booths").select("*", head),
    supabase.from("store_ratings").select("*", head),
    supabase.from("visitor_ratings").select("*", head),
  ]);

  const results = [bazaars, active, stores, booths, storeRatings, visitorRatings];
  const failed = results.some((r) => r.error);
  const n = (r: (typeof results)[number]) => (r.error ? null : r.count ?? 0);
  const allZero = !failed && results.every((r) => (r.count ?? 0) === 0);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy-800">الرئيسية</h1>

      {failed ? (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          تعذّرت قراءة البيانات من قاعدة البيانات. تأكد من تنفيذ ملف supabase/wahaj_schema.sql
          ومن صحة مفاتيح Supabase في ملف البيئة.
        </p>
      ) : (
        <p className="mt-2 text-sm text-navy-600">الأرقام أدناه تُقرأ مباشرة من قاعدة البيانات.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard label="إجمالي البازارات" value={n(bazaars)} />
        <StatCard label="البازارات النشطة" value={n(active)} />
        <StatCard label="إجمالي المتاجر" value={n(stores)} />
        <StatCard label="إجمالي البوثات" value={n(booths)} />
        <StatCard label="تقييمات المتاجر" value={n(storeRatings)} />
        <StatCard label="تقييمات الزوار" value={n(visitorRatings)} />
      </div>

      {allZero && (
        <p className="mt-6 rounded-lg border border-gold/40 bg-white p-4 text-sm leading-6 text-navy-600">
          لا توجد بيانات بعد. ستتمكن من إضافة البازارات والبوثات والمتاجر في المرحلة الثانية.
        </p>
      )}
    </div>
  );
}
