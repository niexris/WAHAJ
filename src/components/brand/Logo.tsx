export function Logo({ size = "md", light = false }: { size?: "md" | "lg"; light?: boolean }) {
  const big = size === "lg";
  return (
    <div className="flex items-center gap-3">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={big ? "h-12 w-12" : "h-8 w-8"}
        fill="#C9A24B"
      >
        <path d="M12 0c.6 6.2 2.8 9 12 12-9.2 3-11.4 5.8-12 12-.6-6.2-2.8-9-12-12C9.2 9 11.4 6.2 12 0z" />
      </svg>
      <div className="leading-none">
        <div className={`font-extrabold ${big ? "text-5xl" : "text-2xl"} ${light ? "text-white" : "text-navy-800"}`}>
          وهج
        </div>
        <div className={`mt-1 tracking-[0.3em] text-gold ${big ? "text-sm" : "text-[10px]"}`}>WAHAJ</div>
      </div>
    </div>
  );
}
