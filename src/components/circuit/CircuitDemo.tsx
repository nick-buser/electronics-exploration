import { useMemo, type ReactNode } from "react";
import { scaleLinear } from "d3-scale";
import { line as d3Line } from "d3-shape";
import { extent } from "d3-array";
import { runTransient } from "@/sim/transient";
import type { Circuit } from "@/sim/circuit";
import { DemoFrame, Readout, Slider } from "@/demos/shell";

/** Slider-controlled numeric parameter for a circuit. */
export interface CircuitParam {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  /** Number of decimal places (or significant figures) to display. */
  format?: (v: number) => string;
  /** Suffix to display after the value, e.g. "Ω", "Hz". */
  unit?: string;
}

export interface ProbeSpec {
  node: string;
  label?: string;
  color?: string;
}

export interface CircuitDemoProps {
  title: string;
  /** Builds the netlist from current parameter values. */
  build: (params: Record<string, number>) => Circuit;
  params: CircuitParam[];
  values: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
  probes: ProbeSpec[];
  /** Simulation duration in seconds. */
  duration: number;
  /** Timestep in seconds. Should divide duration cleanly. */
  dt: number;
  /** Renders the schematic. */
  schematic: ReactNode;
  /** Time-axis display unit. */
  tUnit?: "s" | "ms" | "us";
}

const T_SCALE: Record<NonNullable<CircuitDemoProps["tUnit"]>, { mul: number; label: string }> = {
  s: { mul: 1, label: "s" },
  ms: { mul: 1e3, label: "ms" },
  us: { mul: 1e6, label: "µs" },
};

const TRACE_W = 560;
const TRACE_H = 160;
const MARGIN = { top: 8, right: 36, bottom: 22, left: 32 };

const DEFAULT_COLORS = [
  "var(--color-accent)",
  "var(--color-amber)",
  "var(--color-rose)",
  "var(--color-violet)",
  "var(--color-sky)",
];

