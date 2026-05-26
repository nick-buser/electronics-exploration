import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import { DOMAINS, ENTRIES, TYPE_META } from "@/data/corpus";
import type { Entry, EntryType } from "@/data/schemas";

type Snippet = { text: string; q: string } | null;
type Hit = Entry & { __snippet?: Snippet };

function fuzzyScore(q: string, text: string): number {
  if (!q) return 0;
  const ql = q.toLowerCase();
  const tl = text.toLowerCase();
  if (tl.includes(ql)) return 10 + (tl.startsWith(ql) ? 5 : 0);
  let qi = 0;
  for (let i = 0; i < tl.length && qi < ql.length; i++) {
    if (tl[i] === ql[qi]) qi++;
  }
  return qi === ql.length ? 3 : 0;
}

type Props = { onClose: () => void };

export function Palette({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntryType | null>(null);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [focus, setFocus] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results: Hit[] = useMemo(() => {
    let pool: Entry[] = ENTRIES;
    if (typeFilter) pool = pool.filter((e) => e.type === typeFilter);
    if (domainFilter) {
      pool = pool.filter((e) => ("domain" in e ? e.domain === domainFilter : false));
    }
    if (!query) return pool.slice(0, 40);

    const scored = pool
      .map((e) => {
        const titleS = fuzzyScore(query, e.title) * 3;
        const deckS = e.deck ? fuzzyScore(query, e.deck) * 0.6 : 0;
        const slugS = fuzzyScore(query, e.slug);
        const total = titleS + deckS + slugS;
        let snippet: Snippet = null;
        if (e.deck) {
          const idx = e.deck.toLowerCase().indexOf(query.toLowerCase());
          if (idx !== -1) {
            const start = Math.max(0, idx - 18);
            const end = Math.min(e.deck.length, idx + query.length + 30);
            snippet = { text: e.deck.slice(start, end), q: query };
          }
        }
        return { e, total, snippet };
      })
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 40);

    return scored.map((r) => ({ ...r.e, __snippet: r.snippet }));
  }, [query, typeFilter, domainFilter]);

  const grouped = useMemo(() => {
    const g: Record<string, Hit[]> = {};
    results.forEach((r) => {
      const k = TYPE_META[r.type].group;
      (g[k] ||= []).push(r);
    });
    return g;
  }, [results]);

  useEffect(() => {
    setFocus(0);
  }, [query, typeFilter, domainFilter]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocus((f) => Math.min(f + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocus((f) => Math.max(f - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[focus];
      if (r) {
        window.location.hash = `#/${r.slug}`;
        onClose();
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-start justify-center pt-[10vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] mx-4 bg-bg-2 border border-line-2 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKey}
        tabIndex={0}
      >
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-line">
          <Search size={16} className="text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search slugs, principles, components, projects…"
            className="flex-1 bg-transparent border-0 outline-0 text-[15px] placeholder:text-faint"
          />
        </div>

        <Filters
          label="type"
          all="all"
          options={Object.entries(TYPE_META).map(([k, v]) => ({ value: k, label: v.label }))}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as EntryType | null)}
        />
        <Filters
          label="domain"
          all="any"
          options={DOMAINS.map((d) => ({ value: d.slug, label: d.title }))}
          value={domainFilter}
          onChange={(v) => setDomainFilter(v)}
          border
        />

        <div className="flex-1 overflow-y-auto scroll-thin">
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-muted text-[13px]">No matches</div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="px-4 pt-3 pb-1 font-mono font-mono-features text-[10px] uppercase tracking-[0.12em] text-faint">
                {group} — {items.length}
              </div>
              {items.map((r) => {
                const globalIdx = results.indexOf(r);
                const isFocused = globalIdx === focus;
                return (
                  <div
                    key={r.slug}
                    onClick={() => {
                      window.location.hash = `#/${r.slug}`;
                      onClose();
                    }}
                    onMouseEnter={() => setFocus(globalIdx)}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-2 cursor-pointer border-l-2",
                      isFocused
                        ? "bg-accent/10 border-accent"
                        : "border-transparent hover:bg-hover",
                    )}
                  >
                    <span className="font-mono font-mono-features text-[10px] uppercase tracking-[0.1em] text-faint min-w-[68px]">
                      {TYPE_META[r.type].label}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-[13.5px] text-text">{r.title}</span>
                      {r.__snippet && (
                        <span className="block truncate text-[11.5px] text-muted">
                          …{r.__snippet.text}…
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-mono-features text-[10.5px] text-faint">
                      {("tier" in r && r.tier) || ("domain" in r && r.domain) || ""}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-line text-[10.5px] text-faint font-mono font-mono-features">
          <Kbd>↑↓</Kbd>navigate
          <Kbd>↵</Kbd>open
          <Kbd>esc</Kbd>close
          <span className="ml-auto">
            {results.length} of {ENTRIES.length}
          </span>
        </div>
      </div>
    </div>
  );
}

function Filters({
  label,
  all,
  options,
  value,
  onChange,
  border,
}: {
  label: string;
  all: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
  border?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex flex-wrap items-center gap-1.5 px-4 py-2",
        border && "border-b border-line",
      )}
    >
      <span className="font-mono font-mono-features text-[10px] text-faint uppercase tracking-[0.1em] mr-1">
        {label}
      </span>
      <Chip active={value === null} onClick={() => onChange(null)}>
        {all}
      </Chip>
      {options.map((o) => (
        <Chip
          key={o.value}
          active={value === o.value}
          onClick={() => onChange(value === o.value ? null : o.value)}
        >
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-2 py-0.5 rounded-full font-mono font-mono-features text-[10.5px] border transition-colors",
        active
          ? "bg-accent/10 border-accent/40 text-accent"
          : "bg-transparent border-line text-muted hover:border-line-2 hover:text-text-2",
      )}
    >
      {children}
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-bg border border-line-2 px-1.5 py-px rounded text-faint">{children}</span>
  );
}
