import { useMemo, useState } from "react";
import { scaleLinear } from "d3-scale";
import { line, curveMonotoneX } from "d3-shape";
import { DemoFrame, Readout, Seg, Slider } from "./shell";

type Chem = "liion" | "lipo" | "lifepo4" | "nimh" | "leadacid";

type ChemSpec = {
  name: string;
  color: string;
  v0: number;
  vKnee: number;
  vEnd: number;
  cycles: string;
  density: string;
  safety: string;
};

const CHEMS: Record<Chem, ChemSpec> = {
  liion: {
    name: "Li-ion (NMC)",
    color: "var(--color-accent)",
    v0: 4.2,
    vKnee: 3.7,
    vEnd: 3.0,
    cycles: "500–1000",
    density: "200–250 Wh/kg",
    safety: "Thermal runaway if punctured/overcharged",
  },
  lipo: {
    name: "Li-Po",
    color: "var(--color-rose)",
    v0: 4.2,
    vKnee: 3.7,
    vEnd: 3.2,
    cycles: "300–500",
    density: "150–200 Wh/kg",
    safety: "Same as Li-ion, plus puffs when damaged",
  },
  lifepo4: {
    name: "LiFePO₄",
    color: "var(--color-amber)",
    v0: 3.6,
    vKnee: 3.3,
    vEnd: 2.5,
    cycles: "2000–5000",
    density: "90–120 Wh/kg",
    safety: "Very stable; no thermal runaway in normal abuse",
  },
  nimh: {
    name: "NiMH",
    color: "var(--color-violet)",
    v0: 1.4,
    vKnee: 1.2,
    vEnd: 1.0,
    cycles: "500–1000",
    density: "60–120 Wh/kg",
    safety: "Robust; vented gas if shorted",
  },
  leadacid: {
    name: "Lead-acid",
    color: "var(--color-sky)",
    v0: 2.13,
    vKnee: 2.0,
    vEnd: 1.75,
    cycles: "200–500",
    density: "30–50 Wh/kg",
    safety: "Acid leak; hydrogen if overcharged",
  },
};

const W = 600;
const H = 200;
const V_MIN = 1.0;
const V_MAX = 4.5;
const GRID_VOLTS = [1.0, 2.0, 3.0, 4.0];
const GRID_DODS = [0.25, 0.5, 0.75, 1.0];

export function DemoBattery() {
  const [chem, setChem] = useState<Chem>("liion");
  const [cRate, setCRate] = useState(1);
  const spec = CHEMS[chem];

  const x = useMemo(() => scaleLinear().domain([0, 1]).range([0, W]), []);
  const y = useMemo(() => scaleLinear().domain([V_MIN, V_MAX]).range([H, 0]), []);

  const path = useMemo(() => {
    const sag = (cRate - 1) * 0.08;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 100; i++) {
      const dod = i / 100;
      let v: number;
      if (dod < 0.1) {
        v = spec.v0 - (spec.v0 - spec.vKnee) * (dod / 0.1) * 0.4;
      } else if (dod < 0.85) {
        v =
          spec.vKnee +
          (spec.vKnee - spec.v0) * 0.1 -
          (spec.vKnee - spec.vEnd) * ((dod - 0.1) / 0.75) * 0.3;
      } else {
        v = spec.vKnee - (spec.vKnee - spec.vEnd) * ((dod - 0.85) / 0.15);
      }
      v -= sag;
      pts.push([x(dod), y(Math.max(V_MIN + 0.05, Math.min(V_MAX - 0.05, v)))]);
    }
    return (
      line<[number, number]>().x((p) => p[0]).y((p) => p[1]).curve(curveMonotoneX)(pts) ?? ""
    );
  }, [spec, cRate, x, y]);

  return (
    <DemoFrame
      title="Battery discharge curves"
      readouts={<Readout label="cell" value={spec.name} />}
      controls={
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-muted">Chemistry</span>
            <Seg<Chem>
              value={chem}
              onChange={setChem}
              options={[
                { value: "liion", label: "Li-ion" },
                { value: "lipo", label: "LiPo" },
                { value: "lifepo4", label: "LiFePO₄" },
                { value: "nimh", label: "NiMH" },
                { value: "leadacid", label: "Lead" },
              ]}
            />
          </div>
          <Slider
            label="Discharge rate"
            value={cRate}
            onChange={setCRate}
            min={0.1}
            max={5}
            step={0.1}
            unit="C"
            display={cRate.toFixed(1)}
          />
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full block">
        <line x1={0} y1={H} x2={W} y2={H} stroke="var(--color-line-2)" />
        <line x1={0} y1={0} x2={0} y2={H} stroke="var(--color-line-2)" />
        {GRID_VOLTS.map((v) => (
          <g key={v}>
            <line x1={0} y1={y(v)} x2={W} y2={y(v)} stroke="var(--color-line)" strokeDasharray="2,4" />
            <text x={W - 30} y={y(v) - 4} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-faint)">
              {v.toFixed(1)}V
            </text>
          </g>
        ))}
        {GRID_DODS.map((d) => (
          <text
            key={d}
            x={x(d)}
            y={H + 16}
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="var(--color-faint)"
            textAnchor="middle"
          >
            {(d * 100).toFixed(0)}%
          </text>
        ))}
        <path d={path} stroke={spec.color} strokeWidth={2} fill="none" />
        <text
          x={W / 2}
          y={H + 26}
          fontFamily="var(--font-mono)"
          fontSize="10"
          fill="var(--color-muted)"
          textAnchor="middle"
        >
          depth of discharge
        </text>
      </svg>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <FactCard label="cycles" value={spec.cycles} />
        <FactCard label="energy density" value={spec.density} />
        <FactCard label="safety" value={spec.safety} small />
      </div>
    </DemoFrame>
  );
}

function FactCard({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="p-3 rounded-md bg-bg border border-line">
      <div className="font-mono font-mono-features text-[10px] uppercase tracking-[0.1em] text-faint mb-1">
        {label}
      </div>
      <div
        className={
          small
            ? "font-mono font-mono-features text-[11px] leading-[1.45] text-text-2"
            : "font-mono font-mono-features text-[13px] text-text"
        }
      >
        {value}
      </div>
    </div>
  );
}
