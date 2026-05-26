import {
  ARCHETYPES,
  BY_SLUG,
  COMPARISONS,
  COMPONENTS,
  JOURNAL,
  PRINCIPLES,
  PROJECTS,
  TOOLS,
  tierLabel,
} from "@/data/corpus";
import type {
  Archetype,
  Comparison,
  Component,
  Domain,
  Journal,
  Principle,
  Project,
  Tool,
} from "@/data/schemas";
import { ArchetypeBodies, DomainBodies } from "./bodies";
import { CardGrid, CardLink, PageHead, SpecTable, StatusPill } from "./elements";
import { DemoPWM } from "@/demos/DemoPWM";

/* ── Domain ───────────────────────────────────────────── */
export function DomainPage({ entry }: { entry: Domain }) {
  const projects = PROJECTS.filter((p) => p.domain === entry.slug);
  const archetypes = ARCHETYPES.filter((a) => a.domain === entry.slug);
  const components = COMPONENTS.filter((c) => c.domain === entry.slug);
  const principles = PRINCIPLES.filter((p) => p.domain === entry.slug);
  const tools = TOOLS.filter((t) => t.domain === entry.slug);
  const comparisons = COMPARISONS.filter((c) => c.domain === entry.slug);
  const Body = DomainBodies[entry.slug];

  return (
    <div className="prose-bench">
      <PageHead entry={entry} />
      {Body && <Body />}
      <Section title="Archetypes" items={archetypes} />
      <Section title="Projects in this domain" items={projects} />
      <Section title="Principles & patterns" items={principles} />
      <Section title="Components" items={components} />
      <Section title="Tools" items={tools} />
      <Section title="Comparisons" items={comparisons} />
    </div>
  );
}

function Section({ title, items }: { title: string; items: { slug: string }[] }) {
  if (!items.length) return null;
  return (
    <>
      <h2>{title}</h2>
      <CardGrid>
        {items.map((i) => (
          <CardLink key={i.slug} slug={i.slug} />
        ))}
      </CardGrid>
    </>
  );
}

/* ── Archetype ────────────────────────────────────────── */
export function ArchetypePage({ entry }: { entry: Archetype }) {
  const projects = PROJECTS.filter((p) => p.archetype === entry.slug);
  const Body = ArchetypeBodies[entry.slug];
  return (
    <div className="prose-bench">
      <PageHead entry={entry} />
      {Body ? <Body /> : <p>{entry.deck}</p>}
      <Section title="Concrete builds" items={projects} />
    </div>
  );
}

