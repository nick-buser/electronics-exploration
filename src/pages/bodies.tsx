import type { ReactNode } from "react";
import { Callout, Compare, ImageSlot, SpecTable } from "./elements";
import { CodeBlock } from "@/components/code/CodeBlock";
import { RcPwmDemo } from "@/circuits/RcPwmDemo";
import { DecouplingZDemo } from "@/circuits/DecouplingZDemo";
import { DemoPWM } from "@/demos/DemoPWM";
import { DemoBus } from "@/demos/DemoBus";
import { DemoPID } from "@/demos/DemoPID";
import { DemoMotors } from "@/demos/DemoMotors";
import { DemoBattery } from "@/demos/DemoBattery";
import { DemoBench } from "@/demos/DemoBench";

type Body = () => ReactNode;

export const DomainBodies: Record<string, Body> = {
  robotics: () => (
    <>
      <p>
        Robotics is the integrator domain. It forces mechanics, electronics, firmware, control theory, software architecture,
        sensing, calibration, and safety into one visible system. A robotic arm is the full-stack web app of hardware learning —
        approachable enough to build, complex enough to reveal real constraints.
      </p>
      <p>
        The path here goes from <a href="#/the-arm">kinematic arms</a> through <a href="#/the-walker">walkers</a> and{" "}
        <a href="#/the-rover">mobile bases</a> to <a href="#/the-drone">real-time flight</a>. Most builders shouldn't pick a
        single archetype — they should build a small version of each and let the patterns transfer.
      </p>
      <Callout label="// stack you'll end up in">
        Python or C++ at the host layer, ROS2 or LeRobot for orchestration, micro-ROS or bare Arduino at the joint level,
        Klipper-style real-time loops where motion matters, and PyTorch/JAX for any learned policy.
      </Callout>
    </>
  ),
  ee: () => (
    <>
      <p>
        If robotics is about making things move, EE is about making things not catch fire while moving. The progression:
        breadboards (anyone can wire), schematic capture (now you think in symbols), PCB layout (now you can ship). KiCad is free
        and professional; JLCPCB turns gerbers into populated boards for the price of lunch.
      </p>
      <p>
        Watch <a href="#/pr-decoupling">decoupling</a>, <a href="#/pr-ground-bounce">ground bounce</a>, and the gap between a
        working breadboard and a working PCB. Most "weird intermittent" bugs in hardware live in that gap.
      </p>
    </>
  ),
  firmware: () => (
    <>
      <p>
        Where software meets the metal. Registers, interrupts, DMA, and the slow process of learning that <code>while(1)</code>{" "}
        is sometimes the right architecture. Most people start with Arduino's abstractions, then peel them back — the progression
        isn't just complexity, it's <em>removing</em> the safety net.
      </p>
    </>
  ),
  mech: () => (
    <p>
      3D printing collapses the mechanical iteration loop from weeks to hours. The skill isn't operating the printer — it's
      designing <em>for</em> additive manufacturing: overhangs, layer adhesion, snap fits, threaded inserts, tolerances that
      print true.
    </p>
  ),
  bio: () => (
    <>
      <p>
        The health-facing extension of physical computing. Sensors, signals, experiments, measurement quality, safety, data
        interpretation. Stay non-medical and instrumentation-focused: learn to acquire signals, validate them, log them, and
        reason about noise before chasing conclusions.
      </p>
      <Callout kind="warn" label="⚠ safety">
        Avoid mains-connected body circuits. Galvanic isolation is non-negotiable. Treat anything you record as exploratory data,
        not diagnosis.
      </Callout>
    </>
  ),
  bench: () => (
    <p>
      The bench is the dev environment of physical computing — instruments, fixtures, safe defaults, known-good references, and
      a workflow for isolating failure. Bench discipline is foundational; current-limit first, inspect polarity, verify grounds,
      test subassemblies, document known-good states.
    </p>
  ),
  net: () => (
    <p>
      The connective tissue. Once you have more than two devices that need to talk, segmentation, identity, telemetry, and
      remote access stop being optional. The shift from consumer Wi-Fi to managed networking is closer to learning a new
      language than a new tool.
    </p>
  ),
  ai: () => (
    <p>
      AI becomes useful after the lower layers produce trustworthy data and controllable actuators. The near-term goal isn't
      "robot but ChatGPT" — it's perception, anomaly detection, calibration assistance, and better human-in-the-loop control over
      instruments and robots you trust.
    </p>
  ),
  fpga: () => (
    <p>
      FPGAs are where you stop writing code that <em>runs</em> and start writing descriptions of hardware that <em>exists</em>.
      Every signal is in parallel, every clock edge is a state transition, and "performance" means "did you meet timing?"
    </p>
  ),
};

