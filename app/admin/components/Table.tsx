import { type ReactNode } from "react";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  loading?: boolean;
}

export default function Table<T extends { id: string | number }>({
  columns,
  rows,
  emptyMessage = "No results.",
  loading = false,
}: TableProps<T>) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-app)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-app)] bg-[var(--color-surface-subtle)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase ${col.className ?? ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--color-border-app)] last:border-0 hover:bg-[var(--color-surface-subtle)] transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-[var(--color-text-primary)] ${col.className ?? ""}`}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
