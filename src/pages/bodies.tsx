import type { ReactNode } from "react";
import { Callout, Compare, ImageSlot, SpecTable } from "./elements";
import { CodeBlock } from "@/components/code/CodeBlock";
import { RcPwmDemo } from "@/circuits/RcPwmDemo";
import { DecouplingZDemo } from "@/circuits/DecouplingZDemo";
import { NonInvertingAmpDemo } from "@/circuits/NonInvertingAmpDemo";
import { ActiveLowPassDemo } from "@/circuits/ActiveLowPassDemo";
import { RectifierDemo } from "@/circuits/RectifierDemo";
import { CommonEmitterDemo } from "@/circuits/CommonEmitterDemo";
import { CommonEmitterBodeDemo } from "@/circuits/CommonEmitterBodeDemo";
import { NmosSwitchDemo } from "@/circuits/NmosSwitchDemo";
import { GbwTradeoffDemo } from "@/circuits/GbwTradeoffDemo";
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
  "pr-opamp": () => (
    <>
      <h2>The trick</h2>
      <p>
        Inside the package there's a differential pair, a current mirror, a couple of stages of gain, and an output driver —
        maybe twenty or thirty transistors carefully biased so that the open-loop gain from the difference between the two
        inputs to the output is enormous (10<sup>5</sup>–10<sup>7</sup>). That gain is too large to use directly. The op-amp's
        whole reason for existing is that <em>you don't have to</em>: wrap a feedback path from the output back to the
        inverting input and the giant gain disappears, replaced by an exact ratio of the resistors you chose. The transistors
        do whatever they must to keep V<sub>+</sub> = V<sub>−</sub>; you just write down what that gives you at the output.
      </p>
      <Callout label="// the golden rules">
        For any op-amp circuit with negative feedback: <strong>V<sub>+</sub> = V<sub>−</sub></strong> and{" "}
        <strong>I<sub>+</sub> = I<sub>−</sub> = 0</strong>. Almost every result on this page falls straight out of those two
        sentences.
      </Callout>
      <h2>Non-inverting amplifier</h2>
      <p>
        Feed the signal to the <strong>+</strong> input. From the <strong>−</strong> input, run a resistor R<sub>g</sub> to
        ground and another resistor R<sub>f</sub> back from V<sub>out</sub>. The two form a divider from V<sub>out</sub> to
        ground; the op-amp drives V<sub>out</sub> until the divider's midpoint matches V<sub>in</sub>. That fixes the gain at
        a pure resistor ratio, free of any device parameter:
      </p>
      <Callout label="// math">
        V<sub>out</sub> / V<sub>in</sub> = 1 + R<sub>f</sub> / R<sub>g</sub>
      </Callout>
      <NonInvertingAmpDemo />
      <h2>Active first-order low-pass</h2>
      <p>
        Switch to the inverting topology — signal in through R<sub>in</sub> to the <strong>−</strong> input, ground on the{" "}
        <strong>+</strong> input — and put a capacitor across the feedback resistor. At DC the cap is open and you get the
        plain inverting gain −R<sub>f</sub> / R<sub>in</sub>. As frequency rises the cap shunts the feedback path, dropping the
        gain at −20 dB/decade above the corner where the cap's impedance equals R<sub>f</sub>:
      </p>
      <Callout label="// math">
        H(s) = −R<sub>f</sub> / (R<sub>in</sub> · (1 + s·R<sub>f</sub>·C<sub>f</sub>)) &nbsp; · &nbsp; f<sub>c</sub> = 1 /
        (2π·R<sub>f</sub>·C<sub>f</sub>)
      </Callout>
      <ActiveLowPassDemo />
      <h2>Gain–bandwidth tradeoff</h2>
      <p>
        The "ideal op-amp" model is a useful fiction. A real op-amp's open-loop gain is enormous but finite at DC, and it
        rolls off above a dominant pole. The product of the gain and the −3 dB bandwidth is roughly constant — it's the part's{" "}
        <strong>gain–bandwidth product</strong>, <strong>GBW</strong>, and it's what the datasheet quotes. A μA741 has GBW ≈
        1 MHz; an OPA855 reaches 8 GHz. Everything in between trades amplifier-y things (input-offset accuracy, noise, current
        consumption) for that number.
      </p>
      <p>
        For a closed-loop gain G, the bandwidth you actually get is approximately{" "}
        <strong>GBW / G</strong>. So a unity-gain buffer sees the full GBW, a ×10 amplifier sees a tenth of it, a ×100 amp a
        hundredth. The simulator's op-amp accepts <code>A0</code> and <code>GBW</code> parameters (or omits them for the
        infinite-gain idealisation). When set, the dominant-pole transfer function{" "}
        <code>A(s) = A₀ / (1 + s/ω_p)</code> takes over — DC accuracy degrades by ~1/A₀, AC analysis picks up the pole, and
        transient analysis sees the corresponding integrator time constant.
      </p>
      <GbwTradeoffDemo />
      <p>
        Each closed-loop trace starts flat at its gain, rolls off −20 dB/decade past its own corner, and merges onto the same
        open-loop curve at high frequency. They all cross 0 dB (unity gain) at exactly GBW. Drag GBW up and the whole family
        translates right; drag A₀ down and the open-loop plateau lowers but the unity-gain crossover stays put — because GBW
        is GBW.
      </p>
      <h2>Where the model breaks</h2>
      <ul>
        <li>
          <strong>Real op-amps run out of gain</strong>. The textbook "infinite open-loop gain" is finite and falls at
          20 dB/decade above its dominant pole; what you actually have is a <em>gain–bandwidth product</em>. Above
          GBW / closed-loop-gain you stop being able to enforce V<sub>+</sub> = V<sub>−</sub>, and the gain rolls off
          regardless of what your feedback network says it should be.
        </li>
        <li>
          <strong>Output swing</strong>. The output can't go past the supply rails, and even "rail-to-rail" parts get within a
          hundred millivolts or so. Pick a part whose supply rails comfortably bracket the output you need.
        </li>
        <li>
          <strong>Slew rate</strong>. The output has a maximum dV/dt. Drive a fast edge through an op-amp slower than your
          edge wants and you'll get a clean ramp where you wanted a step.
        </li>
        <li>
          <strong>Input offset and bias current</strong>. The two inputs aren't perfectly matched and they don't draw exactly
          zero current. For DC-coupled high-precision work, pick a chopper-stabilised or auto-zero part.
        </li>
      </ul>
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
  "c-1n4148": () => (
    <>
      <h2>What it is</h2>
      <p>
        The default small-signal switching diode you'll reach for nine times out of ten. A pn junction in a tiny glass DO-35
        package — <strong>4 ns reverse-recovery</strong>, <strong>~700 mV forward drop</strong> at 10 mA, <strong>100 V</strong>{" "}
        reverse standoff, and ~150 mA continuous forward current. Fast enough for logic-level signal steering, cheap enough that
        a strip of a hundred costs about a coffee. The black band on the body marks the cathode.
      </p>
      <h2>The model</h2>
      <p>
        Every analog simulator uses the Shockley equation as its starting point:
      </p>
      <Callout label="// math">
        I<sub>D</sub> = I<sub>S</sub> · (e<sup>V<sub>D</sub> / (N · V<sub>T</sub>)</sup> − 1)
      </Callout>
      <p>
        I<sub>S</sub> is the reverse saturation current (~4 nA for a 1N4148), V<sub>T</sub> = kT/q ≈ 25.85 mV at room
        temperature, and N is the emission coefficient (~1.9 for this part). At V<sub>D</sub> ≪ 0, I<sub>D</sub> ≈ −I
        <sub>S</sub> — the reverse leakage you'd measure with a sensitive ammeter. At V<sub>D</sub> ≳ 0.6 V the exponential
        takes over, the diode "turns on", and small changes in V<sub>D</sub> swing the current by orders of magnitude. There is
        no V<sub>D</sub> threshold in the equation — the "0.7 V drop" is just a rule of thumb for typical small-signal currents.
      </p>
      <h2>Why this simulator iterates</h2>
      <p>
        That exponential is the first nonlinear thing in the simulator. Every other element (R, L, C, V, op-amp) is linear in
        the node voltages, so one matrix solve gives the operating point. The diode breaks that: the unknown V<sub>D</sub>
        appears inside an exponential, so we replace it with its tangent line at a current guess and solve. Then we update the
        guess from the result and re-solve. Newton-Raphson, applied per-element via companion models. With SPICE-style step
        limiting on V<sub>D</sub> to keep the exponential from overflowing on an over-eager iteration, every realistic circuit
        converges in single-digit iterations.
      </p>
      <h2>Half-wave rectifier with smoothing</h2>
      <p>
        The canonical use: turn AC into approximate DC. Vin swings positive → diode conducts → cap charges to (peak − V
        <sub>D</sub>). Vin swings back → diode blocks → cap holds Vout up while the load drains it. Crank R · C up relative to
        the input period and the ripple shrinks; turn it down and the cap can't keep up.
      </p>
      <RectifierDemo />
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>Reverse-recovery</strong> — the 4 ns spec matters when you're switching at &gt;100 kHz. Below that the diode
          looks ideal; above it, you start seeing brief reverse-current spikes when the diode tries to turn off.
        </li>
        <li>
          <strong>Temperature shift</strong> — V<sub>D</sub> drops by roughly 2 mV/°C at constant current. A hot junction looks
          like a lower drop, which is the basis of using one as a temperature sensor.
        </li>
        <li>
          <strong>Drop scales weakly with current</strong> — V<sub>D</sub> goes up about 60 mV per decade of forward current. So
          a 1N4148 at 10 mA reads ~700 mV; at 100 µA it's closer to 600 mV.
        </li>
        <li>
          <strong>For rectifying mains</strong>, reach for a 1N4007 (1 A, 1 kV) or a Schottky like the SS14 (low V<sub>D</sub>,
          fast). The 1N4148 is for signals, not power.
        </li>
      </ul>
    </>
  ),
  "c-2n3904": () => (
    <>
      <h2>What it is</h2>
      <p>
        Workhorse small-signal NPN BJT in a TO-92 plastic package. ~200 mA continuous collector current, 40 V V<sub>CEO</sub>,
        β<sub>F</sub> typically ≈ 100–300. It and its PNP complement the 2N3906 are still in every parts kit a decade after
        better parts exist, because they're cheap, well-modelled, and good enough for almost any small-signal job: signal
        amplifiers, level shifters, small relay drivers, oscillators, current mirrors.
      </p>
      <h2>The model</h2>
      <p>
        The simulator uses Ebers-Moll in injection form: two diodes (B-E and B-C junctions) plus controlled current sources
        that account for charge carriers swept across the base. In NPN forward active (V<sub>BE</sub> ≳ 0.6 V, V<sub>BC</sub>{" "}
        &lt; 0):
      </p>
      <Callout label="// math">
        I<sub>C</sub> ≈ I<sub>S</sub> · exp(V<sub>BE</sub> / V<sub>T</sub>) &nbsp;·&nbsp; I<sub>B</sub> ≈ I<sub>C</sub> / β
        <sub>F</sub> &nbsp;·&nbsp; I<sub>E</sub> = −(I<sub>C</sub> + I<sub>B</sub>)
      </Callout>
      <p>
        Same Newton iteration as a diode, just with three terminals and a 3×3 Jacobian per BJT instead of one number per diode.
        The Newton iterate tracks V<sub>BE</sub> and V<sub>BC</sub> separately; pn-junction limiting applies to both.
      </p>
      <h2>Common-emitter amplifier</h2>
      <p>
        The canonical small-signal BJT stage: a voltage divider sets the base around 1.5 V, R<sub>E</sub> stabilises the bias
        against β variation and adds linearity, R<sub>C</sub> converts swinging collector current into voltage at the output.
        Voltage gain is approximately −R<sub>C</sub> / R<sub>E</sub>, set by a resistor ratio and not by anything the
        transistor cares about. AC-couple the input through a cap so the source doesn't pull the bias around.
      </p>
      <CommonEmitterDemo />
      <p>
        Crank R<sub>C</sub> up and the gain grows; crank R<sub>E</sub> down and so does the gain (but bias gets twitchier).
        Push the input amplitude past ~50 mV and clipping appears at the output — the linear small-signal regime only holds
        for inputs much smaller than V<sub>T</sub> · (1 + R<sub>E</sub>/r<sub>e</sub>).
      </p>
      <h2>Frequency response (small-signal at op-point)</h2>
      <p>
        Same circuit, plotted in the frequency domain. The simulator finds the DC bias point first — Newton on V
        <sub>BE</sub> and V<sub>BC</sub> until both junctions converge — then freezes that bias and replaces the transistor
        with its small-signal model: a conductance{" "}
        g<sub>m</sub> = ∂I<sub>C</sub>/∂V<sub>BE</sub> at the operating point, plus the rest of the Jacobian terms. The
        circuit around it (R<sub>C</sub>, R<sub>E</sub>, the coupling cap, the bias divider) stays in its native form, and
        the whole thing becomes a linear AC problem. SPICE calls this an{" "}
        <code>.AC</code> analysis.
      </p>
      <CommonEmitterBodeDemo />
      <p>
        The high-pass corner at the bottom comes from C<sub>in</sub> looking into the parallel combination of the bias
        divider and r<sub>π</sub> ≈ β·V<sub>T</sub>/I<sub>E</sub>. Drop C<sub>in</sub> by a decade and watch the corner
        translate right by a decade. The flat midband is approximately −R<sub>C</sub> / (R<sub>E</sub> + r<sub>e</sub>) — the
        same gain the transient demo gives.
      </p>
      <h2>The upper rolloff is the Miller effect</h2>
      <p>
        The high-frequency corner at the top of the plot is what kills wideband BJT amplifiers, and it almost never lives at
        the part's f<sub>T</sub>. It lives at the base, where the small base-collector capacitance C<sub>μ</sub> gets
        magnified by the voltage gain: looking into the base, that ~4 pF cap behaves like a much larger cap of value{" "}
        <code>C_μ · (1 + g_m·R_C)</code> — the <strong>Miller effect</strong>. Add the intrinsic C<sub>π</sub> and you're
        driving roughly a nanofarad to ground through whatever source impedance lives in front of the base. With a 1 kΩ
        source and R<sub>π</sub> in parallel, the pole lands somewhere in the hundreds-of-kHz range.
      </p>
      <Callout label="// math">
        f<sub>upper</sub> ≈ 1 / (2π · R<sub>S</sub>&apos; · (C<sub>π</sub> + C<sub>μ</sub>·(1 + g<sub>m</sub>·R<sub>C</sub>)))
      </Callout>
      <p>
        Slide C<sub>μ</sub> up in the demo above and the upper corner drops fast — multiplied by gain, every extra picofarad
        of feedback cap costs you bandwidth. Bring C<sub>μ</sub> down to zero and the upper rolloff is dominated entirely by
        C<sub>π</sub> and the input impedance. Bring R<sub>C</sub> down and the Miller multiplier shrinks, pushing the corner
        right. Every cascode, every common-base, every bandwidth trick in the analog playbook exists to neutralise this one
        picofarad-times-gain product.
      </p>
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>β has a lot of variation</strong> — don't design anything that critically depends on it. Treat β as
          "somewhere between 100 and 300" and let the topology (degeneration, current mirrors, etc.) absorb the spread.
        </li>
        <li>
          <strong>V<sub>BE</sub> drifts with temperature</strong> — about −2 mV/°C at constant I<sub>C</sub>. Hot transistor →
          more current → hotter still. Use emitter degeneration or a current source to keep this from running away.
        </li>
        <li>
          <strong>Saturation is slow</strong>. Driving a BJT switch hard into saturation stores excess base charge that takes
          microseconds to clear — a problem for fast switching. Use a Baker clamp or just switch to a MOSFET.
        </li>
        <li>
          <strong>For real currents, use a power BJT</strong> (TIP31, BD139) or a Darlington pair. The 2N3904 dies above ~200
          mA continuous.
        </li>
      </ul>
    </>
  ),
  "c-2n7000": () => (
    <>
      <h2>What it is</h2>
      <p>
        Small-signal N-channel enhancement-mode MOSFET in a TO-92 package. Vth ≈ 1.5–2.5 V (logic-level — important — the
        related 2N7002 needs a higher V<sub>GS</sub>), R<sub>DS(on)</sub> ≈ 5 Ω at V<sub>GS</sub> = 10 V, drain current up to
        200 mA. The default part to reach for when a 5 V MCU pin can't sink enough current and you don't want to build a
        full BJT stage.
      </p>
      <h2>The model</h2>
      <p>
        Simulator uses Shichman-Hodges (SPICE Level 1) — the textbook piecewise-quadratic model with three regions:
      </p>
      <Callout label="// math">
        cutoff: I<sub>D</sub> = 0 when V<sub>GS</sub> &lt; V<sub>th</sub>
        <br />
        triode: I<sub>D</sub> = K · [(V<sub>GS</sub> − V<sub>th</sub>) · V<sub>DS</sub> − V<sub>DS</sub>² / 2]
        <br />
        saturation: I<sub>D</sub> = (K/2) · (V<sub>GS</sub> − V<sub>th</sub>)²
      </Callout>
      <p>
        No body effect, no channel-length modulation, no subthreshold conduction. Good enough to teach the regions; not good
        enough to design an analog ASIC with. The Newton iterate tracks V<sub>GS</sub> and V<sub>DS</sub>; a tiny GMIN
        conductance sits across drain-source so a fully cut-off channel doesn't leave the matrix singular.
      </p>
      <h2>Low-side switch</h2>
      <p>
        The simplest useful FET circuit: load between supply and drain, source to ground, gate driven by a logic pin. Gate
        high → MOSFET conducts → load energised. Gate low → MOSFET cuts off → load disconnected. Drag the gate frequency and
        duty cycle below and watch the drain (V<sub>DS</sub>) swing between supply and ~0V.
      </p>
      <NmosSwitchDemo />
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>"Logic level" actually means V<sub>th</sub> low enough that a 3.3V or 5V pin gets you well into saturation
          </strong> — read the datasheet, don't assume. Plenty of "small-signal" MOSFETs need V<sub>GS</sub> ≥ 10 V to turn
          fully on.
        </li>
        <li>
          <strong>Gate charge is real</strong>. The gate looks like a capacitor (~50 pF for a 2N7000). Driving it fast through
          a high-impedance source means the MOSFET spends real time in the linear region while switching, where it dissipates
          power. For fast switching at any current, use a dedicated gate driver.
        </li>
        <li>
          <strong>Inductive loads need a flyback diode</strong> across them. When you cut the channel, the load's stored energy
          has nowhere to go and the V<sub>DS</sub> spike will pop the FET.
        </li>
        <li>
          <strong>The body diode is always there</strong>. NMOS has an intrinsic diode from source to drain. It's why you can't
          block reverse current with a single FET — and why a single FET <em>does</em> work as a synchronous rectifier when
          driven by external logic.
        </li>
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