export const ArchetypeBodies: Record<string, Body> = {
  "the-arm": () => (
    <>
      <h2>Why it's the spine</h2>
      <p>
        A six-DOF arm sits at the intersection of every hardware skill: mechanical tolerance, motor selection, power delivery,
        firmware, kinematics, host protocols, calibration, control theory, and — eventually — perception and learned policy. It
        can start as a teleoperated toy and grow indefinitely.
      </p>

      <h2>What it makes legible</h2>
      <ul>
        <li>
          <strong>Backlash</strong> — the gap between commanded and actual joint angle, which dominates everything downstream
        </li>
        <li>
          <strong>Coordinate frames</strong> — the math behind "tool position" versus "joint angles"
        </li>
        <li>
          <strong>Cable routing</strong> — the invisible mechanical engineering that makes arms survive their own motion
        </li>
        <li>
          <strong>Power delivery</strong> — stall torque versus continuous torque, brownouts under transient load
        </li>
        <li>
          <strong>Latency</strong> — the chain from sensor → host → controller → motor and where it breaks
        </li>
      </ul>

      <h2>Stages of mastery</h2>
      <ol>
        <li>Joints move on command</li>
        <li>Forward kinematics: joint angles → tool position</li>
        <li>Inverse kinematics: tool position → joint angles</li>
        <li>Teleoperation with a leader arm</li>
        <li>Recorded trajectories that replay accurately</li>
        <li>Camera-guided pick-and-place</li>
        <li>Learned policy from demonstrations</li>
      </ol>

      <Callout>
        See <a href="#/pr-kinematics">kinematics</a> for the math layer, and <a href="#/cmp-motors">motor comparison</a> for the
        actuator choice.
      </Callout>
    </>
  ),
  "the-board": () => (
    <>
      <h2>Why it's a unlock</h2>
      <p>
        Once you've gone from schematic to layout to fab to bring-up once, the entire physical-products universe stops feeling
        like magic. The first time your own board enumerates over USB is qualitatively different from any tutorial.
      </p>
      <h2>What you'll learn the hard way</h2>
      <ul>
        <li>Decoupling capacitors are not optional</li>
        <li>Footprints lie until they don't</li>
        <li>Pour your ground plane, then route the small stuff</li>
        <li>DRC catches some mistakes; experience catches the rest</li>
        <li>Assembly services (JLCPCB / PCBA) save you from your own hand-soldering</li>
      </ul>
    </>
  ),
};

