/* ──────────────────────────────────────────────────────────
   DEMOS — eureka-inducing interactive widgets
   PWM · Bus (I²C/SPI/UART) · PID cart · Motors · Battery · Bench
   ────────────────────────────────────────────────────────── */

const { useState, useEffect, useRef, useMemo } = React;

/* small util: animation tick */
function useTick(running, fps = 60) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!running) return;
    let raf, last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setT(prev => prev + dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  return t;
}

function Slider({ label, value, onChange, min, max, step = 1, unit = "", display }) {
  return (
    <label className="ctrl">
      <span className="ctrl-label">
        <span>{label}</span>
        <span className="val">{display !== undefined ? display : value}{unit}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value}
             onChange={e => onChange(parseFloat(e.target.value))} />
    </label>
  );
}

function Seg({ value, onChange, options }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o.value} className={value === o.value ? "active" : ""} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   1. PWM — duty cycle visualizer
   ════════════════════════════════════════════════════════ */
function DemoPWM() {
  const [duty, setDuty] = useState(35);
  const [freq, setFreq] = useState(2); // Hz for animation purposes
  const [load, setLoad] = useState("led"); // led | motor

  const W = 640, H = 140;
  const period = 1 / freq; // seconds
  const t = useTick(true);
  const phase = (t % period) / period; // 0..1

  // Build waveform points
  const cycles = 4;
  const pts = [];
  for (let i = 0; i <= cycles * 200; i++) {
    const x = (i / (cycles * 200)) * W;
    const cyclePos = (i / 200) % 1;
    const on = cyclePos < duty / 100;
    pts.push([x, on ? 20 : 120]);
  }
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");

  const avg = (duty / 100) * 3.3;
  const ledBright = duty / 100;
  const motorRpm = Math.round((duty / 100) * 8000);

  // Rotor angle for motor
  const rotorAngle = (t * (duty / 100) * 360 * 4) % 360;

  return (
    <div className="demo">
      <div className="demo-head">
        <span className="label">// demo</span>
        <span className="title">PWM duty cycle → analog output</span>
        <span className="spacer"></span>
        <span className="readout"><span className="lbl">V_avg</span><span className="v">{avg.toFixed(2)}V</span></span>
      </div>
      <div className="demo-body">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {/* grid */}
          {Array.from({ length: cycles + 1 }).map((_, i) => (
            <line key={i} x1={(i / cycles) * W} y1="0" x2={(i / cycles) * W} y2={H}
                  stroke="var(--line)" strokeDasharray="2,4" />
          ))}
          <line x1="0" y1="70" x2={W} y2="70" stroke="var(--dim)" strokeDasharray="2,4" />
          {/* avg voltage line */}
          <line x1="0" y1={120 - (duty / 100) * 100} x2={W} y2={120 - (duty / 100) * 100}
                stroke="var(--amber)" strokeDasharray="4,4" opacity="0.6" />
          {/* waveform */}
          <path d={path} stroke="var(--accent)" strokeWidth="2" fill="none" />
          {/* labels */}
          <text x="6" y="18" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">HIGH (3.3V)</text>
          <text x="6" y="135" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">LOW (0V)</text>
          <text x={W - 70} y={120 - (duty / 100) * 100 - 4} fontFamily="var(--mono)" fontSize="10" fill="var(--amber)">avg {avg.toFixed(2)}V</text>
        </svg>

        <div style={{ display: "flex", gap: 32, marginTop: 28, alignItems: "center", justifyContent: "center" }}>
          {load === "led" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="22" fill={`rgba(217, 184, 122, ${ledBright})`}
                        stroke="var(--amber)" strokeWidth="1.5"
                        style={{ filter: `drop-shadow(0 0 ${ledBright * 18}px rgba(217, 184, 122, ${ledBright * 0.9}))` }} />
                <line x1="32" y1="62" x2="32" y2="78" stroke="var(--muted)" strokeWidth="1.5" />
                <line x1="48" y1="62" x2="48" y2="78" stroke="var(--muted)" strokeWidth="1.5" />
              </svg>
              <span className="readout"><span className="lbl">brightness</span><span className="v">{Math.round(duty)}%</span></span>
            </div>
          )}
          {load === "motor" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="28" fill="none" stroke="var(--line-2)" strokeWidth="2" />
                <g transform={`rotate(${rotorAngle} 40 40)`}>
                  <rect x="38" y="14" width="4" height="52" fill="var(--accent)" />
                  <circle cx="40" cy="40" r="6" fill="var(--accent)" />
                </g>
              </svg>
              <span className="readout"><span className="lbl">rpm</span><span className="v">{motorRpm}</span></span>
            </div>
          )}
        </div>
      </div>
      <div className="demo-controls">
        <Slider label="Duty cycle" value={duty} onChange={setDuty} min={0} max={100} step={1} unit="%" />
        <Slider label="Frequency (vis)" value={freq} onChange={setFreq} min={0.5} max={8} step={0.5} unit="Hz"
                display={freq.toFixed(1)} />
        <div className="ctrl">
          <span className="ctrl-label"><span>Load</span></span>
          <Seg value={load} onChange={setLoad} options={[
            { value: "led", label: "LED" },
            { value: "motor", label: "Motor" },
          ]} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   2. BUS — I²C / SPI / UART logic-analyzer
   ════════════════════════════════════════════════════════ */
