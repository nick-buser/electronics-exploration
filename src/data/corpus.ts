import {
  type Archetype,
  type Comparison,
  type Component,
  type Domain,
  type Entry,
  type EntryType,
  type Journal,
  type Principle,
  type Project,
  type Tool,
} from "./schemas";

export const DOMAINS: Domain[] = [
  { type: "domain", slug: "robotics", title: "Robotics", deck: "Actuation, kinematics, sensor fusion, control. The integrator domain." },
  { type: "domain", slug: "ee", title: "Electrical Eng.", deck: "Power, signal, components. The substrate everything else stands on." },
  { type: "domain", slug: "firmware", title: "Firmware", deck: "Bare-metal C, RTOS, peripherals, bus protocols. Software meets metal." },
  { type: "domain", slug: "fpga", title: "Digital Logic / FPGA", deck: "Hardware that's described, not run. Where parallel becomes the default." },
  { type: "domain", slug: "mech", title: "3D Printing & Mech.", deck: "Bodies, brackets, jigs, tolerances. The mechanical iteration layer." },
  { type: "domain", slug: "net", title: "Networking & Infra", deck: "VLANs, telemetry, self-hosted control planes. Connective tissue." },
  { type: "domain", slug: "bio", title: "Bioware", deck: "Biosignals, instruments, wet-dry interfaces. Sensors with consequences." },
  { type: "domain", slug: "bench", title: "Bench & Tools", deck: "The dev environment of physical computing. Where mistakes become knowledge." },
  { type: "domain", slug: "ai", title: "AI & Autonomy", deck: "Perception, planning, anomaly detection grounded in real sensors." },
];

export const ARCHETYPES: Archetype[] = [
  { type: "archetype", slug: "the-arm", title: "The Arm", domain: "robotics", analog: "≈ AUTH SYSTEM", deck: "Joints, kinematics, the gap between commanded and actual position. The first robotics project worth finishing." },
  { type: "archetype", slug: "the-walker", title: "The Walker", domain: "robotics", analog: "≈ DISTRIBUTED SYSTEM", deck: "Coordinated actuators maintaining a global property — balance — through local decisions." },
  { type: "archetype", slug: "the-rover", title: "The Mobile Base", domain: "robotics", analog: "≈ DATABASE", deck: "A platform you build on. Quietly unremarkable; powerful in what it enables." },
  { type: "archetype", slug: "the-drone", title: "The Drone", domain: "robotics", analog: "≈ REAL-TIME SYSTEM", deck: "Hard latency budgets, lethal failure modes, state estimation under noise." },
  { type: "archetype", slug: "the-board", title: "The Custom Board", domain: "ee", analog: "≈ FIRST WEB APP", deck: "Schematic to layout to fab to bring-up. The moment your own silicon boots." },
  { type: "archetype", slug: "the-cpu", title: "The Soft CPU", domain: "fpga", analog: "≈ COMPILER FROM SCRATCH", deck: "A working RISC-V on FPGA is the 'I wrote a compiler' moment for hardware." },
  { type: "archetype", slug: "the-instrument", title: "The Instrument", domain: "bio", analog: "≈ INFRASTRUCTURE", deck: "An ECG, scope, microscope: a sensor with enough rigor to be trusted." },
  { type: "archetype", slug: "the-bioreactor", title: "The Bioreactor", domain: "bio", analog: "≈ FULL-STACK APP", deck: "Every layer matters — fluidics, mechanics, firmware, networked control, data." },
];