export const PrincipleBodies: Record<string, Body> = {
  "pr-pwm": () => (
    <>
      <h2>The idea</h2>
      <p>
        You can't easily make a microcontroller pin output 1.3V. You <em>can</em> make it output 0V or 3.3V very fast. If you
        switch between them quickly enough, anything with inertia — an LED's perception, a motor's rotor, a capacitor — sees the
        time-average. That's PWM.
      </p>
      <DemoPWM />
      <h2>In firmware</h2>
      <p>
        On most 8-bit Arduinos <code>analogWrite()</code> hands you an 8-bit duty cycle (0–255) on a fixed ~490Hz/980Hz
        carrier. The fade below is the canonical first PWM program:
      </p>
      <CodeBlock
        language="cpp"
        filename="fade.ino"
        code={`const int LED = 9;  // a PWM-capable pin (~ marked on the board)

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  // ramp up: 0 -> 255 duty
  for (int duty = 0; duty <= 255; duty++) {
    analogWrite(LED, duty);   // duty/255 average voltage
    delay(4);
  }
  // ramp down
  for (int duty = 255; duty >= 0; duty--) {
    analogWrite(LED, duty);
    delay(4);
  }
}`}
      />
      <h2>Why it works for each load</h2>
      <ul>
        <li>
          <strong>LEDs</strong> — your eye integrates over ~50ms. Switch faster than ~200Hz and brightness looks smooth.
        </li>
        <li>
          <strong>Motors</strong> — winding inductance integrates current. Switch ~20kHz+ and the rotor sees an average torque.
        </li>
        <li>
          <strong>Heaters</strong> — thermal mass integrates over seconds. Switch at 1Hz, the resistor doesn't care.
        </li>
        <li>
          <strong>Audio</strong> — class-D amplifiers PWM at 250kHz+ and rely on the speaker (and your ear) to low-pass-filter.
        </li>
      </ul>
      <h2>Watch the load integrate</h2>
      <p>
        Average voltage is a real, measurable thing — the load just has to be slow enough to see it. The circuit below is a
        live simulation: a PWM source drives a series resistor into a capacitor, exactly the low-pass filter a class-D
        amplifier or a slow DAC relies on. Push R or C up so R·C ≫ the PWM period and the capacitor's voltage flattens onto
        the duty-cycle average. Drop them and you see the raw square wave bleed through.
      </p>
      <RcPwmDemo />
      <h2>Where it breaks</h2>
      <Callout kind="warn">
        Cheap continuous-rotation servos take PWM as <em>position</em> commands, not duty cycle. Drive them at 50Hz with 1–2ms
        pulses, not arbitrary duty. Easy mistake.
      </Callout>
      <Callout kind="warn">
        PWM-driving an LED through a current-limiting resistor wastes the same power per "on" cycle. Use a proper
        constant-current driver for high-power LEDs.
      </Callout>
    </>
  ),
  "pr-pid": () => (
    <>
      <h2>The idea</h2>
      <p>
        You have a measured value (the "process variable"), a desired value (the "setpoint"), and an actuator that affects the
        world. PID is the three-term combination of how wrong you are right now (P), how wrong you've been on average (I), and
        how fast wrong is changing (D).
      </p>
      <DemoPID />
      <h2>The terms, intuitively</h2>
      <ul>
        <li>
          <strong>P (proportional)</strong> — the obvious one: push harder when you're further off. Too much and you overshoot.
        </li>
        <li>
          <strong>I (integral)</strong> — the patient one: a small persistent error accumulates and pushes back. Too much and
          you wind up oscillating.
        </li>
        <li>
          <strong>D (derivative)</strong> — the predictive one: the faster the error is closing, the harder you brake. Too much
          and you become twitchy.
        </li>
      </ul>
      <h2>Tuning workflow</h2>
      <ol>
        <li>
          Set K<sub>i</sub> and K<sub>d</sub> to zero. Raise K<sub>p</sub> until it oscillates, then back off by ~half.
        </li>
        <li>
          Add K<sub>d</sub> to damp the overshoot. The trace should round off without ringing.
        </li>
        <li>
          Add K<sub>i</sub> last and small — only enough to remove steady-state error.
        </li>
      </ol>
      <Callout>
        The demo above is a cart-pendulum, which is famously harder than most real systems. If you can balance it, your
        intuition will overshoot for normal robotics loops.
      </Callout>
    </>
  ),
  "pr-decoupling": () => (
    <>
      <h2>What the rail actually sees</h2>
      <p>
        When a fast IC switches its outputs, it pulls a sharp burst of current from V<sub>cc</sub>. The trace back to the bulk
        supply isn't a free wire — it has resistance and, more importantly, <em>inductance</em>. Inductors resist sudden current
        changes, so during that switching edge the IC sees the rail briefly sag, every other IC sharing the rail sees a glitch,
        and the logic threshold of something downstream gets violated. Decoupling caps fight this by sitting locally at each IC:
        they have charge ready to deliver before the slow path to the bulk supply can react.
      </p>
      <h2>It's not the value — it's the impedance</h2>
      <p>
        At any one switching edge, what matters is how low the path-to-ground impedance is at the frequencies in that edge. An
        ideal cap's impedance is 1/(ωC) — falling forever at 20 dB/decade. Real caps have parasitic inductance (ESL): the
        physical loop between the cap's pads and the IC's V<sub>cc</sub>/GND pins forms a tiny series inductor. That ESL turns
        the cap into a series LC, which has a <em>self-resonant frequency</em> where it briefly looks like a wire, but climbs
        again above that. The big bulk cap on the board has tons of capacitance but enough ESL that it's useless above a few
        MHz; the 100 nF ceramic next to the IC has much less capacitance but its self-resonance lives in the tens of MHz, right
        where the switching edges have most of their energy.
      </p>
      <DecouplingZDemo />
      <h2>Rules of thumb</h2>
      <ul>
        <li>
          <strong>100 nF ceramic on every V<sub>cc</sub> pin</strong>, within a few millimetres. This is the "high-frequency"
          shunt — the one fighting fast edges.
        </li>
        <li>
          <strong>One or two bulk caps per power rail</strong> (10–100 µF), tucked somewhere near the rail's entry to the board.
          These handle the slower current swings the ceramics can't.
        </li>
        <li>
          <strong>Pour your ground plane</strong>. High-frequency return current finds the path of minimum inductance — usually
          directly under the trace — and that path only exists if you give it one.
        </li>
        <li>
          <strong>Pick the cap location, not the cap value, first.</strong> Two extra mm of trace inductance to the IC defeats
          most of what the cap was buying you.
        </li>
      </ul>
      <Callout label="// rule of thumb">
        If you only remember one number: 100 nF X7R, 0402 or 0603 package, as close as the layout will physically allow.
      </Callout>
    </>
  ),
  "pr-i2c": () => (
    <>
      <h2>The idea</h2>
      <p>
        Two wires (SDA and SCL), open-drain so anyone can pull them low but only the pull-up resistor pulls them high. Each
        device has a 7- or 10-bit address. The master clocks bits onto the bus, devices ACK by pulling SDA low for one clock
        period. That's it. Hundreds of sensors use it.
      </p>
      <DemoBus />
      <h2>The bus scanner you'll reach for first</h2>
      <p>
        Before debugging a driver, prove the device ACKs at the address you expect. This walks all 7-bit addresses and prints
        any that respond — the hardware equivalent of <code>ping</code>:
      </p>
      <CodeBlock
        language="cpp"
        filename="i2c_scan.ino"
        code={`#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(115200);
  while (!Serial) {}
  Serial.println("Scanning I2C bus...");

  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {        // 0 == device ACKed
      Serial.print("  found 0x");
      Serial.println(addr, HEX);
    }
  }
  Serial.println("done.");
}

void loop() {}`}
      />
      <h2>The most common failures</h2>
      <ul>
        <li>
          <strong>No pull-ups</strong> — the bus floats and reads as random nonsense. 4.7kΩ to V<sub>cc</sub> on each line.
        </li>
        <li>
          <strong>Address collision</strong> — two devices on 0x48 fight invisibly. Check before you buy.
        </li>
        <li>
          <strong>Voltage mismatch</strong> — 5V and 3.3V devices on the same bus need level shifting.
        </li>
        <li>
          <strong>Held SDA low</strong> — a confused slave can hang the bus until you toggle SCL by hand.
        </li>
      </ul>
    </>
  ),
};

