/* ──────────────────────────────────────────────────────────
   CORPUS — every slug in the atlas
   Each entry has: slug, type, title, domain, tier, deck, tags
   The page body lives in pages.jsx, keyed by slug.
   ────────────────────────────────────────────────────────── */

const DOMAINS = [
  { slug: "robotics",   title: "Robotics",          deck: "Actuation, kinematics, sensor fusion, control. The integrator domain." },
  { slug: "ee",         title: "Electrical Eng.",   deck: "Power, signal, components. The substrate everything else stands on." },
  { slug: "firmware",   title: "Firmware",          deck: "Bare-metal C, RTOS, peripherals, bus protocols. Software meets metal." },
  { slug: "fpga",       title: "Digital Logic / FPGA", deck: "Hardware that's described, not run. Where parallel becomes the default." },
  { slug: "mech",       title: "3D Printing & Mech.", deck: "Bodies, brackets, jigs, tolerances. The mechanical iteration layer." },
  { slug: "net",        title: "Networking & Infra", deck: "VLANs, telemetry, self-hosted control planes. Connective tissue." },
  { slug: "bio",        title: "Bioware",           deck: "Biosignals, instruments, wet-dry interfaces. Sensors with consequences." },
  { slug: "bench",      title: "Bench & Tools",     deck: "The dev environment of physical computing. Where mistakes become knowledge." },
  { slug: "ai",         title: "AI & Autonomy",     deck: "Perception, planning, anomaly detection grounded in real sensors." },
];

const ARCHETYPES = [
  { slug: "the-arm",       title: "The Arm",        domain: "robotics", analog: "≈ AUTH SYSTEM", deck: "Joints, kinematics, the gap between commanded and actual position. The first robotics project worth finishing." },
  { slug: "the-walker",    title: "The Walker",     domain: "robotics", analog: "≈ DISTRIBUTED SYSTEM", deck: "Coordinated actuators maintaining a global property — balance — through local decisions." },
  { slug: "the-rover",     title: "The Mobile Base",domain: "robotics", analog: "≈ DATABASE",     deck: "A platform you build on. Quietly unremarkable; powerful in what it enables." },
  { slug: "the-drone",     title: "The Drone",      domain: "robotics", analog: "≈ REAL-TIME SYSTEM", deck: "Hard latency budgets, lethal failure modes, state estimation under noise." },
  { slug: "the-board",     title: "The Custom Board", domain: "ee",     analog: "≈ FIRST WEB APP", deck: "Schematic to layout to fab to bring-up. The moment your own silicon boots." },
  { slug: "the-cpu",       title: "The Soft CPU",   domain: "fpga",     analog: "≈ COMPILER FROM SCRATCH", deck: "A working RISC-V on FPGA is the 'I wrote a compiler' moment for hardware." },
  { slug: "the-instrument",title: "The Instrument", domain: "bio",      analog: "≈ INFRASTRUCTURE", deck: "An ECG, scope, microscope: a sensor with enough rigor to be trusted." },
  { slug: "the-bioreactor",title: "The Bioreactor", domain: "bio",      analog: "≈ FULL-STACK APP", deck: "Every layer matters — fluidics, mechanics, firmware, networked control, data." },
];

const PROJECTS = [
  // Active spine + a couple satellites — leave many empty for you to grow into.
  { slug: "p-so-arm100",    title: "SO-ARM100 build",      domain: "robotics", tier: "T2", status: "building",
    archetype: "the-arm",
    deck: "Hugging Face LeRobot 6-DOF teleop arm. ~$120 in parts, Dynamixel-style serial servos. Spine project for ML/teleop work.",
    cost: "$180", started: "2026-04-12" },
  { slug: "p-bench-psu",    title: "Bench harness kit",    domain: "bench",    tier: "T1", status: "done",
    archetype: null,
    deck: "Labeled banana/barrel/JST leads with inline fuses. The bench equivalent of known-good cables.",
    cost: "$45", started: "2026-03-02" },
  { slug: "p-ecg-monitor",  title: "AD8232 ECG monitor",   domain: "bio",      tier: "T1", status: "planned",
    archetype: "the-instrument",
    deck: "Front-end + isolated ESP32 + small OLED. Your own heart on a screen, with disciplined filtering." },
  { slug: "p-rp2040-breakout", title: "RP2040 breakout v1", domain: "ee",      tier: "T2", status: "building",
    archetype: "the-board",
    deck: "USB-C, LDO, status LED, broken-out GPIO. The first board to learn KiCad → JLCPCB end-to-end.",
    cost: "$35", started: "2026-05-01" },
  { slug: "p-balancing-bot", title: "Two-wheel balancer",  domain: "robotics", tier: "T2", status: "planned",
    archetype: null,
    deck: "IMU + geared motors. Tunes a real PID loop while it tries not to fall over." },
  { slug: "p-voron",        title: "Voron 2.4 build",      domain: "mech",     tier: "T4", status: "shelved",
    archetype: null,
    deck: "Self-built CoreXY printer. ~150 hours assembly, every layer of mechatronics in one box." },
  { slug: "p-pioreactor",   title: "Pioreactor mini",      domain: "bio",      tier: "T3", status: "planned",
    archetype: "the-bioreactor",
    deck: "Stirring, OD sensing, peristaltic dosing. The bioware integration archetype." },
  { slug: "p-soft-riscv",   title: "RV32I on Tang Nano",   domain: "fpga",     tier: "T3", status: "planned",
    archetype: "the-cpu",
    deck: "Synthesize a small RISC-V core, run C code on it. The 'I made a CPU' moment." },
];