export const PROJECTS: Project[] = [
  { type: "project", slug: "p-so-arm100", title: "SO-ARM100 build", domain: "robotics", tier: "T2", status: "building", archetype: "the-arm", deck: "Hugging Face LeRobot 6-DOF teleop arm. ~$120 in parts, Dynamixel-style serial servos. Spine project for ML/teleop work.", cost: "$180", started: "2026-04-12" },
  { type: "project", slug: "p-bench-psu", title: "Bench harness kit", domain: "bench", tier: "T1", status: "done", archetype: null, deck: "Labeled banana/barrel/JST leads with inline fuses. The bench equivalent of known-good cables.", cost: "$45", started: "2026-03-02" },
  { type: "project", slug: "p-ecg-monitor", title: "AD8232 ECG monitor", domain: "bio", tier: "T1", status: "planned", archetype: "the-instrument", deck: "Front-end + isolated ESP32 + small OLED. Your own heart on a screen, with disciplined filtering." },
  { type: "project", slug: "p-rp2040-breakout", title: "RP2040 breakout v1", domain: "ee", tier: "T2", status: "building", archetype: "the-board", deck: "USB-C, LDO, status LED, broken-out GPIO. The first board to learn KiCad → JLCPCB end-to-end.", cost: "$35", started: "2026-05-01" },
  { type: "project", slug: "p-balancing-bot", title: "Two-wheel balancer", domain: "robotics", tier: "T2", status: "planned", archetype: null, deck: "IMU + geared motors. Tunes a real PID loop while it tries not to fall over." },
  { type: "project", slug: "p-voron", title: "Voron 2.4 build", domain: "mech", tier: "T4", status: "shelved", archetype: null, deck: "Self-built CoreXY printer. ~150 hours assembly, every layer of mechatronics in one box." },
  { type: "project", slug: "p-pioreactor", title: "Pioreactor mini", domain: "bio", tier: "T3", status: "planned", archetype: "the-bioreactor", deck: "Stirring, OD sensing, peristaltic dosing. The bioware integration archetype." },
  { type: "project", slug: "p-soft-riscv", title: "RV32I on Tang Nano", domain: "fpga", tier: "T3", status: "planned", archetype: "the-cpu", deck: "Synthesize a small RISC-V core, run C code on it. The 'I made a CPU' moment." },
];

export const COMPONENTS: Component[] = [
  { type: "component", slug: "c-555", title: "NE555 timer", domain: "ee", deck: "The iconic 8-pin IC. Astable, monostable, and the calibration of period-from-RC instinct." },
  { type: "component", slug: "c-esp32", title: "ESP32", domain: "firmware", deck: "Dual-core Xtensa + Wi-Fi + BLE. The default 'connected thing' MCU." },
  { type: "component", slug: "c-rp2040", title: "RP2040", domain: "firmware", deck: "Raspberry Pi's dual M0+ with programmable IO. Cheap, well-documented, weird in pleasant ways." },
  { type: "component", slug: "c-stm32", title: "STM32 family", domain: "firmware", deck: "The industrial standard for ARM Cortex-M. Heavy docs, every peripheral you've heard of." },
  { type: "component", slug: "c-nrf52840", title: "nRF52840", domain: "firmware", deck: "Nordic's BLE 5 / Thread / Zigbee workhorse. Cortex-M4F with the radio Bluetooth Classic forgot." },
  { type: "component", slug: "c-ad8232", title: "AD8232", domain: "bio", deck: "Single-lead ECG analog front-end. Right-leg drive, instrumentation amp, the works." },
  { type: "component", slug: "c-drv8323", title: "DRV8323", domain: "ee", deck: "3-phase smart gate driver. The chip behind credible field-oriented BLDC control." },
  { type: "component", slug: "c-ads1299", title: "ADS1299", domain: "bio", deck: "8-channel 24-bit Σ-Δ ADC built for EEG. Low-noise, high-impedance, the heart of OpenBCI." },
  { type: "component", slug: "c-ina219", title: "INA219", domain: "ee", deck: "I²C current/voltage shunt monitor. The cheap way to see what your circuit is actually drawing." },
  { type: "component", slug: "c-1n4148", title: "1N4148", domain: "ee", deck: "The default small-signal switching diode. ~4 ns recovery, ~700 mV forward drop, in every parts bin worth having." },
  { type: "component", slug: "c-2n3904", title: "2N3904 NPN", domain: "ee", deck: "Workhorse small-signal NPN transistor. β ≈ 200, 40V/200mA, TO-92 — the default first BJT in a lot of designs." },
  { type: "component", slug: "c-2n7000", title: "2N7000 NMOS", domain: "ee", deck: "Small-signal N-channel enhancement MOSFET. Vth ≈ 1.5V, drives 200mA. Cheap, common, TO-92 — what you reach for when an MCU pin can't sink enough current." },
  { type: "component", slug: "c-led", title: "LED", domain: "ee", deck: "The first peripheral every engineer wires up. A pn junction that emits photons instead of heat. Get the current-limit resistor right and everything else follows." },
  { type: "component", slug: "c-pushbutton", title: "Pushbutton", domain: "ee", deck: "Two pieces of metal that touch when you press them. Add a pull-up and a debouncer and you've got reliable digital input." },
  { type: "component", slug: "c-bme280", title: "BME280", domain: "ee", deck: "Bosch's three-in-one I²C sensor. Temperature, humidity, barometric pressure on one chip — and altitude almost for free." },
  { type: "component", slug: "c-mpu6050", title: "MPU6050", domain: "ee", deck: "6-DoF MEMS IMU on every $2 module. Three-axis accelerometer + three-axis gyroscope on one I²C die. Bring your own sensor fusion." },
  { type: "component", slug: "c-bno055", title: "BNO055", domain: "ee", deck: "Bosch's 9-DoF IMU with sensor fusion built in. Outputs quaternions and Euler angles — no Kalman filter for you to write." },
  { type: "component", slug: "c-ov2640", title: "OV2640", domain: "ee", deck: "OmniVision's 2 MP CMOS image sensor. The chip inside every ESP32-CAM. Parallel DVP data + SCCB control on one tiny module." },
  { type: "component", slug: "c-dc-motor", title: "Brushed DC motor + TB6612FNG", domain: "ee", deck: "A coil, a magnet, and a mechanical commutator. The whole drive chain: motor physics, H-bridge driver, PWM speed control, and back-EMF protection." },
  { type: "component", slug: "c-stepper", title: "Stepper motor + A4988", domain: "ee", deck: "Position control without a feedback loop. Bipolar stepper physics, microstepping, current limiting via V_REF, and the canonical step/dir interface." },
];