export const ComparisonBodies: Record<string, Body> = {
  "cmp-motors": () => (
    <>
      <p>
        Three motor families that cover ~95% of personal projects, with very different control surfaces and failure modes. Pick
        by what failure mode you can live with, not by raw torque numbers.
      </p>
      <DemoMotors />
      <h2>At a glance</h2>
      <Compare
        header={["", "Stepper", "Servo", "BLDC"]}
        rows={[
          ["Control", "Open-loop steps", "Closed-loop position", "FOC / trapezoidal"],
          ["Cost (medium)", "$15–40", "$10–200", "$30–300"],
          ["Backlash", "None (within step)", "Gearbox-dependent", "None direct, gearbox if geared"],
          ["Best for", "3D printers, CNC, positioners", "RC, robotic arms, low-budget", "Drones, e-vehicles, smooth motion"],
          ["Driver complexity", "Medium (A4988, TMC2209)", "None — built-in", "High (DRV8323, ODrive)"],
          ["Failure mode", "Skipped steps (silent)", "Stall + overheat", "Driver smoke"],
        ]}
      />
      <h2>Rule of thumb</h2>
      <ul>
        <li>
          If you need to know where the shaft <em>is</em> without an encoder, use a stepper.
        </li>
        <li>If you need cheap "go to angle and hold", use a servo.</li>
        <li>If you need smooth, fast, efficient motion at scale, use BLDC and pay the firmware tax.</li>
      </ul>
    </>
  ),
  "cmp-batteries": () => (
    <>
      <p>
        Five chemistries that cover essentially every personal project. The right answer is almost always "what tradeoff am I
        willing to make on safety, cycle life, and weight?"
      </p>
      <DemoBattery />
      <h2>How to read the curves</h2>
      <ul>
        <li>
          <strong>The knee</strong> — where the voltage falls off a cliff. This is the practical end of useful discharge.
        </li>
        <li>
          <strong>The plateau</strong> — LiFePO₄'s broad flat region is why it works in low-voltage-cutoff applications;
          lead-acid's drooping plateau is why it dies quietly.
        </li>
        <li>
          <strong>Sag under C-rate</strong> — at 2C, every chemistry loses voltage, but lead-acid loses dramatically more. Raise
          the rate slider to see it.
        </li>
      </ul>
    </>
  ),
};

