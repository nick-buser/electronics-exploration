import { useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import {
  ARCHETYPES,
  COMPARISONS,
  COMPONENTS,
  DOMAINS,
  ENTRIES,
  JOURNAL,
  PRINCIPLES,
  PROJECTS,
  TOOLS,
} from "@/data/corpus";
import type { Entry } from "@/data/schemas";

type Group = { label: string; items: Entry[]; render?: (e: Entry) => JSX.Element };

type Props = {
  slug: string;
  onOpenPalette: () => void;
};

const STATUS_DOT: Record<string, string> = {
  building: "bg-accent",
  planned: "bg-amber",
  done: "bg-text-2",
  shelved: "bg-faint",
};

export function Sidebar({ slug, onOpenPalette }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const groups: Group[] = [
    { label: "Domains", items: DOMAINS },
    { label: "Archetypes", items: ARCHETYPES },
    {
      label: "Projects",
      items: PROJECTS,
      render: (e) => {
        if (e.type !== "project") return <NavItem key={e.slug} entry={e} active={slug === e.slug} />;
        return (
          <a
            key={e.slug}
            href={`#/${e.slug}`}
            className={clsx(
              "group flex items-center gap-2 mx-3 px-2 py-[5px] rounded text-[13px] text-text-2 hover:bg-hover hover:text-text transition-colors",
              slug === e.slug && "bg-accent/10 text-text",
            )}
          >
            <span className={clsx("size-1.5 rounded-full", STATUS_DOT[e.status] ?? "bg-dim")} />
            <span className="truncate flex-1">{e.title}</span>
            <span className="font-mono font-mono-features text-[10px] text-faint">{e.tier}</span>
          </a>
        );
      },
    },
    { label: "Principles", items: PRINCIPLES },
    { label: "Components", items: COMPONENTS },
    { label: "Tools", items: TOOLS },
    { label: "Comparisons", items: COMPARISONS },
    { label: "Journal", items: JOURNAL },
  ];

  return (
    <aside className="sticky top-0 h-screen overflow-y-auto bg-bg-2 border-r border-line py-4 pb-8 text-[13.5px] scroll-thin">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 pt-1.5 pb-4 mb-2.5 border-b border-line">
        <div className="size-[22px] grid place-items-center rounded border border-accent text-accent font-mono font-semibold text-[11px]" style={{ background: "var(--accent-bg)" }}>
          B
        </div>
        <div className="font-mono font-mono-features font-semibold text-[13px] tracking-[0.02em] text-text">
          bench<span className="text-muted font-normal"> · atlas</span>
        </div>
      </div>

      {/* Search trigger */}
      <button
        onClick={onOpenPalette}
        className="flex items-center gap-2.5 w-[calc(100%-24px)] mx-3 mb-4 px-2.5 py-2 bg-surface border border-line rounded-lg text-muted text-[13px] hover:border-line-2 hover:text-text-2 transition-colors"
      >
        <Search size={14} />
        <span>Search the atlas…</span>
        <span className="ml-auto font-mono font-mono-features text-[10.5px] text-faint bg-bg border border-line-2 px-1.5 py-px rounded">
          ⌘K
        </span>
      </button>

      {/* Overview */}
      <NavSection label="Overview">
        <NavRow href="#/" active={slug === ""}>
          <span className="size-1.5 rounded-full bg-dim" />
          Home
        </NavRow>
        <NavRow href="#/inventory" active={slug === "inventory"}>
          <span className="size-1.5 rounded-full bg-dim" />
          <span className="flex-1">Inventory</span>
          <span className="font-mono font-mono-features text-[10px] text-faint">parts</span>
        </NavRow>
      </NavSection>

      {groups.map((g) => {
        const isCollapsed = !!collapsed[g.label];
        return (
          <div className="pt-3.5 pb-1" key={g.label}>
            <button
              className="flex items-center gap-1.5 w-[calc(100%-24px)] mx-3 px-2 pb-1.5 font-mono font-mono-features text-[10px] uppercase tracking-[0.14em] text-faint hover:text-muted transition-colors"
              onClick={() => setCollapsed((c) => ({ ...c, [g.label]: !c[g.label] }))}
            >
              <svg width={9} height={9} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} className={clsx("transition-transform", isCollapsed && "-rotate-90")}>
                <path d="M3 4.5 L6 7.5 L9 4.5" />
              </svg>
              <span>{g.label}</span>
              <span className="ml-auto text-dim">{g.items.length}</span>
            </button>
            {!isCollapsed &&
              g.items.map((e) =>
                g.render ? g.render(e) : <NavItem key={e.slug} entry={e} active={slug === e.slug} />,
              )}
          </div>
        );
      })}

      <div className="px-5 pt-5 font-mono font-mono-features text-[10px] text-dim tracking-[0.08em]">
        v0.1 · {ENTRIES.length} slugs
      </div>
    </aside>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-3.5 pb-1">
      <div
        className="flex items-center px-5 pb-1.5 font-mono font-mono-features text-[10px] uppercase tracking-[0.14em] text-faint cursor-pointer"
        onClick={() => (window.location.hash = "#/")}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function NavRow({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={clsx(
        "flex items-center gap-2 mx-3 px-2 py-[5px] rounded text-[13px] text-text-2 hover:bg-hover hover:text-text transition-colors",
        active && "bg-accent/10 text-text",
      )}
    >
      {children}
    </a>
  );
}

function NavItem({ entry, active }: { entry: Entry; active: boolean }) {
  const tier = "tier" in entry ? entry.tier : undefined;
  return (
    <a
      href={`#/${entry.slug}`}
      className={clsx(
        "flex items-center gap-2 mx-3 px-2 py-[5px] rounded text-[13px] text-text-2 hover:bg-hover hover:text-text transition-colors",
        active && "bg-accent/10 text-text",
      )}
    >
      <span className="size-1.5 rounded-full bg-dim" />
      <span className="truncate flex-1">{entry.title}</span>
      {tier && <span className="font-mono font-mono-features text-[10px] text-faint">{tier}</span>}
    </a>
  );
}
