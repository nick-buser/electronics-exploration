import { useMemo, type ReactNode } from "react";
import { scaleLinear, scaleLog } from "d3-scale";
import { line as d3Line } from "d3-shape";
import { extent } from "d3-array";
import { acSweep, type AcInput, type AcPoint } from "@/sim/ac";
import { abs, type Complex } from "@/sim/complex";
import type { Circuit } from "@/sim/circuit";
import { DemoFrame, Slider } from "@/demos/shell";
import type { CircuitParam } from "./CircuitDemo";

export interface BodeTrace {
  id: string;
  label: string;
  color?: string;
  /** Pulls a phasor out of one sweep point; the demo plots its magnitude. */
  extract: (point: AcPoint) => Complex;
  /** Optional schematic for this trace, shown when it's the active one. */
  schematic?: ReactNode;
}

export interface CircuitBodeDemoProps {
  title: string;
  /** Build the netlist from current params (used for every trace). */
  build: (params: Record<string, number>, traceId: string) => Circuit;
  /** AC inputs (source id → phasor). Re-used across every trace. */
  inputs: Record<string, AcInput>;
  params: CircuitParam[];
  values: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
  traces: BodeTrace[];
  /** Active trace id — selecting one shows its schematic. Pass null for "all". */
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
  fStart: number;
  fStop: number;
  nPoints?: number;
  /** "linear-log" plots |y| on a log scale (e.g. Ω); "dB" plots 20·log10|y|. */
  yScale?: "linear-log" | "dB";
  yLabel?: string;
  controlsExtra?: ReactNode;
}

const TRACE_W = 580;
const TRACE_H = 220;
const MARGIN = { top: 12, right: 12, bottom: 28, left: 48 };

const DEFAULT_COLORS = [
  "var(--color-accent)",
  "var(--color-amber)",
  "var(--color-rose)",
  "var(--color-violet)",
  "var(--color-sky)",
];