export const ToolBodies: Record<string, Body> = {
  "t-multimeter": () => (
    <>
      <h2>What it gives you</h2>
      <p>
        The most-used instrument on any bench. Volts, amps, ohms, continuity, and on better units capacitance and frequency.
        Get a true-RMS meter; the few extra dollars pay back the first time you measure a PWM-driven load.
      </p>
      <DemoBench />
      <h2>Habits worth building</h2>
      <ul>
        <li>
          Continuity first — before you power on anything, verify there's no short from V<sub>cc</sub> to GND.
        </li>
        <li>Two-handed measurement risks coupling current through your chest. One hand at a time on &gt;50V.</li>
        <li>Move the red probe between V-Ω and A jacks deliberately. Forgetting blows fuses (and sometimes meters).</li>
      </ul>
    </>
  ),
  "t-oscilloscope": () => (
    <>
      <h2>What it gives you</h2>
      <p>
        Voltage over time, visibly. Where the multimeter answers "how much?", the scope answers "in what shape?" — and an
        enormous fraction of hardware bugs only become legible in shape.
      </p>
      <DemoBench />
      <h2>Buying advice (2026)</h2>
      <ul>
        <li>
          <strong>First scope</strong> — 2-channel, 100MHz, ~$300. Rigol DHO804 or Siglent SDS814X HD are the current sweet
          spot.
        </li>
        <li>
          <strong>Probes</strong> — 1x/10x switchable, compensate them on day one and re-compensate when you move benches.
        </li>
        <li>
          <strong>Bandwidth rule</strong> — buy 5× the highest frequency you'll measure. Edge measurements need bandwidth.
        </li>
      </ul>
      <h2>Three things to learn early</h2>
      <ul>
        <li>
          <strong>Triggering</strong> — most "noisy" traces are just untriggered traces.
        </li>
        <li>
          <strong>Probe compensation</strong> — overshoot or rolled-off square waves mean a probe needs adjusting.
        </li>
        <li>
          <strong>Coupling</strong> — DC reveals offset, AC reveals ripple. Learn which question you're asking.
        </li>
      </ul>
    </>
  ),
};

