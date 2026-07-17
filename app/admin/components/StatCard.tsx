interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
}

export default function StatCard({ label, value, delta, deltaUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-app)] p-5">
      <p className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-[var(--color-brand-primary)]">{value}</p>
      {delta && (
        <p
          className={`text-xs font-medium mt-1 ${
            deltaUp ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {deltaUp ? "↑" : "↓"} {delta}
        </p>
      )}
    </div>
  );
}