export function CircuitBodeDemo({
  title,
  build,
  inputs,
  params,
  values,
  onChange,
  traces,
  activeId,
  onActiveChange,
  fStart,
  fStop,
  nPoints = 201,
  yScale = "linear-log",
  yLabel,
  controlsExtra,
}: CircuitBodeDemoProps) {
  const sweeps = useMemo(() => {
    return traces.map((trace) => {
      const circuit = build(values, trace.id);
      const pts = acSweep(circuit, { fStart, fStop, nPoints, inputs });
      const yVals: { f: number; y: number; raw: Complex }[] = pts.map((p) => {
        const c = trace.extract(p);
        const m = abs(c);
        const y = yScale === "dB" ? 20 * Math.log10(Math.max(1e-30, m)) : m;
        return { f: p.f, y, raw: c };
      });
      return { trace, yVals };
    });
  }, [build, values, traces, inputs, fStart, fStop, nPoints, yScale]);

  const innerW = TRACE_W - MARGIN.left - MARGIN.right;
  const innerH = TRACE_H - MARGIN.top - MARGIN.bottom;

  const x = scaleLog().base(10).domain([fStart, fStop]).range([MARGIN.left, MARGIN.left + innerW]);

  // y-axis domain depends on scale type
  const yExtent = useMemo<[number, number]>(() => {
    const ys: number[] = [];
    for (const s of sweeps) for (const p of s.yVals) ys.push(p.y);
    const [lo = 0, hi = 1] = extent(ys);
    if (yScale === "linear-log") {
      // log-scale Ω plot; nudge floor up so very tiny values don't dominate
      const safeLo = Math.max(lo, hi * 1e-6);
      return [safeLo, hi * 1.4];
    }
    // dB plot
    const pad = Math.max(3, (hi - lo) * 0.08);
    return [lo - pad, hi + pad];
  }, [sweeps, yScale]);

  const y =
    yScale === "linear-log"
      ? scaleLog().base(10).domain(yExtent).range([MARGIN.top + innerH, MARGIN.top])
      : scaleLinear().domain(yExtent).range([MARGIN.top + innerH, MARGIN.top]);

  const xTicks = decadeTicks(fStart, fStop);
  const yTicks = yScale === "linear-log" ? decadeTicks(yExtent[0], yExtent[1]) : niceLinearTicks(yExtent[0], yExtent[1], 5);

  const lineGen = d3Line<{ f: number; y: number }>()
    .x((d) => x(d.f))
    .y((d) => y(d.y));

  const visibleTraces = sweeps.map((s, i) => ({
    ...s,
    color: s.trace.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    dim: activeId !== null && activeId !== s.trace.id,
  }));

  const activeTrace = activeId ? traces.find((t) => t.id === activeId) : null;

  return (
    <DemoFrame
      title={title}
      label="// AC analysis"
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
          {controlsExtra}
        </>
      }
    >
      {/* Trace selector + schematic */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-center">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => onActiveChange(null)}
            className={
              "text-left px-2 py-1.5 rounded border text-[12px] font-mono font-mono-features transition-colors " +
              (activeId === null
                ? "bg-bg border-line-2 text-text"
                : "bg-transparent border-line text-muted hover:border-line-2 hover:text-text-2")
            }
          >
            all traces
          </button>
          {visibleTraces.map((s) => (
            <button
              key={s.trace.id}
              onClick={() => onActiveChange(s.trace.id)}
              className={
                "flex items-center gap-2 text-left px-2 py-1.5 rounded border text-[12px] font-mono font-mono-features transition-colors " +
                (activeId === s.trace.id
                  ? "bg-bg border-line-2 text-text"
                  : "bg-transparent border-line text-muted hover:border-line-2 hover:text-text-2")
              }
            >
              <span
                className="inline-block w-3 h-[2px] rounded-full"
                style={{ background: s.color }}
              />
              {s.trace.label}
            </button>
          ))}
        </div>
        <div className="rounded-md border border-line bg-bg p-3 min-h-[140px] grid place-items-center">
          {activeTrace?.schematic ?? (
            <div className="font-mono font-mono-features text-[11px] text-faint">
              select a trace to view its schematic
            </div>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${TRACE_W} ${TRACE_H}`} className="w-full block mt-5">
        <rect
          x={MARGIN.left}
          y={MARGIN.top}
          width={innerW}
          height={innerH}
          fill="var(--color-bg)"
          stroke="var(--color-line)"
        />
        {/* Y gridlines */}
        {yTicks.map((v) => (
          <g key={`y-${v}`}>
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
              {formatY(v, yScale)}
            </text>
          </g>
        ))}
        {/* X gridlines (frequency decades) */}
        {xTicks.map((f) => (
          <g key={`x-${f}`}>
            <line
              x1={x(f)}
              x2={x(f)}
              y1={MARGIN.top}
              y2={MARGIN.top + innerH}
              stroke="var(--color-line)"
              strokeDasharray="2,4"
            />
            <text
              x={x(f)}
              y={MARGIN.top + innerH + 12}
              fontFamily="var(--font-mono)"
              fontSize={9}
              fill="var(--color-faint)"
              textAnchor="middle"
            >
              {formatFreq(f)}
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
          frequency · Hz
        </text>
        {yLabel && (
          <text
            x={6}
            y={MARGIN.top + 4}
            fontFamily="var(--font-mono)"
            fontSize={9}
            fill="var(--color-muted)"
          >
            {yLabel}
          </text>
        )}
        {visibleTraces.map((s) => (
          <path
            key={s.trace.id}
            d={lineGen(s.yVals) ?? ""}
            stroke={s.color}
            strokeWidth={s.dim ? 1 : 1.6}
            opacity={s.dim ? 0.35 : 1}
            fill="none"
          />
        ))}
      </svg>
    </DemoFrame>
  );
}

/* ── formatting / tick helpers ──────────────────────────── */

function decadeTicks(lo: number, hi: number): number[] {
  if (lo <= 0 || hi <= 0) return [];
  const a = Math.floor(Math.log10(lo));
  const b = Math.ceil(Math.log10(hi));
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(Math.pow(10, i));
  return out;
}

function niceLinearTicks(lo: number, hi: number, n: number): number[] {
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

function formatFreq(f: number): string {
  if (f >= 1e9) return `${(f / 1e9).toFixed(0)}G`;
  if (f >= 1e6) return `${(f / 1e6).toFixed(0)}M`;
  if (f >= 1e3) return `${(f / 1e3).toFixed(0)}k`;
  return `${f.toFixed(0)}`;
}

function formatY(v: number, scale: "linear-log" | "dB"): string {
  if (scale === "dB") return `${v.toFixed(0)} dB`;
  // log-scaled value (typically Ω) — show with SI prefix
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}k`;
  if (v >= 1) return `${v.toFixed(1)}`;
  if (v >= 1e-3) return `${(v * 1e3).toFixed(0)}m`;
  return v.toExponential(0);
}
