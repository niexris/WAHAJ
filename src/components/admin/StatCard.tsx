export function StatCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5">
      <div className="text-sm text-navy-600">{label}</div>
      <div className="mt-2 text-3xl font-extrabold text-navy-800">
        {value === null ? "—" : value.toLocaleString("en-US")}
      </div>
    </div>
  );
}