export const ProjectBodies: Record<string, Body> = {
  "p-so-arm100": () => (
    <>
      <h2>Goals</h2>
      <ul>
        <li>End-to-end teleop with a leader/follower pair</li>
        <li>Record 20+ demonstrations of a single pick-and-place</li>
        <li>Train one imitation-learning policy and run it on-device</li>
        <li>Quantify joint backlash before and after a tighter mechanical revision</li>
      </ul>

      <h2>Bill of materials</h2>
      <SpecTable
        rows={[
          ["Servos", "6× STS3215 (serial bus, position+torque feedback)"],
          ["Frame", "PLA+, printed at 30% gyroid, 0.2mm layer"],
          ["Controller", "Waveshare Servo Bus Controller + USB-C"],
          ["Power", "12V 5A bench, regulated 6V rail for servos"],
          ["Host", "MacBook → Python / LeRobot stack"],
          ["Camera", "Logitech C920, fixed-mount, 30fps"],
        ]}
      />

      <ImageSlot label="hero shot · arm on bench · drop your photo here" />

      <h2>Teleop loop (LeRobot)</h2>
      <p>
        The leader/follower pair runs through LeRobot's host stack. The bring-up script that proves the whole chain — leader
        bus → host → follower bus — is just a copy from one set of motors to the other:
      </p>
      <CodeBlock
        language="python"
        filename="teleop.py"
        code={`from lerobot.common.robot_devices.motors.feetech import FeetechMotorsBus

# Two STS3215 buses: the leader you move by hand, the follower it drives.
leader = FeetechMotorsBus(port="/dev/ttyACM0", motors=ARM_MOTORS)
follower = FeetechMotorsBus(port="/dev/ttyACM1", motors=ARM_MOTORS)
leader.connect()
follower.connect()

# Let the leader move freely; the follower holds position.
leader.write("Torque_Enable", 0)
follower.write("Torque_Enable", 1)

try:
    while True:
        target = leader.read("Present_Position")  # 6 joint angles
        follower.write("Goal_Position", target)   # mirror them
except KeyboardInterrupt:
    leader.disconnect()
    follower.disconnect()`}
      />

      <h2>References</h2>
      <ul>
        <li>
          <a href="#/the-arm">The Arm</a> archetype — pattern this is an instance of
        </li>
        <li>
          <a href="#/pr-kinematics">Forward &amp; inverse kinematics</a>
        </li>
        <li>
          <a href="#/cmp-motors">Motor comparison</a> — why bus servos here, not steppers
        </li>
      </ul>

      <h2>Learnings (rolling)</h2>
      <ul>
        <li>Joint 3 has 1.4° of backlash from gear slop — needs printed retainers</li>
        <li>Bus servo IDs collide if you don't program them one at a time before assembly</li>
        <li>The wrist twist axis benefits from a tighter gear ratio; stock is overly fast and under-torqued for picking</li>
      </ul>
    </>
  ),
  "p-rp2040-breakout": () => (
    <>
      <h2>Plan</h2>
      <p>
        A minimal RP2040 breakout to learn KiCad → JLCPCB end-to-end without distractions. USB-C power and data, a 3.3V LDO,
        status LED, broken-out GPIO on 0.1" headers. No fancy peripherals — the point is the workflow.
      </p>

      <h2>BOM (target ≤ $5 per board)</h2>
      <SpecTable
        rows={[
          ["MCU", "RP2040 · QFN-56"],
          ["Flash", "W25Q128JV · 16MB"],
          ["USB", "USB-C 6-pin SMD, CC1/CC2 5.1kΩ pulldowns"],
          ["Regulator", "NCP1117-3.3 (1A) · 10µF in + 10µF out"],
          ["Crystal", "12MHz · 12pF caps"],
          [
            "Decoupling",
            <>
              10× 100nF · one per VDD pin (see <a href="#/pr-decoupling">decoupling</a>)
            </>,
          ],
        ]}
      />

      <ImageSlot label="schematic · top-level KiCad capture" />
      <ImageSlot label="3D render · before fab" />
    </>
  ),
  "p-bench-psu": () => (
    <>
      <h2>What this is</h2>
      <p>
        A small kit of labelled, known-good power cables and adapters. The bench equivalent of writing a CI pipeline once so you
        stop wasting time on environment bugs.
      </p>

      <h2>Inventory</h2>
      <ul>
        <li>2× banana-to-barrel, 5.5×2.1mm, with inline 2A fuses</li>
        <li>2× banana-to-JST-XH, 1S and 3S</li>
        <li>1× banana-to-USB-C breakout (5V regulated, fused)</li>
        <li>4× alligator-to-banana, color-matched and labelled</li>
        <li>Heat-shrunk strain reliefs everywhere</li>
      </ul>

      <Callout>
        Every cable is labelled with a P-tape sleeve showing max V, max A, and a 2-digit ID. The ID maps to a row in a notebook
        with "first-built" and "last-fault-checked" dates.
      </Callout>
    </>
  ),
};