/* ── Project ──────────────────────────────────────────── */
export function ProjectPage({ entry }: { entry: Project }) {
  const journal = JOURNAL.filter((j) => j.project === entry.slug);
  const archetype = entry.archetype ? BY_SLUG[entry.archetype] : null;
  return (
    <div className="prose-bench">
      <PageHead entry={entry} />
      <SpecTable
        rows={[
          ...(entry.cost ? ([["Budget", entry.cost]] as [string, React.ReactNode][]) : []),
          ...(entry.started
            ? ([
                [
                  "Started",
                  <span key="d" className="font-mono font-mono-features">
                    {entry.started}
                  </span>,
                ],
              ] as [string, React.ReactNode][])
            : []),
          ...(archetype
            ? ([
                [
                  "Archetype",
                  <a key="a" href={`#/${archetype.slug}`}>
                    {archetype.title}
                  </a>,
                ],
              ] as [string, React.ReactNode][])
            : []),
          ["Tier", `${entry.tier} — ${tierLabel(entry.tier)}`],
          ["Status", <StatusPill key="s" status={entry.status} />],
        ]}
      />

      <h2>Plan</h2>
      <p>
        This project page is a stub. Add narrative, build log entries, BOM, and learnings as they accumulate.
      </p>

      {journal.length > 0 && (
        <>
          <h2>Build log</h2>
          <div className="flex flex-col mt-4">
            {journal.map((j) => (
              <a
                key={j.slug}
                href={`#/${j.slug}`}
                className="block py-4 border-b border-line last:border-0 hover:bg-surface/40 -mx-3 px-3 rounded transition-colors"
              >
                <div className="font-mono font-mono-features text-[11px] text-faint uppercase tracking-[0.08em] mb-1">
                  {j.date}
                </div>
                <h4 className="text-[15px] font-medium text-text m-0">{j.title}</h4>
                <p className="text-[13.5px] text-muted m-0 mt-1">{j.deck}</p>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Component ───────────────────────────────────────── */
export function ComponentPage({ entry }: { entry: Component }) {
  return (
    <div className="prose-bench">
      <PageHead entry={entry} />
      <p>
        Stub. Add the canonical info you keep forgetting: pinout, power, gotchas, datasheet link, projects you've used it in.
      </p>
    </div>
  );
}

/* ── Tool ────────────────────────────────────────────── */
export function ToolPage({ entry }: { entry: Tool }) {
  return (
    <div className="prose-bench">
      <PageHead entry={entry} />
      <p>Stub. Add the rationale for owning this, what to buy first, common modes, and the most common mistakes.</p>
    </div>
  );
}

/* ── Principle ───────────────────────────────────────── */
export function PrinciplePage({ entry }: { entry: Principle }) {
  return (
    <div className="prose-bench">
      <PageHead entry={entry} />
      {entry.slug === "pr-pwm" ? (
        <>
          <h2>The idea</h2>
          <p>
            You can't easily make a microcontroller pin output 1.3V. You <em>can</em> make it output 0V or 3.3V very fast. If
            you switch between them quickly enough, anything with inertia — an LED's perception, a motor's rotor, a capacitor —
            sees the time-average. That's PWM.
          </p>
          <DemoPWM />
          <h2>Why it works for each load</h2>
          <ul>
            <li>
              <strong>LEDs</strong> — your eye integrates over ~50ms. Switch faster than ~200Hz and brightness looks smooth.
            </li>
            <li>
              <strong>Motors</strong> — winding inductance integrates current. Switch ~20kHz+ and the rotor sees an average
              torque.
            </li>
            <li>
              <strong>Heaters</strong> — thermal mass integrates over seconds. Switch at 1Hz, the resistor doesn't care.
            </li>
            <li>
              <strong>Audio</strong> — class-D amplifiers PWM at 250kHz+ and rely on the speaker (and your ear) to
              low-pass-filter.
            </li>
          </ul>
        </>
      ) : (
        <p>Stub. Add the intuition, the formal version, when it breaks, and which projects taught you about it.</p>
      )}
    </div>
  );
}

/* ── Comparison ──────────────────────────────────────── */
export function ComparisonPage({ entry }: { entry: Comparison }) {
  return (
    <div className="prose-bench">
      <PageHead entry={entry} />
      <p>{entry.deck}</p>
    </div>
  );
}

/* ── Journal ─────────────────────────────────────────── */
export function JournalPage({ entry }: { entry: Journal }) {
  const project = entry.project ? BY_SLUG[entry.project] : null;
  return (
    <div className="prose-bench">
      <PageHead
        entry={entry}
        extras={
          project ? (
            <a
              href={`#/${project.slug}`}
              className="font-mono font-mono-features text-[11px] text-accent border-b border-accent/30"
            >
              ↗ {project.title}
            </a>
          ) : null
        }
      />
      <div className="font-mono font-mono-features text-[11px] text-faint uppercase tracking-[0.08em] mb-3">
        {entry.date}
      </div>
      <p>{entry.deck}</p>
    </div>
  );
}

/* ── Not Found ───────────────────────────────────────── */
export function NotFoundPage({ slug }: { slug: string }) {
  return (
    <div className="prose-bench">
      <div className="pb-8 mb-8 border-b border-line">
        <div className="font-mono font-mono-features text-[11px] text-rose mb-3">404</div>
        <h1 className="text-[40px] leading-[1.15] font-serif text-text mb-3">No such slug</h1>
        <div className="text-[16px] text-text-2">
          Nothing registered at <code>/{slug}</code>. Press ⌘K to search, or return{" "}
          <a href="#/">home</a>.
        </div>
      </div>
    </div>
  );
}
