import { BY_SLUG, DOMAINS, TYPE_META } from "@/data/corpus";

type Props = {
  slug: string;
  onOpenPalette: () => void;
};

type Crumb = { label: string; href: string | null };

export function Topbar({ slug, onOpenPalette }: Props) {
  const entry = BY_SLUG[slug];
  const crumbs: Crumb[] = [{ label: "Atlas", href: "#/" }];
  if (slug === "inventory") {
    crumbs.push({ label: "Inventory", href: null });
  } else if (slug === "map") {
    crumbs.push({ label: "Map", href: null });
  } else if (entry) {
    crumbs.push({ label: TYPE_META[entry.type].group, href: "#/" });
    if (entry.type !== "domain" && entry.domain) {
      const d = DOMAINS.find((x) => x.slug === entry.domain);
      if (d) crumbs.push({ label: d.title, href: `#/${d.slug}` });
    }
    crumbs.push({ label: entry.title, href: null });
  }

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/85 backdrop-blur px-12 h-12">
      <div className="flex items-center gap-2 text-[12.5px]">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-faint">/</span>}
            {c.href ? (
              <a href={c.href} className="text-muted hover:text-text-2 transition-colors">
                {c.label}
              </a>
            ) : (
              <span className="text-text">{c.label}</span>
            )}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPalette}
          className="px-2.5 py-1 font-mono font-mono-features text-[11px] text-muted border border-line rounded hover:border-line-2 hover:text-text-2 transition-colors"
        >
          Search ⌘K
        </button>
      </div>
    </div>
  );
}