export const ComponentBodies: Record<string, Body> = {
  "c-555": () => (
    <>
      <h2>What it is</h2>
      <p>
        A 1972 IC that just won't die: two comparators, an RS latch, a discharge transistor, and a divider chain that hands you
        1/3 V<sub>cc</sub> and 2/3 V<sub>cc</sub> thresholds. From those primitives you build astable oscillators, monostable
        pulses, PWM, Schmitt triggers, and an alarming amount of analog mischief.
      </p>

      <h2>Pinout</h2>
      <SpecTable
        rows={[
          ["1 — GND", "Ground reference"],
          ["2 — TRIG", "Trigger input; pulse low to start the cycle"],
          ["3 — OUT", "Push-pull output, ~200mA sink/source"],
          ["4 — RESET", "Active-low reset; tie high if unused"],
          ["5 — CTRL", "Control voltage; bypass with 10nF to GND"],
          [
            "6 — THRES",
            <>
              Threshold; comparator vs 2/3 V<sub>cc</sub>
            </>,
          ],
          ["7 — DISCH", "Open-collector discharge to GND"],
          [
            <>
              8 — V<sub>cc</sub>
            </>,
            "4.5–16V (TLC555 down to 2V)",
          ],
        ]}
      />

      <h2>Astable period</h2>
      <Callout label="// math">
        T<sub>high</sub> = 0.693 · (R<sub>1</sub> + R<sub>2</sub>) · C &nbsp;&nbsp; T<sub>low</sub> = 0.693 · R<sub>2</sub> · C
        &nbsp;&nbsp; Duty = (R<sub>1</sub> + R<sub>2</sub>) / (R<sub>1</sub> + 2R<sub>2</sub>)
      </Callout>
      <p>
        Duty under 50% takes a diode trick (across R<sub>2</sub>). The math becomes instinct after about three astable
        circuits.
      </p>
      <p>
        No scope handy? Measure the period straight off pin 3 with <code>pulseIn()</code> and back out the frequency:
      </p>
      <CodeBlock
        language="cpp"
        filename="measure_555.ino"
        code={`const int OUT_555 = 2;  // wire to NE555 pin 3 (OUT)

void setup() {
  pinMode(OUT_555, INPUT);
  Serial.begin(115200);
}

void loop() {
  // high + low time, in microseconds
  unsigned long tHigh = pulseIn(OUT_555, HIGH);
  unsigned long tLow  = pulseIn(OUT_555, LOW);
  unsigned long period = tHigh + tLow;
  if (period > 0) {
    float freq = 1e6f / period;            // Hz
    float duty = 100.0f * tHigh / period;  // %
    Serial.print(freq, 1);  Serial.print(" Hz  ");
    Serial.print(duty, 1);  Serial.println(" % duty");
  }
  delay(250);
}`}
      />

      <h2>Gotchas</h2>
      <ul>
        <li>Skip pin 5's bypass cap and your output jitters with supply noise</li>
        <li>
          Bipolar 555s draw nasty supply transients when output switches — decouple V<sub>cc</sub> with 100nF + 10µF
        </li>
        <li>Use the CMOS variant (TLC555 / LMC555) for low current and battery work</li>
      </ul>
    </>
  ),
};

export const JournalBodies: Record<string, Body> = {
  "j-2026-05-18": () => (
    <>
      <p>
        Spent the afternoon on the third joint of the <a href="#/p-so-arm100">SO-ARM100</a>. Visible backlash — about 1.4° at
        the wrist when I let the arm hang and gently rocked the end-effector. The gear retainer print at 20% grid is too
        compliant.
      </p>
      <ImageSlot label="caliper measurement · joint 3 backlash" />
      <h2>What I changed</h2>
      <ul>
        <li>Reprinted retainer at 30% gyroid, vertical orientation, 0.16mm layer</li>
        <li>Tighter hole for the bearing (Ø 8.0 → 7.95mm) to reduce slop</li>
        <li>Re-tightened M3 grub screw on the servo horn with thread locker</li>
      </ul>
      <h2>Result</h2>
      <p>
        Backlash dropped to roughly 0.4°. Acceptable for now; will revisit when imitation-learning policy starts demanding
        repeatable end-effector position.
      </p>
      <h2>Next</h2>
      <ul>
        <li>Calibrate IK with the new joint stiffness</li>
        <li>Record first 10 demonstrations of the pick task</li>
      </ul>
    </>
  ),
};
