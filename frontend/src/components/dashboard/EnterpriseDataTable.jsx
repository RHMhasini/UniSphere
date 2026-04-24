/**
 * @typedef {{ id: string }} Row
 */

const badgeStyles = {
  success:
    'bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/30',
  error:
    'bg-red-50 text-red-800 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-500/30',
  warning:
    'bg-amber-50 text-amber-900 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-500/30',
  neutral:
    'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-500/20',
};

function StatusBadge({ variant, children }) {
  const cls = badgeStyles[variant] ?? badgeStyles.neutral;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {children}
    </span>
  );
}

/**
 * @param {{
 *   columns: { key: string, header: string, className?: string }[],
 *   rows: Record<string, unknown>[],
 *   statusKey?: string,
 *   statusLabel?: (row: Record<string, unknown>) => string,
 *   statusVariant?: (row: Record<string, unknown>) => 'success' | 'error' | 'warning' | 'neutral',
 * }} props
 */
export default function EnterpriseDataTable({
  columns,
  rows,
  statusKey = 'status',
  statusLabel,
  statusVariant,
}) {
  const getLabel =
    statusLabel ??
    ((row) => String(row[statusKey] ?? ''));
  const getVariant =
    statusVariant ??
    ((row) => {
      const s = String(row[statusKey] ?? '').toLowerCase();
      if (['active', 'success', 'completed', 'ok', 'approved'].includes(s))
        return 'success';
      if (['error', 'failed', 'rejected', 'inactive', 'cancelled'].includes(s))
        return 'error';
      if (['pending', 'warning', 'review'].includes(s)) return 'warning';
      return 'neutral';
    });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-slate-700 dark:text-slate-300 ${col.className ?? ''}`}
                  >
                    {row[col.key] ?? '—'}
                  </td>
                ))}
                <td className="px-4 py-3.5">
                  <StatusBadge variant={getVariant(row)}>
                    {getLabel(row)}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { StatusBadge };
