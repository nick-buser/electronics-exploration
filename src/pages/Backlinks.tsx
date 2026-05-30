import { useMemo } from "react";
import { getBacklinks } from "@/data/backlinks";
import { TYPE_META } from "@/data/corpus";
import type { Entry, EntryType } from "@/data/schemas";

type Props = {
  slug: string;
  exclude?: (e: Entry) => boolean;
};

export function Backlinks({ slug, exclude }: Props) {
  const grouped = useMemo(() => {
    const all = getBacklinks(slug).filter((e) => !exclude?.(e));
    const g = new Map<EntryType, Entry[]>();
    for (const e of all) {
      const arr = g.get(e.type) ?? [];
      arr.push(e);
      g.set(e.type, arr);
    }
    return g;
  }, [slug, exclude]);

  const total = [...grouped.values()].reduce((n, arr) => n + arr.length, 0);
  if (total === 0) return null;

  const order: EntryType[] = [
    "domain",
    "archetype",
    "project",
    "principle",
    "component",
    "tool",
    "comparison",
    "journal",
  ];

  return (
    <section className="mt-12 pt-6 border-t border-line">
      <div className="font-mono font-mono-features text-[10px] uppercase tracking-[0.14em] text-faint mb-3">
        Referenced by · {total}
      </div>
      <div className="flex flex-col gap-4">
        {order
          .filter((t) => grouped.has(t))
          .map((t) => {
            const items = grouped.get(t)!;
            return (
              <div key={t}>
                <div className="font-mono font-mono-features text-[10.5px] uppercase tracking-[0.1em] text-muted mb-1.5">
                  {TYPE_META[t].group}
                </div>
                <ul className="flex flex-wrap gap-x-3 gap-y-1 m-0 p-0 list-none">
                  {items.map((e) => (
                    <li key={e.slug}>
                      <a
                        href={`#/${e.slug}`}
                        className="text-[13px] text-text-2 hover:text-accent border-b border-transparent hover:border-accent/40 transition-colors"
                      >
                        {e.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
      </div>
    </section>
  );
}
