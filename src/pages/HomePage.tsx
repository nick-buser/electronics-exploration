import { ARCHETYPES, BY_SLUG, DOMAINS, JOURNAL, PROJECTS } from "@/data/corpus";
import { CardGrid, CardLink } from "./elements";

export function HomePage() {
  const recent = JOURNAL.slice(0, 3);
  const active = PROJECTS.filter((p) => p.status === "building" || p.status === "planned").slice(0, 4);
  return (
    <div className="prose-bench">
      <div className="pb-8 mb-8 border-b border-line">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="font-mono font-mono-features text-[10px] uppercase tracking-[0.14em] text-accent">
            Atlas
          </span>
          <span className="font-mono font-mono-features text-[11px] text-faint">v0.1 · personal edition</span>
        </div>
        <h1 className="text-[40px] leading-[1.1] font-serif font-light text-text max-w-3xl">
          A <em className="italic">bench</em>-to-autonomy
          <br />
          reference, built as I learn.
        </h1>
        <div className="mt-4 text-[17px] leading-[1.55] text-text-2 max-w-3xl">
          Every domain, archetype, component, principle, instrument, and project I'm working through — each with its own slug,
          cross-linked, with interactive explainers where they help. Press{" "}
          <Kbd>⌘ K</Kbd> to jump to anything.
        </div>
      </div>

      <h2>Domains</h2>
      <CardGrid>
        {DOMAINS.map((d) => (
          <CardLink key={d.slug} slug={d.slug} />
        ))}
      </CardGrid>

      <h2>Active projects</h2>
      <CardGrid>
        {active.map((p) => (
          <CardLink key={p.slug} slug={p.slug} />
        ))}
      </CardGrid>

      <h2>Project archetypes</h2>
      <p>
        Reusable hardware projects in the way CRUD apps, auth systems, and compilers are reusable software projects. Each one
        teaches a layer of the stack you'll keep returning to.
      </p>
      <CardGrid>
        {ARCHETYPES.map((a) => (
          <CardLink key={a.slug} slug={a.slug} />
        ))}
      </CardGrid>

      <h2>Recent journal</h2>
      <div className="mt-5 flex flex-col">
        {recent.map((j) => {
          const proj = j.project ? BY_SLUG[j.project] : null;
          return (
            <a
              key={j.slug}
              href={`#/${j.slug}`}
              className="block py-4 border-b border-line last:border-0 hover:bg-surface/40 transition-colors -mx-3 px-3 rounded"
            >
              <div className="font-mono font-mono-features text-[11px] text-faint uppercase tracking-[0.08em] mb-1">
                {j.date}
                {proj ? ` · ${proj.title}` : ""}
              </div>
              <h4 className="text-[15px] font-medium text-text m-0">{j.title}</h4>
              <p className="text-[13.5px] text-muted m-0 mt-1">{j.deck}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block font-mono font-mono-features text-[11px] bg-bg-2 border border-line-2 px-1.5 py-0.5 rounded text-text-2">
      {children}
    </span>
  );
}
