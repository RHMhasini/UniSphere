import { Building2, Ticket, Users, CalendarDays } from 'lucide-react';

/** Enterprise stat cards; `items[].icon` is a Lucide icon component. */
export default function StatsGrid({ items }) {
  const accentRing = {
    indigo: 'ring-indigo-200 dark:ring-indigo-900/40',
    slate: 'ring-slate-200 dark:ring-slate-700',
    emerald: 'ring-emerald-200 dark:ring-emerald-900/40',
    amber: 'ring-amber-200 dark:ring-amber-900/40',
  };

  const accentIcon = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const a = item.accent ?? 'indigo';
        return (
          <article
            key={item.label}
            className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-inset ${accentRing[a]} transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-white">
                  {item.value}
                </p>
                {item.sub ? (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.sub}
                  </p>
                ) : null}
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accentIcon[a]}`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export { Users, Building2, Ticket, CalendarDays };