const COMPONENTS = [
  { slug: "c-555",       title: "NE555 timer",      domain: "ee",     deck: "The iconic 8-pin IC. Astable, monostable, and the calibration of period-from-RC instinct." },
  { slug: "c-esp32",     title: "ESP32",            domain: "firmware", deck: "Dual-core Xtensa + Wi-Fi + BLE. The default 'connected thing' MCU." },
  { slug: "c-rp2040",    title: "RP2040",           domain: "firmware", deck: "Raspberry Pi's dual M0+ with programmable IO. Cheap, well-documented, weird in pleasant ways." },
  { slug: "c-stm32",     title: "STM32 family",     domain: "firmware", deck: "The industrial standard for ARM Cortex-M. Heavy docs, every peripheral you've heard of." },
  { slug: "c-ad8232",    title: "AD8232",           domain: "bio",    deck: "Single-lead ECG analog front-end. Right-leg drive, instrumentation amp, the works." },
  { slug: "c-drv8323",   title: "DRV8323",          domain: "ee",     deck: "3-phase smart gate driver. The chip behind credible field-oriented BLDC control." },
  { slug: "c-ads1299",   title: "ADS1299",          domain: "bio",    deck: "8-channel 24-bit Σ-Δ ADC built for EEG. Low-noise, high-impedance, the heart of OpenBCI." },
  { slug: "c-ina219",    title: "INA219",           domain: "ee",     deck: "I²C current/voltage shunt monitor. The cheap way to see what your circuit is actually drawing." },
];

const TOOLS = [
  { slug: "t-multimeter",      title: "Digital multimeter", domain: "bench", deck: "Voltage, current, continuity, resistance. The first instrument and the most used." },
  { slug: "t-oscilloscope",    title: "Oscilloscope",       domain: "bench", deck: "Voltage over time. Where 'is it oscillating?' becomes a visible answer." },
  { slug: "t-logic-analyzer",  title: "Logic analyzer",     domain: "bench", deck: "Many-channel digital capture with protocol decoding. I²C bugs become readable." },
  { slug: "t-bench-psu",       title: "Bench power supply", domain: "bench", deck: "Adjustable V and I limit. Current-limiting is the single best habit." },
  { slug: "t-hot-air",         title: "Hot air rework",     domain: "bench", deck: "For SMD assembly, rework, and removing chips without lifting pads." },
  { slug: "t-soldering",       title: "Soldering iron",     domain: "bench", deck: "Temperature-controlled, with proper tips. The bench's most personal tool." },
];

const PRINCIPLES = [
  { slug: "pr-pwm",        title: "PWM",                  domain: "ee",     deck: "Duty cycle as a knob. Average voltage from a digital pin, motor speed from a transistor." },
  { slug: "pr-pid",        title: "PID control",          domain: "robotics", deck: "The proportional-integral-derivative loop, tuned by feel, justified by theory." },
  { slug: "pr-decoupling", title: "Decoupling capacitors", domain: "ee",    deck: "Local energy reservoirs near every IC. The reason your board doesn't reset under load." },
  { slug: "pr-ground-bounce", title: "Ground bounce",    domain: "ee",     deck: "When 'ground' isn't, and switching transients corrupt your reference." },
  { slug: "pr-i2c",        title: "I²C bus",              domain: "firmware", deck: "Two wires, many devices, pull-ups not optional. The default chatty bus." },
  { slug: "pr-spi",        title: "SPI bus",              domain: "firmware", deck: "Four wires, fast, point-to-point. When I²C is too slow." },
  { slug: "pr-uart",       title: "UART",                 domain: "firmware", deck: "Async serial. The bus everyone learned first and reaches for last." },
  { slug: "pr-kinematics", title: "Forward & inverse kinematics", domain: "robotics", deck: "Joint angles to tool position, and back. The arm's coordinate-frame math." },
  { slug: "pr-slam",       title: "SLAM",                 domain: "robotics", deck: "Simultaneous localization and mapping. Two unknowns, solved together." },
  { slug: "pr-fft",        title: "FFT & spectra",        domain: "bio",    deck: "Time → frequency. Where biosignal artifacts and band powers become legible." },
];

