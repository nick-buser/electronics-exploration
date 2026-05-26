/* ──────────────────────────────────────────────────────────
   PAGES — renderers per page type + populated content
   ────────────────────────────────────────────────────────── */

const { useState: useStateP, useEffect: useEffectP, useMemo: useMemoP } = React;

/* ── Building blocks ───────────────────────────────────── */
function PageHead({ entry, extras }) {
  const t = TYPES[entry.type];
  return (
    <div className="page-head">
      <div className="page-meta">
        <span className="page-type">{t.label}</span>
        {entry.domain && <span className="page-domain mono">{(DOMAINS.find(d => d.slug === entry.domain) || {}).title || entry.domain}</span>}
        {entry.tier && <span className="page-tier">{entry.tier}</span>}
        {entry.status && <StatusPill status={entry.status} />}
        {entry.analog && <span className="mono" style={{ color: "var(--faint)" }}>{entry.analog}</span>}
        {extras}
      </div>
      <h1 className="page-title">{entry.title}</h1>
      {entry.deck && <div className="page-deck">{entry.deck}</div>}
      {entry.tags && entry.tags.length > 0 && (
        <div className="page-tags">
          {entry.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  return <span className={`pill ${status}`}><span className="dot"></span>{status}</span>;
}

function Callout({ kind = "note", label, children }) {
  return (
    <div className={`callout ${kind}`}>
      <div className="callout-label">{label || (kind === "warn" ? "⚠ warning" : "// note")}</div>
      <p>{children}</p>
    </div>
  );
}

function CardLink({ slug, children }) {
  const e = BY_SLUG[slug];
  if (!e) return null;
  return (
    <a className="card" href={`#/${e.slug}`}>
      <div className="card-head">
        <span className="type">{TYPES[e.type].label}</span>
        {e.tier && <span className="tier">{e.tier}</span>}
      </div>
      <h4>{e.title}</h4>
      <p>{e.deck}</p>
    </a>
  );
}

function ImageSlot({ label }) {
  return <div className="image-slot">[ {label || "image"} ]</div>;
}

/* ══════════════════════════════════════════════════════════
   HOME
   ══════════════════════════════════════════════════════════ */
function HomePage() {
  const recent = JOURNAL.slice(0, 3);
  const active = PROJECTS.filter(p => p.status === "building" || p.status === "planned").slice(0, 4);
  return (
    <div>
      <div className="page-head">
        <div className="page-meta">
          <span className="page-type">Atlas</span>
          <span className="mono" style={{ color: "var(--faint)" }}>v0.1 · personal edition</span>
        </div>
        <h1 className="page-title">
          A <em>bench</em>-to-autonomy<br />reference, built as I learn.
        </h1>
        <div className="page-deck">
          Every domain, archetype, component, principle, instrument, and project I'm working through —
          each with its own slug, cross-linked, with interactive explainers where they help.
          Press <span className="kbd-hint">⌘ K</span> to jump to anything.
        </div>
      </div>

      <h2>Domains</h2>
      <div className="card-grid">
        {DOMAINS.map(d => <CardLink key={d.slug} slug={d.slug} />)}
      </div>

      <h2>Active projects</h2>
      <div className="card-grid">
        {active.map(p => <CardLink key={p.slug} slug={p.slug} />)}
      </div>

      <h2>Project archetypes</h2>
      <p>Reusable hardware projects in the way CRUD apps, auth systems, and compilers are reusable software projects. Each one teaches a layer of the stack you'll keep returning to.</p>
      <div className="card-grid">
        {ARCHETYPES.map(a => <CardLink key={a.slug} slug={a.slug} />)}
      </div>

      <h2>Recent journal</h2>
      <div style={{ marginTop: 20 }}>
        {recent.map(j => {
          const proj = j.project ? BY_SLUG[j.project] : null;
          return (
            <a key={j.slug} href={`#/${j.slug}`} className="journal-entry" style={{ display: "block", textDecoration: "none" }}>
              <div className="journal-date">{j.date}{proj ? ` · ${proj.title}` : ""}</div>
              <h4>{j.title}</h4>
              <p style={{ color: "var(--muted)", margin: 0, fontSize: 13.5 }}>{j.deck}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DOMAIN
   ══════════════════════════════════════════════════════════ */
function DomainPage({ entry }) {
  const projects = PROJECTS.filter(p => p.domain === entry.slug);
  const archetypes = ARCHETYPES.filter(a => a.domain === entry.slug);
  const components = COMPONENTS.filter(c => c.domain === entry.slug);
  const principles = PRINCIPLES.filter(p => p.domain === entry.slug);
  const tools = TOOLS.filter(t => t.domain === entry.slug);
  const comparisons = COMPARISONS.filter(c => c.domain === entry.slug);

  return (
    <div>
      <PageHead entry={entry} />
      {(() => { const B = DomainBodies[entry.slug]; return B ? <B /> : null; })()}

      {archetypes.length > 0 && (<>
        <h2>Archetypes</h2>
        <div className="card-grid">{archetypes.map(a => <CardLink key={a.slug} slug={a.slug} />)}</div>
      </>)}

      {projects.length > 0 && (<>
        <h2>Projects in this domain</h2>
        <div className="card-grid">{projects.map(p => <CardLink key={p.slug} slug={p.slug} />)}</div>
      </>)}

      {principles.length > 0 && (<>
        <h2>Principles & patterns</h2>
        <div className="card-grid">{principles.map(p => <CardLink key={p.slug} slug={p.slug} />)}</div>
      </>)}

      {components.length > 0 && (<>
        <h2>Components</h2>
        <div className="card-grid">{components.map(c => <CardLink key={c.slug} slug={c.slug} />)}</div>
      </>)}

      {tools.length > 0 && (<>
        <h2>Tools</h2>
        <div className="card-grid">{tools.map(t => <CardLink key={t.slug} slug={t.slug} />)}</div>
      </>)}

      {comparisons.length > 0 && (<>
        <h2>Comparisons</h2>
        <div className="card-grid">{comparisons.map(c => <CardLink key={c.slug} slug={c.slug} />)}</div>
      </>)}
    </div>
  );
}

const DomainBodies = {
  robotics: () => (
    <>
      <p>Robotics is the integrator domain. It forces mechanics, electronics, firmware, control theory, software architecture, sensing, calibration, and safety into one visible system. A robotic arm is the full-stack web app of hardware learning — approachable enough to build, complex enough to reveal real constraints.</p>
      <p>The path here goes from <a href="#/the-arm" style={{ color: "var(--accent)" }}>kinematic arms</a> through <a href="#/the-walker" style={{ color: "var(--accent)" }}>walkers</a> and <a href="#/the-rover" style={{ color: "var(--accent)" }}>mobile bases</a> to <a href="#/the-drone" style={{ color: "var(--accent)" }}>real-time flight</a>. Most builders shouldn't pick a single archetype — they should build a small version of each and let the patterns transfer.</p>
      <Callout label="// stack you'll end up in">
        Python or C++ at the host layer, ROS2 or LeRobot for orchestration, micro-ROS or bare Arduino at the joint level, Klipper-style real-time loops where motion matters, and PyTorch/JAX for any learned policy.
      </Callout>
    </>
  ),
  ee: () => (
    <>
      <p>If robotics is about making things move, EE is about making things not catch fire while moving. The progression: breadboards (anyone can wire), schematic capture (now you think in symbols), PCB layout (now you can ship). KiCad is free and professional; JLCPCB turns gerbers into populated boards for the price of lunch.</p>
      <p>Watch <a href="#/pr-decoupling" style={{ color: "var(--accent)" }}>decoupling</a>, <a href="#/pr-ground-bounce" style={{ color: "var(--accent)" }}>ground bounce</a>, and the gap between a working breadboard and a working PCB. Most "weird intermittent" bugs in hardware live in that gap.</p>
    </>
  ),
  firmware: () => (
    <>
      <p>Where software meets the metal. Registers, interrupts, DMA, and the slow process of learning that <code>while(1)</code> is sometimes the right architecture. Most people start with Arduino's abstractions, then peel them back — the progression isn't just complexity, it's <em>removing</em> the safety net.</p>
    </>
  ),
  mech: () => (
    <p>3D printing collapses the mechanical iteration loop from weeks to hours. The skill isn't operating the printer — it's designing <em>for</em> additive manufacturing: overhangs, layer adhesion, snap fits, threaded inserts, tolerances that print true.</p>
  ),
  bio: () => (
    <>
      <p>The health-facing extension of physical computing. Sensors, signals, experiments, measurement quality, safety, data interpretation. Stay non-medical and instrumentation-focused: learn to acquire signals, validate them, log them, and reason about noise before chasing conclusions.</p>
      <Callout kind="warn" label="⚠ safety">
        Avoid mains-connected body circuits. Galvanic isolation is non-negotiable. Treat anything you record as exploratory data, not diagnosis.
      </Callout>
    </>
  ),
  bench: () => (
    <p>The bench is the dev environment of physical computing — instruments, fixtures, safe defaults, known-good references, and a workflow for isolating failure. Bench discipline is foundational; current-limit first, inspect polarity, verify grounds, test subassemblies, document known-good states.</p>
  ),
  net: () => (
    <p>The connective tissue. Once you have more than two devices that need to talk, segmentation, identity, telemetry, and remote access stop being optional. The shift from consumer Wi-Fi to managed networking is closer to learning a new language than a new tool.</p>
  ),
  ai: () => (
    <p>AI becomes useful after the lower layers produce trustworthy data and controllable actuators. The near-term goal isn't "robot but ChatGPT" — it's perception, anomaly detection, calibration assistance, and better human-in-the-loop control over instruments and robots you trust.</p>
  ),
  fpga: () => (
    <p>FPGAs are where you stop writing code that <em>runs</em> and start writing descriptions of hardware that <em>exists</em>. Every signal is in parallel, every clock edge is a state transition, and "performance" means "did you meet timing?"</p>
  ),
};

/* ══════════════════════════════════════════════════════════
   ARCHETYPE
   ══════════════════════════════════════════════════════════ */
function ArchetypePage({ entry }) {
  const projects = PROJECTS.filter(p => p.archetype === entry.slug);
  return (
    <div>
      <PageHead entry={entry} />
      {(() => { const B = ArchetypeBodies[entry.slug]; return B ? <B /> : <p>{entry.deck}</p>; })()}

      {projects.length > 0 && (<>
        <h2>Concrete builds</h2>
        <div className="card-grid">
          {projects.map(p => <CardLink key={p.slug} slug={p.slug} />)}
        </div>
      </>)}
    </div>
  );
}

const ArchetypeBodies = {
  "the-arm": () => (
    <>
      <h2>Why it's the spine</h2>
      <p>A six-DOF arm sits at the intersection of every hardware skill: mechanical tolerance, motor selection, power delivery, firmware, kinematics, host protocols, calibration, control theory, and — eventually — perception and learned policy. It can start as a teleoperated toy and grow indefinitely.</p>

      <h2>What it makes legible</h2>
      <ul>
        <li><strong>Backlash</strong> — the gap between commanded and actual joint angle, which dominates everything downstream</li>
        <li><strong>Coordinate frames</strong> — the math behind "tool position" versus "joint angles"</li>
        <li><strong>Cable routing</strong> — the invisible mechanical engineering that makes arms survive their own motion</li>
        <li><strong>Power delivery</strong> — stall torque versus continuous torque, brownouts under transient load</li>
        <li><strong>Latency</strong> — the chain from sensor → host → controller → motor and where it breaks</li>
      </ul>

      <h2>Stages of mastery</h2>
      <ol>
        <li>Joints move on command</li>
        <li>Forward kinematics: joint angles → tool position</li>
        <li>Inverse kinematics: tool position → joint angles</li>
        <li>Teleoperation with a leader arm</li>
        <li>Recorded trajectories that replay accurately</li>
        <li>Camera-guided pick-and-place</li>
        <li>Learned policy from demonstrations</li>
      </ol>

      <Callout>
        See <a href="#/pr-kinematics" style={{ color: "var(--accent)" }}>kinematics</a> for the math layer,
        and <a href="#/cmp-motors" style={{ color: "var(--accent)" }}>motor comparison</a> for the actuator choice.
      </Callout>
    </>
  ),
  "the-board": () => (
    <>
      <h2>Why it's a unlock</h2>
      <p>Once you've gone from schematic to layout to fab to bring-up once, the entire physical-products universe stops feeling like magic. The first time your own board enumerates over USB is qualitatively different from any tutorial.</p>
      <h2>What you'll learn the hard way</h2>
      <ul>
        <li>Decoupling capacitors are not optional</li>
        <li>Footprints lie until they don't</li>
        <li>Pour your ground plane, then route the small stuff</li>
        <li>DRC catches some mistakes; experience catches the rest</li>
        <li>Assembly services (JLCPCB / PCBA) save you from your own hand-soldering</li>
      </ul>
    </>
  ),
};

/* ══════════════════════════════════════════════════════════
   PROJECT
   ══════════════════════════════════════════════════════════ */
function ProjectPage({ entry }) {
  const journal = JOURNAL.filter(j => j.project === entry.slug);
  const archetype = entry.archetype ? BY_SLUG[entry.archetype] : null;
  const Body = ProjectBodies[entry.slug];

  return (
    <div>
      <PageHead entry={entry} />

      <table className="spec-table">
        <tbody>
          {entry.cost && <tr><td>Budget</td><td>{entry.cost}</td></tr>}
          {entry.started && <tr><td>Started</td><td className="mono">{entry.started}</td></tr>}
          {archetype && <tr><td>Archetype</td><td><a href={`#/${archetype.slug}`} style={{ color: "var(--accent)" }}>{archetype.title}</a></td></tr>}
          <tr><td>Tier</td><td>{entry.tier} — {tierLabel(entry.tier)}</td></tr>
          <tr><td>Status</td><td><StatusPill status={entry.status} /></td></tr>
        </tbody>
      </table>

      {Body ? <Body /> : (
        <>
          <h2>Plan</h2>
          <p>This project page is a stub. Add narrative, build log entries, BOM, and learnings as you go.</p>
          <Callout>Fill in: goals, constraints, references, BOM, schematic, build log, learnings.</Callout>
        </>
      )}

      {journal.length > 0 && (<>
        <h2>Build log</h2>
        <div style={{ marginTop: 18 }}>
          {journal.map(j => (
            <a key={j.slug} href={`#/${j.slug}`} className="journal-entry" style={{ display: "block", textDecoration: "none" }}>
              <div className="journal-date">{j.date}</div>
              <h4>{j.title}</h4>
              <p style={{ color: "var(--muted)", margin: 0, fontSize: 13.5 }}>{j.deck}</p>
            </a>
          ))}
        </div>
      </>)}
    </div>
  );
}

function tierLabel(t) {
  return { T1: "Entry", T2: "Core", T3: "Bridge", T4: "Hard" }[t] || "";
}

const ProjectBodies = {
  "p-so-arm100": () => (
    <>
      <h2>Goals</h2>
      <ul>
        <li>End-to-end teleop with a leader/follower pair</li>
        <li>Record 20+ demonstrations of a single pick-and-place</li>
        <li>Train one imitation-learning policy and run it on-device</li>
        <li>Quantify joint backlash before and after a tighter mechanical revision</li>
      </ul>

      <h2>Bill of materials</h2>
      <table className="spec-table">
        <tbody>
          <tr><td>Servos</td><td>6× STS3215 (serial bus, position+torque feedback)</td></tr>
          <tr><td>Frame</td><td>PLA+, printed at 30% gyroid, 0.2mm layer</td></tr>
          <tr><td>Controller</td><td>Waveshare Servo Bus Controller + USB-C</td></tr>
          <tr><td>Power</td><td>12V 5A bench, regulated 6V rail for servos</td></tr>
          <tr><td>Host</td><td>MacBook → Python / LeRobot stack</td></tr>
          <tr><td>Camera</td><td>Logitech C920, fixed-mount, 30fps</td></tr>
        </tbody>
      </table>

      <ImageSlot label="hero shot · arm on bench · drop your photo here" />

      <h2>References</h2>
      <ul>
        <li><a href="#/the-arm" style={{ color: "var(--accent)" }}>The Arm</a> archetype — pattern this is an instance of</li>
        <li><a href="#/pr-kinematics" style={{ color: "var(--accent)" }}>Forward & inverse kinematics</a></li>
        <li><a href="#/cmp-motors" style={{ color: "var(--accent)" }}>Motor comparison</a> — why bus servos here, not steppers</li>
      </ul>

      <h2>Learnings (rolling)</h2>
      <ul>
        <li>Joint 3 has 1.4° of backlash from gear slop — needs printed retainers</li>
        <li>Bus servo IDs collide if you don't program them one at a time before assembly</li>
        <li>The wrist twist axis benefits from a tighter gear ratio; stock is overly fast and under-torqued for picking</li>
      </ul>
    </>
  ),
  "p-rp2040-breakout": () => (
    <>
      <h2>Plan</h2>
      <p>A minimal RP2040 breakout to learn KiCad → JLCPCB end-to-end without distractions. USB-C power and data, a 3.3V LDO, status LED, broken-out GPIO on 0.1" headers. No fancy peripherals — the point is the workflow.</p>

      <h2>BOM (target ≤ $5 per board)</h2>
      <table className="spec-table">
        <tbody>
          <tr><td>MCU</td><td>RP2040 · QFN-56</td></tr>
          <tr><td>Flash</td><td>W25Q128JV · 16MB</td></tr>
          <tr><td>USB</td><td>USB-C 6-pin SMD, CC1/CC2 5.1kΩ pulldowns</td></tr>
          <tr><td>Regulator</td><td>NCP1117-3.3 (1A) · 10µF in + 10µF out</td></tr>
          <tr><td>Crystal</td><td>12MHz · 12pF caps</td></tr>
          <tr><td>Decoupling</td><td>10× 100nF · one per VDD pin (see <a href="#/pr-decoupling" style={{ color: "var(--accent)" }}>decoupling</a>)</td></tr>
        </tbody>
      </table>

      <ImageSlot label="schematic · top-level KiCad capture" />
      <ImageSlot label="3D render · before fab" />
    </>
  ),
  "p-bench-psu": () => (
    <>
      <h2>What this is</h2>
      <p>A small kit of labelled, known-good power cables and adapters. The bench equivalent of writing a CI pipeline once so you stop wasting time on environment bugs.</p>
      <h2>Inventory</h2>
      <ul>
        <li>2× banana-to-barrel, 5.5×2.1mm, with inline 2A fuses</li>
        <li>2× banana-to-JST-XH, 1S and 3S</li>
        <li>1× banana-to-USB-C breakout (5V regulated, fused)</li>
        <li>4× alligator-to-banana, color-matched and labelled</li>
        <li>Heat-shrunk strain reliefs everywhere</li>
      </ul>
      <Callout>
        Every cable is labelled with a P-tape sleeve showing max V, max A, and a 2-digit ID.
        The ID maps to a row in a notebook with "first-built" and "last-fault-checked" dates.
      </Callout>
    </>
  ),
};

/* ══════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════ */
function ComponentPage({ entry }) {
  const Body = ComponentBodies[entry.slug];
  return (
    <div>
      <PageHead entry={entry} />
      {Body ? <Body /> : (
        <>
          <p>Stub. Add the canonical info you keep forgetting: pinout, power, gotchas, datasheet link, projects you've used it in.</p>
        </>
      )}
    </div>
  );
}

const ComponentBodies = {
  "c-555": () => (
    <>
      <h2>What it is</h2>
      <p>A 1972 IC that just won't die: two comparators, an RS latch, a discharge transistor, and a divider chain that hands you 1/3 V<sub>cc</sub> and 2/3 V<sub>cc</sub> thresholds. From those primitives you build astable oscillators, monostable pulses, PWM, Schmitt triggers, and an alarming amount of analog mischief.</p>

      <h2>Pinout</h2>
      <table className="spec-table">
        <tbody>
          <tr><td>1 — GND</td><td>Ground reference</td></tr>
          <tr><td>2 — TRIG</td><td>Trigger input; pulse low to start the cycle</td></tr>
          <tr><td>3 — OUT</td><td>Push-pull output, ~200mA sink/source</td></tr>
          <tr><td>4 — RESET</td><td>Active-low reset; tie high if unused</td></tr>
          <tr><td>5 — CTRL</td><td>Control voltage; bypass with 10nF to GND</td></tr>
          <tr><td>6 — THRES</td><td>Threshold; comparator vs 2/3 V<sub>cc</sub></td></tr>
          <tr><td>7 — DISCH</td><td>Open-collector discharge to GND</td></tr>
          <tr><td>8 — V<sub>cc</sub></td><td>4.5–16V (TLC555 down to 2V)</td></tr>
        </tbody>
      </table>

      <h2>Astable period</h2>
      <Callout label="// math">
        T<sub>high</sub> = 0.693 · (R<sub>1</sub> + R<sub>2</sub>) · C &nbsp;&nbsp;
        T<sub>low</sub> = 0.693 · R<sub>2</sub> · C &nbsp;&nbsp;
        Duty = (R<sub>1</sub> + R<sub>2</sub>) / (R<sub>1</sub> + 2R<sub>2</sub>)
      </Callout>
      <p>Duty under 50% takes a diode trick (across R<sub>2</sub>). The math becomes instinct after about three astable circuits.</p>

      <h2>Gotchas</h2>
      <ul>
        <li>Skip pin 5's bypass cap and your output jitters with supply noise</li>
        <li>Bipolar 555s draw nasty supply transients when output switches — decouple V<sub>cc</sub> with 100nF + 10µF</li>
        <li>Use the CMOS variant (TLC555 / LMC555) for low current and battery work</li>
      </ul>
    </>
  ),
};

/* ══════════════════════════════════════════════════════════
   TOOL
   ══════════════════════════════════════════════════════════ */
function ToolPage({ entry }) {
  const Body = ToolBodies[entry.slug];
  return (
    <div>
      <PageHead entry={entry} />
      {Body ? <Body /> : (
        <>
          <p>Stub. Add the rationale for owning this, what to buy first, common modes, and the most common mistakes.</p>
        </>
      )}
    </div>
  );
}

const ToolBodies = {
  "t-oscilloscope": () => (
    <>
      <h2>What it gives you</h2>
      <p>Voltage over time, visibly. Where the multimeter answers "how much?", the scope answers "in what shape?" — and an enormous fraction of hardware bugs only become legible in shape.</p>

      <DemoBench />

      <h2>Buying advice (2026)</h2>
      <table className="spec-table">
        <tbody>
          <tr><td>First scope</td><td>2-channel, 100MHz, ~$300. Rigol DHO804 or Siglent SDS814X HD are the current sweet spot.</td></tr>
          <tr><td>Probes</td><td>1x/10x switchable, compensate them on day one and re-compensate when you move benches.</td></tr>
          <tr><td>Bandwidth rule</td><td>Buy 5× the highest frequency you'll measure. Edge measurements need bandwidth.</td></tr>
        </tbody>
      </table>

      <h2>Three things to learn early</h2>
      <ul>
        <li><strong>Triggering</strong> — most "noisy" traces are just untriggered traces</li>
        <li><strong>Probe compensation</strong> — overshoot or rolled-off square waves mean a probe needs adjusting</li>
        <li><strong>Coupling</strong> — DC reveals offset, AC reveals ripple. Learn which question you're asking.</li>
      </ul>
    </>
  ),
  "t-multimeter": () => (
    <>
      <h2>What it gives you</h2>
      <p>The most-used instrument on any bench. Volts, amps, ohms, continuity, and on better units capacitance and frequency. Get a true-RMS meter; the few extra dollars pay back the first time you measure a PWM-driven load.</p>
      <DemoBench />
      <h2>Habits worth building</h2>
      <ul>
        <li>Continuity first — before you power on anything, verify there's no short from V<sub>cc</sub> to GND</li>
        <li>Two-handed measurement risks coupling current through your chest. One hand at a time on >50V.</li>
        <li>Move the red probe between V-Ω and A jacks deliberately. Forgetting blows fuses (and sometimes meters).</li>
      </ul>
    </>
  ),
};

/* ══════════════════════════════════════════════════════════
   PRINCIPLE
   ══════════════════════════════════════════════════════════ */
function PrinciplePage({ entry }) {
  const Body = PrincipleBodies[entry.slug];
  return (
    <div>
      <PageHead entry={entry} />
      {Body ? <Body /> : (
        <>
          <p>Stub. Add the intuition, the formal version, when it breaks, and which projects taught you about it.</p>
        </>
      )}
    </div>
  );
}

const PrincipleBodies = {
  "pr-pwm": () => (
    <>
      <h2>The idea</h2>
      <p>You can't easily make a microcontroller pin output 1.3V. You <em>can</em> make it output 0V or 3.3V very fast. If you switch between them quickly enough, anything with inertia — an LED's perception, a motor's rotor, a capacitor — sees the time-average. That's PWM.</p>

      <DemoPWM />

      <h2>Why it works for each load</h2>
      <ul>
        <li><strong>LEDs</strong> — your eye integrates over ~50ms. Switch faster than ~200Hz and brightness looks smooth.</li>
        <li><strong>Motors</strong> — winding inductance integrates current. Switch ~20kHz+ and the rotor sees an average torque.</li>
        <li><strong>Heaters</strong> — thermal mass integrates over seconds. Switch at 1Hz, the resistor doesn't care.</li>
        <li><strong>Audio</strong> — class-D amplifiers PWM at 250kHz+ and rely on the speaker (and your ear) to low-pass-filter.</li>
      </ul>

      <h2>Where it breaks</h2>
      <Callout kind="warn">
        Cheap continuous-rotation servos take PWM as <em>position</em> commands, not duty cycle. Drive them at 50Hz with 1–2ms pulses, not arbitrary duty. Easy mistake.
      </Callout>
      <Callout kind="warn">
        PWM-driving an LED through a current-limiting resistor wastes the same power per "on" cycle. Use a proper constant-current driver for high-power LEDs.
      </Callout>
    </>
  ),
  "pr-pid": () => (
    <>
      <h2>The idea</h2>
      <p>You have a measured value (the "process variable"), a desired value (the "setpoint"), and an actuator that affects the world. PID is the three-term combination of how wrong you are right now (P), how wrong you've been on average (I), and how fast wrong is changing (D).</p>

      <DemoPID />

      <h2>The terms, intuitively</h2>
      <ul>
        <li><strong>P (proportional)</strong> — the obvious one: push harder when you're further off. Too much and you overshoot.</li>
        <li><strong>I (integral)</strong> — the patient one: a small persistent error accumulates and pushes back. Too much and you wind up oscillating.</li>
        <li><strong>D (derivative)</strong> — the predictive one: the faster the error is closing, the harder you brake. Too much and you become twitchy.</li>
      </ul>

      <h2>Tuning workflow</h2>
      <ol>
        <li>Set K<sub>i</sub> and K<sub>d</sub> to zero. Raise K<sub>p</sub> until it oscillates, then back off by ~half.</li>
        <li>Add K<sub>d</sub> to damp the overshoot. The trace should round off without ringing.</li>
        <li>Add K<sub>i</sub> last and small — only enough to remove steady-state error.</li>
      </ol>

      <Callout>
        The demo above is a cart-pendulum, which is famously harder than most real systems. If you can balance it, your intuition will overshoot for normal robotics loops.
      </Callout>
    </>
  ),
  "pr-i2c": () => (
    <>
      <h2>The idea</h2>
      <p>Two wires (SDA and SCL), open-drain so anyone can pull them low but only the pull-up resistor pulls them high. Each device has a 7- or 10-bit address. The master clocks bits onto the bus, devices ACK by pulling SDA low for one clock period. That's it. Hundreds of sensors use it.</p>

      <DemoBus />

      <h2>The most common failures</h2>
      <ul>
        <li><strong>No pull-ups</strong> — the bus floats and reads as random nonsense. 4.7kΩ to V<sub>cc</sub> on each line.</li>
        <li><strong>Address collision</strong> — two devices on 0x48 fight invisibly. Check before you buy.</li>
        <li><strong>Voltage mismatch</strong> — 5V and 3.3V devices on the same bus need level shifting.</li>
        <li><strong>Held SDA low</strong> — a confused slave can hang the bus until you toggle SCL by hand.</li>
      </ul>
    </>
  ),
};

/* ══════════════════════════════════════════════════════════
   COMPARISON
   ══════════════════════════════════════════════════════════ */
function ComparisonPage({ entry }) {
  const Body = ComparisonBodies[entry.slug];
  return (
    <div>
      <PageHead entry={entry} />
      {Body ? <Body /> : <p>Stub.</p>}
    </div>
  );
}

const ComparisonBodies = {
  "cmp-motors": () => (
    <>
      <p>Three motor families that cover ~95% of personal projects, with very different control surfaces and failure modes. Pick by what failure mode you can live with, not by raw torque numbers.</p>

      <DemoMotors />

      <h2>At a glance</h2>
      <div className="compare" style={{ "--cols": 3 }}>
        <div className="compare-row"><div></div><div>Stepper</div><div>Servo</div><div>BLDC</div></div>
        <div className="compare-row"><div>Control</div><div>Open-loop steps</div><div>Closed-loop position</div><div>FOC / trapezoidal</div></div>
        <div className="compare-row"><div>Cost (medium)</div><div>$15–40</div><div>$10–200</div><div>$30–300</div></div>
        <div className="compare-row"><div>Backlash</div><div>None (within step)</div><div>Gearbox-dependent</div><div>None direct, gearbox if geared</div></div>
        <div className="compare-row"><div>Best for</div><div>3D printers, CNC, positioners</div><div>RC, robotic arms, low-budget</div><div>Drones, e-vehicles, smooth motion</div></div>
        <div className="compare-row"><div>Driver complexity</div><div>Medium (A4988, TMC2209)</div><div>None — built-in</div><div>High (DRV8323, ODrive)</div></div>
        <div className="compare-row"><div>Failure mode</div><div>Skipped steps (silent)</div><div>Stall + overheat</div><div>Driver smoke</div></div>
      </div>

      <h2>Rule of thumb</h2>
      <ul>
        <li>If you need to know where the shaft <em>is</em> without an encoder, use a stepper.</li>
        <li>If you need cheap "go to angle and hold", use a servo.</li>
        <li>If you need smooth, fast, efficient motion at scale, use BLDC and pay the firmware tax.</li>
      </ul>
    </>
  ),
  "cmp-batteries": () => (
    <>
      <p>Five chemistries that cover essentially every personal project. The right answer is almost always "what tradeoff am I willing to make on safety, cycle life, and weight?"</p>
      <DemoBattery />
      <h2>How to read the curves</h2>
      <ul>
        <li><strong>The knee</strong> — where the voltage falls off a cliff. This is the practical end of useful discharge.</li>
        <li><strong>The plateau</strong> — LiFePO₄'s broad flat region is why it works in low-voltage-cutoff applications; lead-acid's drooping plateau is why it dies quietly.</li>
        <li><strong>Sag under C-rate</strong> — at 2C, every chemistry loses voltage, but lead-acid loses dramatically more. Raise the rate slider to see it.</li>
      </ul>
    </>
  ),
};

/* ══════════════════════════════════════════════════════════
   JOURNAL
   ══════════════════════════════════════════════════════════ */
function JournalPage({ entry }) {
  const project = entry.project ? BY_SLUG[entry.project] : null;
  const Body = JournalBodies[entry.slug];
  return (
    <div>
      <PageHead entry={entry} extras={
        project ? <a href={`#/${project.slug}`} className="mono" style={{ color: "var(--accent)" }}>↗ {project.title}</a> : null
      } />
      <div className="journal-date">{entry.date}</div>
      {Body ? <Body /> : <p>{entry.deck}</p>}
    </div>
  );
}

const JournalBodies = {
  "j-2026-05-18": () => (
    <>
      <p>Spent the afternoon on the third joint of the <a href="#/p-so-arm100" style={{ color: "var(--accent)" }}>SO-ARM100</a>. Visible backlash — about 1.4° at the wrist when I let the arm hang and gently rocked the end-effector. The gear retainer print at 20% grid is too compliant.</p>
      <ImageSlot label="caliper measurement · joint 3 backlash" />
      <h2>What I changed</h2>
      <ul>
        <li>Reprinted retainer at 30% gyroid, vertical orientation, 0.16mm layer</li>
        <li>Tighter hole for the bearing (Ø 8.0 → 7.95mm) to reduce slop</li>
        <li>Re-tightened M3 grub screw on the servo horn with thread locker</li>
      </ul>
      <h2>Result</h2>
      <p>Backlash dropped to roughly 0.4°. Acceptable for now; will revisit when imitation-learning policy starts demanding repeatable end-effector position.</p>
      <h2>Next</h2>
      <ul>
        <li>Calibrate IK with the new joint stiffness</li>
        <li>Record first 10 demonstrations of the pick task</li>
      </ul>
    </>
  ),
};

/* ══════════════════════════════════════════════════════════
   Dispatcher
   ══════════════════════════════════════════════════════════ */
function PageDispatcher({ slug }) {
  if (slug === "" || slug === "home") return <HomePage />;
  if (slug === "inventory") return <InventoryPage />;
  const entry = BY_SLUG[slug];
  if (!entry) return <NotFoundPage slug={slug} />;
  switch (entry.type) {
    case "domain":     return <DomainPage entry={entry} />;
    case "archetype":  return <ArchetypePage entry={entry} />;
    case "project":    return <ProjectPage entry={entry} />;
    case "component":  return <ComponentPage entry={entry} />;
    case "tool":       return <ToolPage entry={entry} />;
    case "principle":  return <PrinciplePage entry={entry} />;
    case "comparison": return <ComparisonPage entry={entry} />;
    case "journal":    return <JournalPage entry={entry} />;
    default:           return <NotFoundPage slug={slug} />;
  }
}

function NotFoundPage({ slug }) {
  return (
    <div>
      <div className="page-head">
        <div className="page-meta">
          <span className="mono" style={{ color: "var(--rose)" }}>404</span>
        </div>
        <h1 className="page-title">No such slug</h1>
        <div className="page-deck">Nothing registered at <code>/{slug}</code>. Press ⌘K to search, or return <a href="#/" style={{ color: "var(--accent)" }}>home</a>.</div>
      </div>
    </div>
  );
}

Object.assign(window, { PageDispatcher });