function DemoBus() {
  const [proto, setProto] = useState("i2c");
  const [data, setData] = useState("A7");
  const [addr, setAddr] = useState("48");
  const [baud, setBaud] = useState(9600); // for UART
  const W = 640, H = 160;

  const dataByte = parseInt(data, 16) || 0;
  const addrByte = parseInt(addr, 16) || 0;

  // Build bit sequences for each protocol
  const lines = useMemo(() => {
    if (proto === "i2c") {
      const bits = [];
      // START: SDA falls while SCL high
      // 7-bit addr + R/W + ACK + 8 data + ACK + STOP
      const addrBits = Array.from({ length: 7 }, (_, i) => (addrByte >> (6 - i)) & 1);
      const dataBits = Array.from({ length: 8 }, (_, i) => (dataByte >> (7 - i)) & 1);
      // SDA sequence frames
      const seq = [];
      seq.push({ sda: 1, scl: 1, label: "" });        // idle
      seq.push({ sda: 0, scl: 1, label: "START" });
      addrBits.forEach((b, i) => seq.push({ sda: b, scl: 0, label: i === 0 ? "ADDR" : "" }));
      seq.push({ sda: 0, scl: 0, label: "W" });
      seq.push({ sda: 0, scl: 0, label: "ACK" });
      dataBits.forEach((b, i) => seq.push({ sda: b, scl: 0, label: i === 0 ? "DATA" : "" }));
      seq.push({ sda: 0, scl: 0, label: "ACK" });
      seq.push({ sda: 0, scl: 1, label: "STOP" });
      seq.push({ sda: 1, scl: 1, label: "" });

      const step = W / seq.length;
      const sdaPath = [], sclPath = [];
      seq.forEach((f, i) => {
        const x0 = i * step, x1 = (i + 1) * step;
        const sdaY = f.sda ? 20 : 60, sclY = f.scl || i === 1 || i === seq.length - 2 ? 90 : 130;
        // SCL toggles during data bits — fake: full square per slot for visual clarity
        const sclYActual = (i >= 2 && i < seq.length - 2) ? 130 : 90;
        sdaPath.push([x0, sdaY], [x1, sdaY]);
        sclPath.push([x0, sclYActual], [x1, sclYActual]);
      });
      return { seq, sdaPath, sclPath, step, sigs: ["SDA", "SCL"] };
    }
    if (proto === "spi") {
      const dataBits = Array.from({ length: 8 }, (_, i) => (dataByte >> (7 - i)) & 1);
      // CS low, then 8 bits with SCK toggling, MOSI carrying bits
      const slots = 2 + 8 * 2 + 2; // CS edges + bit slots + idle
      const step = W / slots;
      const csPath = [], sckPath = [], mosiPath = [];
      // CS
      csPath.push([0, 20], [step, 20], [step, 60], [W - step, 60], [W - step, 20], [W, 20]);
      // SCK and MOSI for each bit, 2 slots per bit (low, high)
      for (let i = 0; i < 8; i++) {
        const x = step + i * 2 * step;
        sckPath.push([x, 130], [x + step, 130], [x + step, 90], [x + 2 * step, 90], [x + 2 * step, 130]);
        const my = dataBits[i] ? 170 : 210;
        mosiPath.push([x, my], [x + 2 * step, my]);
      }
      // idle SCK
      sckPath.unshift([0, 130]); sckPath.push([W, 130]);
      mosiPath.unshift([0, 210]); mosiPath.push([W, 210]);
      return { sigs: ["CS", "SCK", "MOSI"], csPath, sckPath, mosiPath, dataBits, step };
    }
    if (proto === "uart") {
      // Start (low), 8 data bits LSB first, stop (high)
      const bits = [1, 0, ...Array.from({ length: 8 }, (_, i) => (dataByte >> i) & 1), 1, 1];
      const step = W / bits.length;
      const path = [];
      bits.forEach((b, i) => {
        const x0 = i * step, x1 = (i + 1) * step;
        const y = b ? 40 : 100;
        path.push([x0, y], [x1, y]);
      });
      return { sigs: ["TX"], path, bits, step };
    }
  }, [proto, dataByte, addrByte]);

  const decodedI2c = proto === "i2c" ? `addr=0x${addr.toUpperCase()} write 0x${data.toUpperCase()}` : "";
  const decodedSpi = proto === "spi" ? `MOSI 0x${data.toUpperCase()} (${dataByte.toString(2).padStart(8, "0")})` : "";
  const decodedUart = proto === "uart" ? `start | ${dataByte.toString(2).padStart(8, "0")} (LSB first, 0x${data.toUpperCase()}) | stop` : "";

  function poly(pts) {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  }

  return (
    <div className="demo">
      <div className="demo-head">
        <span className="label">// demo</span>
        <span className="title">Bus traffic simulator</span>
        <span className="spacer"></span>
        <span className="readout mono"><span className="lbl">{proto.toUpperCase()}</span></span>
      </div>
      <div className="demo-body">
        <svg width="100%" viewBox={`0 0 ${W} ${proto === "spi" ? 240 : proto === "uart" ? 140 : 160}`} style={{ display: "block" }}>
          {proto === "i2c" && (
            <>
              <text x="0" y="12" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">SDA</text>
              <text x="0" y="82" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">SCL</text>
              <path d={poly(lines.sdaPath)} stroke="var(--accent)" strokeWidth="1.6" fill="none" />
              <path d={poly(lines.sclPath)} stroke="var(--amber)" strokeWidth="1.6" fill="none" />
              {lines.seq.map((f, i) => f.label ? (
                <text key={i} x={i * lines.step + 2} y={155}
                      fontFamily="var(--mono)" fontSize="8.5"
                      fill={f.label === "START" || f.label === "STOP" ? "var(--accent)" : "var(--faint)"}>
                  {f.label}
                </text>
              ) : null)}
            </>
          )}
          {proto === "spi" && (
            <>
              <text x="0" y="12" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">CS</text>
              <text x="0" y="82" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">SCK</text>
              <text x="0" y="162" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">MOSI</text>
              <path d={poly(lines.csPath)} stroke="var(--rose)" strokeWidth="1.6" fill="none" />
              <path d={poly(lines.sckPath)} stroke="var(--amber)" strokeWidth="1.6" fill="none" />
              <path d={poly(lines.mosiPath)} stroke="var(--accent)" strokeWidth="1.6" fill="none" />
              {lines.dataBits.map((b, i) => (
                <text key={i} x={lines.step * (1 + 2 * i) + lines.step / 2} y={235}
                      fontFamily="var(--mono)" fontSize="10" fill="var(--accent)" textAnchor="middle">{b}</text>
              ))}
            </>
          )}
          {proto === "uart" && (
            <>
              <text x="0" y="32" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">TX</text>
              <path d={poly(lines.path)} stroke="var(--accent)" strokeWidth="1.6" fill="none" />
              {lines.bits.map((b, i) => {
                const labels = ["idle", "start", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "stop", "idle"];
                return (
                  <text key={i} x={lines.step * i + lines.step / 2} y={130}
                        fontFamily="var(--mono)" fontSize="9"
                        fill={labels[i] === "start" || labels[i] === "stop" ? "var(--accent)" : "var(--muted)"}
                        textAnchor="middle">
                    {labels[i]}
                  </text>
                );
              })}
            </>
          )}
        </svg>
        <div style={{
          marginTop: 18, padding: "10px 14px",
          background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 4,
          fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)"
        }}>
          <span style={{ color: "var(--faint)" }}>decoded → </span>
          <span style={{ color: "var(--accent)" }}>{decodedI2c || decodedSpi || decodedUart}</span>
        </div>
      </div>
      <div className="demo-controls">
        <div className="ctrl">
          <span className="ctrl-label"><span>Protocol</span></span>
          <Seg value={proto} onChange={setProto} options={[
            { value: "i2c", label: "I²C" },
            { value: "spi", label: "SPI" },
            { value: "uart", label: "UART" },
          ]} />
        </div>
        {proto === "i2c" && (
          <label className="ctrl">
            <span className="ctrl-label"><span>Addr (hex)</span><span className="val mono">0x{addr.toUpperCase()}</span></span>
            <input type="text" value={addr} onChange={e => setAddr(e.target.value)} maxLength="2"
                   style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 4, padding: "4px 8px", fontFamily: "var(--mono)" }} />
          </label>
        )}
        <label className="ctrl">
          <span className="ctrl-label"><span>Data (hex)</span><span className="val mono">0x{data.toUpperCase()}</span></span>
          <input type="text" value={data} onChange={e => setData(e.target.value)} maxLength="2"
                 style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 4, padding: "4px 8px", fontFamily: "var(--mono)" }} />
        </label>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   3. PID — inverted pendulum on a cart
   ════════════════════════════════════════════════════════ */