export const TOOLS: Tool[] = [
  { type: "tool", slug: "t-multimeter", title: "Digital multimeter", domain: "bench", deck: "Voltage, current, continuity, resistance. The first instrument and the most used." },
  { type: "tool", slug: "t-oscilloscope", title: "Oscilloscope", domain: "bench", deck: "Voltage over time. Where 'is it oscillating?' becomes a visible answer." },
  { type: "tool", slug: "t-logic-analyzer", title: "Logic analyzer", domain: "bench", deck: "Many-channel digital capture with protocol decoding. I²C bugs become readable." },
  { type: "tool", slug: "t-bench-psu", title: "Bench power supply", domain: "bench", deck: "Adjustable V and I limit. Current-limiting is the single best habit." },
  { type: "tool", slug: "t-hot-air", title: "Hot air rework", domain: "bench", deck: "For SMD assembly, rework, and removing chips without lifting pads." },
  { type: "tool", slug: "t-soldering", title: "Soldering iron", domain: "bench", deck: "Temperature-controlled, with proper tips. The bench's most personal tool." },
];

export const PRINCIPLES: Principle[] = [
  { type: "principle", slug: "pr-pwm", title: "PWM", domain: "ee", deck: "Duty cycle as a knob. Average voltage from a digital pin, motor speed from a transistor." },
  { type: "principle", slug: "pr-pid", title: "PID control", domain: "robotics", deck: "The proportional-integral-derivative loop, tuned by feel, justified by theory." },
  { type: "principle", slug: "pr-decoupling", title: "Decoupling capacitors", domain: "ee", deck: "Local energy reservoirs near every IC. The reason your board doesn't reset under load." },
  { type: "principle", slug: "pr-ground-bounce", title: "Ground bounce", domain: "ee", deck: "When 'ground' isn't, and switching transients corrupt your reference." },
  { type: "principle", slug: "pr-i2c", title: "I²C bus", domain: "firmware", deck: "Two wires, many devices, pull-ups not optional. The default chatty bus." },
  { type: "principle", slug: "pr-spi", title: "SPI bus", domain: "firmware", deck: "Four wires, fast, point-to-point. When I²C is too slow." },
  { type: "principle", slug: "pr-uart", title: "UART", domain: "firmware", deck: "Async serial. The bus everyone learned first and reaches for last." },
  { type: "principle", slug: "pr-kinematics", title: "Forward & inverse kinematics", domain: "robotics", deck: "Joint angles to tool position, and back. The arm's coordinate-frame math." },
  { type: "principle", slug: "pr-slam", title: "SLAM", domain: "robotics", deck: "Simultaneous localization and mapping. Two unknowns, solved together." },
  { type: "principle", slug: "pr-fft", title: "FFT & spectra", domain: "bio", deck: "Time → frequency. Where biosignal artifacts and band powers become legible." },
  { type: "principle", slug: "pr-opamp", title: "Op-amp", domain: "ee", deck: "Near-ideal feedback amplifier. Two resistors set the gain; the silicon takes care of everything else." },
  { type: "principle", slug: "pr-schmitt", title: "Schmitt trigger & hysteresis", domain: "ee", deck: "A comparator with two different trip points. The dead band between them is what makes relaxation oscillators (and the 555) work." },
];

