import { useMemo, useState } from "react";
import { DemoFrame, Readout, Seg, Slider } from "./shell";
import { useTick } from "./useTick";

type Kind = "stepper" | "servo" | "bldc";

const FACTS: Record<Kind, Record<string, string>> = {
  stepper: {
    Control: "Open-loop count steps",
    Torque: "High at low speed, falls fast",
    Backlash: "Zero (within step)",
    "Best for": "3D printers, CNC, anywhere position matters more than smoothness",
    "Failure mode": "Skipped steps under load — silent and corrosive",
  },
  servo: {
    Control: "Closed-loop position",
    Torque: "Continuous, configurable",
    Backlash: "Gearbox dependent",
    "Best for": "Robotic arms, RC, anywhere you need 'go to angle and hold'",
    "Failure mode": "Stall / overheat if pushed past torque",
  },
  bldc: {
    Control: "FOC or trapezoidal commutation",
    Torque: "Smooth across speed",
    Backlash: "None (direct-drive)",
    "Best for": "Drones, CoreXY, e-vehicles, anywhere efficiency and power density matter",
    "Failure mode": "Driver / firmware bugs become smoke quickly",
  },
};

export function DemoMotors() {
  const [kind, setKind] = useState<Kind>("stepper");
  const [load, setLoad] = useState(20);
  const [target, setTarget] = useState(90);
  const t = useTick(true);

  const angle = useMemo(() => {
    if (kind === "stepper") {
      const stepRate = (4 * (100 - load)) / 100;
      const stepN = Math.floor(t * stepRate);
      return (stepN * 1.8) % 360;
    }
    if (kind === "servo") {
      return target;
    }
    const rpm = (120 * (100 - load)) / 100;
    return ((t * rpm * 360) / 60) % 360;
  }, [kind, t, load, target]);

  return (
    <DemoFrame
      label="// comparison"
      title="Stepper · Servo · BLDC"
      readouts={<Readout label="θ" value={`${angle.toFixed(0)}°`} />}
      controls={
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-muted">Motor type</span>
            <Seg<Kind>
              value={kind}
              onChange={setKind}
              options={[
                { value: "stepper", label: "Stepper" },
                { value: "servo", label: "Servo" },
                { value: "bldc", label: "BLDC" },
              ]}
            />
          </div>
          {kind === "servo" ? (
            <Slider label="Target angle" value={target} onChange={setTarget} min={0} max={359} unit="°" />
          ) : (
            <Slider label="Load" value={load} onChange={setLoad} min={0} max={95} unit="%" />
          )}
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <svg viewBox="0 0 200 200" className="w-full max-w-[220px] mx-auto block">
          <circle cx={100} cy={100} r={70} fill="none" stroke="var(--color-line-2)" strokeWidth={2} />
          {kind === "stepper" &&
            Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={100 + Math.cos(a) * 62}
                  y1={100 + Math.sin(a) * 62}
                  x2={100 + Math.cos(a) * 75}
                  y2={100 + Math.sin(a) * 75}
                  stroke="var(--color-muted)"
                  strokeWidth={2}
                />
              );
            })}
          {kind === "bldc" &&
            Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={100 + Math.cos(a) * 60}
                  y1={100 + Math.sin(a) * 60}
                  x2={100 + Math.cos(a) * 78}
                  y2={100 + Math.sin(a) * 78}
                  stroke="var(--color-accent-soft)"
                  strokeWidth={2.5}
                />
              );
            })}
          {kind === "servo" && (
            <g>
              <path
                d={`M 100 100 L ${100 + Math.cos(((target - 90) * Math.PI) / 180) * 75} ${100 + Math.sin(((target - 90) * Math.PI) / 180) * 75}`}
                stroke="var(--color-amber)"
                strokeDasharray="3,3"
              />
              <text
                x={100}
                y={190}
                fontFamily="var(--font-mono)"
                fontSize="9"
                fill="var(--color-amber)"
                textAnchor="middle"
              >
                target {target}°
              </text>
            </g>
          )}
          <g transform={`rotate(${angle} 100 100)`}>
            <rect x={96} y={40} width={8} height={62} fill="var(--color-accent)" />
            <circle cx={100} cy={100} r={10} fill="var(--color-accent)" />
          </g>
        </svg>

        <div className="text-[13px] leading-[1.6]">
          {Object.entries(FACTS[kind]).map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-[110px_1fr] gap-3 py-1.5 border-b border-line last:border-0"
            >
              <span className="font-mono font-mono-features text-[10px] uppercase tracking-[0.06em] text-muted">
                {k}
              </span>
              <span className="text-text-2">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}