function DemoPID() {
  const [Kp, setKp] = useState(40);
  const [Ki, setKi] = useState(0.5);
  const [Kd, setKd] = useState(8);
  const [running, setRunning] = useState(true);
  const [disturb, setDisturb] = useState(0);

  // sim state in ref so it survives re-renders without resets
  const sim = useRef({
    theta: 0.2, omega: 0, x: 0, v: 0, intErr: 0, lastErr: 0, traceTheta: [], traceForce: [],
  });
  const W = 640, H = 200;
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!running) return;
    let raf;
    const step = () => {
      const dt = 0.016;
      const s = sim.current;

      // PID on theta (we want theta = 0)
      const err = -s.theta;
      s.intErr += err * dt;
      const dErr = (err - s.lastErr) / dt;
      s.lastErr = err;
      const force = Kp * err + Ki * s.intErr + Kd * dErr;

      // Cart-pendulum dynamics (simplified)
      const g = 9.81, mp = 0.2, mc = 1.0, l = 0.5;
      const sinT = Math.sin(s.theta), cosT = Math.cos(s.theta);
      const num = g * sinT + cosT * (-force - mp * l * s.omega * s.omega * sinT) / (mc + mp);
      const den = l * (4 / 3 - (mp * cosT * cosT) / (mc + mp));
      const alpha = num / den;
      const ax = (force + mp * l * (s.omega * s.omega * sinT - alpha * cosT)) / (mc + mp);

      s.omega += alpha * dt;
      s.theta += s.omega * dt;
      s.v += ax * dt;
      s.x += s.v * dt;

      // soft walls
      if (s.x > 1.2) { s.x = 1.2; s.v = -Math.abs(s.v) * 0.3; }
      if (s.x < -1.2) { s.x = -1.2; s.v = Math.abs(s.v) * 0.3; }

      // trace
      s.traceTheta.push(s.theta);
      s.traceForce.push(force);
      if (s.traceTheta.length > 300) { s.traceTheta.shift(); s.traceForce.shift(); }

      setFrame(f => (f + 1) % 1e9);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running, Kp, Ki, Kd]);

  // Apply disturbance impulse
  function nudge() {
    sim.current.omega += 1.5 * (Math.random() > 0.5 ? 1 : -1);
  }

  function reset() {
    sim.current = { theta: 0.2, omega: 0, x: 0, v: 0, intErr: 0, lastErr: 0, traceTheta: [], traceForce: [] };
  }

  const s = sim.current;
  const cartX = W / 2 + s.x * 150;
  const pendX = cartX + Math.sin(s.theta) * 80;
  const pendY = 140 - Math.cos(s.theta) * 80;

  // trace path
  const traceLen = s.traceTheta.length;
  const traceMax = 300;
  const tracePath = s.traceTheta.map((th, i) => {
    const x = W * (i / traceMax);
    const y = 100 - th * 60;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  return (
    <div className="demo">
      <div className="demo-head">
        <span className="label">// demo</span>
        <span className="title">PID — cart-pendulum balance</span>
        <span className="spacer"></span>
        <span className="readout"><span className="lbl">θ</span><span className="v">{(s.theta * 57.3).toFixed(1)}°</span></span>
        <span className="readout"><span className="lbl">ω</span><span className="v">{s.omega.toFixed(2)}</span></span>
      </div>
      <div className="demo-body">
        <svg width="100%" viewBox={`0 0 ${W} 220`} style={{ display: "block" }}>
          {/* ground */}
          <line x1="0" y1="160" x2={W} y2="160" stroke="var(--line-2)" />
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={i} x1={i * (W / 20)} y1="160" x2={i * (W / 20) + 6} y2="170" stroke="var(--dim)" />
          ))}
          {/* cart */}
          <rect x={cartX - 30} y={140} width="60" height="22" fill="var(--surface-2)" stroke="var(--accent)" />
          <circle cx={cartX - 18} cy={166} r="5" fill="var(--bg)" stroke="var(--muted)" />
          <circle cx={cartX + 18} cy={166} r="5" fill="var(--bg)" stroke="var(--muted)" />
          {/* pendulum */}
          <line x1={cartX} y1="140" x2={pendX} y2={pendY} stroke="var(--accent)" strokeWidth="3" />
          <circle cx={pendX} cy={pendY} r="8" fill="var(--accent)" />
        </svg>
        <svg width="100%" viewBox={`0 0 ${W} 60`} style={{ display: "block", marginTop: 8 }}>
          <text x="0" y="12" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">θ(t)</text>
          <line x1="0" y1="30" x2={W} y2="30" stroke="var(--dim)" strokeDasharray="2,4" />
          <path d={tracePath} stroke="var(--amber)" strokeWidth="1.3" fill="none" />
        </svg>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn-ghost" onClick={nudge}>Disturb</button>
          <button className="btn-ghost" onClick={reset}>Reset</button>
          <button className="btn-primary" onClick={() => setRunning(r => !r)}>{running ? "Pause" : "Resume"}</button>
        </div>
      </div>
      <div className="demo-controls">
        <Slider label="Kp" value={Kp} onChange={setKp} min={0} max={120} step={1} />
        <Slider label="Ki" value={Ki} onChange={setKi} min={0} max={5} step={0.05} display={Ki.toFixed(2)} />
        <Slider label="Kd" value={Kd} onChange={setKd} min={0} max={30} step={0.5} display={Kd.toFixed(1)} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   4. MOTORS — stepper vs servo vs BLDC animator
   ════════════════════════════════════════════════════════ */