export const COMPARISONS: Comparison[] = [
  { type: "comparison", slug: "cmp-motors", title: "Stepper vs servo vs BLDC", domain: "robotics", deck: "Three motor types, three failure modes, three control philosophies." },
  { type: "comparison", slug: "cmp-mcu", title: "ESP32 vs RP2040 vs STM32", domain: "firmware", deck: "When you reach for which microcontroller, and why." },
  { type: "comparison", slug: "cmp-batteries", title: "Li-ion vs LiPo vs LiFePO4", domain: "ee", deck: "Energy density vs safety vs cycle life. Pick your tradeoff." },
  { type: "comparison", slug: "cmp-printers", title: "Bambu vs Voron vs Prusa", domain: "mech", deck: "Three philosophies of FDM: appliance, kit-as-craft, and the middle path." },
  { type: "comparison", slug: "cmp-cad", title: "Fusion 360 vs Onshape vs FreeCAD", domain: "mech", deck: "Parametric CAD options for personal use, ranked on lock-in and capability." },
];

export const JOURNAL: Journal[] = [
  { type: "journal", slug: "j-2026-05-18", title: "SO-ARM100 — frame printed, joints sloppy", date: "2026-05-18", project: "p-so-arm100", deck: "Joint 3 has visible backlash. Reprinted at 30% gyroid, oriented vertically." },
  { type: "journal", slug: "j-2026-05-10", title: "RP2040 breakout — gerbers off to JLCPCB", date: "2026-05-10", project: "p-rp2040-breakout", deck: "Final DRC clean. Decoupling caps placed before route. Ordered 5x ENIG." },
  { type: "journal", slug: "j-2026-04-22", title: "Bench harness kit — last cable labelled", date: "2026-04-22", project: "p-bench-psu", deck: "All barrel adapters now have inline fuses sized to load. Closing out." },
];

export const TYPE_META: Record<EntryType, { label: string; group: string }> = {
  domain: { label: "Domain", group: "Domains" },
  archetype: { label: "Archetype", group: "Archetypes" },
  project: { label: "Project", group: "Projects" },
  component: { label: "Component", group: "Components" },
  tool: { label: "Tool", group: "Tools / instruments" },
  principle: { label: "Principle", group: "Principles & patterns" },
  comparison: { label: "Comparison", group: "Comparisons" },
  journal: { label: "Journal", group: "Journal" },
};

export const ENTRIES: Entry[] = [
  ...DOMAINS,
  ...ARCHETYPES,
  ...PROJECTS,
  ...COMPONENTS,
  ...TOOLS,
  ...PRINCIPLES,
  ...COMPARISONS,
  ...JOURNAL,
];

export const BY_SLUG: Record<string, Entry> = Object.fromEntries(
  ENTRIES.map((e) => [e.slug, e]),
);

export function tierLabel(t: string | undefined): string {
  return ({ T1: "Entry", T2: "Core", T3: "Bridge", T4: "Hard" } as const)[
    t as "T1" | "T2" | "T3" | "T4"
  ] ?? "";
}
