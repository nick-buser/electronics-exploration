import { useMemo, useState } from "react";
import clsx from "clsx";
import { DemoFrame, Seg } from "./shell";
import { useTick } from "./useTick";

type Inst = "multi" | "scope" | "logic";
type DmmMode = "V" | "A" | "Ω" | "Hz" | "cont";

const DMM_MODES: { v: DmmMode; lbl: string }[] = [
  { v: "V", lbl: "Voltage" },
  { v: "A", lbl: "Current" },
  { v: "Ω", lbl: "Resistance" },
  { v: "Hz", lbl: "Frequency" },
  { v: "cont", lbl: "Continuity" },
];

const SCOPE_W = 580;
const SCOPE_H = 180;
const LA_W = 580;
const LA_ROWS = 4;
const LA_LABELS = ["CH0", "CH1", "CH2", "CH3"];
const LA_KINDS = ["clock", "data", "cs", "data"] as const;
const LA_COLORS = [
  "var(--color-accent)",
  "var(--color-amber)",
  "var(--color-rose)",
  "var(--color-violet)",
];

export function DemoBench() {
  const [inst, setInst] = useState<Inst>("multi");
  const [mode, setMode] = useState<DmmMode>("V");
  const t = useTick(true);

  const reading = useMemo(() => {
    if (mode === "V") return `${(3.3 + 0.05 * Math.sin(t * 4)).toFixed(3)} V`;
    if (mode === "A") return `${(0.187 + 0.01 * Math.sin(t * 3)).toFixed(3)} A`;
    if (mode === "Ω") return "10.02 kΩ";
    if (mode === "Hz") return "120.0 Hz";
    return Math.sin(t * 2) > 0.6 ? "OL" : "0.4 Ω · beep";
  }, [mode, t]);

  const scopePath = useMemo(() => {
    const sig = (x: number) => 3.3 + 0.08 * Math.sin(x * 0.15) + 0.02 * Math.sin(x * 2.3);
    const pts: string[] = [];
    for (let i = 0; i <= SCOPE_W; i++) {
      const y = SCOPE_H / 2 - (sig(i + t * 60) - 3.3) * 600;
      pts.push(`${i === 0 ? "M" : "L"}${i},${y.toFixed(2)}`);
    }
    return pts.join(" ");
  }, [t]);

  return (
    <DemoFrame
      label="// tour"
      title="Bench instruments"
      readouts={
        <Seg<Inst>
          value={inst}
          onChange={setInst}
          options={[
            { value: "multi", label: "DMM" },
            { value: "scope", label: "Scope" },
            { value: "logic", label: "Logic" },
          ]}
        />
      }
      controls={
        <div className="md:col-span-3 font-mono font-mono-features text-[11px] text-muted leading-[1.6]">
          {inst === "multi" &&
            "// the first instrument and the most used. autoranging, true-RMS, ~$30 gets you something credible."}
          {inst === "scope" &&
            "// where 'is it oscillating?' becomes a visible answer. start with a 100MHz 2-channel digital."}
          {inst === "logic" &&
            "// many cheap channels + protocol decoding. saleae-clones at ~$15 are the unreasonable upgrade."}
        </div>
      }
    >
      {inst === "multi" && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6 items-center">
          <div
            className="rounded-lg p-6 text-right tracking-[0.05em] font-mono font-mono-features text-[36px] text-accent border border-line bg-bg"
            style={{ boxShadow: "inset 0 0 24px rgba(125,211,192,0.06)" }}
          >
            {reading}
            <div className="text-[11px] text-muted text-left mt-1.5 tracking-[0.1em]">
              AUTO · DC · TRUE-RMS
            </div>
          </div>
          <div>
            <div className="font-mono font-mono-features text-[10px] text-faint uppercase tracking-[0.12em] mb-2.5">
              function
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DMM_MODES.map((m) => (
                <button
                  key={m.v}
                  onClick={() => setMode(m.v)}
                  className={clsx(
                    "px-2.5 py-1 text-[12px] border rounded transition-colors",
                    mode === m.v
                      ? "bg-accent/10 border-accent/40 text-accent"
                      : "bg-transparent border-line text-muted hover:border-line-2 hover:text-text-2",
                  )}
                >
                  {m.lbl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {inst === "scope" && (
        <svg
          viewBox={`0 0 ${SCOPE_W} ${SCOPE_H}`}
          className="w-full block rounded-md border border-line bg-bg"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={(i * SCOPE_W) / 10}
              y1={0}
              x2={(i * SCOPE_W) / 10}
              y2={SCOPE_H}
              stroke="var(--color-line)"
              strokeDasharray="1,3"
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={(i * SCOPE_H) / 8}
              x2={SCOPE_W}
              y2={(i * SCOPE_H) / 8}
              stroke="var(--color-line)"
              strokeDasharray="1,3"
            />
          ))}
          <line x1={0} y1={SCOPE_H / 2} x2={SCOPE_W} y2={SCOPE_H / 2} stroke="var(--color-dim)" />
          <path d={scopePath} stroke="var(--color-accent)" strokeWidth={1.4} fill="none" />
          <text x={8} y={14} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
            CH1 · 50mV/div · 5ms/div
          </text>
          <text
            x={SCOPE_W - 80}
            y={14}
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="var(--color-amber)"
          >
            trig: rising
          </text>
        </svg>
      )}

      {inst === "logic" && (
        <svg
          viewBox={`0 0 ${LA_W} ${LA_ROWS * 35 + 10}`}
          className="w-full block rounded-md border border-line bg-bg"
        >
          {LA_LABELS.map((lbl, row) => (
            <g key={row}>
              <text
                x={6}
                y={row * 35 + 18}
                fontFamily="var(--font-mono)"
                fontSize="10"
                fill="var(--color-muted)"
              >
                {lbl}
              </text>
              <path
                d={buildLaPath(row, LA_KINDS[row], t)}
                stroke={LA_COLORS[row]}
                strokeWidth={1.3}
                fill="none"
              />
            </g>
          ))}
        </svg>
      )}
    </DemoFrame>
  );
}

function buildLaPath(row: number, kind: (typeof LA_KINDS)[number], t: number): string {
  const yHi = 20;
  const yLo = 35;
  const rowY = row * 35;
  const slots = 40;
  const pts: [number, number][] = [];
  for (let i = 0; i < slots; i++) {
    const x = (i / slots) * LA_W;
    let on = false;
    if (kind === "clock") on = i % 2 === 0;
    else if (kind === "data") on = (i + Math.floor(t * 4)) % 5 < 2;
    else if (kind === "cs") on = !((i + Math.floor(t * 4)) % 12 < 8);
    pts.push([x, rowY + (on ? yHi : yLo)], [x + LA_W / slots, rowY + (on ? yHi : yLo)]);
  }
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
}
