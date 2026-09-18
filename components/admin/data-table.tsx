import { cn } from "@/lib/utils/cn";
import { EmptyState } from "@/components/ui/empty-state";

export interface Column<T> {
  header: string;
  className?: string;
  cell: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

/** Simple, boring, fast admin data table. No client-side sorting/virtualization needed at this scale. */
export function DataTable<T>({ columns, rows, rowKey, emptyMessage = "No records yet." }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} className="rounded-xl border-slate-200" />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60">
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn("px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
              {columns.map((col, i) => (
                <td key={i} className={cn("px-4 py-3 align-middle text-slate-700", col.className)}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
