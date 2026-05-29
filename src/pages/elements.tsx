import clsx from "clsx";
import { BY_SLUG, DOMAINS, TYPE_META } from "@/data/corpus";
import type { Entry, ProjectStatus } from "@/data/schemas";

export function PageHead({
  entry,
  extras,
}: {
  entry: Entry;
  extras?: React.ReactNode;
}) {
  const t = TYPE_META[entry.type];
  const domainSlug = "domain" in entry ? entry.domain : undefined;
  const tier = "tier" in entry ? entry.tier : undefined;
  const status = "status" in entry ? entry.status : undefined;
  const analog = "analog" in entry ? entry.analog : undefined;
  return (
    <div className="pb-8 mb-8 border-b border-line">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="font-mono font-mono-features text-[10px] uppercase tracking-[0.14em] text-accent">
          {t.label}
        </span>
        {domainSlug && (
          <span className="font-mono font-mono-features text-[11px] text-muted">
            {DOMAINS.find((d) => d.slug === domainSlug)?.title ?? domainSlug}
          </span>
        )}
        {tier && (
          <span className="font-mono font-mono-features text-[11px] text-muted">{tier}</span>
        )}
        {status && <StatusPill status={status} />}
        {analog && (
          <span className="font-mono font-mono-features text-[10.5px] text-faint">{analog}</span>
        )}
        {extras}
      </div>
      <h1 className="text-[36px] leading-[1.15] font-serif font-normal text-text mb-3 max-w-3xl">
        {entry.title}
      </h1>
      {entry.deck && (
        <div className="text-[17px] leading-[1.55] text-text-2 max-w-3xl">{entry.deck}</div>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  building: "bg-accent/10 text-accent border-accent/30",
  planned: "bg-amber/10 text-amber border-amber/30",
  done: "bg-text-2/10 text-text-2 border-text-2/20",
  shelved: "bg-faint/10 text-faint border-faint/30",
};

export function StatusPill({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-mono font-mono-features text-[10.5px] uppercase tracking-[0.06em]",
        STATUS_STYLES[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function Callout({
  kind = "note",
  label,
  children,
}: {
  kind?: "note" | "warn";
  label?: string;
  children: React.ReactNode;
}) {
  const isWarn = kind === "warn";
  return (
    <div
      className={clsx(
        "border-l-2 pl-4 py-3 my-5",
        isWarn ? "border-rose bg-rose/5" : "border-accent/50 bg-accent/5",
      )}
    >
      <div
        className={clsx(
          "font-mono font-mono-features text-[10.5px] uppercase tracking-[0.1em] mb-1.5",
          isWarn ? "text-rose" : "text-accent",
        )}
      >
        {label || (isWarn ? "⚠ warning" : "// note")}
      </div>
      <div className="text-[14px] leading-[1.6] text-text-2 [&>p]:m-0">{children}</div>
    </div>
  );
}

export function CardLink({ slug }: { slug: string }) {
  const e = BY_SLUG[slug];
  if (!e) return null;
  const tier = "tier" in e ? e.tier : undefined;
  return (
    <a
      href={`#/${e.slug}`}
      className="group block p-5 bg-surface border border-line rounded-lg hover:border-line-2 hover:bg-surface-2 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono font-mono-features text-[10px] uppercase tracking-[0.12em] text-faint group-hover:text-muted transition-colors">
          {TYPE_META[e.type].label}
        </span>
        {tier && <span className="font-mono font-mono-features text-[10.5px] text-faint">{tier}</span>}
      </div>
      <h4 className="text-[15px] font-medium text-text mb-1.5">{e.title}</h4>
      {e.deck && <p className="text-[13px] leading-[1.5] text-muted m-0">{e.deck}</p>}
    </a>
  );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 my-6">{children}</div>;
}

export function ImageSlot({ label }: { label?: string }) {
  return (
    <div className="grid place-items-center h-44 my-6 rounded border border-dashed border-line-2 bg-bg-2 text-muted font-mono font-mono-features text-[11px]">
      [ {label || "image"} ]
    </div>
  );
}

export function SpecTable({ rows }: { rows: [React.ReactNode, React.ReactNode][] }) {
  return (
    <table className="w-full my-6 border-collapse">
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-line last:border-0">
            <td className="py-2.5 pr-6 align-top w-[180px] text-[13px] text-muted font-mono font-mono-features">
              {row[0]}
            </td>
            <td className="py-2.5 align-top text-[14px] text-text-2">{row[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Compare({ header, rows }: { header: string[]; rows: (string | React.ReactNode)[][] }) {
  const cols = header.length;
  return (
    <div className="my-6 border border-line rounded-lg overflow-hidden">
      <div
        className="grid bg-bg-2 border-b border-line"
        style={{ gridTemplateColumns: `160px repeat(${cols - 1}, 1fr)` }}
      >
        {header.map((h, i) => (
          <div
            key={i}
            className="px-3 py-2 font-mono font-mono-features text-[10.5px] uppercase tracking-[0.08em] text-faint"
          >
            {h}
          </div>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div
          key={ri}
          className="grid border-b border-line last:border-0 hover:bg-hover/30 transition-colors"
          style={{ gridTemplateColumns: `160px repeat(${cols - 1}, 1fr)` }}
        >
          {row.map((c, ci) => (
            <div
              key={ci}
              className={
                ci === 0
                  ? "px-3 py-2.5 text-[12.5px] text-muted font-mono font-mono-features"
                  : "px-3 py-2.5 text-[13.5px] text-text-2"
              }
            >
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
