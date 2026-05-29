import { useMemo, useState } from "react";
import { DemoFrame, Readout, Seg } from "./shell";

type Proto = "i2c" | "spi" | "uart";

const W = 640;

function bitsMSB(byte: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => (byte >> (n - 1 - i)) & 1);
}

function bitsLSB(byte: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => (byte >> i) & 1);
}

function poly(pts: [number, number][]): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
}

function parseHexByte(s: string): number {
  const v = parseInt(s, 16);
  return Number.isFinite(v) ? v & 0xff : 0;
}

export function DemoBus() {
  const [proto, setProto] = useState<Proto>("i2c");
  const [data, setData] = useState("A7");
  const [addr, setAddr] = useState("48");

  const dataByte = parseHexByte(data);
  const addrByte = parseHexByte(addr);

  const i2c = useMemo(() => {
    const addrBits = bitsMSB(addrByte, 7);
    const dataBits = bitsMSB(dataByte, 8);
    const seq: { sda: number; scl: number; label: string }[] = [];
    seq.push({ sda: 1, scl: 1, label: "" });
    seq.push({ sda: 0, scl: 1, label: "START" });
    addrBits.forEach((b, i) => seq.push({ sda: b, scl: 0, label: i === 0 ? "ADDR" : "" }));
    seq.push({ sda: 0, scl: 0, label: "W" });
    seq.push({ sda: 0, scl: 0, label: "ACK" });
    dataBits.forEach((b, i) => seq.push({ sda: b, scl: 0, label: i === 0 ? "DATA" : "" }));
    seq.push({ sda: 0, scl: 0, label: "ACK" });
    seq.push({ sda: 0, scl: 1, label: "STOP" });
    seq.push({ sda: 1, scl: 1, label: "" });

    const step = W / seq.length;
    const sdaPts: [number, number][] = [];
    const sclPts: [number, number][] = [];
    seq.forEach((f, i) => {
      const x0 = i * step;
      const x1 = (i + 1) * step;
      const sdaY = f.sda ? 20 : 60;
      const sclY = i >= 2 && i < seq.length - 2 ? 130 : 90;
      sdaPts.push([x0, sdaY], [x1, sdaY]);
      sclPts.push([x0, sclY], [x1, sclY]);
    });
    return { seq, sdaPath: poly(sdaPts), sclPath: poly(sclPts), step };
  }, [addrByte, dataByte]);

  const spi = useMemo(() => {
    const dataBits = bitsMSB(dataByte, 8);
    const slots = 2 + 8 * 2 + 2;
    const step = W / slots;
    const csPath = poly([
      [0, 20],
      [step, 20],
      [step, 60],
      [W - step, 60],
      [W - step, 20],
      [W, 20],
    ]);
    const sckPts: [number, number][] = [[0, 130]];
    const mosiPts: [number, number][] = [[0, 210]];
    for (let i = 0; i < 8; i++) {
      const x = step + i * 2 * step;
      sckPts.push([x, 130], [x + step, 130], [x + step, 90], [x + 2 * step, 90], [x + 2 * step, 130]);
      const my = dataBits[i] ? 170 : 210;
      mosiPts.push([x, my], [x + 2 * step, my]);
    }
    sckPts.push([W, 130]);
    mosiPts.push([W, 210]);
    return { dataBits, csPath, sckPath: poly(sckPts), mosiPath: poly(mosiPts), step };
  }, [dataByte]);

  const uart = useMemo(() => {
    const bits = [1, 0, ...bitsLSB(dataByte, 8), 1, 1];
    const step = W / bits.length;
    const pts: [number, number][] = [];
    bits.forEach((b, i) => {
      const x0 = i * step;
      const x1 = (i + 1) * step;
      const y = b ? 40 : 100;
      pts.push([x0, y], [x1, y]);
    });
    return { bits, path: poly(pts), step };
  }, [dataByte]);

  const decoded =
    proto === "i2c"
      ? `addr=0x${addr.toUpperCase()} write 0x${data.toUpperCase()}`
      : proto === "spi"
        ? `MOSI 0x${data.toUpperCase()} (${dataByte.toString(2).padStart(8, "0")})`
        : `start | ${dataByte.toString(2).padStart(8, "0")} (LSB first, 0x${data.toUpperCase()}) | stop`;

  const vbH = proto === "spi" ? 240 : proto === "uart" ? 140 : 160;

  return (
    <DemoFrame
      title="Bus traffic simulator"
      readouts={<Readout label={proto.toUpperCase()} value="" />}
      controls={
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-muted">Protocol</span>
            <Seg<Proto>
              value={proto}
              onChange={setProto}
              options={[
                { value: "i2c", label: "I²C" },
                { value: "spi", label: "SPI" },
                { value: "uart", label: "UART" },
              ]}
            />
          </div>
          {proto === "i2c" && (
            <HexInput label="Addr (hex)" value={addr} onChange={setAddr} />
          )}
          <HexInput label="Data (hex)" value={data} onChange={setData} />
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${vbH}`} className="w-full block">
        {proto === "i2c" && (
          <>
            <text x={0} y={12} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
              SDA
            </text>
            <text x={0} y={82} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
              SCL
            </text>
            <path d={i2c.sdaPath} stroke="var(--color-accent)" strokeWidth={1.6} fill="none" />
            <path d={i2c.sclPath} stroke="var(--color-amber)" strokeWidth={1.6} fill="none" />
            {i2c.seq.map((f, i) =>
              f.label ? (
                <text
                  key={i}
                  x={i * i2c.step + 2}
                  y={155}
                  fontFamily="var(--font-mono)"
                  fontSize="8.5"
                  fill={
                    f.label === "START" || f.label === "STOP"
                      ? "var(--color-accent)"
                      : "var(--color-faint)"
                  }
                >
                  {f.label}
                </text>
              ) : null,
            )}
          </>
        )}
        {proto === "spi" && (
          <>
            <text x={0} y={12} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
              CS
            </text>
            <text x={0} y={82} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
              SCK
            </text>
            <text x={0} y={162} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
              MOSI
            </text>
            <path d={spi.csPath} stroke="var(--color-rose)" strokeWidth={1.6} fill="none" />
            <path d={spi.sckPath} stroke="var(--color-amber)" strokeWidth={1.6} fill="none" />
            <path d={spi.mosiPath} stroke="var(--color-accent)" strokeWidth={1.6} fill="none" />
            {spi.dataBits.map((b, i) => (
              <text
                key={i}
                x={spi.step * (1 + 2 * i) + spi.step / 2}
                y={235}
                fontFamily="var(--font-mono)"
                fontSize="10"
                fill="var(--color-accent)"
                textAnchor="middle"
              >
                {b}
              </text>
            ))}
          </>
        )}
        {proto === "uart" && (
          <>
            <text x={0} y={32} fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
              TX
            </text>
            <path d={uart.path} stroke="var(--color-accent)" strokeWidth={1.6} fill="none" />
            {uart.bits.map((_, i) => {
              const labels = ["idle", "start", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "stop", "idle"];
              const lbl = labels[i];
              return (
                <text
                  key={i}
                  x={uart.step * i + uart.step / 2}
                  y={130}
                  fontFamily="var(--font-mono)"
                  fontSize="9"
                  fill={lbl === "start" || lbl === "stop" ? "var(--color-accent)" : "var(--color-muted)"}
                  textAnchor="middle"
                >
                  {lbl}
                </text>
              );
            })}
          </>
        )}
      </svg>

      <div className="mt-4 px-3.5 py-2.5 bg-bg border border-line rounded font-mono font-mono-features text-[12px] text-text-2">
        <span className="text-faint">decoded → </span>
        <span className="text-accent">{decoded}</span>
      </div>
    </DemoFrame>
  );
}

function HexInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between text-[12px] text-muted">
        <span>{label}</span>
        <span className="font-mono font-mono-features text-text-2">0x{value.toUpperCase()}</span>
      </span>
      <input
        type="text"
        value={value}
        maxLength={2}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9a-fA-F]/g, ""))}
        className="bg-bg border border-line rounded px-2 py-1 font-mono font-mono-features text-[13px] text-text focus:border-accent/40 outline-0 transition-colors"
      />
    </label>
  );
}
