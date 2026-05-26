import { useMemo, useState } from "react";
import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { DemoFrame, Readout, Seg, Slider } from "./shell";
import { useTick } from "./useTick";

type Load = "led" | "motor";

const WIDTH = 640;
const HEIGHT = 140;
const CYCLES = 4;
const SAMPLES_PER_CYCLE = 200;

export function DemoPWM() {
  const [duty, setDuty] = useState(35);
  const [freq, setFreq] = useState(2);
  const [load, setLoad] = useState<Load>("led");

  const t = useTick(true);

  const x = scaleLinear().domain([0, CYCLES * SAMPLES_PER_CYCLE]).range([0, WIDTH]);
  const yHigh = 20;
  const yLow = 120;

  const path = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= CYCLES * SAMPLES_PER_CYCLE; i++) {
      const cyclePos = (i / SAMPLES_PER_CYCLE) % 1;
      const on = cyclePos < duty / 100;
      pts.push([x(i), on ? yHigh : yLow]);
    }
    return line<[number, number]>().x((p) => p[0]).y((p) => p[1])(pts) ?? "";
  }, [duty, x]);

  const avg = (duty / 100) * 3.3;
  const avgY = yLow - (duty / 100) * (yLow - yHigh);
  const ledBright = duty / 100;
  const motorRpm = Math.round((duty / 100) * 8000);
  const rotorAngle = (t * (duty / 100) * 360 * 4) % 360;

  return (
    <DemoFrame
      title="PWM duty cycle → analog output"
      readouts={<Readout label="V_avg" value={`${avg.toFixed(2)}V`} />}
      controls={
        <>
          <Slider label="Duty cycle" value={duty} onChange={setDuty} min={0} max={100} unit="%" />
          <Slider
            label="Frequency (vis)"
            value={freq}
            onChange={setFreq}
            min={0.5}
            max={8}
            step={0.5}
            unit="Hz"
            display={freq.toFixed(1)}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-muted">Load</span>
            <Seg
              value={load}
              onChange={setLoad}
              options={[
                { value: "led", label: "LED" },
                { value: "motor", label: "Motor" },
              ]}
            />
          </div>
        </>
      }
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full block">
        {Array.from({ length: CYCLES + 1 }).map((_, i) => (
          <line
            key={i}
            x1={(i / CYCLES) * WIDTH}
            y1={0}
            x2={(i / CYCLES) * WIDTH}
            y2={HEIGHT}
            stroke="var(--color-line)"
            strokeDasharray="2,4"
          />
        ))}
        <line x1={0} y1={70} x2={WIDTH} y2={70} stroke="var(--color-dim)" strokeDasharray="2,4" />
        <line x1={0} y1={avgY} x2={WIDTH} y2={avgY} stroke="var(--color-amber)" strokeDasharray="4,4" opacity="0.6" />
        <path d={path} stroke="var(--color-accent)" strokeWidth={2} fill="none" />
        <text x={6} y={18} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
          HIGH (3.3V)
        </text>
        <text x={6} y={135} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
          LOW (0V)
        </text>
        <text x={WIDTH - 70} y={avgY - 4} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-amber)">
          avg {avg.toFixed(2)}V
        </text>
      </svg>

      <div className="flex justify-center gap-8 mt-7">
        {load === "led" && (
          <div className="flex flex-col items-center gap-2">
            <svg width={80} height={80} viewBox="0 0 80 80">
              <circle
                cx={40}
                cy={40}
                r={22}
                fill={`rgba(217, 184, 122, ${ledBright})`}
                stroke="var(--color-amber)"
                strokeWidth={1.5}
                style={{ filter: `drop-shadow(0 0 ${ledBright * 18}px rgba(217, 184, 122, ${ledBright * 0.9}))` }}
              />
              <line x1={32} y1={62} x2={32} y2={78} stroke="var(--color-muted)" strokeWidth={1.5} />
              <line x1={48} y1={62} x2={48} y2={78} stroke="var(--color-muted)" strokeWidth={1.5} />
            </svg>
            <Readout label="brightness" value={`${Math.round(duty)}%`} />
          </div>
        )}
        {load === "motor" && (
          <div className="flex flex-col items-center gap-2">
            <svg width={80} height={80} viewBox="0 0 80 80">
              <circle cx={40} cy={40} r={28} fill="none" stroke="var(--color-line-2)" strokeWidth={2} />
              <g transform={`rotate(${rotorAngle} 40 40)`}>
                <rect x={38} y={14} width={4} height={52} fill="var(--color-accent)" />
                <circle cx={40} cy={40} r={6} fill="var(--color-accent)" />
              </g>
            </svg>
            <Readout label="rpm" value={motorRpm} />
          </div>
        )}
      </div>
    </DemoFrame>
  );
}