const COMPARISONS = [
  { slug: "cmp-motors",   title: "Stepper vs servo vs BLDC", domain: "robotics", deck: "Three motor types, three failure modes, three control philosophies." },
  { slug: "cmp-mcu",      title: "ESP32 vs RP2040 vs STM32", domain: "firmware", deck: "When you reach for which microcontroller, and why." },
  { slug: "cmp-batteries",title: "Li-ion vs LiPo vs LiFePO4", domain: "ee",     deck: "Energy density vs safety vs cycle life. Pick your tradeoff." },
  { slug: "cmp-printers", title: "Bambu vs Voron vs Prusa",  domain: "mech",   deck: "Three philosophies of FDM: appliance, kit-as-craft, and the middle path." },
  { slug: "cmp-cad",      title: "Fusion 360 vs Onshape vs FreeCAD", domain: "mech", deck: "Parametric CAD options for personal use, ranked on lock-in and capability." },
];

const JOURNAL = [
  { slug: "j-2026-05-18", title: "SO-ARM100 — frame printed, joints sloppy",
    date: "2026-05-18", project: "p-so-arm100",
    deck: "Joint 3 has visible backlash. Reprinted at 30% gyroid, oriented vertically." },
  { slug: "j-2026-05-10", title: "RP2040 breakout — gerbers off to JLCPCB",
    date: "2026-05-10", project: "p-rp2040-breakout",
    deck: "Final DRC clean. Decoupling caps placed before route. Ordered 5x ENIG." },
  { slug: "j-2026-04-22", title: "Bench harness kit — last cable labelled",
    date: "2026-04-22", project: "p-bench-psu",
    deck: "All barrel adapters now have inline fuses sized to load. Closing out." },
];

/* ──────────────────────────────────────────────────────────
   Page-type metadata — used by the renderer + palette
   ────────────────────────────────────────────────────────── */
const TYPES = {
  domain:     { label: "Domain",     color: "var(--accent)", group: "Domains" },
  archetype:  { label: "Archetype",  color: "var(--accent)", group: "Archetypes" },
  project:    { label: "Project",    color: "var(--accent)", group: "Projects" },
  component:  { label: "Component",  color: "var(--accent)", group: "Components" },
  tool:       { label: "Tool",       color: "var(--accent)", group: "Tools / instruments" },
  principle:  { label: "Principle",  color: "var(--accent)", group: "Principles & patterns" },
  comparison: { label: "Comparison", color: "var(--accent)", group: "Comparisons" },
  journal:    { label: "Journal",    color: "var(--accent)", group: "Journal" },
};

/* ──────────────────────────────────────────────────────────
   Flatten everything to one searchable index.
   ────────────────────────────────────────────────────────── */
const ENTRIES = [
  ...DOMAINS.map(d => ({ ...d, type: "domain" })),
  ...ARCHETYPES.map(a => ({ ...a, type: "archetype" })),
  ...PROJECTS.map(p => ({ ...p, type: "project" })),
  ...COMPONENTS.map(c => ({ ...c, type: "component" })),
  ...TOOLS.map(t => ({ ...t, type: "tool" })),
  ...PRINCIPLES.map(p => ({ ...p, type: "principle" })),
  ...COMPARISONS.map(c => ({ ...c, type: "comparison" })),
  ...JOURNAL.map(j => ({ ...j, type: "journal" })),
];

const BY_SLUG = Object.fromEntries(ENTRIES.map(e => [e.slug, e]));

/* Expose globally to other Babel scripts */
Object.assign(window, {
  DOMAINS, ARCHETYPES, PROJECTS, COMPONENTS, TOOLS, PRINCIPLES, COMPARISONS, JOURNAL,
  TYPES, ENTRIES, BY_SLUG,
});
