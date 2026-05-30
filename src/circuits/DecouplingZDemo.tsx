/**
 * Impedance of a decoupling network from V_cc to GND.
 *
 * Three traces over the same frequency sweep so the canonical lessons land
 * side-by-side:
 *
 *   - **Ideal cap** — pure −20 dB/decade Z = 1/(ωC)
 *   - **Cap + ESL** — adds the parasitic inductance every real cap has, so
 *     |Z| bottoms out at the self-resonant frequency and climbs again
 *   - **Two caps parallel** — large bulk + small ceramic, each with its
 *     own ESL; the dip moves to a much higher frequency where the small
 *     cap takes over
 *
 * The "all traces" view layers them on the same log-log axes.
 */
import { useCallback, useState } from "react";
import { CircuitBodeDemo, type BodeTrace } from "@/components/circuit/CircuitBodeDemo";
import type { CircuitParam } from "@/components/circuit/CircuitDemo";
import {
  Capacitor,
  Ground,
  Inductor,
  NodeLabel,
  Schematic,
  VSource,
  Wire,
} from "@/components/circuit/schematic-prims";
import type { Circuit } from "@/sim/circuit";
import { impedanceFromSource } from "@/sim/ac";

const PARAMS: CircuitParam[] = [
  {
    id: "c1nF",
    label: "C₁ (ceramic)",
    min: 1,
    max: 1000,
    step: 1,
    format: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} µF` : `${v.toFixed(0)} nF`),
  },
  {
    id: "esl1nH",
    label: "ESL₁",
    min: 0.5,
    max: 10,
    step: 0.1,
    format: (v) => `${v.toFixed(1)} nH`,
  },
  {
    id: "c2uF",
    label: "C₂ (bulk)",
    min: 1,
    max: 100,
    step: 1,
    format: (v) => `${v.toFixed(0)} µF`,
  },
  {
    id: "esl2nH",
    label: "ESL₂",
    min: 1,
    max: 100,
    step: 1,
    format: (v) => `${v.toFixed(0)} nH`,
  },
];

const INITIAL: Record<string, number> = {
  c1nF: 100,
  esl1nH: 1.5,
  c2uF: 10,
  esl2nH: 30,
};

export function DecouplingZDemo() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);
  const [activeId, setActiveId] = useState<string | null>("esl");

  const build = useCallback(
    (p: Record<string, number>, traceId: string): Circuit => {
      const C1 = p.c1nF * 1e-9;
      const L1 = p.esl1nH * 1e-9;
      const C2 = p.c2uF * 1e-6;
      const L2 = p.esl2nH * 1e-9;
      const RESR = 5e-3; // tiny series resistance so resonances aren't infinitely sharp

      const elements: Circuit["elements"] = [
        // 1V AC test source driving the test point against ground
        { kind: "V", id: "vs", a: "vcc", b: "gnd", wave: { kind: "dc", value: 0 } },
      ];

      if (traceId === "ideal") {
        elements.push({ kind: "C", id: "c1", a: "vcc", b: "gnd", value: C1 });
      } else if (traceId === "esl") {
        elements.push({ kind: "L", id: "l1", a: "vcc", b: "n1", value: L1 });
        elements.push({ kind: "R", id: "esr1", a: "n1", b: "n1b", value: RESR });
        elements.push({ kind: "C", id: "c1", a: "n1b", b: "gnd", value: C1 });
      } else {
        // parallel
        elements.push({ kind: "L", id: "l1", a: "vcc", b: "n1", value: L1 });
        elements.push({ kind: "R", id: "esr1", a: "n1", b: "n1b", value: RESR });
        elements.push({ kind: "C", id: "c1", a: "n1b", b: "gnd", value: C1 });
        elements.push({ kind: "L", id: "l2", a: "vcc", b: "n2", value: L2 });
        elements.push({ kind: "R", id: "esr2", a: "n2", b: "n2b", value: RESR });
        elements.push({ kind: "C", id: "c2", a: "n2b", b: "gnd", value: C2 });
      }

      return { elements };
    },
    [],
  );

  const traces: BodeTrace[] = [
    {
      id: "ideal",
      label: "ideal cap",
      color: "var(--color-text-2)",
      extract: (p) => impedanceFromSource(p, "vs"),
      schematic: <IdealSchematic c1Label={fmtCap(values.c1nF)} />,
    },
    {
      id: "esl",
      label: "cap + ESL",
      color: "var(--color-accent)",
      extract: (p) => impedanceFromSource(p, "vs"),
      schematic: (
        <EslSchematic c1Label={fmtCap(values.c1nF)} eslLabel={`${values.esl1nH.toFixed(1)}nH`} />
      ),
    },
    {
      id: "parallel",
      label: "two caps parallel",
      color: "var(--color-amber)",
      extract: (p) => impedanceFromSource(p, "vs"),
      schematic: (
        <ParallelSchematic
          c1Label={fmtCap(values.c1nF)}
          esl1Label={`${values.esl1nH.toFixed(1)}nH`}
          c2Label={`${values.c2uF.toFixed(0)}µF`}
          esl2Label={`${values.esl2nH.toFixed(0)}nH`}
        />
      ),
    },
  ];

  return (
    <CircuitBodeDemo
      title="Decoupling network impedance |Z(f)|"
      build={build}
      inputs={{ vs: { mag: 1 } }}
      params={PARAMS}
      values={values}
      onChange={setValues}
      traces={traces}
      activeId={activeId}
      onActiveChange={setActiveId}
      fStart={1e4}
      fStop={1e9}
      nPoints={201}
      yScale="linear-log"
      yLabel="|Z| · Ω"
    />
  );
}

function fmtCap(nF: number): string {
  if (nF >= 1000) return `${(nF / 1000).toFixed(1)}µF`;
  return `${nF.toFixed(0)}nF`;
}

/* ── Schematics per mode ───────────────────────────────── */

function IdealSchematic({ c1Label }: { c1Label: string }) {
  return (
    <Schematic width={260} height={150}>
      <NodeLabel at={[68, 32]} text="vcc" />
      <Wire path="M 70 40 L 180 40" />
      <Capacitor a={[180, 40]} b={[180, 100]} label="C" value={c1Label} />
      <Wire path="M 180 100 L 180 120" />
      <VSource a={[60, 40]} b={[60, 120]} label="1V AC" />
      <Wire path="M 60 120 L 180 120" />
      <Wire path="M 120 120 L 120 132" />
      <Ground at={[120, 132]} />
    </Schematic>
  );
}

function EslSchematic({ c1Label, eslLabel }: { c1Label: string; eslLabel: string }) {
  return (
    <Schematic width={260} height={170}>
      <NodeLabel at={[68, 32]} text="vcc" />
      <Wire path="M 70 40 L 180 40" />
      <Inductor a={[180, 40]} b={[180, 88]} label="ESL" value={eslLabel} />
      <Capacitor a={[180, 88]} b={[180, 130]} label="C" value={c1Label} />
      <Wire path="M 180 130 L 180 142" />
      <VSource a={[60, 40]} b={[60, 142]} label="1V AC" />
      <Wire path="M 60 142 L 180 142" />
      <Wire path="M 120 142 L 120 154" />
      <Ground at={[120, 154]} />
    </Schematic>
  );
}

function ParallelSchematic({
  c1Label,
  esl1Label,
  c2Label,
  esl2Label,
}: {
  c1Label: string;
  esl1Label: string;
  c2Label: string;
  esl2Label: string;
}) {
  return (
    <Schematic width={320} height={170}>
      <NodeLabel at={[68, 32]} text="vcc" />
      <Wire path="M 70 40 L 260 40" />

      {/* Branch 1: ceramic */}
      <Inductor a={[170, 40]} b={[170, 86]} label="ESL₁" value={esl1Label} />
      <Capacitor a={[170, 86]} b={[170, 128]} label="C₁" value={c1Label} />
      <Wire path="M 170 128 L 170 142" />

      {/* Branch 2: bulk */}
      <Inductor a={[260, 40]} b={[260, 86]} label="ESL₂" value={esl2Label} />
      <Capacitor a={[260, 86]} b={[260, 128]} label="C₂" value={c2Label} />
      <Wire path="M 260 128 L 260 142" />

      <VSource a={[60, 40]} b={[60, 142]} label="1V AC" />
      <Wire path="M 60 142 L 260 142" />
      <Wire path="M 160 142 L 160 154" />
      <Ground at={[160, 154]} />
    </Schematic>
  );
}