export function CircuitDemo({
  title,
  build,
  params,
  values,
  onChange,
  probes,
  duration,
  dt,
  schematic,
  tUnit = "ms",
}: CircuitDemoProps) {
  const samples = useMemo(() => {
    const circuit = build(values);
    // Decimate so we keep the trace under ~600 points
    const targetPoints = 600;
    const totalSteps = Math.ceil(duration / dt);
    const decimate = Math.max(1, Math.floor(totalSteps / targetPoints));
    return runTransient(circuit, { duration, dt, decimate });
  }, [build, values, duration, dt]);

  const timeMul = T_SCALE[tUnit].mul;

  const innerW = TRACE_W - MARGIN.left - MARGIN.right;
  const innerH = TRACE_H - MARGIN.top - MARGIN.bottom;

  const tDomain: [number, number] = [0, duration * timeMul];
  const vExtent = useMemo<[number, number]>(() => {
    const vs: number[] = [];
    for (const s of samples) for (const p of probes) vs.push(s.v[p.node] ?? 0);
    const [lo = 0, hi = 1] = extent(vs);
    const pad = Math.max(0.05, (hi - lo) * 0.08);
    return [lo - pad, hi + pad];
  }, [samples, probes]);

  const x = scaleLinear().domain(tDomain).range([MARGIN.left, MARGIN.left + innerW]);
  const y = scaleLinear().domain(vExtent).range([MARGIN.top + innerH, MARGIN.top]);

  const gridV = niceTicks(vExtent[0], vExtent[1], 4);
  const gridT = niceTicks(tDomain[0], tDomain[1], 5);

  const lineGen = d3Line<{ t: number; v: number }>()
    .x((d) => x(d.t * timeMul))
    .y((d) => y(d.v));

  const probePaths = probes.map((p, i) => {
    const pts = samples.map((s) => ({ t: s.t, v: s.v[p.node] ?? 0 }));
    return {
      probe: p,
      color: p.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      d: lineGen(pts) ?? "",
      lastV: pts[pts.length - 1]?.v ?? 0,
    };
  });

  return (
    <DemoFrame
      title={title}
      readouts={
        <>
          {probePaths.map((p) => (
            <Readout
              key={p.probe.node}
              label={p.probe.label ?? p.probe.node}
              value={
                <span style={{ color: p.color }}>{p.lastV.toFixed(p.lastV >= 1 ? 2 : 3)}V</span>
              }
            />
          ))}
        </>
      }
      controls={
        <>
          {params.map((p) => (
            <Slider
              key={p.id}
              label={p.label}
              value={values[p.id]}
              onChange={(v) => onChange({ ...values, [p.id]: v })}
              min={p.min}
              max={p.max}
              step={p.step ?? 1}
              unit={p.unit ?? ""}
              display={p.format ? p.format(values[p.id]) : undefined}
            />
          ))}
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
        <div className="rounded-md border border-line bg-bg p-3">{schematic}</div>
        <div className="flex flex-col gap-2 text-[10.5px] font-mono font-mono-features text-faint uppercase tracking-[0.08em]">
          {probes.map((p, i) => (
            <span key={p.node} className="flex items-center gap-2 text-text-2">
              <span
                className="inline-block w-3 h-[2px] rounded-full"
                style={{ background: p.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
              />
              {p.label ?? p.node}
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${TRACE_W} ${TRACE_H}`} className="w-full block mt-4">
        <rect
          x={MARGIN.left}
          y={MARGIN.top}
          width={innerW}
          height={innerH}
          fill="var(--color-bg)"
          stroke="var(--color-line)"
        />
        {gridV.map((v) => (
          <g key={`gv-${v}`}>
            <line
              x1={MARGIN.left}
              x2={MARGIN.left + innerW}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--color-line)"
              strokeDasharray="2,4"
            />
            <text
              x={MARGIN.left - 4}
              y={y(v)}
              fontFamily="var(--font-mono)"
              fontSize={9}
              fill="var(--color-faint)"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {fmtV(v)}
            </text>
          </g>
        ))}
        {gridT.map((t) => (
          <g key={`gt-${t}`}>
            <line
              x1={x(t)}
              x2={x(t)}
              y1={MARGIN.top}
              y2={MARGIN.top + innerH}
              stroke="var(--color-line)"
              strokeDasharray="2,4"
            />
            <text
              x={x(t)}
              y={MARGIN.top + innerH + 12}
              fontFamily="var(--font-mono)"
              fontSize={9}
              fill="var(--color-faint)"
              textAnchor="middle"
            >
              {fmtT(t)}
            </text>
          </g>
        ))}
        <text
          x={MARGIN.left + innerW}
          y={TRACE_H - 4}
          fontFamily="var(--font-mono)"
          fontSize={9}
          fill="var(--color-muted)"
          textAnchor="end"
        >
          t · {T_SCALE[tUnit].label}
        </text>
        {probePaths.map((p) => (
          <path key={p.probe.node} d={p.d} stroke={p.color} strokeWidth={1.4} fill="none" />
        ))}
      </svg>
    </DemoFrame>
  );
}

function niceTicks(lo: number, hi: number, n: number): number[] {
  if (hi <= lo) return [lo];
  const span = hi - lo;
  const rough = span / Math.max(1, n);
  const pow10 = Math.pow(10, Math.floor(Math.log10(rough)));
  const candidates = [1, 2, 5, 10].map((m) => m * pow10);
  let step = candidates[0];
  for (const c of candidates) if (Math.abs(c - rough) < Math.abs(step - rough)) step = c;
  const start = Math.ceil(lo / step) * step;
  const out: number[] = [];
  for (let v = start; v <= hi + step / 2; v += step) out.push(Number(v.toFixed(10)));
  return out;
}

function fmtV(v: number): string {
  if (Math.abs(v) < 0.01) return v.toFixed(3);
  if (Math.abs(v) < 10) return v.toFixed(2);
  return v.toFixed(1);
}

function fmtT(t: number): string {
  if (Math.abs(t) < 0.1) return t.toFixed(2);
  if (Math.abs(t) < 10) return t.toFixed(1);
  return t.toFixed(0);
}