function DemoMotors() {
  const [kind, setKind] = useState("stepper");
  const [load, setLoad] = useState(20);
  const [target, setTarget] = useState(90);
  const t = useTick(true);

  const angle = useMemo(() => {
    if (kind === "stepper") {
      // discrete steps, 200 steps/rev = 1.8°/step
      const stepRate = 4 * (100 - load) / 100; // steps/sec
      const stepN = Math.floor(t * stepRate);
      return (stepN * 1.8) % 360;
    }
    if (kind === "servo") {
      // moves to target with critically-damped response
      return target;
    }
    if (kind === "bldc") {
      const rpm = 120 * (100 - load) / 100;
      return (t * rpm * 360 / 60) % 360;
    }
  }, [kind, t, load, target]);

  const facts = {
    stepper: {
      "Control": "Open-loop count steps",
      "Torque": "High at low speed, falls fast",
      "Backlash": "Zero (within step)",
      "Best for": "3D printers, CNC, anywhere position matters more than smoothness",
      "Failure mode": "Skipped steps under load — silent and corrosive"
    },
    servo: {
      "Control": "Closed-loop position",
      "Torque": "Continuous, configurable",
      "Backlash": "Gearbox dependent",
      "Best for": "Robotic arms, RC, anywhere you need 'go to angle and hold'",
      "Failure mode": "Stall / overheat if pushed past torque"
    },
    bldc: {
      "Control": "FOC or trapezoidal commutation",
      "Torque": "Smooth across speed",
      "Backlash": "None (direct-drive)",
      "Best for": "Drones, CoreXY, e-vehicles, anywhere efficiency and power density matter",
      "Failure mode": "Driver / firmware bugs become smoke quickly"
    }
  };

  return (
    <div className="demo">
      <div className="demo-head">
        <span className="label">// comparison</span>
        <span className="title">Stepper · Servo · BLDC</span>
        <span className="spacer"></span>
        <span className="readout"><span className="lbl">θ</span><span className="v">{angle.toFixed(0)}°</span></span>
      </div>
      <div className="demo-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
          <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: 220, margin: "0 auto", display: "block" }}>
            <circle cx="100" cy="100" r="70" fill="none" stroke="var(--line-2)" strokeWidth="2" />
            {/* pole markers depend on type */}
            {kind === "stepper" && Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={100 + Math.cos(a) * 62} y1={100 + Math.sin(a) * 62}
                           x2={100 + Math.cos(a) * 75} y2={100 + Math.sin(a) * 75}
                           stroke="var(--muted)" strokeWidth="2" />;
            })}
            {kind === "bldc" && Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <line key={i} x1={100 + Math.cos(a) * 60} y1={100 + Math.sin(a) * 60}
                           x2={100 + Math.cos(a) * 78} y2={100 + Math.sin(a) * 78}
                           stroke="var(--accent-soft)" strokeWidth="2.5" />;
            })}
            {kind === "servo" && (
              <g>
                <path d={`M 100 100 L ${100 + Math.cos((target - 90) * Math.PI / 180) * 75} ${100 + Math.sin((target - 90) * Math.PI / 180) * 75}`}
                      stroke="var(--amber)" strokeDasharray="3,3" />
                <text x="100" y="190" fontFamily="var(--mono)" fontSize="9" fill="var(--amber)" textAnchor="middle">target {target}°</text>
              </g>
            )}
            {/* rotor */}
            <g transform={`rotate(${angle} 100 100)`}>
              <rect x="96" y="40" width="8" height="62" fill="var(--accent)" />
              <circle cx="100" cy="100" r="10" fill="var(--accent)" />
            </g>
          </svg>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            {Object.entries(facts[kind]).map(([k, v]) => (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12, padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</span>
                <span style={{ color: "var(--text-2)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="demo-controls">
        <div className="ctrl">
          <span className="ctrl-label"><span>Motor type</span></span>
          <Seg value={kind} onChange={setKind} options={[
            { value: "stepper", label: "Stepper" },
            { value: "servo", label: "Servo" },
            { value: "bldc", label: "BLDC" },
          ]} />
        </div>
        {kind === "servo" ? (
          <Slider label="Target angle" value={target} onChange={setTarget} min={0} max={359} unit="°" />
        ) : (
          <Slider label="Load" value={load} onChange={setLoad} min={0} max={95} unit="%" />
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   5. BATTERY — chemistry & discharge picker
   ════════════════════════════════════════════════════════ */
function DemoBattery() {
  const [chem, setChem] = useState("liion");
  const [cRate, setCRate] = useState(1);

  // discharge curves (cell V over 0..1 depth-of-discharge, approximate)
  const curves = {
    liion:   { color: "var(--accent)", v0: 4.2,  vKnee: 3.7, vEnd: 3.0, name: "Li-ion (NMC)", cycles: "500–1000", density: "200–250 Wh/kg", safety: "Thermal runaway if punctured/overcharged" },
    lipo:    { color: "var(--rose)",   v0: 4.2,  vKnee: 3.7, vEnd: 3.2, name: "Li-Po",         cycles: "300–500",  density: "150–200 Wh/kg", safety: "Same as Li-ion, plus puffs when damaged" },
    lifepo4: { color: "var(--amber)",  v0: 3.6,  vKnee: 3.3, vEnd: 2.5, name: "LiFePO₄",       cycles: "2000–5000", density: "90–120 Wh/kg",  safety: "Very stable; no thermal runaway in normal abuse" },
    nimh:    { color: "var(--violet)", v0: 1.4,  vKnee: 1.2, vEnd: 1.0, name: "NiMH",          cycles: "500–1000",  density: "60–120 Wh/kg",  safety: "Robust; vented gas if shorted" },
    leadacid:{ color: "var(--sky)",    v0: 2.13, vKnee: 2.0, vEnd: 1.75,name: "Lead-acid",     cycles: "200–500",   density: "30–50 Wh/kg",   safety: "Acid leak; hydrogen if overcharged" },
  };
  const c = curves[chem];

  // sag from C-rate
  const sag = (cRate - 1) * 0.08; // V drop per C above 1

  const W = 600, H = 200;
  const pts = [];
  for (let i = 0; i <= 100; i++) {
    const x = (i / 100) * W;
    const dod = i / 100;
    let v;
    if (dod < 0.1) v = c.v0 - (c.v0 - c.vKnee) * (dod / 0.1) * 0.4;
    else if (dod < 0.85) v = c.vKnee + (c.vKnee - c.v0) * 0.1 - (c.vKnee - c.vEnd) * ((dod - 0.1) / 0.75) * 0.3;
    else v = c.vKnee - (c.vKnee - c.vEnd) * ((dod - 0.85) / 0.15);
    v -= sag;
    const y = H - ((v - 1.0) / (4.5 - 1.0)) * H;
    pts.push([x, Math.max(8, Math.min(H - 8, y))]);
  }
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");

  return (
    <div className="demo">
      <div className="demo-head">
        <span className="label">// demo</span>
        <span className="title">Battery discharge curves</span>
        <span className="spacer"></span>
        <span className="readout"><span className="lbl">cell</span><span className="v">{c.name}</span></span>
      </div>
      <div className="demo-body">
        <svg width="100%" viewBox={`0 0 ${W} ${H + 30}`} style={{ display: "block" }}>
          {/* axes */}
          <line x1="0" y1={H} x2={W} y2={H} stroke="var(--line-2)" />
          <line x1="0" y1="0" x2="0" y2={H} stroke="var(--line-2)" />
          {[1.0, 2.0, 3.0, 4.0].map(v => {
            const y = H - ((v - 1.0) / (4.5 - 1.0)) * H;
            return <g key={v}>
              <line x1="0" y1={y} x2={W} y2={y} stroke="var(--line)" strokeDasharray="2,4" />
              <text x={W - 30} y={y - 4} fontFamily="var(--mono)" fontSize="10" fill="var(--faint)">{v.toFixed(1)}V</text>
            </g>;
          })}
          {[0.25, 0.5, 0.75, 1.0].map(d => {
            const x = d * W;
            return <text key={d} x={x} y={H + 16} fontFamily="var(--mono)" fontSize="10" fill="var(--faint)" textAnchor="middle">{(d * 100).toFixed(0)}%</text>;
          })}
          <path d={path} stroke={c.color} strokeWidth="2" fill="none" />
          <text x={W / 2} y={H + 26} fontFamily="var(--mono)" fontSize="10" fill="var(--muted)" textAnchor="middle">depth of discharge</text>
        </svg>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 20 }}>
          <div className="readout" style={{ flexDirection: "column", alignItems: "flex-start", padding: 10 }}>
            <span className="lbl">cycles</span><span className="v">{c.cycles}</span>
          </div>
          <div className="readout" style={{ flexDirection: "column", alignItems: "flex-start", padding: 10 }}>
            <span className="lbl">energy density</span><span className="v">{c.density}</span>
          </div>
          <div className="readout" style={{ flexDirection: "column", alignItems: "flex-start", padding: 10 }}>
            <span className="lbl">safety</span><span className="v" style={{ fontSize: 11, fontWeight: 400 }}>{c.safety}</span>
          </div>
        </div>
      </div>
      <div className="demo-controls">
        <div className="ctrl">
          <span className="ctrl-label"><span>Chemistry</span></span>
          <Seg value={chem} onChange={setChem} options={[
            { value: "liion", label: "Li-ion" },
            { value: "lipo", label: "LiPo" },
            { value: "lifepo4", label: "LiFePO₄" },
            { value: "nimh", label: "NiMH" },
            { value: "leadacid", label: "Lead" },
          ]} />
        </div>
        <Slider label="Discharge rate" value={cRate} onChange={setCRate} min={0.1} max={5} step={0.1} unit="C"
                display={cRate.toFixed(1)} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   6. BENCH — instrument tour
   ════════════════════════════════════════════════════════ */
function DemoBench() {
  const [inst, setInst] = useState("multi");
  const [mode, setMode] = useState("V");
  const t = useTick(true);

  // signal under test — a 3.3V supply with ripple
  const sig = (x) => 3.3 + 0.08 * Math.sin(x * 0.15) + 0.02 * Math.sin(x * 2.3);

  // Multimeter readout
  const reading = useMemo(() => {
    if (mode === "V") return (3.3 + 0.05 * Math.sin(t * 4)).toFixed(3) + " V";
    if (mode === "A") return (0.187 + 0.01 * Math.sin(t * 3)).toFixed(3) + " A";
    if (mode === "Ω") return "10.02 kΩ";
    if (mode === "Hz") return "120.0 Hz";
    if (mode === "cont") return Math.sin(t * 2) > 0.6 ? "OL" : "0.4 Ω · beep";
    return "—";
  }, [mode, t]);

  // Scope trace
  const W = 580, H = 180;
  const scopePts = [];
  for (let i = 0; i <= W; i++) {
    const x = i;
    const y = H / 2 - (sig(i + t * 60) - 3.3) * 600;
    scopePts.push([x, y]);
  }
  const scopePath = scopePts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");

  // Logic analyzer fake — show 4 channels of a clock + data + cs
  const laRows = 4;
  const laLabels = ["CH0", "CH1", "CH2", "CH3"];
  function laPath(row, kind) {
    const pts = [];
    const yHi = 20, yLo = 35;
    const rowY = row * 35;
    for (let i = 0; i < 40; i++) {
      const x = (i / 40) * W;
      let on;
      if (kind === "clock") on = i % 2 === 0;
      else if (kind === "data") on = (i + Math.floor(t * 4)) % 5 < 2;
      else if (kind === "cs") on = (i + Math.floor(t * 4)) % 12 < 8 ? false : true;
      else on = false;
      pts.push([x, rowY + (on ? yHi : yLo)]);
      pts.push([x + W / 40, rowY + (on ? yHi : yLo)]);
    }
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  }
  const laKinds = ["clock", "data", "cs", "data"];

  return (
    <div className="demo">
      <div className="demo-head">
        <span className="label">// tour</span>
        <span className="title">Bench instruments</span>
        <span className="spacer"></span>
        <Seg value={inst} onChange={setInst} options={[
          { value: "multi", label: "DMM" },
          { value: "scope", label: "Scope" },
          { value: "logic", label: "Logic" },
        ]} />
      </div>
      <div className="demo-body">
        {inst === "multi" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 24, alignItems: "center" }}>
            <div style={{
              background: "var(--bg)", border: "1px solid var(--line)",
              borderRadius: 8, padding: 24,
              fontFamily: "var(--mono)", fontSize: 38, color: "var(--accent)",
              textAlign: "right", letterSpacing: "0.05em",
              boxShadow: "inset 0 0 24px rgba(125,211,192,0.06)"
            }}>
              {reading}
              <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "left", marginTop: 6, letterSpacing: "0.1em" }}>AUTO · DC · TRUE-RMS</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>function</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  ["V", "Voltage"], ["A", "Current"], ["Ω", "Resistance"],
                  ["Hz", "Frequency"], ["cont", "Continuity"]
                ].map(([v, lbl]) => (
                  <button key={v} className="btn-ghost" onClick={() => setMode(v)}
                          style={{ background: mode === v ? "var(--accent-bg)" : "transparent",
                                   borderColor: mode === v ? "var(--accent-line)" : "var(--line)",
                                   color: mode === v ? "var(--accent)" : "var(--muted)" }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {inst === "scope" && (
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 6, display: "block" }}>
            {/* grid */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={"v" + i} x1={i * W / 10} y1="0" x2={i * W / 10} y2={H} stroke="var(--line)" strokeDasharray="1,3" />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={"h" + i} x1="0" y1={i * H / 8} x2={W} y2={i * H / 8} stroke="var(--line)" strokeDasharray="1,3" />
            ))}
            <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="var(--dim)" />
            <path d={scopePath} stroke="var(--accent)" strokeWidth="1.4" fill="none" />
            <text x="8" y="14" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">CH1 · 50mV/div · 5ms/div</text>
            <text x={W - 80} y={14} fontFamily="var(--mono)" fontSize="10" fill="var(--amber)">trig: rising</text>
          </svg>
        )}

        {inst === "logic" && (
          <svg width="100%" viewBox={`0 0 ${W} ${laRows * 35 + 10}`} style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 6, display: "block" }}>
            {laLabels.map((lbl, row) => (
              <g key={row}>
                <text x="6" y={row * 35 + 18} fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">{lbl}</text>
                <path d={laPath(row, laKinds[row])} stroke={["var(--accent)", "var(--amber)", "var(--rose)", "var(--violet)"][row]}
                      strokeWidth="1.3" fill="none" />
              </g>
            ))}
          </svg>
        )}
      </div>
      <div className="demo-controls">
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
          {inst === "multi" && "// the first instrument and the most used. autoranging, true-RMS, ~$30 gets you something credible."}
          {inst === "scope" && "// where 'is it oscillating?' becomes a visible answer. start with a 100MHz 2-channel digital."}
          {inst === "logic" && "// many cheap channels + protocol decoding. saleae-clones at ~$15 are the unreasonable upgrade."}
        </div>
      </div>
    </div>
  );
}

/* Expose */
Object.assign(window, {
  DemoPWM, DemoBus, DemoPID, DemoMotors, DemoBattery, DemoBench,
});
