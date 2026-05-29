import { useEffect, useRef, useState } from "react";
import { DemoFrame, Readout, Slider } from "./shell";

type SimState = {
  theta: number;
  omega: number;
  x: number;
  v: number;
  intErr: number;
  lastErr: number;
  traceTheta: number[];
};

const W = 640;
const TRACE_MAX = 300;

function initialState(): SimState {
  return { theta: 0.2, omega: 0, x: 0, v: 0, intErr: 0, lastErr: 0, traceTheta: [] };
}

export function DemoPID() {
  const [Kp, setKp] = useState(40);
  const [Ki, setKi] = useState(0.5);
  const [Kd, setKd] = useState(8);
  const [running, setRunning] = useState(true);

  const sim = useRef<SimState>(initialState());
  const [, setFrame] = useState(0);

  // Capture latest gains so the RAF loop can read them without restarting
  const gains = useRef({ Kp, Ki, Kd });
  useEffect(() => {
    gains.current = { Kp, Ki, Kd };
  }, [Kp, Ki, Kd]);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = () => {
      const dt = 0.016;
      const s = sim.current;
      const { Kp, Ki, Kd } = gains.current;

      const err = -s.theta;
      s.intErr += err * dt;
      const dErr = (err - s.lastErr) / dt;
      s.lastErr = err;
      const force = Kp * err + Ki * s.intErr + Kd * dErr;

      const g = 9.81;
      const mp = 0.2;
      const mc = 1.0;
      const l = 0.5;
      const sinT = Math.sin(s.theta);
      const cosT = Math.cos(s.theta);
      const num = g * sinT + (cosT * (-force - mp * l * s.omega * s.omega * sinT)) / (mc + mp);
      const den = l * (4 / 3 - (mp * cosT * cosT) / (mc + mp));
      const alpha = num / den;
      const ax = (force + mp * l * (s.omega * s.omega * sinT - alpha * cosT)) / (mc + mp);

      s.omega += alpha * dt;
      s.theta += s.omega * dt;
      s.v += ax * dt;
      s.x += s.v * dt;

      if (s.x > 1.2) {
        s.x = 1.2;
        s.v = -Math.abs(s.v) * 0.3;
      }
      if (s.x < -1.2) {
        s.x = -1.2;
        s.v = Math.abs(s.v) * 0.3;
      }

      s.traceTheta.push(s.theta);
      if (s.traceTheta.length > TRACE_MAX) s.traceTheta.shift();

      setFrame((f) => (f + 1) % 1e9);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  function nudge() {
    sim.current.omega += 1.5 * (Math.random() > 0.5 ? 1 : -1);
  }
  function reset() {
    sim.current = initialState();
  }

  const s = sim.current;
  const cartX = W / 2 + s.x * 150;
  const pendX = cartX + Math.sin(s.theta) * 80;
  const pendY = 140 - Math.cos(s.theta) * 80;

  const tracePath = s.traceTheta
    .map((th, i) => {
      const x = W * (i / TRACE_MAX);
      const y = 30 - th * 25;
      return `${i === 0 ? "M" : "L"}${x},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <DemoFrame
      title="PID — cart-pendulum balance"
      readouts={
        <>
          <Readout label="θ" value={`${(s.theta * 57.3).toFixed(1)}°`} />
          <Readout label="ω" value={s.omega.toFixed(2)} />
        </>
      }
      controls={
        <>
          <Slider label="Kp" value={Kp} onChange={setKp} min={0} max={120} />
          <Slider
            label="Ki"
            value={Ki}
            onChange={setKi}
            min={0}
            max={5}
            step={0.05}
            display={Ki.toFixed(2)}
          />
          <Slider
            label="Kd"
            value={Kd}
            onChange={setKd}
            min={0}
            max={30}
            step={0.5}
            display={Kd.toFixed(1)}
          />
        </>
      }
    >
      <svg viewBox={`0 0 ${W} 220`} className="w-full block">
        <line x1={0} y1={160} x2={W} y2={160} stroke="var(--color-line-2)" />
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={i}
            x1={i * (W / 20)}
            y1={160}
            x2={i * (W / 20) + 6}
            y2={170}
            stroke="var(--color-dim)"
          />
        ))}
        <rect
          x={cartX - 30}
          y={140}
          width={60}
          height={22}
          fill="var(--color-surface-2)"
          stroke="var(--color-accent)"
        />
        <circle cx={cartX - 18} cy={166} r={5} fill="var(--color-bg)" stroke="var(--color-muted)" />
        <circle cx={cartX + 18} cy={166} r={5} fill="var(--color-bg)" stroke="var(--color-muted)" />
        <line x1={cartX} y1={140} x2={pendX} y2={pendY} stroke="var(--color-accent)" strokeWidth={3} />
        <circle cx={pendX} cy={pendY} r={8} fill="var(--color-accent)" />
      </svg>

      <svg viewBox={`0 0 ${W} 60`} className="w-full block mt-2">
        <text x={0} y={12} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
          θ(t)
        </text>
        <line x1={0} y1={30} x2={W} y2={30} stroke="var(--color-dim)" strokeDasharray="2,4" />
        <path d={tracePath} stroke="var(--color-amber)" strokeWidth={1.3} fill="none" />
      </svg>

      <div className="flex gap-2 mt-3">
        <button
          onClick={nudge}
          className="px-2.5 py-1 text-[12px] text-muted border border-line rounded hover:border-line-2 hover:text-text-2 transition-colors"
        >
          Disturb
        </button>
        <button
          onClick={reset}
          className="px-2.5 py-1 text-[12px] text-muted border border-line rounded hover:border-line-2 hover:text-text-2 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-2.5 py-1 text-[12px] text-accent bg-accent/10 border border-accent/40 rounded hover:bg-accent/20 transition-colors"
        >
          {running ? "Pause" : "Resume"}
        </button>
      </div>
    </DemoFrame>
  );
}
