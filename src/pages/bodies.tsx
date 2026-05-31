import type { ReactNode } from "react";
import { Callout, Compare, ImageSlot, SpecTable } from "./elements";
import { CodeBlock } from "@/components/code/CodeBlock";
import { RcPwmDemo } from "@/circuits/RcPwmDemo";
import { DecouplingZDemo } from "@/circuits/DecouplingZDemo";
import { NonInvertingAmpDemo } from "@/circuits/NonInvertingAmpDemo";
import { ActiveLowPassDemo } from "@/circuits/ActiveLowPassDemo";
import { RectifierDemo } from "@/circuits/RectifierDemo";
import { VaractorTankDemo } from "@/circuits/VaractorTankDemo";
import { CommonEmitterDemo } from "@/circuits/CommonEmitterDemo";
import { CommonEmitterBodeDemo } from "@/circuits/CommonEmitterBodeDemo";
import { NmosSwitchDemo } from "@/circuits/NmosSwitchDemo";
import { GbwTradeoffDemo } from "@/circuits/GbwTradeoffDemo";
import { SlewRateDemo } from "@/circuits/SlewRateDemo";
import { RelaxationOscDemo } from "@/circuits/RelaxationOscDemo";
import { Astable555Demo } from "@/circuits/Astable555Demo";
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
      <h2>Slew rate — the large-signal speed limit</h2>
      <p>
        GBW is a <em>small-signal</em> spec. Push the input hard enough that the integrator inside the op-amp can't keep up
        — typically because the differential pair driving the dominant-pole cap runs out of bias current — and the output
        ramps at a fixed maximum rate regardless of what the feedback network asks for. That rate is the part's{" "}
        <strong>slew rate</strong>: 0.5 V/µs for a 741, 50 V/µs for an OPA134, a few hundred V/µs for high-speed parts. The
        consequence is a hard cap on the largest sine you can faithfully reproduce at a given frequency. A 10 V<sub>pp</sub>{" "}
        sine at 100 kHz has a peak slope of <code>2π · f · V_peak</code> = 3.14 V/µs — fine for the OPA134 but already past
        the 741's headline number, even though both have plenty of gain-bandwidth.
      </p>
      <Callout label="// math">
        Full-power bandwidth: f<sub>FP</sub> = SR / (2π · V<sub>peak</sub>) &nbsp;·&nbsp; max sine ampl @ f: V<sub>peak</sub>
        = SR / (2π · f)
      </Callout>
      <p>
        The simulator's op-amp accepts an optional <code>SR</code> parameter (V/s). When set, transient analysis caps{" "}
        |dV<sub>out</sub>/dt| at ±SR per step. Implementation is an outer slew loop on top of Newton: each timestep solves
        with the normal finite-GBW stamp, checks whether V<sub>out</sub> moved more than dt·SR, and if so re-solves with V
        <sub>out</sub> = V<sub>out</sub>(t−dt) ± dt·SR forced — the V+/V− inputs contribute nothing to the row, because the
        output stage is saturated by physical current limits regardless of what the feedback network demands. AC and DC
        analyses ignore SR by design — slew is a large-signal phenomenon.
      </p>
      <SlewRateDemo />
      <p>
        Pull SR down in the demo and the unity-gain buffer stops following the square wave — the trace becomes a triangle
        ramping at exactly ±SR per leg. Bring SR back up and the output snaps back to faithful tracking once it can outrun
        the input edges. Push the frequency up and the same SR isn't enough anymore.
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
  "pr-schmitt": () => (
    <>
      <h2>The trick: two trip points instead of one</h2>
      <p>
        A normal comparator has one threshold: input above it, output is HIGH; below, output is LOW. That single boundary
        becomes a problem the moment the input has any noise on it. Approach the threshold slowly and the comparator will{" "}
        <em>flap</em> — the output bouncing high-low-high-low for as long as the input is parked near the trip point. The
        Schmitt trigger fixes this by having <strong>two</strong> trip points: one for going up (V<sub>TH+</sub>) and a
        lower one for coming back down (V<sub>TH−</sub>). Once the output snaps high, you have to drop the input all the way
        below V<sub>TH−</sub> before it can flip back. The dead band in between is the <strong>hysteresis</strong>, and it's
        what makes the output stable in the presence of noise.
      </p>
      <Callout label="// math">
        V<sub>TH+</sub> &gt; V<sub>TH−</sub> &nbsp;·&nbsp; hysteresis window = V<sub>TH+</sub> − V<sub>TH−</sub>
        &nbsp;·&nbsp; latch holds in the dead band
      </Callout>
      <p>
        The 7414 is a hex inverting Schmitt. The 555 has two of them inside, wired to the 1/3 and 2/3 V<sub>cc</sub> trip
        points that show up in its astable formula. Op-amp comparators (LM393, LM339) become Schmitts with positive feedback
        through two resistors. Every memoryless real-world threshold detector — line receiver, key-bounce filter, slow-edge
        digital input — uses some flavour of this.
      </p>
      <h2>Relaxation oscillator</h2>
      <p>
        Wire the Schmitt's output back to its input through a single resistor, and put a cap at the input to ground. The
        output (HIGH or LOW) charges the cap one direction through R. When the cap crosses the upper trip point, the output
        flips, and the cap starts charging the other direction. Crosses the lower trip point, it flips again. Square wave at
        the output, triangle wave at the cap — no clock, no biasing, no inductors.
      </p>
      <Callout label="// math">
        T ≈ 2·R·C · ln((V<sub>swing</sub> + V<sub>hyst</sub>) / (V<sub>swing</sub> − V<sub>hyst</sub>)) &nbsp;·&nbsp;
        for 1/3–2/3 thresholds on a V<sub>cc</sub> swing this collapses to <strong>T ≈ 1.39·R·C</strong>
      </Callout>
      <RelaxationOscDemo />
      <p>
        Drag R and C around and the period scales linearly with their product. Push V<sub>supply</sub> up and the swing grows
        — but the period stays the same, since the threshold ratios scale with the supply too (the 1/3–2/3 cancellation in
        the formula). That last property is why the 555's frequency depends only on R and C, not on V<sub>cc</sub>: there's a
        Schmitt-ish hysteretic comparator pair inside doing exactly this dance.
      </p>
      <Callout>
        The simulator's <code>XSCH</code> element is the building block here. It exposes vTh+/vTh− and the output values for
        each latch state — set vHigh &lt; vLow to get the inverting polarity an oscillator needs (output drops when input
        climbs past the upper threshold, kicking off the discharge half-cycle). Pair it with the <code>SW</code> element
        and you have everything needed to model a 555 internally.
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
      <h2>The IC, opened up</h2>
      <p>
        Two comparators looking at the same cap, an RS latch holding the result, and a discharge transistor. That's the
        whole 555. The hysteretic-comparator-plus-flip-flop combination is just a <strong>Schmitt trigger</strong> with
        thresholds at 1/3 and 2/3 V<sub>cc</sub>, and the discharge transistor is just a <strong>switch</strong> driven
        from the latch — so the entire IC fits into one Schmitt-trigger element (<code>XSCH</code>) and one voltage-
        controlled switch (<code>SW</code>) in the simulator. The behavioral model below uses two <code>XSCH</code>s only
        because we need both Q (driving the switch) and Q̄ (driving pin 3 OUT) — same hysteretic latch, opposite output
        polarity.
      </p>
      <Astable555Demo />
      <p>
        Symmetric resistors (R<sub>1</sub> = R<sub>2</sub>) give a duty cycle of 2/3, not 1/2 — visible in the demo as the
        OUT square wave spending two-thirds of each cycle high. That asymmetry is baked into the topology: during the high
        phase the cap charges through R<sub>1</sub> + R<sub>2</sub>, but during the low phase it discharges through R<sub>2</sub>{" "}
        alone (R<sub>1</sub> is shorted to ground via the discharge pin). To get below 50% duty, the trick is a diode
        across R<sub>2</sub> so the charge path bypasses it.
      </p>
      <p>
        Push V<sub>cc</sub> from 5 V to 12 V and notice the period doesn't change — the 1/3 and 2/3 thresholds scale with
        the supply, so the cap's RC half-cycle is V<sub>cc</sub>-independent. This is the same trick from the relaxation
        oscillator's <a href="#/pr-schmitt">Schmitt-trigger page</a>: ratiometric thresholds make frequency depend only on
        R and C, not on what voltage the chip happens to be running at.
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
  "c-esp32": () => (
    <>
      <h2>What it is</h2>
      <p>
        Espressif's 2016 follow-up to the ESP8266 and the chip that turned "add Wi-Fi to a thing" into a $3 problem. A dual-core
        <strong> Xtensa LX6</strong> @ 240 MHz with 520 KB SRAM on-die, an integrated 2.4 GHz radio that talks both Wi-Fi
        (b/g/n) and Bluetooth 4.2 (Classic + BLE), and a peripheral set that's wildly over-spec for the price. You almost
        never see the bare ESP32-D0WDQ6 chip in QFN-48 — you reach for an{" "}
        <strong>ESP-WROOM-32 module</strong> instead: chip + 40 MHz crystal + RF matching + 4 MB SPI flash + an FCC/CE-
        certified shielded can on a 25.5 × 18 mm PCB. The whole module is what slots into your design, and it's what every
        dev board (NodeMCU-32S, ESP32-DevKitC, DOIT ESP32) wraps in a USB-UART bridge.
      </p>
      <Callout>
        For new designs in 2026 you'd probably reach for the <strong>ESP32-S3</strong> (USB-OTG, vector extensions, more
        RAM) or the <strong>ESP32-C6</strong> (RISC-V, Wi-Fi 6, Zigbee/Thread). The original ESP32 is still the volume
        leader in the field, though, and most "ESP32" tutorials online still describe it.
      </Callout>
      <h2>The family at a glance</h2>
      <Compare
        header={["", "CPU", "Wireless", "USB", "Notable"]}
        rows={[
          ["ESP32 (2016)", "2× Xtensa LX6 @ 240", "Wi-Fi b/g/n + BT 4.2", "no native", "The original. Cheap, everywhere"],
          ["ESP32-S2 (2019)", "1× Xtensa LX7 @ 240", "Wi-Fi b/g/n only", "USB-OTG", "Single-core, no BT — cost-down for HID/UVC"],
          ["ESP32-S3 (2021)", "2× Xtensa LX7 @ 240", "Wi-Fi b/g/n + BLE 5", "USB-OTG", "AI/vector ISA, more RAM. The current default"],
          ["ESP32-C3 (2021)", "1× RISC-V @ 160", "Wi-Fi b/g/n + BLE 5", "USB-Serial-JTAG", "Sub-$1 RISC-V replacement for the 8266"],
          ["ESP32-C6 (2023)", "1× RISC-V @ 160", "Wi-Fi 6 + BLE 5 + 802.15.4", "USB-Serial-JTAG", "Thread / Zigbee / Matter ready"],
          ["ESP32-H2 (2023)", "1× RISC-V @ 96", "BLE 5 + 802.15.4 (no Wi-Fi)", "USB-Serial-JTAG", "Pure mesh/sensor node"],
        ]}
      />
      <h2>Datasheet at a glance (ESP32-WROOM-32)</h2>
      <SpecTable
        rows={[
          ["CPU", <>2× Xtensa LX6, up to 240 MHz, FPU on each core</>],
          ["Memory", <>520 KB SRAM, 448 KB ROM, 4 MB SPI flash on the module (16 MB option)</>],
          ["Wireless", <>Wi-Fi 802.11 b/g/n (2.4 GHz only) + BT 4.2 Classic + BLE</>],
          ["GPIO", <>34 physical GPIOs, with extensive pin-mux via the GPIO matrix</>],
          ["ADC", <>2× SAR ADCs, 12-bit, 18 channels total. ADC1 (8 ch) is the usable one</>],
          ["DAC", <>2× 8-bit, on GPIO25 and GPIO26 — the only true analog out</>],
          ["UART", <>3× hardware, with hardware flow control on 2 of them</>],
          ["I²C", <>2× hardware, fully pin-muxable through the GPIO matrix</>],
          ["SPI", <>4× (SPI0/1 are reserved for flash, HSPI/VSPI are general-purpose)</>],
          ["PWM", <>16 channels via LEDC, plus 8 from MCPWM (built for motor drive)</>],
          ["Other", <>I²S, RMT, SD/MMC, CAN/TWAI, capacitive touch (10 ch), Hall sensor</>],
          [<>V<sub>DD</sub></>, <>2.3 – 3.6 V, typical 3.3 V; peak 700+ mA during Wi-Fi TX bursts</>],
          ["Package", <>QFN-48 (6×6 mm) chip, or WROOM-32 module (25.5 × 18 mm)</>],
        ]}
      />
      <h2>GPIO map and the strapping-pin trap</h2>
      <p>
        The ESP32 has 34 numbered GPIOs but you can't treat them as interchangeable. Some are <strong>input-only</strong>
        (GPIO34, 35, 36, 39 — they have no output driver and no internal pull-up/down). Some are <strong>strapping pins</strong>
        sampled at boot to decide flash voltage and boot mode (GPIO0, GPIO2, GPIO5, GPIO12, GPIO15) — drive them with the
        wrong level at reset and the chip refuses to boot. GPIO6–11 are <strong>permanently wired to the SPI flash</strong>
        on every WROOM-32 module; treat them as nonexistent or you'll brick the boot. Pins around the JTAG and external
        crystal are similarly off-limits depending on configuration.
      </p>
      <SpecTable
        rows={[
          ["Safe-to-use", "GPIO 4, 13, 14, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33"],
          ["Input-only (no pull-up/down)", "GPIO 34, 35, 36, 39"],
          [
            "Strapping pins (be careful at boot)",
            <>
              <strong>GPIO0</strong> (must be HIGH to boot from flash), <strong>GPIO2</strong> (must be LOW or floating),
              GPIO5 (HIGH), GPIO12 (LOW, sets flash V<sub>DD</sub>), GPIO15 (HIGH or boot logs flood UART0)
            </>,
          ],
          ["Reserved (flash)", "GPIO 6, 7, 8, 9, 10, 11"],
          [
            <>
              ADC1 (Wi-Fi safe)
            </>,
            "GPIO 32, 33, 34, 35, 36, 37, 38, 39",
          ],
          [
            <>
              ADC2 (blocked while Wi-Fi is up)
            </>,
            "GPIO 0, 2, 4, 12, 13, 14, 15, 25, 26, 27",
          ],
          ["DAC out", "GPIO25, GPIO26"],
          ["Touch sensor", "GPIO 0, 2, 4, 12–15, 27, 32, 33"],
        ]}
      />
      <Callout kind="warn" label="// the ADC2 trap">
        The radio shares the ADC2 SAR with Wi-Fi calibration. The moment you call <code>WiFi.begin()</code>, ADC2 reads
        return random garbage until you stop the radio. Default <strong>any analog input to an ADC1 pin</strong>{" "}
        (32–39) and your sensor reads stay clean while the chip is online.
      </Callout>
      <h2>Power and the boot dance</h2>
      <p>
        Three things matter for power: <strong>3.3 V rail</strong>, <strong>EN pin</strong> (active-high reset, must come
        up <em>after</em> the rail is stable), and <strong>GPIO0</strong> (HIGH = boot from flash, LOW at reset = enter
        ROM bootloader). On a dev board the USB-UART bridge (CP2102 / CH340 / FT232) drives both EN and GPIO0 from its DTR
        and RTS lines through the famous Espressif two-transistor reset circuit, so <code>esptool.py</code> can pulse the
        chip into bootloader mode without you touching the board. On your own PCB you replicate the same two-NPN trick or
        you add a "BOOT" tact switch and pull GPIO0 low while reset is pulsed.
      </p>
      <Callout label="// power budget">
        Average current ≈ 80 mA (Wi-Fi connected, low traffic). Peak TX bursts can hit{" "}
        <strong>300–700 mA for ~10 ms</strong>. A 100 nF + 10 µF decoupling pair at the module is the minimum; for battery
        designs, a real LDO (or DC-DC) with ≥500 mA capability is mandatory or you'll get brownout resets the first time
        the radio transmits.
      </Callout>
      <h2>Toolchains: pick one</h2>
      <Compare
        header={["", "What it is", "Use when"]}
        rows={[
          [
            "Arduino IDE",
            "Espressif's Arduino-ESP32 core wraps ESP-IDF behind setup() / loop()",
            "Sketches, libraries you grabbed off GitHub, getting a sensor working in 20 minutes",
          ],
          [
            "ESP-IDF",
            "Espressif's first-party C/C++ framework. CMake, FreeRTOS, full peripheral API",
            "Production firmware, OTA, custom partition layouts, anything past one source file",
          ],
          [
            "PlatformIO",
            "VSCode + CLI wrapper over Arduino or ESP-IDF, with reproducible builds and library lock files",
            "Day-to-day work in a real editor; the toolchain Arduino people graduate into",
          ],
          [
            "MicroPython / CircuitPython",
            "Python runtime flashed onto the chip; you upload .py files via the REPL",
            "Glue scripts, classrooms, fast prototyping. Pay ~30 KB of RAM and some perf",
          ],
        ]}
      />
      <p>
        ESP-IDF is what every Arduino sketch ends up calling underneath, so reading IDF examples is the fastest way to
        understand what your Arduino code is really doing. PlatformIO is the pragmatic default once a project has more
        than one source file or needs to be checked into version control with pinned dependencies.
      </p>
      <h2>Flashing: <code>esptool.py</code> under the hood</h2>
      <p>
        Every toolchain ends at the same place: <code>esptool.py</code> talking to the ROM bootloader over UART0
        (GPIO1=TX, GPIO3=RX). The bootloader auto-bauds — it'll happily accept anything from 9600 up to 921600 (and on
        some setups 1.5 Mbaud), but{" "}
        <strong>921600</strong> is the sweet spot for stability across USB-UART bridges.
      </p>
      <CodeBlock
        language="text"
        filename="flash.sh"
        code={`# Detect the chip and dump its eFuse summary (no flashing)
esptool.py --port /dev/ttyUSB0 chip_id
esptool.py --port /dev/ttyUSB0 read_mac

# Erase the whole flash — clears partition table, NVS, OTA slots
esptool.py --port /dev/ttyUSB0 erase_flash

# Flash a single binary at the application offset (0x10000 by default)
esptool.py --chip esp32 --port /dev/ttyUSB0 --baud 921600 \\
  write_flash -z 0x10000 build/firmware.bin

# Full IDF-style flash: bootloader, partition table, and application
esptool.py --chip esp32 --port /dev/ttyUSB0 --baud 921600 \\
  write_flash -z \\
    0x1000  build/bootloader/bootloader.bin \\
    0x8000  build/partition_table/partition-table.bin \\
    0x10000 build/firmware.bin

# Monitor the serial output at 115200 (the app's UART0 default)
miniterm.py /dev/ttyUSB0 115200`}
      />
      <Callout label="// auto-reset into bootloader">
        Modern <code>esptool.py</code> uses the DTR/RTS lines to pulse EN low (reset) while holding GPIO0 low (boot mode).
        If your USB-UART bridge doesn't expose both lines, or you're flashing a bare module, you'll need to short
        GPIO0–GND, pulse EN to GND, then release GPIO0 — the manual version of what the dev board does for you.
      </Callout>
      <h2>Peripherals and their realistic ceilings</h2>
      <SpecTable
        rows={[
          [
            "UART",
            <>
              3× hardware. Default app rate is 115200; <strong>921600 is reliably the practical max</strong> over the
              on-board USB-UART; 5 Mbaud is the theoretical chip limit on a direct level-shifted connection.
            </>,
          ],
          [
            "I²C",
            <>
              2× hardware. Speeds: <strong>100 kHz</strong> (standard), <strong>400 kHz</strong> (fast), up to{" "}
              <strong>1 MHz</strong> (fast-mode-plus) if both devices and the pull-ups cooperate. Both buses are
              pin-muxable via the GPIO matrix.
            </>,
          ],
          [
            "SPI",
            <>
              HSPI and VSPI are general-purpose, up to <strong>80 MHz</strong> on a direct-pin layout (40 MHz once you
              route through the GPIO matrix). Use DMA for any transfer ≥ 64 bytes.
            </>,
          ],
          [
            "ADC",
            <>
              12-bit SAR. Effective resolution is closer to <strong>~10 bits</strong> after nonlinearity — the curve sags
              at the rails, gets noisy near V<sub>DD</sub>. Calibrate with the eFuse Vref or oversample.
            </>,
          ],
          [
            "DAC",
            <>
              2× 8-bit (GPIO25/26). True analog out, but only 256 levels. Use the PDM / cosine generator if you need
              audio.
            </>,
          ],
          [
            "LEDC (PWM)",
            <>
              16 channels (8 high-speed + 8 low-speed) sharing 4 timers. Resolution ↔ frequency tradeoff:{" "}
              <strong>1 kHz @ 16-bit</strong>, <strong>10 kHz @ 13-bit</strong>, <strong>40 MHz @ 1-bit</strong>.
            </>,
          ],
          [
            "RMT",
            <>
              Built for IR remote codes but secretly the right tool for any custom waveform: WS2812 LEDs, 1-Wire, IR-NEC,
              stepper pulse trains. 8 channels, each with its own pattern memory.
            </>,
          ],
          [
            "I²S",
            <>
              2 controllers, can be ganged for 24-bit stereo audio. Also the trick used to drive parallel LCD panels and
              high-throughput WS2812 strings.
            </>,
          ],
          [
            "Wi-Fi",
            <>
              2.4 GHz only (no 5 GHz). STA, AP, and STA+AP modes; ESP-NOW for 250 µs connectionless peer-to-peer.
              Realistic TCP throughput ~10–20 Mbps. See <a href="#/pr-i2c">pr-i2c</a> for the bus pattern and{" "}
              <a href="#/pr-pwm">pr-pwm</a> for the LEDC math.
            </>,
          ],
          [
            "BLE",
            <>
              Bluetooth 4.2 (not 5). Peripheral, central, or both via the NimBLE stack in ESP-IDF. The original ESP32 has
              no Coded PHY or extended advertising — for those, use the S3/C3.
            </>,
          ],
        ]}
      />
      <h2>Hello world over UART, three ways</h2>
      <p>
        Same job, three toolchains. Open a terminal at 115200 8N1 to see the output.
      </p>
      <CodeBlock
        language="cpp"
        filename="hello.ino"
        code={`// Arduino-ESP32 core
void setup() {
  Serial.begin(115200);     // UART0 on GPIO1/3, USB-bridged on dev boards
  pinMode(2, OUTPUT);        // GPIO2 — onboard LED on most dev kits
}

void loop() {
  Serial.printf("uptime: %lu ms\\n", millis());
  digitalWrite(2, !digitalRead(2));
  delay(500);
}`}
      />
      <CodeBlock
        language="c"
        filename="main/hello_main.c"
        code={`// ESP-IDF (same effect, FreeRTOS task model)
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_log.h"

static const char *TAG = "hello";

void app_main(void) {
    gpio_set_direction(GPIO_NUM_2, GPIO_MODE_OUTPUT);
    int level = 0;
    while (1) {
        ESP_LOGI(TAG, "uptime: %lu ms", (unsigned long)(esp_log_timestamp()));
        gpio_set_level(GPIO_NUM_2, level ^= 1);
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}`}
      />
      <CodeBlock
        language="python"
        filename="main.py"
        code={`# MicroPython
import time
from machine import Pin

led = Pin(2, Pin.OUT)
t0 = time.ticks_ms()
while True:
    print("uptime:", time.ticks_diff(time.ticks_ms(), t0), "ms")
    led.value(not led.value())
    time.sleep_ms(500)`}
      />
      <p>
        The Arduino version compiles down to the IDF version with extra glue; the IDF version is FreeRTOS-native and gives
        you the scheduling control needed for radios and DMA. MicroPython runs in interpreted bytecode at maybe 2% the
        speed but means you can iterate from the REPL with no flash cycle.
      </p>
      <h2>Wiring a sensor: the I²C pattern</h2>
      <p>
        Most ESP32 projects bottom out at "talk to an I²C sensor and ship the reading over Wi-Fi." The pattern is the
        same on every board: SDA + SCL with 4.7 kΩ pull-ups to 3.3 V, sensor V<sub>DD</sub> tied to the 3V3 rail, common
        ground, and any two free GPIOs picked through the GPIO matrix (the default convention is GPIO21=SDA, GPIO22=SCL,
        but it's just a default — you can move them).
      </p>
      <CodeBlock
        language="cpp"
        filename="bme280_read.ino"
        code={`#include <Wire.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;       // I²C address 0x76 or 0x77

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);        // SDA=21, SCL=22 — pick any two safe pins
  Wire.setClock(400000);     // 400 kHz fast mode
  if (!bme.begin(0x76)) {
    Serial.println("BME280 not found at 0x76, trying 0x77");
    bme.begin(0x77);
  }
}

void loop() {
  Serial.printf("T=%.2f C  P=%.1f hPa  RH=%.1f%%\\n",
                bme.readTemperature(),
                bme.readPressure() / 100.0,
                bme.readHumidity());
  delay(2000);
}`}
      />
      <p>
        For everything past two devices, switch to <code>setPins()</code>-style explicit mapping and don't rely on the
        default pins — the Espressif convention has drifted across board revisions and a fresh board may not match. See{" "}
        <a href="#/pr-i2c">pr-i2c</a> for how the bus actually clocks.
      </p>
      <h2>Wi-Fi in five lines, BLE in twenty</h2>
      <CodeBlock
        language="cpp"
        filename="wifi_post.ino"
        code={`#include <WiFi.h>
#include <HTTPClient.h>

void setup() {
  Serial.begin(115200);
  WiFi.begin("ssid", "password");
  while (WiFi.status() != WL_CONNECTED) { delay(250); Serial.print("."); }
  Serial.printf("\\nIP: %s\\n", WiFi.localIP().toString().c_str());

  HTTPClient http;
  http.begin("https://httpbin.org/post");
  http.addHeader("Content-Type", "application/json");
  int code = http.POST("{\\"hello\\": \\"world\\"}");
  Serial.printf("HTTP %d: %s\\n", code, http.getString().c_str());
}

void loop() {}`}
      />
      <p>
        Use <code>WiFi.setSleep(false)</code> for sustained low-latency throughput (the radio sleeps between AP beacons
        by default — fine for sensor uploads, fatal for real-time control). For tightly-paired devices that don't need
        an AP, use <strong>ESP-NOW</strong>: connectionless 250-byte packets between peers, ~1 ms RTT, no router.
      </p>
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>Brownout under Wi-Fi TX.</strong> The radio bursts pull 300–700 mA for ~10 ms. Underspec'd LDOs or
          long thin USB cables sag the rail below 2.7 V and the brownout detector resets the chip. Symptom: works on
          USB-3 port, dies on a 1 m white cable. Fix: a real 500 mA LDO + 10 µF tank cap at the module.
        </li>
        <li>
          <strong>ADC2 vs Wi-Fi.</strong> Already flagged above, repeated here because every newcomer is bitten:
          GPIOs on ADC2 (0/2/4/12–15/25–27) can't be sampled while the radio is up. Pick ADC1 (32–39) for analog.
        </li>
        <li>
          <strong>ADC nonlinearity.</strong> The 12-bit reading is closer to 10 effective bits — the curve sags at both
          rails. Apply the eFuse two-point calibration (<code>esp_adc_cal</code>), or oversample 16–64 reads and average.
        </li>
        <li>
          <strong>Strapping pins are not free GPIO.</strong> Wire an external pull-down on GPIO0 and the chip refuses
          to boot. Wire a strong pull-up on GPIO12 and the bootloader picks the wrong flash voltage. Default rule: if
          you must use a strapping pin as an output, drive it through a series resistor and don't pull it during reset.
        </li>
        <li>
          <strong>GPIO34–39 have no internal pull-ups.</strong> If you put a button on GPIO34, add an external 10 kΩ
          pull-up — there's no <code>INPUT_PULLUP</code> option for those pins.
        </li>
        <li>
          <strong>Deep sleep wakeups only on RTC-domain pins.</strong> External wake works on RTC GPIO 0, 2, 4, 12–15,
          25–27, 32–39. The rest of the chip is powered down. Touch wake works on the touch-capable subset.
        </li>
        <li>
          <strong>Flash encryption is a one-way door.</strong> Enabling <code>FLASH_CRYPT_CNT</code> in eFuse is
          permanent. Once on, you can only flash encrypted images, and a wrong key bricks the chip. Test the whole flow
          on a sacrificial board before shipping.
        </li>
        <li>
          <strong>Serial output during boot.</strong> GPIO15 strapping controls whether the ROM prints boot logs on
          UART0. If you've wired GPIO15 to something that pulls it low, you lose the logs (which is actually how you
          silence the noise on production boards).
        </li>
      </ul>
    </>
  ),
  "c-rp2040": () => (
    <>
      <h2>What it is</h2>
      <p>
        Raspberry Pi's first in-house silicon, released in January 2021. A <strong>dual ARM Cortex-M0+</strong> at 133 MHz
        (overclockable past 200 with no drama), 264 KB of on-die SRAM split into six independently-arbitrated banks, and a
        peripheral the rest of the industry doesn't have: <strong>PIO</strong> — eight tiny programmable state machines
        that let you spin up exotic, cycle-accurate I/O protocols in software. Unusually for a microcontroller it has{" "}
        <strong>no on-chip flash</strong> — the boot ROM loads code over QSPI from an external flash chip (typically a 2
        MB W25Q16 on a Pico, or 16 MB on flash-fat dev boards). The trade-off is freedom: pick the flash size at design
        time, swap chips for different SKUs.
      </p>
      <Callout>
        For new designs you'd also look at the <strong>RP2350</strong> (Pico 2, 2024): dual Cortex-M33 + dual RISC-V
        Hazard3 (you pick which pair boots), 520 KB SRAM, ARM TrustZone, faster GPIO. Drop-in pin-compatible with the
        RP2040 on the Pico-2 board. The original RP2040 stays in production and dominates education / hobby use because
        the documentation, the cheap board, and the toolchain are unmatched.
      </Callout>
      <h2>RP2040 vs Pico vs Pico W</h2>
      <p>
        Easy to confuse three things that ship as the same blue silkscreen:
      </p>
      <Compare
        header={["", "Chip", "Module / board", "Adds"]}
        rows={[
          ["RP2040", "Bare 7×7 mm QFN-56", "—", "The silicon. You design a board around it"],
          ["Raspberry Pi Pico", "RP2040", "21×51 mm castellated board", "External 2 MB flash, 12 MHz crystal, USB µB, BOOTSEL button, onboard LED"],
          ["Raspberry Pi Pico W", "RP2040 + CYW43439", "Same form factor as Pico", "2.4 GHz Wi-Fi b/g/n + BT 5.2 (BLE) over SPI to the CYW43"],
          ["Raspberry Pi Pico 2", "RP2350", "Pin-compatible Pico drop-in", "Cortex-M33 / RISC-V dual-arch, 520 KB SRAM, TrustZone"],
        ]}
      />
      <p>
        Throughout the rest of this page, examples assume the RP2040-based <strong>Pico</strong> board because it's what
        most people have on the bench. Pin numbers map to GPIOxx, not the physical board pins (the board's "Pin 1" is{" "}
        GPIO0, but "Pin 31" is GPIO26 — the Pico pinout PDF is the only authoritative source).
      </p>
      <h2>Datasheet at a glance</h2>
      <SpecTable
        rows={[
          ["CPU", <>2× ARM Cortex-M0+ @ up to 133 MHz (200+ MHz overclock is routine and stable at room temp)</>],
          ["Memory", <>264 KB SRAM in 6 banks (4× 64 KB + 2× 4 KB) for parallel access from both cores + DMA + USB</>],
          ["Flash", <>Off-chip QSPI, up to 16 MB. 2 MB on the Pico, 4 MB on most third-party boards</>],
          ["GPIO", <>30 GPIO total on the QFN-56; 26 of them broken out on the Pico (GPIO0–22, 26–28). 4 of those can be ADC inputs</>],
          ["ADC", <>1× 12-bit SAR @ 500 kS/s, mux'd across 4 inputs + on-die temperature sensor</>],
          ["UART", <>2× 16550-compatible. Pin-muxable across many GPIOs (see "GPIO function table" in the datasheet)</>],
          ["I²C", <>2× hardware. 100 kHz / 400 kHz / 1 MHz. Pin-muxable</>],
          ["SPI", <>2× hardware, up to 62.5 MHz (≈ clk/2)</>],
          ["PWM", <>8 slices × 2 channels = 16 channels, sharing one base clock</>],
          ["USB", <>1.1 Full-Speed (12 Mbps), can run as device or host</>],
          ["PIO", <>2 blocks × 4 state machines each = <strong>8 software-defined I/O engines</strong></>],
          ["DMA", <>12 channels with chained transfers and pacing from any peripheral request</>],
          [<>V<sub>DD</sub></>, <>1.8 – 3.3 V (digital), separate 1.1 V core rail generated by internal LDO</>],
          ["Package", <>QFN-56 (7×7 mm) chip, or Pico board (21×51 mm)</>],
        ]}
      />
      <h2>The Pico, pin by pin</h2>
      <p>
        Unlike the ESP32, there are <strong>no strapping pins, no input-only pins, no reserved flash pins</strong> exposed
        to the user — the QSPI flash lives inside the module and you can't even reach those GPIOs. Every GPIO on the
        headers is fully equal: bidirectional, with internal pull-up/down, and routable to almost any peripheral via the
        GPIO function mux.
      </p>
      <SpecTable
        rows={[
          ["Default UART0", <>GPIO0 = TX, GPIO1 = RX (movable to many other pairs)</>],
          ["Default I²C0", <>GPIO4 = SDA, GPIO5 = SCL</>],
          ["Default I²C1", <>GPIO6 = SDA, GPIO7 = SCL</>],
          ["Default SPI0", <>GPIO16 = MISO, GPIO17 = CS, GPIO18 = SCK, GPIO19 = MOSI</>],
          [
            "ADC inputs (12-bit)",
            <>
              <strong>GPIO26 = ADC0</strong>, GPIO27 = ADC1, GPIO28 = ADC2, GPIO29 = ADC3 (Pico-internal: V<sub>SYS</sub>/3
              for battery monitoring), <strong>ADC4 = on-die temperature sensor</strong>
            </>,
          ],
          ["Onboard LED", <>GPIO25 (Pico) — but on the Pico W it's on the CYW43439, reached via the Wi-Fi driver, not GPIO</>],
          [
            "Pico-specific control",
            <>
              GPIO23 = SMPS PWM mode (set high for less ripple on ADC), GPIO24 = V<sub>BUS</sub> sense, GPIO29 = V
              <sub>SYS</sub> sense
            </>,
          ],
          [
            "Power pins (Pico)",
            <>
              V<sub>BUS</sub> (USB 5 V passthrough), V<sub>SYS</sub> (1.8 – 5.5 V battery input), 3V3_OUT (300 mA from
              onboard SMPS), 3V3_EN (drive low to shut the board down)
            </>,
          ],
        ]}
      />
      <Callout label="// the GPIO function mux">
        Each GPIO can be routed to ~10 different peripheral functions via the IO_BANK0 mux. UART0 isn't pinned to
        GPIO0/1 — that's just the default; you can put UART0_TX on GPIO12 with one register write. PIO state machines
        can drive any contiguous set of GPIOs. It's the most flexible pinout of any sub-$5 MCU.
      </Callout>
      <h2>Power and boot — drag and drop</h2>
      <p>
        The Pico boots in one of two modes, decided at reset by the <strong>BOOTSEL</strong> button:
      </p>
      <ol>
        <li>
          <strong>Normal boot:</strong> ROM loads the second-stage bootloader from XIP flash, which jumps to your
          application. This is what happens every time you plug power in normally.
        </li>
        <li>
          <strong>BOOTSEL mode:</strong> hold the BOOTSEL button while plugging in USB. The chip enumerates as a USB Mass
          Storage device called <code>RPI-RP2</code>. Drag a <code>.uf2</code> file onto it; the bootloader writes it to
          flash and resets into your app. <em>No driver. No esptool. No serial port dance.</em>
        </li>
      </ol>
      <p>
        On a custom board without a BOOTSEL button, ground the <code>QSPI_SS</code> pin on power-up to enter BOOTSEL.
        Once the chip is alive, a <code>picotool reboot -f -u</code> from a running app also triggers it without touching
        hardware.
      </p>
      <Callout label="// power budget">
        Typical: 20–30 mA at 125 MHz with both cores idle, ~50 mA active. The on-board SMPS on the Pico is good for{" "}
        <strong>300 mA on 3V3_OUT</strong> — plenty for sensors and a small OLED, not enough for a power-hungry radio
        module. Pull GPIO23 high to force SMPS PWM mode and trade efficiency for cleaner ADC readings.
      </Callout>
      <h2>Toolchains</h2>
      <Compare
        header={["", "What it is", "Use when"]}
        rows={[
          [
            "pico-sdk (C/C++)",
            "Raspberry Pi's first-party SDK. CMake build, hardware_xxx libraries, full PIO assembler",
            "Production firmware, when you need PIO, when you want bare-metal performance",
          ],
          [
            "Arduino-pico",
            "Earle Philhower's Arduino core. setup() / loop() but with full pico-sdk available underneath",
            "Existing Arduino libraries, fast prototyping, when you don't need to fight CMake",
          ],
          [
            "MicroPython",
            "Official build maintained by the Damien George / Raspberry Pi joint. Includes a PIO assembler",
            "REPL-driven exploration, classrooms, any project where flash-iterate latency hurts",
          ],
          [
            "CircuitPython",
            "Adafruit's MicroPython fork. Drag .py files onto the CIRCUITPY drive — no REPL upload needed",
            "Total beginners, sensor-heavy projects backed by Adafruit's library set",
          ],
          [
            "Rust (embassy / rp-hal)",
            "Mature async-Rust HAL and bare-metal HAL. PIO assembler via macros",
            "When you want strong types and async over the bare-metal C feel",
          ],
        ]}
      />
      <h2>Flashing: just copy a file</h2>
      <p>
        The RP2040 is the rare MCU where the canonical flash workflow is <em>not</em> a CLI tool. The pico-sdk emits a{" "}
        <code>.uf2</code> file — a Microsoft-defined USB flashing format that packs binary + load address in 512-byte
        blocks — and you drag it onto the RPI-RP2 USB drive. For scripted CI/CD use{" "}
        <code>picotool</code>:
      </p>
      <CodeBlock
        language="text"
        filename="flash.sh"
        code={`# Build (using the pico-sdk CMake template)
mkdir build && cd build
cmake .. -DPICO_BOARD=pico        # or pico_w, pico2, pico2_w
make -j

# Drag-and-drop flow: hold BOOTSEL, plug in, then
cp blink.uf2 /run/media/$USER/RPI-RP2/

# OR: scripted flash with picotool (Pico must be in BOOTSEL mode,
# or running an app linked with stdio_usb so it can be force-rebooted)
picotool info -a                              # what's on the chip
picotool load -fx blink.uf2                   # force-reboot, flash, reboot
picotool reboot -f -u                         # boot a running Pico into BOOTSEL

# Serial monitor — the Pico enumerates as /dev/ttyACM0 once stdio_usb is up
minicom -D /dev/ttyACM0 -b 115200`}
      />
      <h2>Peripherals and their realistic ceilings</h2>
      <SpecTable
        rows={[
          [
            "UART",
            <>
              2× 16550-compatible. Up to <strong>4.6 Mbaud</strong> on paper, <strong>921600</strong> reliably in
              practice over USB-UART bridges. Pin-muxable.
            </>,
          ],
          [
            "I²C",
            <>
              2× hardware, Synopsys DesignWare IP. Standard <strong>100 kHz</strong>, fast <strong>400 kHz</strong>,
              fast-mode-plus <strong>1 MHz</strong>. The hardware has a notorious 10-bit-address quirk worth checking
              in errata.
            </>,
          ],
          [
            "SPI",
            <>
              2× hardware, PL022-compatible. <strong>Up to 62.5 MHz</strong> (sys_clk / 2). DMA chained transfers make
              this the right channel for fast display panels.
            </>,
          ],
          [
            "ADC",
            <>
              1× 12-bit @ <strong>500 kS/s</strong>, muxed across 4 inputs + the on-die temp sensor (channel 4). ENOB is
              ~9 bits — there's a well-documented DNL artifact at codes near multiples of 512 (the "RP2040 ADC
              staircase"). Decouple AVDD with a ferrite or you'll see SMPS ripple in your readings.
            </>,
          ],
          [
            "PWM",
            <>
              8 slices, each with 2 channels — 16 output channels total. All share one base clock; one slice picks the
              frequency, both channels of that slice pick the duty. Resolution × frequency tradeoff identical to LEDC:{" "}
              <strong>~2 kHz @ 16-bit</strong>, ~30 kHz @ 12-bit at 125 MHz sys_clk.
            </>,
          ],
          [
            "USB",
            <>
              Full-Speed (12 Mbps) only — no High-Speed. Built-in host and device support. TinyUSB ships with the SDK,
              so HID / CDC / MIDI device classes are one #define away.
            </>,
          ],
          [
            "DMA",
            <>
              12 channels, paceable from any peripheral DREQ. <strong>Chained</strong> transfers let one channel
              configure the next — circular buffers, double-buffered ADC streams, even a chain that re-programs itself
              are routine.
            </>,
          ],
          [
            "PIO",
            <>
              2 blocks × 4 state machines. Each instruction is 16 bits, each program is up to 32 instructions, the
              fastest a state machine runs is{" "}
              <strong>one instruction per sys_clk cycle</strong> (= 7.5 ns at 133 MHz). DMA-coupled, IRQ-coupled,
              FIFO-buffered.
            </>,
          ],
        ]}
      />
      <h2>The PIO secret weapon</h2>
      <p>
        The PIO is what makes the RP2040 different from every other sub-$5 MCU. Each of the 8 state machines is a tiny
        CPU with 9 instructions, designed exclusively for shoveling bits in and out of GPIO at deterministic rates. They
        can drive arbitrary serial protocols you'd otherwise need an FPGA for: WS2812 strings with no DMA glitch
        windows, parallel LCD panels at 25 MHz, the DPI signal for a VGA monitor, a quadrature decoder that doesn't drop
        edges at 1 MHz, even a USB-to-PS/2 bridge.
      </p>
      <p>
        Here's a "blink an LED in pure PIO" — the M0 sets the program running and never touches it again:
      </p>
      <CodeBlock
        language="c"
        filename="blink.pio + main.c"
        code={`; blink.pio — 4-instruction PIO program. Toggles a pin at sys_clk / N.
.program blink

    set pindirs, 1         ; the GPIO bound to this state machine is an output
loop:
    set pins, 1     [31]   ; pin high, then idle 31 cycles
    nop             [31]   ; idle another 31 — total 63 cycles HIGH
    set pins, 0     [31]   ; pin low, then idle 31
    nop             [31]   ; total 63 cycles LOW
    jmp loop

// main.c — load, configure clock divider, point at GPIO25, run
#include "blink.pio.h"
int main(void) {
    PIO pio = pio0;
    uint sm = 0;
    uint offset = pio_add_program(pio, &blink_program);

    pio_sm_config c = blink_program_get_default_config(offset);
    sm_config_set_set_pins(&c, 25, 1);     // bind GPIO25 to the SET destination
    sm_config_set_clkdiv(&c, 65535.0f);    // ~0.5 Hz blink at 125 MHz sys_clk
    pio_gpio_init(pio, 25);
    pio_sm_init(pio, sm, offset, &c);
    pio_sm_set_enabled(pio, sm, true);

    while (1) { tight_loop_contents(); }   // M0 has nothing to do
}`}
      />
      <p>
        A WS2812 driver is 4 PIO instructions. An SPI peripheral with a custom framing is 6. The PIO assembler is in the
        SDK; <code>pioasm</code> emits a C header you include directly.
      </p>
      <h2>Hello world over USB-CDC</h2>
      <p>
        Three ways, same blink + print. The Pico's USB port shows up as <code>/dev/ttyACM0</code> once{" "}
        <code>stdio_usb</code> is enabled — no separate USB-UART bridge needed.
      </p>
      <CodeBlock
        language="c"
        filename="hello.c (pico-sdk)"
        code={`#include "pico/stdlib.h"

int main(void) {
    stdio_init_all();                    // routes printf to USB-CDC at 115200
    gpio_init(PICO_DEFAULT_LED_PIN);
    gpio_set_dir(PICO_DEFAULT_LED_PIN, GPIO_OUT);

    while (1) {
        printf("uptime: %llu ms\\n", to_ms_since_boot(get_absolute_time()));
        gpio_xor_mask(1u << PICO_DEFAULT_LED_PIN);
        sleep_ms(500);
    }
}`}
      />
      <CodeBlock
        language="cpp"
        filename="hello.ino (Arduino-pico)"
        code={`void setup() {
  Serial.begin(115200);     // USB-CDC; baud is ignored, link is always 12 Mbps
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  Serial.printf("uptime: %lu ms\\n", millis());
  digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  delay(500);
}`}
      />
      <CodeBlock
        language="python"
        filename="main.py (MicroPython)"
        code={`import time
from machine import Pin

led = Pin("LED", Pin.OUT)   # works on Pico and Pico W
t0 = time.ticks_ms()
while True:
    print("uptime:", time.ticks_diff(time.ticks_ms(), t0), "ms")
    led.toggle()
    time.sleep_ms(500)`}
      />
      <h2>Wi-Fi on the Pico W</h2>
      <p>
        The Pico W bolts a CYW43439 Wi-Fi+BLE radio onto the RP2040 over SPI. The driver, <code>cyw43_arch</code>, lives
        in the SDK and exposes a lwIP stack on top. From C, it's three calls to get on the air:
      </p>
      <CodeBlock
        language="c"
        filename="wifi_join.c"
        code={`#include "pico/stdlib.h"
#include "pico/cyw43_arch.h"

int main(void) {
    stdio_init_all();
    if (cyw43_arch_init()) return -1;
    cyw43_arch_enable_sta_mode();

    if (cyw43_arch_wifi_connect_timeout_ms("ssid", "password",
        CYW43_AUTH_WPA2_AES_PSK, 30000)) {
        printf("connect failed\\n");
        return -1;
    }
    printf("got IP: %s\\n",
        ip4addr_ntoa(netif_ip4_addr(&cyw43_state.netif[CYW43_ITF_STA])));
    // ... use lwIP sockets / pico_lwip TCP/UDP API from here
    while (1) sleep_ms(1000);
}`}
      />
      <p>
        Onboard LED control on the Pico W is awkward: GPIO25 isn't wired to the LED — the LED is on a CYW43 pin, so{" "}
        <code>cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 1)</code> is the call. Arduino-pico and MicroPython hide this
        behind <code>LED_BUILTIN</code> / <code>Pin("LED")</code>.
      </p>
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>The chip has no on-board flash.</strong> The Pico board solves this for you, but a custom RP2040 PCB
          needs an external QSPI flash and the matching second-stage bootloader (Winbond W25Q families work without any
          changes; other vendors may need a different blob).
        </li>
        <li>
          <strong>ADC nonlinearity.</strong> The 12-bit reading has a documented DNL bump near codes that are multiples
          of 512 — the "RP2040 staircase". Oversample, dither with software noise, or just accept ~9 ENOB and move on.
          Add a ferrite + 1 µF on AVDD to keep SMPS ripple out.
        </li>
        <li>
          <strong>USB host needs external power switching.</strong> The Pico can run as a USB host but it can't source
          V<sub>BUS</sub> for a downstream device — you need a separate 5 V supply plus a TPS2065-style power switch
          and the right TinyUSB host stack.
        </li>
        <li>
          <strong>Both cores share one set of peripherals.</strong> Spawn a second-core thread that writes to the same
          UART as core 0 and you'll mangle output. Use the SDK's <code>multicore_fifo</code> or a mutex; for shared
          peripherals, pin them to one core.
        </li>
        <li>
          <strong>I²C is a Synopsys DesignWare block.</strong> Inherits a long-known erratum: clock stretching by a slave
          can cause the RP2040 to send a spurious extra clock pulse, breaking some sensors. Workaround is in the SDK's
          <code>hardware_i2c</code> issue tracker; check it before integrating finicky parts.
        </li>
        <li>
          <strong>Default clocks are conservative.</strong> The system clock comes up at 125 MHz, peripherals at
          carefully-chosen divisors. <code>set_sys_clock_khz(200000, true)</code> overclocks reliably on every chip
          tested; pushing to 300 MHz often works but isn't guaranteed across silicon.
        </li>
        <li>
          <strong>USB-CDC baud is fiction.</strong> Setting 115200 in your terminal does nothing — the USB link is always
          12 Mbps. But some libraries still gate "is the host connected?" on a non-zero baud rate seen via{" "}
          <code>cdc_line_state</code>, so check that flag before printing if you care about the first few bytes.
        </li>
        <li>
          <strong>Pico W GPIO23/24/25 are not what you think.</strong> Reassigned to the CYW43 radio interface. Don't
          wire anything to them on a Pico W shield design or you'll fight the Wi-Fi driver.
        </li>
      </ul>
    </>
  ),
  "c-stm32": () => (
    <>
      <h2>What it is</h2>
      <p>
        STMicroelectronics' ARM Cortex-M family — the industrial standard for "I need a real microcontroller in a real
        product." Where the ESP32 is "MCU + Wi-Fi for $3" and the RP2040 is "the hobby community's favourite weirdo," the
        STM32 is what's actually inside the washing machine, the medical device, the drone flight controller, and the
        FOC motor driver on your bench. Wide voltage range, deterministic timers, dense and well-validated peripherals,
        a HAL that's been beaten on for fifteen years, and tools that are free but professional-grade.
      </p>
      <p>
        The downside is that "STM32" isn't one chip — it's <strong>~2000 part numbers</strong> across a dozen families
        (F0, F1, F3, F4, F7, H7, L0, L1, L4, L5, G0, G4, U5, WB, WL…). The peripherals are mostly the same across the
        line, but clocks, packages, and feature sets shift between every group. Pick the wrong family and you'll discover
        on month two that the DMA mux behaves differently or the bootloader doesn't speak USB DFU on your part.
      </p>
      <Callout>
        For the rest of this page the worked examples target the <strong>STM32F103C8T6</strong> on the "Blue Pill" board
        — the ~$3 dev module that's the canonical first STM32. Where the F4 (the production workhorse) or H7 (the
        Cortex-M7 monster) differs materially, it's called out.
      </Callout>
      <h2>The family at a glance</h2>
      <Compare
        header={["", "Core", "Clock", "Sweet spot"]}
        rows={[
          ["STM32F0", "Cortex-M0", "48 MHz", "Cheap entry-level, 8-bit replacements"],
          ["STM32F1", "Cortex-M3", "72 MHz", "Legacy workhorse. The Blue Pill chip"],
          ["STM32F3", "Cortex-M4F", "72 MHz", "Analog-heavy: fast comparators, op-amps on-die"],
          ["STM32F4", "Cortex-M4F", "168–180 MHz", "Production default. F407 Discovery is the canonical board"],
          ["STM32F7", "Cortex-M7", "216 MHz", "Cache + double-precision FPU. Audio, vision pre-processing"],
          ["STM32H7", "Cortex-M7 (+M4)", "Up to 550 MHz", "The monster. Cache, DMA grid, dual-core variants"],
          ["STM32L0/L4/L5/U5", "M0+ / M4 / M33 / M33", "32–160 MHz", "Low power. STOP modes in single-digit µA"],
          ["STM32G0/G4", "Cortex-M0+ / M4", "64–170 MHz", "Newer mainstream, replacing F0/F3 in new designs"],
          ["STM32WB / WL", "M4 + radio coprocessor", "64 MHz", "BLE / Zigbee / Thread / LoRa on-die"],
        ]}
      />
      <h2>The Blue Pill, and the Blue Pill counterfeit problem</h2>
      <p>
        A 53 × 22 mm castellated board with an STM32F103C8T6, a USB-µB port, two pushbuttons, an LED on PC13, and two jumpers
        that set the boot pins. Roughly $2 from AliExpress, $5 from a reputable distributor. It's been the first STM32
        for a generation of embedded developers — but two long-running problems sit on top of it:
      </p>
      <ul>
        <li>
          <strong>The USB pull-up is wrong.</strong> The datasheet says a 1.5 kΩ pull-up from D+ to 3.3 V (signalling
          full-speed); the Blue Pill ships with a 10 kΩ resistor (R10) which is wildly out of spec. It usually enumerates
          anyway, but some hosts (especially USB3 hubs and Macs) refuse. The fix is to replace R10 with 1.5 kΩ, or tack a
          ~1.8 kΩ from D+ to 3.3 V across it.
        </li>
        <li>
          <strong>Counterfeit chips are everywhere.</strong> Cheap Blue Pills increasingly ship with relabeled CKS32 / GD32
          clones, or genuine F103C6 (32 KB) re-marked as C8 (64 KB). Symptom: code runs fine until you cross the 32 KB
          flash boundary, then bricks mysteriously. <code>st-info --probe</code> or the readable Flash Size Register at
          <code>0x1FFFF7E0</code> tells you what's actually on the board.
        </li>
      </ul>
      <Callout>
        Newer alternative: the <strong>"Black Pill"</strong> (WeAct STM32F411CEU6) — same form factor, Cortex-M4F at 100
        MHz, USB-C, working USB pull-up, real ST silicon, ~$8. If you're starting a new project today, get a Black Pill
        instead. The Blue Pill is still the most-tutorialled board on the internet, which is the only reason to keep
        reaching for it.
      </Callout>
      <h2>Datasheet at a glance (STM32F103C8T6)</h2>
      <SpecTable
        rows={[
          ["CPU", "ARM Cortex-M3 @ 72 MHz max (no FPU)"],
          ["Memory", "64 KB Flash (often 128 KB on C8 silicon — the 'extra 64' bonus), 20 KB SRAM"],
          ["GPIO", "37 usable on the LQFP-48 package (across ports A/B/C). All 5V-tolerant on PA8+, PB0+, PC13"],
          ["ADC", "2× 12-bit SAR @ 1 MS/s each, 16 channels total, includes an internal temp + Vrefint"],
          ["DAC", "None on F103 (F100 / F303 / F4 have it)"],
          ["UART", "3× USART (1 hardware-flow-control capable)"],
          ["I²C", "2× hardware, 100 kHz / 400 kHz. The Synopsys block — famously buggy errata, see gotchas"],
          ["SPI", "2× hardware, up to 18 MHz (clk/2)"],
          ["Timers", "4× general-purpose 16-bit + 1× advanced 16-bit + 2× basic 16-bit. PWM, encoder, capture/compare"],
          ["USB", "Full-Speed (12 Mbps) device only. No host. No DMA — the USB block uses packet memory"],
          ["CAN", "1× bxCAN. Shares pins and registers with USB on some packages — exclusive use"],
          [<>V<sub>DD</sub></>, <>2.0 – 3.6 V. Most pins 5V-tolerant for digital inputs</>],
          ["Package", "LQFP-48 on the Blue Pill, also LQFP-64 / LQFP-100 / TQFP / BGA"],
        ]}
      />
      <h2>GPIO, pin mux, and the AFIO model</h2>
      <p>
        STM32 GPIOs live in 16-pin <strong>ports</strong> (GPIOA, GPIOB, …). Each pin has a fixed default function plus a
        small set of <strong>alternate functions</strong> chosen at config time. On the F1 family the alternate functions
        are coarse — a peripheral block (USART1, SPI1, etc.) gets mapped to one of typically two pin sets through the
        <strong> AFIO remap</strong> register, all-or-nothing. The F2 and later families switched to a per-pin AFIO mux
        that's much more flexible.
      </p>
      <SpecTable
        rows={[
          ["Default USART1", "PA9 = TX, PA10 = RX (remappable to PB6/PB7)"],
          ["Default USART2", "PA2 = TX, PA3 = RX"],
          ["Default I²C1", "PB6 = SCL, PB7 = SDA (remappable to PB8/PB9)"],
          ["Default SPI1", "PA5 = SCK, PA6 = MISO, PA7 = MOSI"],
          ["USB", "PA11 = D−, PA12 = D+"],
          ["SWD (programming / debug)", "PA13 = SWDIO, PA14 = SWCLK"],
          ["Boot pins", "BOOT0 (pin 44 on LQFP-48) + BOOT1 = PB2"],
          ["ADC pins", "PA0-7, PB0-1, PC0-5 (PA0 = ADC1_IN0)"],
          ["Onboard LED (Blue Pill)", "PC13 — active LOW, 3 mA max drain when configured as output"],
        ]}
      />
      <Callout label="// PC13 is a strange GPIO">
        On the F103, PC13/14/15 are connected to the internal RTC domain and the LSE oscillator. They can drive up to
        only <strong>3 mA</strong> and they're slow (max toggle rate 2 MHz). Fine for the onboard LED, useless for
        anything else — the Blue Pill silkscreen just happens to put the most-tempting GPIO on the most-restricted pins.
      </Callout>
      <h2>The boot pin dance</h2>
      <p>
        Two pins decide what code runs after reset, sampled once at the rising edge of NRST:
      </p>
      <SpecTable
        rows={[
          [
            "BOOT0 = 0",
            <>Boot from <strong>main Flash</strong> (your application). Normal operation.</>,
          ],
          [
            "BOOT0 = 1, BOOT1 = 0",
            <>Boot from <strong>System Memory</strong>: ST's factory ROM bootloader. Speaks UART1 and USB DFU.</>,
          ],
          [
            "BOOT0 = 1, BOOT1 = 1",
            <>Boot from <strong>SRAM</strong>. Used for code-in-RAM debugging.</>,
          ],
        ]}
      />
      <p>
        On the Blue Pill, two jumpers expose BOOT0 and BOOT1 — flip BOOT0 to 1, press reset, and you're in the ROM
        bootloader. From there <code>stm32flash</code> (UART) or <code>dfu-util</code> (USB) can write your binary even
        without an ST-Link. But almost nobody uses this path on the Blue Pill because of the USB pull-up problem above;
        the canonical flow is ST-Link over SWD instead.
      </p>
      <h2>Programming and debugging — ST-Link + SWD</h2>
      <p>
        The native ST-Link interface is <strong>SWD</strong> (Serial Wire Debug): 2 wires for the debug protocol (SWDIO,
        SWCLK), plus 3V3 and GND. Optional NRST and SWO (single-wire trace output). An <strong>ST-Link V2 clone</strong>{" "}
        is ~$3 from anywhere; ST's official one is $30 with more capability. They program any STM32 in production, debug
        with full step / breakpoint / variable inspection, and stream printf via SWO at up to 2 Mbps without using a
        UART pin.
      </p>
      <CodeBlock
        language="text"
        filename="flash.sh"
        code={`# Probe (no flash)
st-info --probe
# → F1xx Medium-density, flash 128 KiB, sram 20 KiB

# Flash a raw binary at the application base (0x08000000)
st-flash write firmware.bin 0x08000000

# Or use the cross-vendor OpenOCD path
openocd -f interface/stlink.cfg -f target/stm32f1x.cfg \\
        -c "program firmware.elf verify reset exit"

# Or use ST's command line on top of CubeProgrammer
STM32_Programmer_CLI -c port=SWD -w firmware.elf -v -rst

# Erase (the "I have a board that's behaving wildly" first step)
st-flash erase`}
      />
      <Callout>
        Buy two ST-Link V2 clones the first time you order: one almost always has its firmware stuck at the factory
        revision (won't talk to current OpenOCD) and you'll want the working one alongside while you upgrade it via{" "}
        <code>STM32CubeProgrammer</code>'s ST-Link firmware update tool.
      </Callout>
      <h2>Toolchains: pick your level of abstraction</h2>
      <Compare
        header={["", "What it is", "Use when"]}
        rows={[
          [
            "STM32CubeIDE",
            "ST's Eclipse-based IDE + CubeMX integration. Free, free training, official support",
            "Production firmware, peripheral-heavy designs where CubeMX's clock-tree GUI earns its keep",
          ],
          [
            "STM32CubeMX",
            "Graphical peripheral configurator. Emits HAL or LL init code as a CMake / Makefile / IDE project",
            "Bootstrapping a new board. Generate the init, then ignore it and write your own from there",
          ],
          [
            "PlatformIO + Arduino_Core_STM32",
            "The stm32duino Arduino core, all your Arduino libraries, PlatformIO's lockfile workflow",
            "Fast prototypes, when the Arduino HAL is enough, when you don't want to fight CMake",
          ],
          [
            "libopencm3 / ChibiOS / Zephyr",
            "Third-party HAL or full RTOS. CMSIS underneath, vendor-neutral API on top",
            "Multi-vendor projects, or when you've grown out of ST's HAL and want lighter-weight code",
          ],
          [
            "Bare-metal CMSIS",
            "ST's chip headers + arm-none-eabi-gcc. You write to the registers directly",
            "Tight loops, very small chips, or when you genuinely need to read every line of code in your binary",
          ],
          [
            "embedded Rust (stm32-hal, embassy)",
            "Crate ecosystem with strongly-typed peripheral access. Async via embassy",
            "When you want compile-time correctness for the peripheral state machine",
          ],
        ]}
      />
      <h2>HAL vs LL vs registers</h2>
      <p>
        ST ships <strong>two</strong> peripheral libraries with the same headers, plus the raw registers underneath. The
        same UART transmit looks dramatically different at each level:
      </p>
      <CodeBlock
        language="c"
        filename="uart_tx.c"
        code={`#include "stm32f1xx_hal.h"

// HAL: thick, friendly, lots of error-handling branches and DMA glue
extern UART_HandleTypeDef huart1;          // declared in main.c by CubeMX
void hal_send(const char *msg, uint16_t n) {
    HAL_UART_Transmit(&huart1, (uint8_t *)msg, n, HAL_MAX_DELAY);
}

// LL (Low Layer): thin, register-level, no buffering or callbacks
#include "stm32f1xx_ll_usart.h"
void ll_send(const char *msg, uint16_t n) {
    for (uint16_t i = 0; i < n; i++) {
        while (!LL_USART_IsActiveFlag_TXE(USART1)) {}
        LL_USART_TransmitData8(USART1, msg[i]);
    }
}

// Raw registers: the actual bus transactions, useful as a sanity check
#include "stm32f103xb.h"
void reg_send(const char *msg, uint16_t n) {
    for (uint16_t i = 0; i < n; i++) {
        while (!(USART1->SR & USART_SR_TXE)) {}
        USART1->DR = msg[i];
    }
}`}
      />
      <p>
        HAL code generates ~5× the binary size of LL or registers but handles every edge case the chip has. Most
        production firmware mixes the two: HAL for one-shot init (clock tree, DMA controllers), LL or registers in the
        hot path. The CMSIS register definitions (<code>stm32f103xb.h</code>) are always available no matter which HAL
        you picked, so you can drop down a level anytime.
      </p>
      <h2>Hello world over USART, three ways</h2>
      <p>
        UART1 on PA9/PA10, 115200 8N1 — wire an FTDI-style USB-UART or use the ST-Link's optional VCP if your clone has
        one.
      </p>
      <CodeBlock
        language="c"
        filename="main.c (CubeIDE / HAL)"
        code={`#include "main.h"
extern UART_HandleTypeDef huart1;          // CubeMX-generated init

int main(void) {
    HAL_Init();
    SystemClock_Config();                  // 8 MHz HSE × 9 = 72 MHz
    MX_GPIO_Init();
    MX_USART1_UART_Init();

    char buf[32];
    while (1) {
        int n = snprintf(buf, sizeof buf, "uptime: %lu ms\\r\\n", HAL_GetTick());
        HAL_UART_Transmit(&huart1, (uint8_t *)buf, n, HAL_MAX_DELAY);
        HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
        HAL_Delay(500);
    }
}`}
      />
      <CodeBlock
        language="cpp"
        filename="hello.ino (Arduino_Core_STM32)"
        code={`// Board: "Generic STM32F1 series", part: F103C8 (or F103CB for genuine 128 KB silicon)
// Upload method: STLink

void setup() {
  Serial.begin(115200);                    // USART1 on PA9/PA10 by default
  pinMode(PC13, OUTPUT);                   // Blue Pill LED
}

void loop() {
  Serial.printf("uptime: %lu ms\\r\\n", millis());
  digitalWrite(PC13, !digitalRead(PC13));
  delay(500);
}`}
      />
      <CodeBlock
        language="python"
        filename="main.py (MicroPython, stm32 port)"
        code={`# MicroPython for STM32 boots from a 'pyb' module. Flash the firmware via
# dfu-util, then drop main.py onto the PYBFLASH USB drive.
import time
from pyb import LED, UART
u = UART(1, 115200)                        # USART1 = pins PA9/PA10
led = LED(1)
t0 = time.ticks_ms()
while True:
    u.write("uptime: %d ms\\r\\n" % time.ticks_diff(time.ticks_ms(), t0))
    led.toggle()
    time.sleep_ms(500)`}
      />
      <h2>Peripherals and their realistic ceilings</h2>
      <SpecTable
        rows={[
          [
            "USART",
            <>
              3× on the F103, more on bigger parts. <strong>Up to 4.5 Mbaud</strong> in theory, <strong>921600</strong>{" "}
              reliable in practice over USB-UART. DMA-capable on TX and RX.
            </>,
          ],
          [
            "I²C",
            <>
              2× hardware. <strong>100 kHz</strong> standard, <strong>400 kHz</strong> fast. The F1's I²C block is
              infamous for getting stuck — see gotchas. Many designs replace it with bit-banged I²C or a software fix
              from app note <strong>AN10987</strong>.
            </>,
          ],
          [
            "SPI",
            <>
              2× hardware. <strong>Up to 18 MHz</strong> on the F1 (clk/2 from 36 MHz APB), up to 42 MHz on F4. DMA-
              capable. Half- and full-duplex.
            </>,
          ],
          [
            "ADC",
            <>
              2× 12-bit SAR @ <strong>1 MS/s</strong> each on the F1, 2.4 MS/s on F4. Dual-mode lets the two ADCs sample
              simultaneously — useful for differential or three-phase current sensing. ENOB ~10.5 in the analog spec.
            </>,
          ],
          [
            "Timers",
            <>
              The peripheral the STM32 family is famous for. <strong>TIM1 advanced</strong>: dead-time-inserted
              complementary PWM for 3-phase motor drive. <strong>TIM2–5 general</strong>: 16-bit (32-bit on F4 TIM2/5),
              up/down/centre-aligned, encoder mode, capture/compare, DMA-coupled. Can chain master/slave for arbitrary
              one-shot pulses.
            </>,
          ],
          [
            "USB FS",
            <>
              12 Mbps device only on the F103. F4 adds USB OTG (host + device). HID / CDC / MSC stacks are in ST's
              <code>STM32_USB_Device_Library</code>; <code>tinyUSB</code> works too if you want lighter / multi-class.
            </>,
          ],
          [
            "DMA",
            <>
              7 channels on the F1, 16 streams across 2 controllers on the F4. Memory-to-memory, memory-to-peripheral,
              circular mode for continuous ADC sampling — the basis for any audio or sensor-streaming firmware.
            </>,
          ],
          [
            "RCC (clocks)",
            <>
              The clock tree is the whole game on the STM32. CubeMX's clock GUI exists because getting AHB / APB1 / APB2
              / timer / USB / ADC / SPI clocks all aligned at the right multipliers from one HSE crystal is genuinely
              hard. The F103 caps APB1 at 36 MHz, APB2 at 72 MHz, USB at exactly 48 MHz — three constraints fed from one
              8 MHz crystal × 9 PLL.
            </>,
          ],
        ]}
      />
      <h2>Talking to an I²C sensor</h2>
      <p>
        Same BME280 wiring as the ESP32 page, different I²C block underneath. Cube generates the init; you write the
        loop. PB6/PB7 are the default I²C1 pair; 4.7 kΩ pull-ups to 3.3 V; sensor V<sub>DD</sub> on 3V3, common ground.
      </p>
      <CodeBlock
        language="c"
        filename="bme280_read.c (HAL)"
        code={`#include "main.h"
extern I2C_HandleTypeDef hi2c1;
#define BME_ADDR  (0x76 << 1)              // HAL uses 8-bit shifted addresses

static HAL_StatusTypeDef bme_read(uint8_t reg, uint8_t *buf, uint16_t n) {
    HAL_StatusTypeDef s = HAL_I2C_Master_Transmit(&hi2c1, BME_ADDR, &reg, 1, 100);
    if (s != HAL_OK) return s;
    return HAL_I2C_Master_Receive(&hi2c1, BME_ADDR, buf, n, 100);
}

int main(void) {
    HAL_Init(); SystemClock_Config();
    MX_GPIO_Init(); MX_I2C1_Init(); MX_USART1_UART_Init();

    uint8_t id;
    bme_read(0xD0, &id, 1);                // chip-id register → 0x60
    char msg[40];
    int n = snprintf(msg, sizeof msg, "BME280 chip id: 0x%02x\\r\\n", id);
    HAL_UART_Transmit(&huart1, (uint8_t *)msg, n, HAL_MAX_DELAY);
    while (1) { HAL_Delay(1000); }
}`}
      />
      <Callout label="// 7-bit vs 8-bit I²C addresses">
        STM32 HAL takes <strong>shifted</strong> 8-bit addresses (the protocol-level byte that includes the R/W bit). The
        BME280's 7-bit address is 0x76, so you pass <code>0x76 &lt;&lt; 1 = 0xEC</code>. Other libraries pass 7-bit
        addresses raw. Getting this wrong gives you "no device found" with the sensor sitting right on the bus —
        a depressingly common first-day bug.
      </Callout>
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>F1 I²C is buggy.</strong> The hardware can lock up the bus if the line glitches during a transfer.
          Symptom: <code>HAL_I2C_Master_Transmit</code> returns <code>HAL_TIMEOUT</code> forever after one bad cable
          unplug. Fix per ST application note <strong>AN10987</strong>: manually clock SCL 9 times with the peripheral
          disabled, reset the I²C block, re-init. Or use the F1's bit-banged software I²C — the F4/L4/G4 hardware blocks
          fixed this entirely.
        </li>
        <li>
          <strong>The clock tree is the whole game.</strong> Forget to enable an APB clock and the peripheral silently
          does nothing — no error, no warning. <code>__HAL_RCC_GPIOC_CLK_ENABLE()</code> is the single most-forgotten
          line in STM32 firmware. CubeMX generates these for the peripherals you ask for; check the generated init
          when something "should work but doesn't."
        </li>
        <li>
          <strong>Counterfeit Blue Pills.</strong> Already covered above, repeated because every newcomer is bitten. If
          you cross the 32 KB threshold on a board that claims 64 KB, you're on a relabeled F103C6. Check the FSIZE
          register at <code>0x1FFFF7E0</code> at runtime.
        </li>
        <li>
          <strong>PC13 LED is current-limited.</strong> 3 mA max on the F103's RTC-domain pins. The Blue Pill LED works
          fine; do not try to drive a transistor or another LED off PC13 without a buffer.
        </li>
        <li>
          <strong>5V-tolerant ≠ 5V-powered.</strong> Most STM32 pins can <em>accept</em> a 5 V digital input on the
          datasheet's "FT" pins, but V<sub>DD</sub> is still 3.3 V — output high is 3.3 V, not 5 V. If you need 5 V
          out, use a level shifter or an open-drain + pull-up.
        </li>
        <li>
          <strong>USB and CAN share resources.</strong> On the F103 the USB and bxCAN blocks share the packet memory
          SRAM — you can use either, but not both at the same time. Bigger parts (F405) separate them.
        </li>
        <li>
          <strong>BOOT1 is a GPIO too.</strong> BOOT1 lives on PB2. Once boot is done, BOOT1 is general-purpose GPIO — but
          if you drive it high while reset is pulsed, you'll accidentally enter the ROM bootloader and your firmware
          won't run. Pull it down or leave it floating in your hardware design.
        </li>
        <li>
          <strong>SWD pins (PA13/PA14) get repurposed by accident.</strong> If your firmware sets PA13/PA14 to a
          non-SWD alternate function, the chip becomes unprogrammable by ST-Link — the debugger can't get a halt in
          edgewise. Recovery: hold NRST low while powering up, then attach the debugger and erase. <code>st-flash
          erase</code> with NRST held works; CubeProgrammer has a "Connect under reset" toggle for the same thing.
        </li>
        <li>
          <strong>Power-up sequence matters for V<sub>BAT</sub>.</strong> V<sub>BAT</sub> domains have their own quirks
          on STM32 — the LSE oscillator and backup registers stay alive on a CR2032. If your hardware doesn't have a
          coin cell on V<sub>BAT</sub>, tie it to V<sub>DD</sub>; leaving it floating causes mysterious resets on some
          revisions.
        </li>
      </ul>
    </>
  ),
  "c-nrf52840": () => (
    <>
      <h2>What it is</h2>
      <p>
        Nordic Semiconductor's flagship Bluetooth 5 / Thread / Zigbee / Matter SoC, released in 2018 and still the
        default modern BLE chip in 2026. A <strong>single Cortex-M4F</strong> at 64 MHz with hardware floating-point, a
        <strong> 2.4 GHz multi-protocol radio</strong> that does BLE 5, IEEE 802.15.4 (Thread / Zigbee), and Nordic's
        own proprietary ESB protocol, <strong>native USB 2.0 FS</strong>, <strong>1 MB Flash + 256 KB RAM</strong>,
        ARM TrustZone CryptoCell, and a peripheral set built specifically for low-power radio work. Where the ESP32 is
        "Wi-Fi + BLE" and the RP2040 is "PIO and price," the nRF52840 is the chip you reach for when the radio link
        matters more than anything else — sleep currents in the <strong>~1.5 µA range</strong> with the BLE stack
        running, ~100 µA with most peripherals off but the system RAM-retained.
      </p>
      <p>
        It's the silicon inside the Adafruit Feather nRF52840, the Seeed XIAO nRF52840, the SparkFun Pro nRF52840 Mini,
        Particle Argon's coprocessor, and the <strong>nRF52840 Dongle</strong> — a $10 USB stick that's the canonical
        "sniff Bluetooth packets" tool. Most modern BLE products you can name (smart locks, fitness trackers, AirTag
        clones, wireless headphones at the budget end) have an nRF52840 or a sibling chip inside.
      </p>
      <Callout>
        Newer options exist: the <strong>nRF5340</strong> splits the radio onto a dedicated network core for security
        isolation, and the <strong>nRF54L</strong> / <strong>nRF54H</strong> (2024–2025) push the Cortex-M33 further
        with BLE 5.4. For new designs Nordic is steering you toward the 54 line. But the 52840 still dominates the
        ecosystem — every SDK example, every community guide, and every off-the-shelf module assumes it.
      </Callout>
      <h2>The Nordic line at a glance</h2>
      <Compare
        header={["", "Core", "Radio", "Sweet spot"]}
        rows={[
          ["nRF52832", "Cortex-M4F @ 64 MHz", "BLE 5, no 802.15.4, no USB", "Cost-optimised BLE peripherals — beacons, sensors, trackers"],
          ["nRF52833", "Cortex-M4F @ 64 MHz", "BLE 5 + 802.15.4, no USB", "Industrial temp range. Same architecture as 52840 in a cheaper SKU"],
          ["nRF52840", "Cortex-M4F @ 64 MHz", "BLE 5 + 802.15.4 + USB", "The workhorse. Matter, Thread, Zigbee, BLE all in one chip"],
          ["nRF5340", "2× Cortex-M33 @ 128/64 MHz", "BLE 5.3 + 802.15.4 + DF", "App core + dedicated network core. TrustZone-isolated radio stack"],
          ["nRF54L15", "Cortex-M33 @ 128 MHz", "BLE 5.4 + 802.15.4 + ESB", "Newer cost-down option, replaces the 52832 in new designs"],
          ["nRF54H20", "Cortex-M33 + RISC-V VPRs", "BLE 5.4 + 802.15.4 + DECT NR+", "The flagship 2024 part — multi-core, hardware-accelerated"],
          ["nRF9160 / 91x1", "Cortex-M33 @ 64 MHz", "LTE-M / NB-IoT + GPS", "Cellular IoT. Different SDK, different mental model"],
          ["nRF7002", "(not an MCU)", "Wi-Fi 6 companion chip", "Add-on radio over SPI; pairs with an nRF52 or 53 host"],
        ]}
      />
      <h2>Datasheet at a glance (nRF52840)</h2>
      <SpecTable
        rows={[
          ["CPU", "ARM Cortex-M4F @ 64 MHz with single-precision FPU and ARMv7-M DSP instructions"],
          ["Memory", "1 MB Flash + 256 KB SRAM. The SoftDevice (Nordic's BLE stack) eats ~120 KB Flash and ~10 KB RAM"],
          ["GPIO", "48 GPIOs in the QFN-73 package, all on a single P0/P1 bus. Any pin can be any peripheral via PSEL"],
          ["Radio", "2.4 GHz multi-protocol: BLE 5 (including LE Coded PHY, 2 Mbps, advertising extensions), IEEE 802.15.4, Nordic ESB"],
          ["USB", "Full-Speed 2.0 (12 Mbps) device. No host. USB-DFU bootloader in factory ROM"],
          ["NFC", "NFC-A tag mode (reader-emulating) built-in, 13.56 MHz. One of the few sub-$5 MCUs that ships with NFC"],
          ["ADC", "1× 12-bit SAADC, 200 kS/s, 8 input channels. Differential mode supported"],
          ["I²C / SPI / UART", "Up to 4× of any — selectable in software (TWIM, SPIM, UARTE — all DMA-backed)"],
          ["PWM", "4× PWM units × 4 channels each = 16 channels. Each unit has its own clock divisor and counter top"],
          ["I²S", "1× full-duplex master/slave for digital audio. PDM block separately for MEMS mics"],
          ["Timers", "5× general 32-bit timers, 3× real-time counters (RTC) for low-power scheduling"],
          ["Crypto", "ARM CryptoCell-310: AES-128, ECC, SHA-2, TRNG. The reason this chip ends up in security products"],
          [<>V<sub>DD</sub></>, <>1.7 – 5.5 V (LDO mode), 1.7 – 3.6 V (DC-DC mode). On-die DC-DC for &lt; 5 mA Wi-Fi-class power</>],
          ["Sleep currents", "System OFF ~0.4 µA; System ON, RAM retained ~1.5 µA; CPU running @ 64 MHz ~3.7 mA"],
          ["Package", "QFN-73 (7×7 mm) or aQFN-94 (BGA-style, 5×5 mm). Plus the certified module options below"],
        ]}
      />
      <h2>Modules and dev kits</h2>
      <p>
        Nobody designs an nRF52840 board from scratch unless they have to — the radio matching and certification work is
        expensive. The pattern is to drop in a pre-certified module:
      </p>
      <SpecTable
        rows={[
          ["Raytac MDBT50Q", "The Adafruit / SparkFun favourite. ~$5 in volume. FCC, CE, IC, MIC, KC pre-cert"],
          ["Fanstel BT840", "Higher-power variant with external PA, +8 dBm TX, longer range"],
          ["u-blox NORA-B106", "Industrial-grade with built-in 32 MHz crystal and antenna"],
          ["Nordic nRF52840-DK", "The dev kit. Onboard SEGGER J-Link, Arduino headers, two buttons, four LEDs"],
          ["Nordic nRF52840 Dongle", "USB-A stick. $10. Comes with the radio-sniffer firmware for nRF Sniffer"],
          ["Seeed XIAO nRF52840", "Postage-stamp board (21 × 17 mm). USB-C, charge IC for LiPo, popular for wearables"],
          ["Adafruit Feather nRF52840 Express", "Feather form factor, USB-C, charge IC, on-board QSPI flash for filesystem"],
        ]}
      />
      <h2>The PPI: peripherals talking to each other</h2>
      <p>
        The signature Nordic feature, and what separates this chip from a stock Cortex-M4 design. PPI stands for{" "}
        <strong>Programmable Peripheral Interconnect</strong> — a 32-channel crossbar that lets any peripheral{" "}
        <em>event</em> (timer compare, GPIO edge, radio packet received, ADC sample ready) directly trigger any
        peripheral <em>task</em> (start a timer, toggle a GPIO, transmit a radio packet, kick off an ADC sample). No
        CPU involvement, no interrupt latency, no jitter. Set up a channel once at boot and the peripherals run their
        own state machine while the M4 sleeps.
      </p>
      <p>
        A classic example: sample the SAADC at exactly 1 kHz with sub-µs jitter, without an interrupt.
      </p>
      <CodeBlock
        language="c"
        filename="ppi_adc_sampling.c"
        code={`// Hook TIMER0's COMPARE[0] EVENT to SAADC's SAMPLE TASK.
// Every time the timer hits its compare value, the ADC samples — at
// hardware precision, with zero CPU work after setup.
NRF_TIMER0->PRESCALER = 4;                     // 16 MHz / 2^4 = 1 MHz tick
NRF_TIMER0->CC[0]     = 1000;                  // compare every 1000 µs
NRF_TIMER0->SHORTS    = TIMER_SHORTS_COMPARE0_CLEAR_Msk;  // auto-restart
NRF_TIMER0->TASKS_START = 1;

NRF_PPI->CH[0].EEP = (uint32_t)&NRF_TIMER0->EVENTS_COMPARE[0];
NRF_PPI->CH[0].TEP = (uint32_t)&NRF_SAADC->TASKS_SAMPLE;
NRF_PPI->CHENSET   = (1 << 0);                  // enable channel 0`}
      />
      <p>
        Combined with the EasyDMA peripherals (every SPI / I²C / UART / SAADC on the 52840 has its own DMA engine), the
        CPU can sleep for 99% of a frame while the radio, ADC, and storage all do their work in parallel and the PPI
        ties them together. This is what gets the sleep currents into the µA range.
      </p>
      <h2>Pin assignment is software, not hardware</h2>
      <p>
        Unlike the STM32's AF mux or the ESP32's GPIO matrix, Nordic peripherals use <strong>PSEL registers</strong>:
        every UART / SPI / I²C / PWM block has a register where you write the GPIO pin number you want it to use, and
        it routes itself there. Any peripheral on any pin — no precomputed mux table, no remap restrictions.
      </p>
      <CodeBlock
        language="c"
        filename="uart_pinout.c"
        code={`// Put UART0's TX on P0.06, RX on P0.08 — pick anything
NRF_UARTE0->PSEL.TXD = (0 << UARTE_PSEL_TXD_PORT_Pos) | 6;
NRF_UARTE0->PSEL.RXD = (0 << UARTE_PSEL_TXD_PORT_Pos) | 8;
NRF_UARTE0->BAUDRATE = UARTE_BAUDRATE_BAUDRATE_Baud115200;
NRF_UARTE0->ENABLE   = UARTE_ENABLE_ENABLE_Enabled;`}
      />
      <p>
        On the 52840 the GPIOs span two ports (P0 and P1), each with up to 32 pins. The PSEL byte encodes both: high
        bit = port, low 5 bits = pin within the port. The downside of this freedom is that <em>there's no convention</em>
        — every dev kit lays out its UART and SPI pins differently, so the pin numbers in someone else's example almost
        never match your board.
      </p>
      <h2>The SoftDevice: how Nordic ships their BLE stack</h2>
      <p>
        Most BLE SoCs hide their radio stack in ROM or in a vendor binary you link against. Nordic does something
        weirder and (after you adapt to it) better: the radio stack lives in flash as a separate{" "}
        <strong>"SoftDevice"</strong> — a precompiled, signed blob you flash to the bottom of memory before your app.
        Your application sits above it and calls into it through a stable API surface, with interrupt priorities
        partitioned so the SoftDevice always pre-empts your code for radio events.
      </p>
      <SpecTable
        rows={[
          ["S140 (current)", "Bluetooth 5 central + peripheral, multi-link. The default for nRF52840"],
          ["S113", "Peripheral-only. Smaller — ~30 KB instead of S140's ~120 KB"],
          ["S132", "BLE 5 for nRF52832/833. Same API as S140, slimmed for the smaller-memory chips"],
          ["S112", "Peripheral-only for nRF52832 and below"],
        ]}
      />
      <Callout label="// memory map">
        Flash layout on a fresh 52840 with S140 v7: <strong>0x00000–0x27000</strong> SoftDevice, then your bootloader,
        then your application up to 1 MB. RAM: <strong>0x20000000–0x2000BFFC</strong> reserved for SoftDevice scratch
        and ATT table, app gets the rest. Misalign these and the chip resets the moment the radio touches an active
        connection — the linker script that ships with the SDK has them right; don't fight it.
      </Callout>
      <p>
        Newer Nordic SDKs (the Zephyr-based <strong>nRF Connect SDK</strong>) treat the SoftDevice as one of several
        radio stack options, with <strong>SoftDevice Controller</strong> (the lower half of the SoftDevice as a
        standalone library) being the path Nordic is steering everyone toward.
      </p>
      <h2>Toolchains</h2>
      <Compare
        header={["", "What it is", "Use when"]}
        rows={[
          [
            "nRF Connect SDK (NCS)",
            "Nordic's current first-party platform. Zephyr RTOS + SoftDevice Controller + west tool",
            "All new designs. Required for nRF53/54 and recommended for everything else from 2022 on",
          ],
          [
            "nRF5 SDK (legacy)",
            "The pre-2020 SDK. Bare-metal C with SoftDevice binaries, no RTOS",
            "Existing legacy projects. Nordic still maintains it for 52-series but no new features",
          ],
          [
            "Arduino-Adafruit nRF52 Core",
            "Adafruit's Arduino fork bundling Bluefruit LE library on top of the Nordic SoftDevice",
            "Adafruit Feather boards, fast prototyping, basic BLE peripheral / central roles",
          ],
          [
            "Zephyr (upstream)",
            "The RTOS that NCS is built on. Direct use bypasses Nordic's defaults but unlocks the full Zephyr ecosystem",
            "Multi-vendor projects, when you need a peripheral driver Nordic hasn't wrapped",
          ],
          [
            "CircuitPython",
            "Adafruit's runtime, ported to the nRF52840 with a BLE library",
            "Classrooms, BLE prototypes you can edit in a text editor on the USB drive",
          ],
        ]}
      />
      <h2>Programming and debugging — SEGGER J-Link + DFU</h2>
      <p>
        Two delivery paths, depending on how the board exposes the chip:
      </p>
      <ol>
        <li>
          <strong>SWD via J-Link.</strong> Every Nordic dev kit ships with an onboard SEGGER J-Link that exposes itself
          as both a debugger and a USB drive ("MBED" style). The drive accepts <code>.hex</code> drops — copy the file
          on, it flashes. Command-line: <code>nrfjprog</code> from Nordic's command-line tools, or <code>JLinkExe</code>.
        </li>
        <li>
          <strong>USB DFU.</strong> Boards without an onboard debugger (Feather, XIAO, Dongle) ship with a USB DFU
          bootloader. Double-tap the reset button — onboard LED pulses — chip reappears as a USB DFU device. Push your
          firmware with <code>adafruit-nrfutil</code> (Adafruit's fork) or <code>nrfutil</code> (Nordic's official).
        </li>
      </ol>
      <CodeBlock
        language="text"
        filename="flash.sh"
        code={`# Path 1: J-Link / nrfjprog (DK boards, custom boards with SWD pins exposed)
nrfjprog --recover                              # unlock chip + erase
nrfjprog --program app_with_softdevice.hex --verify --reset

# Path 2: USB DFU (Feather, XIAO, Dongle, anything with the Adafruit bootloader)
adafruit-nrfutil --verbose dfu serial \\
  -pkg firmware.zip -p /dev/ttyACM0 -b 115200

# Path 3: Nordic Connect Programmer GUI for "I just want to drag and drop"
nrfconnect                                       # launches the desktop app

# Serial monitor on the USB CDC interface
miniterm.py /dev/ttyACM0 115200`}
      />
      <Callout label="// the J-Link license">
        The onboard J-Link on Nordic dev kits is licensed only for use with Nordic targets. SEGGER ships an "Educational"
        firmware that works on any chip for personal projects, but the dev kit J-Links specifically refuse to attach
        to non-Nordic SoCs. If you want a general-purpose programmer, get a standalone J-Link EDU Mini ($20) or use the
        nRF Connect SDK's <code>pyocd</code> path with a CMSIS-DAP probe.
      </Callout>
      <h2>Hello world over USB-CDC, three ways</h2>
      <CodeBlock
        language="c"
        filename="main.c (nRF Connect SDK / Zephyr)"
        code={`#include <zephyr/kernel.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/usb/usb_device.h>

#define LED0 DT_ALIAS(led0)
static const struct gpio_dt_spec led = GPIO_DT_SPEC_GET(LED0, gpios);

int main(void) {
    usb_enable(NULL);                            // brings up CDC ACM; printf goes here
    gpio_pin_configure_dt(&led, GPIO_OUTPUT_INACTIVE);

    uint32_t t = 0;
    while (1) {
        printk("uptime: %u ms\\n", t);
        gpio_pin_toggle_dt(&led);
        k_msleep(500);
        t += 500;
    }
    return 0;
}`}
      />
      <CodeBlock
        language="cpp"
        filename="hello.ino (Adafruit nRF52 Arduino)"
        code={`#include <bluefruit.h>

void setup() {
  Serial.begin(115200);              // USB-CDC at virtual 115200
  while (!Serial) delay(10);          // wait for host enumeration
  pinMode(LED_BUILTIN, OUTPUT);
  Bluefruit.begin();                  // bring up SoftDevice + advertise as nameless peripheral
  Bluefruit.setName("nRF52840 hello");
  Bluefruit.Advertising.start();
}

void loop() {
  Serial.printf("uptime: %lu ms\\n", millis());
  digitalToggle(LED_BUILTIN);
  delay(500);
}`}
      />
      <CodeBlock
        language="python"
        filename="code.py (CircuitPython)"
        code={`# Drop onto the CIRCUITPY USB drive. Reboot. Done.
import time
import board, digitalio
from adafruit_ble import BLERadio

led = digitalio.DigitalInOut(board.LED)
led.direction = digitalio.Direction.OUTPUT
radio = BLERadio()
radio.name = "nrf52840 hello"
radio.start_advertising()

t0 = time.monotonic_ns()
while True:
    print("uptime:", (time.monotonic_ns() - t0) // 1_000_000, "ms")
    led.value = not led.value
    time.sleep(0.5)`}
      />
      <h2>Peripherals and their realistic ceilings</h2>
      <SpecTable
        rows={[
          [
            "UART (UARTE)",
            <>
              4× DMA-backed. Standard baud rates from 1200 to <strong>1 Mbaud</strong>, with the high-speed mode
              reaching <strong>1 Mbaud</strong> reliably and <strong>~5 Mbaud</strong> at the chip limit on direct-pin
              setups.
            </>,
          ],
          [
            "I²C (TWIM)",
            <>
              4× DMA-backed. <strong>100 kHz</strong>, <strong>250 kHz</strong>, <strong>400 kHz</strong> in hardware;
              software can squeeze the bus to 1 MHz but Nordic doesn't certify it.
            </>,
          ],
          [
            "SPI (SPIM)",
            <>
              4× DMA-backed, plus an additional high-speed <strong>SPIM3</strong> that reaches{" "}
              <strong>32 MHz</strong>. The other three top out at 8 MHz.
            </>,
          ],
          [
            "SAADC",
            <>
              1× 12-bit SAR at <strong>200 kS/s</strong>, 8 input channels, programmable gain, single-ended or
              differential. The on-die V<sub>DD</sub>-divided-by-5 reference is the cleanest path; external precision
              references require an extra pin.
            </>,
          ],
          [
            "PWM",
            <>
              4× PWM units, 4 channels each = 16 outputs total. Each unit has its own clock divisor — you can run a
              fast unit at 1 MHz for LED dimming while another sits at 50 Hz for servo control.
            </>,
          ],
          [
            "USB",
            <>
              Full-Speed (12 Mbps) device only. TinyUSB ships with the nRF Connect SDK; HID / CDC / MSC classes are
              one Kconfig flag away.
            </>,
          ],
          [
            "Radio (BLE 5)",
            <>
              1 Mbps, 2 Mbps, and <strong>125 kbps / 500 kbps Coded PHY</strong> (BLE long-range mode). +8 dBm max TX
              power, −95 dBm sensitivity. ~600 µA average for a 100 ms connection interval at 0 dBm.
            </>,
          ],
          [
            "Radio (802.15.4)",
            <>
              250 kbps at 2.4 GHz, the physical layer underneath Thread, Zigbee, and Matter-over-Thread.
            </>,
          ],
          [
            "NFC",
            <>
              13.56 MHz tag mode (NFC-A). Used for "tap to pair" handoff to BLE, where the smartphone tap reads the
              BLE address out of the NFC tag and skips the discovery dance.
            </>,
          ],
        ]}
      />
      <h2>Wiring a BLE GATT service in Zephyr</h2>
      <p>
        The framework Nordic actually uses now. The pattern is to declare a GATT service as a static struct and let
        Zephyr's BLE host wire up the characteristics; you only write the read / write / notify callbacks.
      </p>
      <CodeBlock
        language="c"
        filename="ble_temp.c"
        code={`#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/gatt.h>
#include <zephyr/bluetooth/uuid.h>

#define TEMP_SVC_UUID  BT_UUID_DECLARE_16(0x181A)        // Environmental Sensing
#define TEMP_CHR_UUID  BT_UUID_DECLARE_16(0x2A6E)        // Temperature, °C × 100, int16

static int16_t temp_centi = 2050;

static ssize_t read_temp(struct bt_conn *c, const struct bt_gatt_attr *a,
                         void *buf, uint16_t len, uint16_t off) {
    return bt_gatt_attr_read(c, a, buf, len, off, &temp_centi, sizeof temp_centi);
}

BT_GATT_SERVICE_DEFINE(temp_svc,
    BT_GATT_PRIMARY_SERVICE(TEMP_SVC_UUID),
    BT_GATT_CHARACTERISTIC(TEMP_CHR_UUID,
        BT_GATT_CHRC_READ | BT_GATT_CHRC_NOTIFY,
        BT_GATT_PERM_READ, read_temp, NULL, &temp_centi),
    BT_GATT_CCC(NULL, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE));

int main(void) {
    bt_enable(NULL);
    static const struct bt_data adv[] = {
        BT_DATA_BYTES(BT_DATA_FLAGS, BT_LE_AD_GENERAL | BT_LE_AD_NO_BREDR),
        BT_DATA_BYTES(BT_DATA_UUID16_ALL, 0x1A, 0x18),     // 0x181A little-endian
    };
    bt_le_adv_start(BT_LE_ADV_CONN_NAME, adv, ARRAY_SIZE(adv), NULL, 0);
    while (1) { k_msleep(1000); }
}`}
      />
      <p>
        Side-load the <em>nRF Connect</em> app on your phone, scan, connect, and the temperature characteristic shows
        up under "Environmental Sensing." That's the entire "talk to a sensor over BLE" example in ~30 lines.
      </p>
      <h2>Power: where this chip actually shines</h2>
      <p>
        The interesting number isn't "what does it draw when running" but "what does it draw between radio events."
        Real-world numbers for a BLE peripheral with a 1-second connection interval, 0 dBm TX:
      </p>
      <SpecTable
        rows={[
          ["CPU running, 64 MHz, no radio", "~3.7 mA"],
          ["BLE peripheral, 1 s conn interval, 0 dBm TX", "~7 µA average"],
          ["BLE peripheral, 100 ms conn interval, 0 dBm TX", "~250 µA average"],
          ["System ON, RAM retained, RTC running (waiting on a wake)", "~1.5 µA"],
          ["System OFF (GPIO/NFC wake only)", "~0.4 µA"],
          ["+8 dBm TX peak", "~16 mA for ~150 µs per packet"],
        ]}
      />
      <Callout label="// the DC-DC matters">
        These currents assume the DC-DC converter is enabled. Out of reset the chip uses an LDO, which costs ~25%
        extra. Enable DC-DC mode with one register write at boot:{" "}
        <code>NRF_POWER-&gt;DCDCEN = 1;</code> — but only if your board has the matching 10 nH / 1 µF inductor +
        cap on the DCC pin. Forgetting this is the #1 reason "my coin-cell battery lasts half as long as Nordic says
        it should."
      </Callout>
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>SoftDevice memory placement is fragile.</strong> The SoftDevice owns specific RAM ranges and specific
          interrupt priorities. If your app's linker script doesn't match the SoftDevice version, the chip resets the
          moment a radio event fires. Symptoms: connects, runs for a few ms, faults. Cause: <code>RAM_START</code> in
          your linker script isn't past <code>APP_RAM_BASE</code>. Fix: re-read the SDK's "Resource Requirements" PDF
          and update the linker script (or use the nRF Connect SDK's auto-computed values).
        </li>
        <li>
          <strong>NFC pins double as GPIO.</strong> P0.09 and P0.10 default to NFC mode at first boot. If your board
          uses them as regular GPIO, you must clear <code>NFCPINS</code> in UICR (a one-time-programmable register).
          Symptom: button on P0.09 reads as floating. Fix: <code>nrfjprog --memwr 0x1000120C --val 0xFFFFFFFE</code>{" "}
          and reset.
        </li>
        <li>
          <strong>Reset pin is also GPIO P0.18.</strong> By default this pin is general GPIO and there's no reset pin
          — recovery via <code>nrfjprog --recover</code> is your safety net. To get a hardware reset pin, set the
          <code>PSELRESET</code> UICR registers. Symptom on a bricked board with both done wrong: J-Link can't attach.
          Fix: <code>nrfjprog --recover</code>, which uses the AP-CTRL bus to force-erase.
        </li>
        <li>
          <strong>The SAADC has a sample-and-hold capacitor that needs settling time.</strong> If you set the acquisition
          time too short for your source impedance, you'll see your previous channel's reading bleed into the current
          one. Rule of thumb: <strong>5 µs minimum acquisition time for any source impedance under 10 kΩ</strong>; for
          higher source impedances use the <code>NRF_SAADC-&gt;CH[].CONFIG.TACQ</code> field to give it 40 µs.
        </li>
        <li>
          <strong>Only one of UARTE/TWIM/SPIM per peripheral slot.</strong> The four EasyDMA blocks (0/1/2/3) each
          contain a TWIM, SPIM, and UARTE that share the same DMA engine. You can use any one, but not two
          simultaneously on the same slot. Pick UART0 for the console and you can't have I²C0 at the same time —
          move I²C to slot 1.
        </li>
        <li>
          <strong>The DC-DC inductor placement matters.</strong> Already flagged. If you enable DC-DC mode without the
          external L/C network, the chip is fine but the power draw doesn't drop — and you've spent footprint area
          on nothing. Worse, if you have the L/C network but don't enable DC-DC, the inductor saturates.
        </li>
        <li>
          <strong>The Nordic GPIO drive strength is high by default.</strong> Standard GPIO can sink/source up to
          5 mA per pin; "high drive" mode pushes that to 15 mA. Useful for driving a small load directly but
          devastating for PCB ground bounce and EMC if you toggle a wide bus at full speed. Slow your IO down
          (<code>NRF_GPIO-&gt;PIN_CNF[n].DRIVE</code>) for anything you don't need fast.
        </li>
        <li>
          <strong>Module antennas hate ground plane changes.</strong> Pre-certified modules ship with a tuned antenna
          that assumes a specific copper keep-out under the module's antenna area. Your PCB's ground plane bleeding
          into that zone detunes the antenna and costs you 10+ dB. Read the module datasheet's "PCB layout guideline"
          page and copy the keep-out exactly.
        </li>
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
      <h2>Junction capacitance and varactors</h2>
      <p>
        Every pn junction has a depletion-region capacitance that varies with the voltage across it: widen the depletion
        region by reverse-biasing the diode harder and you get fewer plates' worth of charge for the same area, so capacitance
        falls. The SPICE-standard expression — the one this simulator uses when you set <code>Cj0</code> on a diode — is:
      </p>
      <Callout label="// math">
        C<sub>j</sub>(V<sub>D</sub>) = C<sub>j0</sub> · (1 − V<sub>D</sub>/V<sub>j</sub>)<sup>−M<sub>j</sub></sup>
        &nbsp;·&nbsp; V<sub>j</sub> ≈ 0.75 V &nbsp;·&nbsp; M<sub>j</sub> ≈ 0.5 (abrupt) or ≈ 0.33 (linearly graded)
      </Callout>
      <p>
        At zero bias C = C<sub>j0</sub>; reverse-bias the diode and C shrinks as the square root of (1 + V/V<sub>j</sub>) for
        the abrupt-junction default. Forward-bias past V<sub>D</sub> ≈ V<sub>j</sub>/2 and the model linearises (otherwise the
        formula heads to infinity at V<sub>D</sub> = V<sub>j</sub>). For a 1N4148 the parameter is small — about 4 pF at zero
        bias — and ordinary circuits don't notice. <strong>Varactor</strong> diodes (BB910, MV209, 1SV149, etc.) are
        designed to maximise this effect: tens or hundreds of picofarads at zero bias, with grading optimised to give a wide
        capacitance tuning ratio across a few volts of reverse bias.
      </p>
      <p>
        The demo below puts a varactor in parallel with an inductor (10 µH default) and reads off the parallel-tank impedance
        peak. Push V<sub>bias</sub> up and the peak climbs — that's a voltage-controlled oscillator's tuning element doing
        its job. Every FM radio tuner, every PLL, every reflex klystron is built on this picture.
      </p>
      <VaractorTankDemo />
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
      <h2>The Early effect sets a maximum voltage gain</h2>
      <p>
        Push V<sub>A</sub> in the slider down from ∞ and a different ceiling appears: the BJT itself stops being a perfect
        controlled-current source. The output collector "tilts up" with V<sub>CE</sub> by a small amount, equivalent to a
        finite output resistance{" "}
        <strong>
          r<sub>o</sub> = V<sub>A</sub> / I<sub>C</sub>
        </strong>
        . That resistance sits in parallel with R<sub>C</sub>; with R<sub>C</sub> comparable to r<sub>o</sub>, the midband
        gain collapses to{" "}
        <code>-g_m · (R_C ‖ r_o)</code> instead of the textbook <code>-g_m · R_C</code>. The maximum gain a single bipolar
        stage can deliver — with R<sub>C</sub> infinite, biased by a current source — is exactly the{" "}
        <em>intrinsic gain</em>{" "}
        <code>g_m · r_o = V_A / V_T</code>. For a 2N3904 with V<sub>A</sub> ≈ 50 V that's about <strong>~2000 V/V</strong>,
        no matter how you bias it.
      </p>
      <Callout label="// math">
        r<sub>o</sub> = V<sub>A</sub> / I<sub>C</sub> &nbsp;·&nbsp; g<sub>m</sub>·r<sub>o</sub> = V<sub>A</sub> / V
        <sub>T</sub>
      </Callout>
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
  "c-led": () => (
    <>
      <h2>What it is</h2>
      <p>
        A <strong>light-emitting diode</strong>: a pn junction made from a direct-bandgap semiconductor (GaAs, GaN, InGaN
        and friends) so that when an electron crosses the junction and recombines with a hole, the energy released comes
        out as a photon instead of a phonon. The wavelength is set by the bandgap of the material, which is in turn set
        by the alloy composition. That's why colour is fixed at manufacture and why every LED has a different forward
        voltage: a red LED's bandgap is ~1.9 eV, a blue one's is ~2.7 eV, so blue costs more electrons-per-photon and
        drops more voltage across the junction.
      </p>
      <p>
        Practically: an LED is a diode you treat as a current-driven load, not a voltage-driven one. You pick the
        current you want flowing (typically 5–20 mA for indicators, 350 mA for power LEDs, up to several amps for high-
        brightness arrays) and design the surrounding circuit to deliver exactly that. The "20 mA at 2 V" you see in
        a parts catalog is just the spec sheet's pick of one operating point on the diode's exponential I/V curve.
      </p>
      <h2>Datasheet at a glance — common 5 mm indicator LEDs</h2>
      <SpecTable
        rows={[
          [<>Red (GaAlAs)</>, <>V<sub>f</sub> ≈ 1.8–2.1 V @ 20 mA, λ ≈ 625 nm, ~3000 mcd at 20°</>],
          [<>Yellow / Amber (AlGaInP)</>, <>V<sub>f</sub> ≈ 2.0–2.2 V @ 20 mA, λ ≈ 590 nm</>],
          [<>Green (older, GaP)</>, <>V<sub>f</sub> ≈ 2.2 V @ 20 mA, λ ≈ 565 nm, dim</>],
          [<>Pure green (InGaN)</>, <>V<sub>f</sub> ≈ 3.0–3.4 V @ 20 mA, λ ≈ 525 nm, very bright</>],
          [<>Blue (InGaN)</>, <>V<sub>f</sub> ≈ 3.0–3.4 V @ 20 mA, λ ≈ 470 nm</>],
          [<>White (blue + phosphor)</>, <>V<sub>f</sub> ≈ 3.0–3.4 V @ 20 mA, full visible spectrum</>],
          [<>UV (385–405 nm)</>, <>V<sub>f</sub> ≈ 3.3–3.8 V @ 20 mA, beware eye safety</>],
          [<>IR (GaAs, 850 / 940 nm)</>, <>V<sub>f</sub> ≈ 1.2–1.5 V @ 20–100 mA, what every remote control uses</>],
        ]}
      />
      <SpecTable
        rows={[
          ["Max forward current (typical 5 mm)", "20–30 mA continuous, 100 mA pulsed at <1 % duty"],
          ["Max reverse voltage", "5 V (most parts). LEDs are terrible Zeners — exceed it and they fail short or open"],
          ["Viewing angle", "10° (focused indicator) to 120° (diffused or 'wide-angle')"],
          [<>Thermal coefficient of V<sub>f</sub></>, "−2 to −4 mV/°C. Matters for current-source-driven power LEDs, not for indicators"],
          ["Optical efficiency", "10–25 lm/W for indicators, 100–200+ lm/W for modern white power LEDs"],
        ]}
      />
      <h2>The current-limit resistor</h2>
      <p>
        Wire an LED directly across 5 V and it draws a runaway exponential current, gets very hot, and dies in
        milliseconds. The reason is that the diode's I/V curve is nearly vertical once forward-biased — V<sub>f</sub>{" "}
        changes by only ~100 mV as the current spans three decades — so you cannot regulate the current by controlling
        the voltage source. You insert a resistor in series that <em>does</em> have a controllable I/V slope (Ohm's
        law) and let it absorb the difference.
      </p>
      <Callout label="// math">
        R = (V<sub>supply</sub> − V<sub>f</sub>) / I<sub>LED</sub> &nbsp;·&nbsp; P<sub>R</sub> = (V<sub>supply</sub> −
        V<sub>f</sub>) · I<sub>LED</sub>
      </Callout>
      <p>
        For a red LED (V<sub>f</sub> = 2.0 V) running at 10 mA from a 5 V rail: R = (5 − 2) / 0.010 = 300 Ω. The
        nearest E12 value is 330 Ω, which gives 9.1 mA — close enough; LEDs don't care about ±10%. The resistor
        dissipates (5 − 2)·0.010 = 30 mW, well within a standard 1/8 W part.
      </p>
      <p>
        For a 3.3 V MCU rail driving a blue LED (V<sub>f</sub> = 3.2 V): (3.3 − 3.2) / 0.010 = 10 Ω. The headroom is
        tiny and the resistor barely limits anything — small variations in V<sub>f</sub> across temperature swing the
        current dramatically. <strong>The fix is to source a higher rail (5 V) through a transistor, or use a constant-
        current driver, or accept that the LED brightness will drift.</strong> Driving 3.0+ V LEDs from a 3.3 V GPIO is
        a common newbie footgun.
      </p>
      <h2>Wiring</h2>
      <p>
        Two equivalent canonical wirings — current-sourcing (GPIO drives the anode, LED to GND) and current-sinking
        (anode to V<sub>cc</sub>, GPIO sinks from the cathode). They produce identical light but invert the polarity:
        in source mode the GPIO going HIGH lights the LED; in sink mode the GPIO going LOW lights it. The choice
        usually comes down to which mode your MCU sinks/sources better (most modern CMOS GPIOs do both equally; older
        bipolar designs sink stronger than they source).
      </p>
      <Callout>
        The LED's longer leg is the <strong>anode</strong> (+). The flat side on the body and the shorter leg mark the
        <strong> cathode</strong> (−). On a SMD LED there's a green dot, T-bar, or chamfered corner on the cathode
        side — every manufacturer marks it differently, so when in doubt put 1 mA through it from a bench supply
        and see which way it lights.
      </Callout>
      <h2>Driving an LED from an MCU pin</h2>
      <p>
        Modern 3.3 V MCU GPIOs can typically source or sink 8–20 mA per pin — fine for one indicator LED. Two
        constraints sneak up on people:
      </p>
      <ul>
        <li>
          <strong>Per-pin current limit</strong> (datasheet) — usually 20–25 mA on STM32, 12 mA on most ESP32 pins, 8 mA
          on a fresh Cortex-M0+. Push past this and you don't blow the pin instantly, but you accelerate latch-up risk
          and the output high voltage sags.
        </li>
        <li>
          <strong>Total port current limit</strong> — the sum across all pins in a port has its own ceiling, typically
          100 mA for an entire 16-pin port. Wire 16 LEDs to one port at 15 mA each and you'll exceed it. The fix is
          either fewer LEDs per port, lower per-LED current, or external buffers.
        </li>
      </ul>
      <p>
        For anything past one or two LEDs per port, or for high-current (100+ mA) LEDs, switch to an external
        transistor — see the <a href="#/c-2n7000">2N7000</a> page for an NMOS low-side driver, or a P-channel MOSFET
        for a high-side switch.
      </p>
      <CodeBlock
        language="cpp"
        filename="blink.ino"
        code={`// Anode → GPIO via 330 Ω, cathode → GND. (Current-sourcing wiring.)
const int LED_PIN = 8;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);   // ~10 mA through the LED
  delay(500);
  digitalWrite(LED_PIN, LOW);    // off
  delay(500);
}`}
      />
      <h2>PWM dimming and the eye's gamma</h2>
      <p>
        Linear current dimming works but eats power as heat in the limiting resistor (the resistor still drops
        V<sub>supply</sub> − V<sub>f</sub> at any current). PWM at &gt; ~120 Hz fools the eye into seeing a smooth
        average brightness while the LED runs at its rated I<sub>F</sub> during the on phase — efficient and easy on
        any GPIO with a timer behind it.
      </p>
      <Callout label="// math">
        I<sub>avg</sub> = I<sub>F</sub> · duty &nbsp;·&nbsp; perceived brightness ∝ duty<sup>γ</sup>, γ ≈ 2.2
      </Callout>
      <p>
        The catch is that human vision is nonlinear: the eye is much more sensitive to brightness changes in dim light
        than in bright light. A linear PWM sweep from 0 % to 100 % duty <em>looks</em> like it jumps from off to
        almost-full-bright over the first 20 % and then barely changes after that. The fix is to apply a gamma curve:
        instead of <code>brightness ∝ duty</code>, use <code>duty ∝ brightness^2.2</code>. For 8-bit input → 8-bit
        PWM:
      </p>
      <CodeBlock
        language="cpp"
        filename="gamma_dim.ino"
        code={`// Pre-computed gamma=2.2 lookup table — turns "input" into the duty value
// that makes brightness changes look perceptually linear.
const uint8_t GAMMA[256] = {
  0,0,0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,7,7,8,8,
  9,9,10,11,11,12,12,13,14,14,15,16,17,17,18,19,20,21,21,22,23,24,25,26,
  /* ... */
  244,246,248,250,251,253,255
};

void setBrightness(uint8_t input) {
  analogWrite(LED_PIN, GAMMA[input]);
}`}
      />
      <p>
        For an exact curve at runtime, use <code>round(255 * pow(input / 255.0, 2.2))</code> — but the table version
        is ~50× faster and identical to within rounding.
      </p>
      <h2>Varieties worth knowing</h2>
      <SpecTable
        rows={[
          [
            "Through-hole (5 mm, 3 mm)",
            <>The classic indicator. Domed lens, 10–60° viewing angle, 1–5 mcd to ~10 cd</>,
          ],
          [
            "Surface-mount (0603, 0805, etc.)",
            <>Same chip in a tiny package. PLCC-2 if you want diffused-side emission, side-lookers for backlight strips</>,
          ],
          [
            "High-brightness / 'super-bright'",
            <>Marketing for "good optical efficiency, narrow viewing angle." Visible in daylight</>,
          ],
          [
            "RGB LED",
            <>Three dice in one package. <strong>Common-anode</strong> (3 cathodes, anode tied to V<sub>cc</sub>) or
            <strong> common-cathode</strong> (3 anodes, cathode to GND). Pick the polarity that matches your driver</>,
          ],
          [
            "Addressable / WS2812 / 'NeoPixel'",
            <>RGB LED + tiny IC in one package. Daisy-chain on one data line, send 24 bits per LED at 800 kHz.
            See <a href="#/c-rp2040">c-rp2040</a> for the PIO driver pattern</>,
          ],
          [
            "Power LED (1 W / 3 W / 10 W)",
            <>Star-MCPCB package, 350 mA / 700 mA / 1+ A at 3–3.5 V V<sub>f</sub>. Needs a heatsink and a constant-current
            driver, not a resistor</>,
          ],
          [
            "Bi-colour / tri-colour (2-pin)",
            <>Two dice anti-parallel. Drive AC or alternate polarity to mix. Half the pin count of an RGB</>,
          ],
          [
            "IR LED (940 nm)",
            <>What every remote, IR-LED-strip, and IR-blaster emits. Same diode physics, you just can't see the light</>,
          ],
        ]}
      />
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>Reverse voltage breakdown is low.</strong> Most LEDs have V<sub>R(max)</sub> around 5 V. They are
          <em>not</em> Zeners — exceed it and they fail unpredictably. Bridge a 12 V supply across an LED backwards and
          you'll see a brief flash, then nothing. If reverse voltage is a possibility (back-EMF from a motor, AC across
          a bicolour pair, a polarity-reversal mishap), put a 1N4148 anti-parallel across the LED to clamp it.
        </li>
        <li>
          <strong>Two LEDs in parallel without per-LED resistors will drift apart.</strong> V<sub>f</sub> varies ±5 %
          part-to-part; the LED with the lower V<sub>f</sub> hogs more current, gets hotter, lowers its V<sub>f</sub>{" "}
          further, and eventually one dies bright while the others go dim. Always one resistor <em>per LED</em>, never
          one resistor shared across a parallel pair.
        </li>
        <li>
          <strong>Series strings of LEDs are fine.</strong> If your supply has the headroom: three red LEDs (V
          <sub>f</sub> = 2.0 V each) in series from 9 V need a (9 − 6)/0.010 = 300 Ω resistor and draw 10 mA total
          instead of 30 mA. Same brightness, 1/3 the current, 1/9 the resistor power.
        </li>
        <li>
          <strong>3.3 V GPIO cannot drive a blue/white LED at full brightness</strong> — explained above. If you need
          a bright modern LED off a 3.3 V MCU, switch a separate 5 V rail through a transistor instead.
        </li>
        <li>
          <strong>The "calculator" current-limit resistor is a maximum, not a minimum.</strong> Most indicator LEDs
          look fine at 2–5 mA, which is half the textbook value, and runs cooler. Don't feel obligated to push 20 mA
          unless you're actually trying to see the thing in daylight.
        </li>
        <li>
          <strong>WS2812 strings need a 5 V data line.</strong> Most addressable strips spec 0.7 × V<sub>DD</sub> as
          logic-high threshold, which at V<sub>DD</sub> = 5 V is 3.5 V — just above a 3.3 V MCU's V<sub>OH</sub>. You
          get away with it sometimes, but for reliability use a 74AHCT125 buffer powered from 5 V to lift the data
          line. The first LED in the chain is usually the one that misbehaves.
        </li>
        <li>
          <strong>The longer leg fooled you once.</strong> SMD LED polarity is marked differently by every vendor — a
          green dot, T-bar, chamfered corner, or printed C. When in doubt, current-limited bench supply at 1 mA and
          eyeball it. Backwards is no light but no damage at 1 mA; backwards at 20 mA risks the reverse-breakdown
          flash.
        </li>
        <li>
          <strong>Power LEDs need a constant-current driver, not a resistor.</strong> A 3 W LED at 3.2 V / 700 mA in
          series with a resistor from 5 V wastes (5 − 3.2) · 0.7 = 1.3 W in the resistor — half the LED's actual rated
          power, as heat in a tiny part. Use a switch-mode CC driver (CAT4101, AL8807, AP3017, the LED-strip-style
          PT4115); for one-off projects a $1 module solves it.
        </li>
      </ul>
    </>
  ),
  "c-pushbutton": () => (
    <>
      <h2>What it is</h2>
      <p>
        Two pieces of metal that touch when you press them, and don't when you don't. The "tactile" or "momentary"
        switch found in every dev board reset corner: a four-pin SMD or through-hole part where the four legs are
        actually two pairs of internally-bridged terminals, and pressing the dome shorts pair A to pair B for as long
        as you're holding it. There's no semiconductor physics in the body of the switch — just a phosphor-bronze
        contact dome that buckles under finger pressure, makes contact, and snaps back when released.
      </p>
      <p>
        Despite the apparent simplicity, a bare pushbutton wired directly to an MCU input is one of the most reliable
        ways to get unreliable behaviour. Two problems lurk: <strong>floating inputs</strong> (the GPIO has nothing
        pulling it to a known state when the button is open) and <strong>contact bounce</strong> (the metal-on-metal
        contact rings for 1–10 ms as the dome settles). Solving them is a tiny circuit + a handful of code lines and
        always the same recipe, so it's worth getting right once.
      </p>
      <h2>The mechanism — and why it bounces</h2>
      <p>
        Inside a 6 mm tactile switch you have a domed contact made of beryllium copper or phosphor bronze, suspended
        over two fixed contacts. When you press the actuator, the dome inverts (this is what makes the satisfying
        "click") and shorts the two fixed contacts together. The dome's spring force is what restores the open state.
      </p>
      <p>
        The bounce happens because the dome doesn't make a single clean contact — it momentarily touches, separates
        microscopically as the metal flexes, touches again, separates, and so on for 1–10 milliseconds until it settles.
        From the GPIO's perspective, that single physical press produces a burst of <strong>tens to hundreds of
        rising and falling edges</strong>. Read the pin in a loop and you'll count one press as many; trigger an
        interrupt on edge and you'll get a flurry of them.
      </p>
      <h2>Pull-up vs pull-down</h2>
      <p>
        A floating CMOS input picks up enough ambient noise (60 Hz hum, your finger near the trace, the FET drain of
        a passing GPIO toggle next door) that it reads as random digital noise. The fix is a <strong>pull resistor</strong>{" "}
        — a ~10 kΩ from the input to either V<sub>cc</sub> or GND, defining a known state when the button is open.
      </p>
      <SpecTable
        rows={[
          [
            "Pull-up (most common)",
            <>One side of the button to GND, other to GPIO; 10 kΩ from GPIO to V<sub>cc</sub>. Pin reads <strong>HIGH idle</strong>, <strong>LOW pressed</strong></>,
          ],
          [
            "Pull-down",
            <>One side of the button to V<sub>cc</sub>, other to GPIO; 10 kΩ from GPIO to GND. Pin reads <strong>LOW idle</strong>, <strong>HIGH pressed</strong></>,
          ],
          [
            "Internal pull-up",
            <>Most MCUs (STM32, ESP32, RP2040, nRF52, AVR) have a ~50 kΩ pull-up built into every GPIO. Enable it with <code>pinMode(PIN, INPUT_PULLUP)</code> and skip the external resistor</>,
          ],
          [
            "Internal pull-down",
            <>STM32 / ESP32 / nRF52 have these too; AVR does not. Same idea, opposite polarity</>,
          ],
        ]}
      />
      <Callout>
        Convention almost everywhere: <strong>active-low pull-up wiring</strong>. The button connects the input to GND
        when pressed. The reason is historical (TTL inputs were happier sinking than sourcing) but it's stuck around
        because every example, every library, and every dev board assumes it.
      </Callout>
      <h2>Debouncing — three approaches</h2>
      <p>
        Once the pull is sorted, the bounce is the next problem. Three patterns, increasing in complexity:
      </p>
      <h3>1. Software debounce (delay)</h3>
      <CodeBlock
        language="cpp"
        filename="debounce_delay.ino"
        code={`const int BTN = 2;
int lastReading = HIGH;
int stableState = HIGH;
unsigned long lastChangeMs = 0;
const unsigned long DEBOUNCE_MS = 20;

void setup() {
  pinMode(BTN, INPUT_PULLUP);   // idle HIGH, pressed LOW
  Serial.begin(115200);
}

void loop() {
  int reading = digitalRead(BTN);
  if (reading != lastReading) {
    lastChangeMs = millis();
    lastReading = reading;
  }
  if (millis() - lastChangeMs > DEBOUNCE_MS) {
    if (reading != stableState) {
      stableState = reading;
      if (stableState == LOW) Serial.println("pressed");
    }
  }
}`}
      />
      <p>
        The pattern: any time the pin changes, restart a 20 ms timer. Only commit the new state once the timer expires
        without further changes. Twenty milliseconds is enough to outlast every tactile switch's bounce window without
        being slow enough that the user notices the lag. This is the textbook approach and it works.
      </p>
      <h3>2. Hardware debounce (RC + Schmitt)</h3>
      <p>
        A 10 kΩ pull-up + a 100 nF cap from input to GND forms a low-pass filter with a 1 ms time constant. Any bounce
        faster than that gets smoothed out before the GPIO sees it. Pair it with a Schmitt-trigger input (see{" "}
        <a href="#/pr-schmitt">pr-schmitt</a>) and you have a hardware debouncer that needs no firmware support:
      </p>
      <Callout label="// math">
        τ = R · C &nbsp;·&nbsp; for 10 kΩ + 100 nF, τ = 1 ms — bounce attenuated 99 % within 5 ms
      </Callout>
      <p>
        The downside is the part count (one resistor, one cap, sometimes one Schmitt buffer) and the fact that you
        also slow down the genuine edge. Worth it for noisy environments, mechanical switches that age into bad
        bounce, or designs where the firmware can't afford a debounce loop.
      </p>
      <h3>3. Dedicated debounce IC</h3>
      <p>
        Maxim's MAX6816 / MAX6817 / MAX6818 series, or the older MC14490, do this in silicon: pin in, debounced
        pin out, fixed ~40 ms window. Overkill for one button, but handy when you have a keypad matrix or a panel
        of switches and want them all clean without 16 RC filters or a tight scan loop.
      </p>
      <h2>Reading buttons in real firmware</h2>
      <p>
        For more than one button, the delay-based loop above scales badly. Two patterns hold up better:
      </p>
      <CodeBlock
        language="cpp"
        filename="debounce_shift.ino"
        code={`// Shift-register debounce: sample at a fixed rate, shift the new bit into a
// rolling history. The state is confirmed only when the last N samples agree.
// At a 1 kHz sample rate and N=8, this is ~8 ms of agreement required.
volatile uint8_t btn_history = 0xFF;   // 1 = released, 0 = pressed
volatile bool    btn_pressed = false;

void on_1ms_tick() {                    // call from a timer ISR at 1 kHz
  btn_history = (btn_history << 1) | digitalRead(BTN);
  if (btn_history == 0x00) {            // 8 consecutive pressed samples
    btn_pressed = true;
  } else if (btn_history == 0xFF) {     // 8 consecutive released
    btn_pressed = false;
  }
}`}
      />
      <p>
        The pattern is portable, fast (one shift + one compare per sample), debounces, and naturally extends to
        click-vs-hold detection (count consecutive 0x00s) and chord detection (combine multiple histories). Most
        production firmware looks like this. The {`<Bounce2>`} library on Arduino, {`button.h`} on Zephyr, and{" "}
        {`<debouncer>`} on embassy-rs all wrap variations of it.
      </p>
      <h2>Beyond the basic press</h2>
      <SpecTable
        rows={[
          [
            "Click vs hold",
            <>Measure the press duration; &gt; 500 ms = hold, &lt; 200 ms = click. The interaction every fitness tracker and smart light uses</>,
          ],
          [
            "Double-click",
            <>Detect a release-then-press cycle within 250 ms of the first release. Mouse-style, useful for binary mode toggle on a single button</>,
          ],
          [
            "Long-press lockout",
            <>Many products require a 3–5 s hold for destructive actions (factory reset, force-off). Same idea, longer threshold</>,
          ],
          [
            "Repeat-on-hold",
            <>After 500 ms of hold, emit a "press" event every 100 ms. Volume-up / volume-down behaviour without polling code</>,
          ],
          [
            "Keypad matrix (rows × columns)",
            <>16 buttons in 4 rows × 4 columns = 8 GPIOs instead of 17. Scan one row at a time, read all columns, debounce per cell</>,
          ],
        ]}
      />
      <h2>Switch variety zoo</h2>
      <SpecTable
        rows={[
          ["Tactile (6×6 mm, 3×6 mm SMD)", "The default. 50 mN to 260 mN actuation force. ~100k cycle life"],
          ["Through-hole 12 mm", "Larger, easier to hand-solder. Same circuit, same code"],
          ["Slide switch (SPDT, DPDT)", "Latching. No spring back. Use for power switches and mode selectors"],
          ["Rocker switch", "Same as slide but with the angled paddle. Same circuit"],
          ["Toggle switch", "Industrial latching switch with a lever. Sometimes lit (LED bezel)"],
          ["Reed switch", "Hermetically sealed magnetic switch. Closes when a magnet is brought close — door sensors, flow meters"],
          ["Hall-effect button", "Solid-state, no contact wear, no bounce. Costs 10× a tactile but lasts forever"],
          ["Capacitive touch pad", "No moving parts at all. ESP32 and nRF52840 have built-in capacitive sensing"],
          ["Membrane keypad", "Cheap multi-button panel. Internally a matrix; treat as the matrix above"],
          ["Rotary encoder", "Two switches phased 90° apart on a knob. See click detection patterns for one button per channel"],
        ]}
      />
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>The four pins are two pairs.</strong> On a standard 6 mm tactile switch, the four legs are{" "}
          A1-A2-B1-B2 where A1↔A2 and B1↔B2 are <em>permanently</em> connected. The button shorts A↔B when pressed.
          Wire two of the wrong pins together and you've built a press-resistance of zero — the switch is "on"
          forever. The datasheet's footprint diagram tells you the pairing; "across the long axis" is the convention
          but not universal.
        </li>
        <li>
          <strong>Floating inputs read random.</strong> Already flagged but bears repeating — a CMOS input with no
          pull is not "low," it's "whatever stray charge it picked up." Symptom: button works on a breadboard alone,
          starts misbehaving once you plug in a USB cable that runs near the trace. Fix: always pull. Internal
          pull-ups are free; use them.
        </li>
        <li>
          <strong>EXTI interrupts on a bouncy edge will fire 5–50 times per press.</strong> Interrupt-on-rising-edge
          for a press counter is the obvious move and it always backfires. Either debounce in the ISR (small enable
          window + state machine) or take the polling-at-1-kHz path above. The "use both edges + dt threshold"
          shortcut works but the polling pattern is friendlier to read.
        </li>
        <li>
          <strong>Cap-touch pads need calibration on every power-up.</strong> Self-capacitance of an exposed pad
          drifts with temperature and humidity. The MCU's touch driver auto-calibrates at boot, so don't touch the
          pad during the first 200 ms — or you'll calibrate the pad's resting state to "finger present" and never
          register a touch.
        </li>
        <li>
          <strong>Mechanical wear is real.</strong> A tactile rated 100k cycles really does get bouncier as it
          ages — a button that worked clean at year 1 might need 50 ms of debounce instead of 20 ms by year 5.
          For products people use daily (UI buttons on appliances), spec a 1M-cycle switch and debounce generously
          in firmware.
        </li>
        <li>
          <strong>ESD on exposed pushbuttons.</strong> A button on the outside of an enclosure is an ESD entry point
          straight to a GPIO. Add a TVS diode (PESD3V3L1BA) and/or a 100 Ω series resistor to the trace if the
          board has to pass ±8 kV contact discharge.
        </li>
        <li>
          <strong>One button, two functions = mental load.</strong> Click/double-click/long-press combinations
          quickly exceed what users can remember. Fitbits and AirPods have the budget to teach this; if your product
          doesn't, prefer two cheap buttons over one button with three behaviours.
        </li>
        <li>
          <strong>Reset buttons aren't pushbuttons in the firmware sense.</strong> The MCU's NRST pin needs an RC
          filter (100 nF to GND) and a 10 kΩ pull-up to V<sub>cc</sub> — and the button goes between NRST and GND.
          Debouncing happens implicitly because the chip is held in reset for the entire press window. No firmware
          involved.
        </li>
      </ul>
    </>
  ),
  "c-bme280": () => (
    <>
      <h2>What it is</h2>
      <p>
        Bosch Sensortec's three-in-one environmental sensor in a 2.5 × 2.5 × 0.93 mm metal-lidded LGA-8 package:
        <strong> temperature</strong> (±1 °C), <strong>relative humidity</strong> (±3 %), and{" "}
        <strong>barometric pressure</strong> (±1 hPa, which translates to ~±1 m of altitude resolution). One sensor,
        one I²C address, one library call — the default starting point for any "weather station," "air quality monitor,"
        or "altitude logger" project. The newer BME680 / BME688 adds a VOC gas sensor for the same price; the older
        BMP280 drops humidity to save ~30 cents. For straight T/H/P, the BME280 is still the right pick.
      </p>
      <p>
        The catch is that the chip's <strong>raw output is uncalibrated</strong>. Each die ships with a per-part
        calibration table burned into its NVM at the factory, and the temperature/humidity/pressure values you actually
        want are computed by applying ~12 floating-point fixup polynomials to the raw reads. Every driver on the
        planet does this for you; the math lives in the datasheet's "compensation formulas" section.
      </p>
      <h2>Datasheet at a glance</h2>
      <SpecTable
        rows={[
          [<>V<sub>DD</sub></>, "1.71 – 3.6 V (the BME280 ships on most breakouts with an onboard LDO from 5 V)"],
          [<>I<sub>DD</sub></>, "3.6 µA @ 1 Hz with all three sensors (humidity-only mode: ~0.1 µA in sleep)"],
          ["Temperature range", "−40 to +85 °C operating; accuracy ±0.5 °C from 0–65 °C"],
          ["Humidity range", "0 – 100 % RH; accuracy ±3 % RH from 20–80 %"],
          ["Pressure range", "300 – 1100 hPa absolute (≈ Mt Everest down to −500 m below sea level)"],
          ["Resolution", "Temperature 0.01 °C, humidity 0.008 % RH, pressure 0.18 Pa"],
          ["Interface", "I²C up to 3.4 MHz, or 4-wire SPI up to 10 MHz — selectable by tying CSB high or low at boot"],
          ["I²C address", <>0x76 (SDO to GND) or 0x77 (SDO to V<sub>DD</sub>). Adafruit defaults to 0x77, AliExpress modules to 0x76</>],
          ["Response time", "Temperature τ ≈ 1.6 s, humidity τ ≈ 1 s, pressure τ ≈ tens of ms"],
          ["Package", "LGA-8, 2.5 × 2.5 × 0.93 mm. Always on a breakout — never hand-solder the bare part"],
        ]}
      />
      <h2>How each sensor works</h2>
      <h3>Pressure — piezoresistive MEMS diaphragm</h3>
      <p>
        A micro-machined silicon diaphragm a few hundred microns across, etched into a Wheatstone bridge of doped
        piezoresistors. Atmospheric pressure deflects the diaphragm by nanometres; the resistors change value
        proportionally; the bridge converts that change into a differential voltage that the on-die 16-bit ADC samples.
        The on-die microcontroller applies the calibration polynomial and you get a 20-bit pressure reading you can
        convert to hPa.
      </p>
      <h3>Humidity — capacitive polymer film</h3>
      <p>
        A polymer film between two metal electrodes acts as the dielectric of a capacitor. The polymer absorbs and
        desorbs water vapour from the surrounding air, changing its dielectric constant by ~5 % over the full 0–100 %
        RH range. An on-die oscillator measures the capacitance against an internal reference and outputs a 16-bit
        humidity value. Response time is dominated by how fast water diffuses in and out of the polymer — about a
        second for a step change.
      </p>
      <h3>Temperature — bandgap reference</h3>
      <p>
        Two on-die transistors biased at different current densities have V<sub>BE</sub> values that diverge linearly
        with absolute temperature (this is a "PTAT" — proportional-to-absolute-temperature — reference, the canonical
        on-chip thermometer). The difference is amplified, digitised, and run through the calibration polynomial. The
        temperature output isn't just a sensor reading on its own — it's also <strong>required</strong> to compensate
        the pressure and humidity polynomials, so even if you only want pressure, the chip samples temperature too.
      </p>
      <Callout>
        The temperature sensor is on the same die as the rest of the chip. The chip itself dissipates ~0.5 mW when
        active, which warms the die ~0.3 °C above ambient under continuous sampling. That's why every BME280 reads
        slightly hot when you first power it up. Use "forced mode" (one-shot sample, then sleep) instead of
        "continuous mode" for accurate temperature.
      </Callout>
      <h2>Wiring</h2>
      <p>
        Four wires for I²C: V<sub>DD</sub>, GND, SDA, SCL. On breakout boards the LDO converts 5 V→3.3 V and a level
        shifter handles 5 V I²C signals — perfectly safe to wire to a 5 V Arduino. For 3.3 V MCUs (ESP32, RP2040,
        STM32, nRF52), use the 3.3 V rail directly; the 5 V input on the breakout still works, but you're spending
        20 µA of LDO quiescent for no reason. SDA and SCL need <strong>4.7 kΩ pull-ups to 3.3 V</strong>; the breakout
        usually has them populated already (check the silkscreen).
      </p>
      <SpecTable
        rows={[
          [<>V<sub>DD</sub></>, "3.3 V (or 5 V via the breakout's LDO)"],
          ["GND", "Common ground"],
          ["SDA", "Bidirectional data, 4.7 kΩ pull-up to 3.3 V"],
          ["SCL", "Clock, 4.7 kΩ pull-up to 3.3 V"],
          ["CSB", "Tie HIGH for I²C mode (default on every breakout). Tie LOW for SPI mode"],
          ["SDO", "I²C address select. GND = 0x76, V_DD = 0x77. (In SPI mode, this is MISO)"],
        ]}
      />
      <h2>Reading it — the canonical Arduino path</h2>
      <CodeBlock
        language="cpp"
        filename="bme280_read.ino"
        code={`#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;             // I²C, default speed 100 kHz

void setup() {
  Serial.begin(115200);
  if (!bme.begin(0x76)) {        // try 0x76 first (most modules)
    if (!bme.begin(0x77)) {      // fall back to 0x77 (Adafruit default)
      Serial.println("BME280 not found, check wiring + address!");
      while (1) delay(10);
    }
  }
  bme.setSampling(Adafruit_BME280::MODE_FORCED,         // one-shot, then sleep
                  Adafruit_BME280::SAMPLING_X1,         // temperature oversample
                  Adafruit_BME280::SAMPLING_X1,         // pressure oversample
                  Adafruit_BME280::SAMPLING_X1,         // humidity oversample
                  Adafruit_BME280::FILTER_OFF);
}

void loop() {
  bme.takeForcedMeasurement();   // wake → sample → sleep
  float t = bme.readTemperature();          // °C
  float p = bme.readPressure() / 100.0F;    // hPa
  float h = bme.readHumidity();             // %RH
  float alt = bme.readAltitude(1013.25F);   // m, vs sea-level 1013.25 hPa
  Serial.printf("T=%.2fC  P=%.1fhPa  H=%.1f%%  alt=%.1fm\\n", t, p, h, alt);
  delay(2000);
}`}
      />
      <Callout label="// what's actually happening on the wire">
        Each <code>readTemperature()</code> issues a multi-byte I²C burst from register 0xFA (the temperature MSB),
        unpacks the 20-bit raw value, then runs it through Bosch's compensation polynomial using the calibration
        constants the driver read at <code>begin()</code> time. The library hides all of it; the datasheet gives the
        exact reference C code in case you want to drop the library and save ~6 KB of Flash.
      </Callout>
      <h2>Altitude from pressure</h2>
      <p>
        Atmospheric pressure drops with altitude — about 12 Pa per metre at sea level, less at higher altitudes. The
        International Standard Atmosphere model lets you convert directly:
      </p>
      <Callout label="// math">
        alt = 44330 · [ 1 − (P / P<sub>0</sub>)<sup>1/5.255</sup> ] &nbsp; (m, with P and P<sub>0</sub> in hPa)
      </Callout>
      <p>
        The catch is the <strong>reference pressure P<sub>0</sub></strong>. If you use the textbook 1013.25 hPa,
        your "altitude" is really "altitude assuming today's weather is standard," which is off by ±100 m on any
        given day depending on the local high/low pressure system. For relative altitude (how much have I climbed
        since I started?) calibrate P<sub>0</sub> to the local pressure at your starting elevation and the BME280
        becomes a <strong>~1 m resolution altimeter</strong> over a 30-minute timescale. For absolute altitude, you
        need a GPS or a network weather query for the local sea-level pressure.
      </p>
      <h2>Operating modes — forced vs normal</h2>
      <SpecTable
        rows={[
          [
            "Sleep mode",
            <>Power-on default. No sampling, ~0.1 µA. Wake by writing to <code>ctrl_meas</code></>,
          ],
          [
            "Forced mode",
            <>One-shot sample on command, then back to sleep. Best accuracy (no self-heating). Use for any
            data-logging or low-power sensor</>,
          ],
          [
            "Normal mode",
            <>Continuous sampling with a programmable standby period (0.5 ms to 1 s). Convenient for
            real-time displays. Self-heats the die — temperature reads ~0.3 °C high</>,
          ],
        ]}
      />
      <h2>The Bosch ecosystem — when to reach for which</h2>
      <Compare
        header={["", "Sensors", "Notable"]}
        rows={[
          ["BMP280", "T + P", "Drop humidity, save ~30 ¢. Same chip, same library"],
          ["BME280", "T + H + P", "The classic. This page"],
          ["BME680", "T + H + P + VOC gas (R)", "Adds a hot-plate metal-oxide gas sensor — VOC index, no specific gas"],
          ["BME688", "T + H + P + VOC + AI", "Successor with on-chip ML classifier (Bosch's BSEC2 firmware)"],
          ["BMP388 / BMP390", "P only, ±0.08 hPa", "9× more accurate than the BME280's pressure stage. The right altimeter for drones"],
        ]}
      />
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>Self-heating in continuous mode.</strong> Already flagged but the most common bug — your BME280 reads
          3 °C too hot, you swap modules, same thing. The fix is forced mode plus a 1-second-minimum interval. If you
          need 10 Hz temperature, accept the offset and subtract a constant.
        </li>
        <li>
          <strong>The I²C address depends on the wiring of SDO.</strong> Half the modules in the world ship at 0x76,
          the other half at 0x77. If <code>begin(0x77)</code> fails silently, try 0x76 before assuming the part is
          dead. Code defensively: scan both addresses at boot.
        </li>
        <li>
          <strong>Humidity drift after solder reflow.</strong> The polymer film absorbs moisture during humid storage
          and reflow can drive it off. Bosch specifies a "rehydration" period of 24 hours at 25 °C / 50 % RH for
          freshly-soldered parts before they hit datasheet accuracy. Most projects don't notice this; high-accuracy
          ones do.
        </li>
        <li>
          <strong>The pressure sensor is sensitive to wind.</strong> If you mount the sensor in an outdoor enclosure,
          a stiff breeze across the vent hole causes ~10 Pa transients — visible as 1 m altitude noise. Either filter
          (the BME280's IIR filter is built for this) or use a vented gore-tex membrane to slow the airflow.
        </li>
        <li>
          <strong>Direct sunlight is fatal to humidity readings.</strong> The dark metal lid soaks up sunlight, the
          die heats 10 °C above ambient, and the humidity calculation (which divides by absolute saturation pressure
          at that temperature) gives you wildly low RH. Always shade the sensor — a Stevenson-screen-style enclosure
          if you're outdoors.
        </li>
        <li>
          <strong>SDA / SCL pull-ups are sometimes missing on cheap modules.</strong> AliExpress BME280 modules are
          inconsistent — some have 4.7 kΩ pull-ups populated, some don't. If <code>begin()</code> hangs forever,
          probe SCL with a scope and check whether it sits at 3.3 V when idle. If it's at 0 V, you need external
          pull-ups.
        </li>
        <li>
          <strong>SPI vs I²C is a hardware-time choice, not runtime.</strong> CSB is sampled at startup and the
          chip locks into the chosen mode until the next reset. There's no software switch. On a breakout it's
          almost always wired for I²C; if you want SPI you'll either need a different breakout or a soldering iron.
        </li>
        <li>
          <strong>Don't trust the "compensated raw" values in the registers.</strong> The chip's output registers
          contain <em>raw ADC</em> readings, not engineering units. You must apply the calibration polynomial
          (Bosch's reference code is ~150 lines of C) before publishing the value. Every library does this; rolling
          your own without the polynomial gives nonsense.
        </li>
      </ul>
    </>
  ),
  "c-mpu6050": () => (
    <>
      <h2>What it is</h2>
      <p>
        InvenSense's 2011 (now TDK's) six-degree-of-freedom IMU: a three-axis MEMS <strong>accelerometer</strong> plus
        a three-axis MEMS <strong>gyroscope</strong> on one die, plus a 16-bit ADC, an on-die temperature sensor, an
        I²C interface, and a half-documented on-die DSP called the <strong>DMP</strong> (Digital Motion Processor)
        that does sensor fusion entirely in firmware. Sold as a bare GY-521 module for under $2; ten years after launch
        it's still the chip that ships on every "Arduino IMU" tutorial despite being officially obsolete.
      </p>
      <p>
        For a modern design you'd reach for the <strong>ICM-20948</strong> (TDK's successor, adds magnetometer + better
        gyro), the <strong>BNO055</strong> (Bosch, with on-chip Kalman fusion — see <a href="#/c-bno055">c-bno055</a>),
        or the <strong>LSM6DSOX</strong> (ST, lower noise, ML core). But the MPU6050 stays popular because the modules
        are cheap, the libraries are mature, and "two axes of accel + one of gyro" is enough for almost any hobby
        project that doesn't need heading-relative motion.
      </p>
      <h2>Datasheet at a glance</h2>
      <SpecTable
        rows={[
          [<>V<sub>DD</sub></>, "2.375 – 3.46 V chip; modules ship with an LDO so 5 V supply is fine"],
          [<>I<sub>DD</sub></>, "3.9 mA active (both sensors), 5 µA gyro-standby, &lt; 5 µA full sleep"],
          ["Accelerometer", "3-axis, 16-bit, programmable ±2 / ±4 / ±8 / ±16 g range, up to 1 kHz output rate"],
          ["Gyroscope", "3-axis, 16-bit, ±250 / ±500 / ±1000 / ±2000 °/s, up to 8 kHz output rate"],
          ["Temperature", "On-die, ±1 °C — same caveats as the BME280's bandgap sensor (self-heating)"],
          ["Interface", "I²C up to 400 kHz (Fast Mode). No SPI on this chip — that's the MPU6500/9250"],
          ["I²C address", "0x68 (AD0 to GND) or 0x69 (AD0 to V_DD)"],
          ["Built-in DMP", "Undocumented coprocessor that runs Kalman fusion on-die. Outputs quaternions at 200 Hz"],
          ["FIFO", "1024-byte buffer. Stream samples to it, drain at your own pace"],
          ["Aux I²C master", "A second I²C bus the chip can drive — used to talk to an external magnetometer on the MPU9150"],
          ["Package", "QFN-24, 4 × 4 × 0.9 mm"],
        ]}
      />
      <h2>How a MEMS accelerometer works</h2>
      <p>
        Inside the die, etched out of single-crystal silicon: a small <strong>proof mass</strong> suspended by silicon
        flexure springs, with interleaved comb fingers on the mass and on a fixed anchor. Acceleration moves the mass
        relative to the anchor by nanometres; the gap between the comb fingers changes; the capacitance between them
        changes proportionally; an on-die charge amplifier reads the change. Three of these structures, oriented
        orthogonally, give you X/Y/Z acceleration.
      </p>
      <Callout label="// the gravity vector is always there">
        At rest on a table, the accelerometer reads 1 g pointing up — the "1 g of gravity" you spent first-year physics
        ignoring. You can't separate "the device is accelerating" from "the device is tilted" without a second sensor.
        That's why the gyro is on the same die.
      </Callout>
      <h2>How a MEMS gyroscope works</h2>
      <p>
        A MEMS gyro uses the <strong>Coriolis effect</strong>: a small silicon proof mass is electrostatically driven
        into a sinusoidal lateral vibration at ~30 kHz. When you rotate the chip around the axis perpendicular to that
        vibration, the Coriolis force pushes the vibrating mass <em>sideways</em> (orthogonal to both the drive and the
        rotation axis) by an amount proportional to the angular rate. A second set of capacitive pickoffs measures
        that sideways deflection, demodulates it against the drive signal, and outputs angular rate in °/s. Three
        decoupled structures handle X, Y, Z. The output is <strong>angular rate</strong>, not angle — to get angle
        you integrate over time, which we'll come back to.
      </p>
      <h2>Wiring</h2>
      <SpecTable
        rows={[
          [<>V<sub>CC</sub></>, "3.3 V or 5 V (module has an LDO)"],
          ["GND", "Common ground"],
          ["SDA", "I²C data, 4.7 kΩ pull-up to 3.3 V"],
          ["SCL", "I²C clock, 4.7 kΩ pull-up to 3.3 V"],
          ["INT", "Optional: data-ready interrupt to a GPIO. Saves you polling"],
          ["AD0", "I²C address LSB. GND = 0x68, V_DD = 0x69"],
          ["XDA / XCL", "Aux I²C master pins. Tie nothing if you're not using them"],
        ]}
      />
      <h2>Reading raw accel + gyro</h2>
      <CodeBlock
        language="cpp"
        filename="mpu6050_raw.ino"
        code={`#include <Wire.h>
#include <MPU6050.h>

MPU6050 imu;                          // address defaults to 0x68

void setup() {
  Wire.begin();
  Serial.begin(115200);
  imu.initialize();
  if (!imu.testConnection()) {
    Serial.println("MPU6050 not found at 0x68");
    while (1) delay(10);
  }
  imu.setFullScaleAccelRange(MPU6050_ACCEL_FS_4);   // ±4 g
  imu.setFullScaleGyroRange(MPU6050_GYRO_FS_500);   // ±500 °/s
}

void loop() {
  int16_t ax, ay, az, gx, gy, gz;
  imu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
  // Raw counts → engineering units (±4 g → 8192 LSB/g, ±500 °/s → 65.5 LSB/(°/s))
  Serial.printf("ax=%+.2fg ay=%+.2fg az=%+.2fg | gx=%+.1f gy=%+.1f gz=%+.1f deg/s\\n",
                ax / 8192.0f, ay / 8192.0f, az / 8192.0f,
                gx / 65.5f, gy / 65.5f, gz / 65.5f);
  delay(20);
}`}
      />
      <h2>Sensor fusion — why neither sensor is enough alone</h2>
      <p>
        Accelerometer alone: tells you the gravity vector instantly, gives you pitch and roll from the static tilt.
        But any motion (running, vibrating, a passing truck) shows up as fake "tilt" — the readings are noisy on any
        meaningful timescale.
      </p>
      <p>
        Gyro alone: tells you angular rate exactly and instantly. Integrate it and you get angle — but every gyro has
        a small <strong>bias</strong> (a few °/s of offset that's not really there), and integrating bias over time
        gives <strong>drift</strong>. Sit the chip perfectly still on a desk and after 30 seconds your "yaw" reading
        will be many degrees off zero.
      </p>
      <p>
        Combining them solves both problems: use the accelerometer's slow-but-true reading to <strong>correct</strong>{" "}
        the gyro's fast-but-drifting integration. The two simple combinations:
      </p>
      <Callout label="// math (complementary filter)">
        angle = α · (angle + gyro · dt) + (1 − α) · accel_angle, α ≈ 0.98
      </Callout>
      <p>
        Trust the gyro 98 % of the time (it's accurate over short windows), let the accelerometer pull the answer
        back to truth the other 2 %. The Kalman filter does the same job more rigorously by tracking the variance of
        each estimate, but the complementary filter gets you 90 % of the result in 5 lines of code.
      </p>
      <CodeBlock
        language="cpp"
        filename="complementary_filter.ino"
        code={`float angle = 0.0f;                  // current pitch estimate, degrees
const float alpha = 0.98f;
unsigned long lastUs = 0;

void loop() {
  imu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
  unsigned long now = micros();
  float dt = (now - lastUs) * 1e-6f;
  lastUs = now;

  // From accel: pitch = atan2(ax, sqrt(ay² + az²))
  float accel_pitch = atan2f(ax, sqrtf(ay*ay + az*az)) * 180.0f / M_PI;
  // From gyro: angular rate in deg/s
  float gyro_rate   = gx / 65.5f;

  angle = alpha * (angle + gyro_rate * dt) + (1.0f - alpha) * accel_pitch;
}`}
      />
      <h2>The DMP — fusion on-die</h2>
      <p>
        The MPU6050 has an embedded coprocessor called the <strong>DMP</strong> that runs InvenSense's own sensor
        fusion (a proprietary Kalman variant) and pushes quaternions into the FIFO at 200 Hz. You write some opaque
        firmware blobs to the chip at boot, configure your sample rate, and read 4-tuples out — no math on the host
        side. When it works, it's magical.
      </p>
      <p>
        The catch: <strong>InvenSense never published the DMP firmware source</strong> or even reliable docs. The
        community reverse-engineered a working blob (now in {`<MPU6050_6Axis_MotionApps20.h>`} in Jeff Rowberg's
        library), and that's what every "MPU6050 with DMP" tutorial uses. It works, but: the load is ~3 KB of opaque
        bytecode, the boot sequence is brittle, and the temperature compensation is poor — leave a powered MPU6050
        sitting for an hour and the gyro bias creeps. For new designs, prefer a sensor with documented fusion
        (BNO055) or write your own with a documented stack like Madgwick or Mahony.
      </p>
      <h2>Picking a full-scale range</h2>
      <SpecTable
        rows={[
          ["Accel ±2 g (16384 LSB/g)", "Tilt sensing, slow motion, posture detection. Best resolution"],
          ["Accel ±4 g (8192 LSB/g)", "General-purpose. Captures normal handheld motion without clipping"],
          ["Accel ±8 g (4096 LSB/g)", "Sports / fitness motion, robotics arms — anything that throws around 5+ g"],
          ["Accel ±16 g (2048 LSB/g)", "Drop detection, crash detection, impact logging"],
          ["Gyro ±250 °/s (131 LSB/°/s)", "Slow rotation — body posture, gimbal stabilisation"],
          ["Gyro ±500 °/s (65.5 LSB/°/s)", "Default-grade general use, handheld + drone"],
          ["Gyro ±1000 °/s (32.8 LSB/°/s)", "Aggressive drone manoeuvres"],
          ["Gyro ±2000 °/s (16.4 LSB/°/s)", "Combat drones, gimbal-induced spin, high-speed rotation"],
        ]}
      />
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>Gyro bias drifts with temperature.</strong> Cold MPU6050 reads ~3 °/s gyro offset; warm one reads
          ~0.5 °/s. The DMP claims to handle this but doesn't, very well. For applications that integrate gyro
          (heading hold, dead reckoning), either calibrate the bias at boot every time or use a fusion algorithm
          that adapts.
        </li>
        <li>
          <strong>Bias calibration must happen with the chip at rest.</strong> Most "calibration" code averages 1000
          readings to find the resting offset. If the device is hand-held or vibrating during calibration, you've
          burned that motion into the bias estimate as "zero" — and now stationary reads wrong. The pattern: put it
          flat, count down 3 seconds, then calibrate.
        </li>
        <li>
          <strong>The accel Z axis reads −1 g at rest, not +1 g.</strong> If the chip is flat on a desk with the dots
          on top, the gravity vector points <em>into</em> the chip's −Z axis. Sign confusion is common; check the
          datasheet's coordinate axes diagram and verify with a known orientation.
        </li>
        <li>
          <strong>I²C clock-stretching is not supported.</strong> The MPU6050 is happy to talk to a master at up to
          400 kHz, but it does not <em>stretch</em> the clock if it's busy. Reading too fast (faster than the sensor's
          output data rate divider produces samples) gives you the same value multiple times — looks like the chip
          is stuck.
        </li>
        <li>
          <strong>The on-die low-pass filter is shared between accel and gyro.</strong> One register sets the digital
          LPF cutoff for both sensors. If you need 1 kHz accel data but only 100 Hz gyro, you have to use the higher
          rate and decimate in software.
        </li>
        <li>
          <strong>FIFO overflow corrupts the buffer.</strong> Set FIFO to "accel + gyro" at 1 kHz and don't drain it
          fast enough → the on-chip buffer fills, overflows, and the next read gives you bytes out of phase. Each
          frame is 12 bytes (6 × int16); 1024 / 12 ≈ 85 frames. Drain it every 50 ms at 1 kHz to avoid this.
        </li>
        <li>
          <strong>The "MPU6050 dead" symptom on AliExpress modules.</strong> A surprising number of cheap GY-521s
          ship with a counterfeit silicon that's never actually programmed. Symptom: <code>testConnection()</code>
          fails, or always returns the same constant. Try a second module before giving up.
        </li>
        <li>
          <strong>If you need a magnetometer, this isn't your chip.</strong> The MPU6050 has only 6 DoF — accel +
          gyro, no compass. Without a magnetometer you can integrate angular rate to get relative heading but you
          can't get absolute "magnetic north." For that, the MPU9250 (older 9-DoF) or ICM-20948 (modern) adds an
          AK8963 magnetometer on the same die.
        </li>
      </ul>
    </>
  ),
  "c-bno055": () => (
    <>
      <h2>What it is</h2>
      <p>
        Bosch's flagship IMU and the chip you reach for when you want absolute orientation as a black-box output, not
        a sensor fusion project. Three MEMS sensors on one substrate — a 3-axis accelerometer, a 3-axis gyroscope, and
        a 3-axis magnetometer — plus an <strong>on-die ARM Cortex-M0</strong> running Bosch's proprietary sensor
        fusion firmware that outputs <strong>quaternions or Euler angles directly</strong> at 100 Hz. You wire it up,
        you read four floats over I²C, you have orientation. No Kalman filter to write, no calibration polynomials to
        debug, no DMP firmware to side-load. That's the pitch.
      </p>
      <p>
        The trade-off is power (~12 mA in full-fusion mode vs ~4 mA for the MPU6050), price (~$30 for the Adafruit
        breakout vs $2 for a GY-521), and a famous I²C clock-stretching bug that makes the chip incompatible with
        some MCUs without workarounds. If those don't kill it for your project, the BNO055 saves you weeks of fusion
        work.
      </p>
      <h2>Datasheet at a glance</h2>
      <SpecTable
        rows={[
          [<>V<sub>DD</sub></>, "2.4 – 3.6 V. The Adafruit breakout adds a 3.3 V LDO so 5 V supply works"],
          [<>I<sub>DD</sub></>, "12.3 mA in NDOF (9-DoF + fusion), 5.7 mA in IMU mode (no compass), &lt; 40 µA suspend"],
          ["Accelerometer", "3-axis, 14-bit, ±2 / ±4 / ±8 / ±16 g (Bosch BMA055-class)"],
          ["Gyroscope", "3-axis, 16-bit, ±125 / ±250 / ±500 / ±1000 / ±2000 °/s"],
          ["Magnetometer", "3-axis, 13/14-bit, ±1300 µT (X/Y) ±2500 µT (Z) — uncalibrated needs the fusion engine"],
          ["Fusion engine", "Bosch's BSX3.0. Outputs Euler / quaternion / linear accel / gravity / heading at 100 Hz"],
          ["Interface", "I²C (≤ 400 kHz) or UART (115200). No SPI"],
          ["I²C address", "0x28 (ADR to GND) or 0x29 (ADR to V_DDIO)"],
          ["Operating modes", "11 modes: config / acc-only / mag-only / gyro-only / accmag / accgyro / maggyro / amg / IMU / compass / M4G / NDOF_FMC_OFF / NDOF"],
          ["Calibration", "Stored in NVM. Survives power cycles. Must be redone after enclosure changes that move ferrous metal"],
          ["Package", "LGA-28, 3.8 × 5.2 × 1.13 mm"],
        ]}
      />
      <h2>The fusion engine and why it matters</h2>
      <p>
        Sensor fusion is the process of combining accelerometer, gyroscope, and magnetometer data into a single
        orientation estimate that's better than any one sensor alone. The MPU6050 page covers the complementary-
        filter approach for the 6-DoF case; with magnetometer added, you need a full quaternion-based filter
        (Madgwick, Mahony, or extended Kalman) to get absolute heading. The BNO055 runs Bosch's BSX3.0 algorithm
        on its on-die M0 and outputs:
      </p>
      <SpecTable
        rows={[
          [
            "Quaternion (w, x, y, z)",
            <>4-tuple of floats, no gimbal lock, the right format for animation and motion control. Updated at 100 Hz</>,
          ],
          [
            "Euler angles (roll, pitch, yaw)",
            <>0–360° heading, ±180° roll/pitch. Easy to read, suffers gimbal lock when pitch nears ±90°</>,
          ],
          [
            "Linear acceleration",
            <>Acceleration with gravity <em>subtracted</em>. What you actually want for dead-reckoning / step
            counting / motion classification</>,
          ],
          [
            "Gravity vector",
            <>The direction of gravity in chip coordinates — the part the fusion subtracted out of linear accel</>,
          ],
          [
            "Calibration status",
            <>Per-sensor 0–3 score. Read this before trusting the heading</>,
          ],
        ]}
      />
      <h2>Wiring</h2>
      <SpecTable
        rows={[
          [<>V<sub>IN</sub> / V<sub>DD</sub></>, "3.3 V or 5 V (module-dependent — Adafruit breakout has an LDO)"],
          ["GND", "Common ground"],
          ["SDA", "I²C data, 4.7 kΩ pull-up to 3.3 V"],
          ["SCL", "I²C clock, 4.7 kΩ pull-up to 3.3 V"],
          ["ADR", "Address select. GND = 0x28, V_DD = 0x29"],
          ["INT", "Optional interrupt out — motion-detected, no-motion, etc."],
          ["RST", "Active-low reset. Pull HIGH for normal use; pulse LOW to force a clean reboot"],
          ["PS0 / PS1", "Protocol select. PS0 = 0, PS1 = 0 → I²C (the default). 0/1 → UART"],
        ]}
      />
      <h2>The 11 operating modes</h2>
      <p>
        The BNO055 has a startling number of modes because the fusion algorithm has different power / accuracy
        trade-offs depending on which sensors you actually want fused. The headline modes:
      </p>
      <SpecTable
        rows={[
          [
            "CONFIG",
            "The power-on default. Sensors off, registers writable. You spend ~0 seconds here in normal use",
          ],
          [
            "ACCONLY / MAGONLY / GYROONLY",
            "Single-sensor passthrough — no fusion. Use if you're after raw sensor data for your own algorithm",
          ],
          [
            "IMU (acc + gyro fusion)",
            "6-DoF fusion. Relative orientation, no compass. 5.7 mA",
          ],
          [
            "COMPASS",
            "Magnetometer + accelerometer. Tilt-compensated compass heading. Doesn't use the gyro",
          ],
          [
            "M4G",
            <>Magnetometer-aided gyro. Falls back to mag heading when the gyro drifts. Lower power than full NDOF</>,
          ],
          [
            "NDOF_FMC_OFF",
            "9-DoF fusion without Fast Magnetic Calibration. Use when the environment has stable magnetic interference",
          ],
          [
            "NDOF",
            "The headline mode. Full 9-DoF fusion + auto-calibration of the magnetometer. ~12 mA, 100 Hz output",
          ],
        ]}
      />
      <h2>Reading orientation</h2>
      <CodeBlock
        language="cpp"
        filename="bno055_quat.ino"
        code={`#include <Adafruit_Sensor.h>
#include <Adafruit_BNO055.h>

Adafruit_BNO055 bno(55, 0x28);

void setup() {
  Serial.begin(115200);
  if (!bno.begin()) {
    Serial.println("BNO055 not found at 0x28");
    while (1) delay(10);
  }
  bno.setExtCrystalUse(true);    // use the breakout's 32.768 kHz crystal — better fusion
}

void loop() {
  imu::Quaternion q = bno.getQuat();
  imu::Vector<3> e = bno.getVector(Adafruit_BNO055::VECTOR_EULER);
  imu::Vector<3> a = bno.getVector(Adafruit_BNO055::VECTOR_LINEARACCEL);

  uint8_t sys, gyro, accel, mag;
  bno.getCalibration(&sys, &gyro, &accel, &mag);

  Serial.printf("q=(%+.3f,%+.3f,%+.3f,%+.3f)  euler=(%.1f,%.1f,%.1f) lin_a=(%+.2f,%+.2f,%+.2f) cal=%d/%d/%d/%d\\n",
                q.w(), q.x(), q.y(), q.z(),
                e.x(), e.y(), e.z(),
                a.x(), a.y(), a.z(),
                sys, gyro, accel, mag);
  delay(100);
}`}
      />
      <h2>Calibration — the dance</h2>
      <p>
        The fusion algorithm needs to know each sensor's bias and scale. The BNO055 auto-calibrates as it sees motion,
        but you have to <strong>give it the motion</strong>. The Adafruit recommended procedure:
      </p>
      <ol>
        <li>
          <strong>Gyro</strong>: hold the device perfectly still for 3 seconds. Score goes 0 → 3 once it sees a steady
          zero rotation.
        </li>
        <li>
          <strong>Accelerometer</strong>: slowly rotate the device through six orientations (each axis up and down for
          ~2 seconds each). The fusion algorithm fits a sphere to the readings.
        </li>
        <li>
          <strong>Magnetometer</strong>: a slow figure-8 in the air, sweeping all axes through every direction. ~10
          seconds. Same sphere-fit math, different sensor.
        </li>
      </ol>
      <p>
        The chip auto-saves the calibration into NVM. On the next power-up the offsets are restored — and if the
        environment is unchanged, you're at full calibration immediately. <strong>Move the device to a different room
        or onto a steel desk and you have to re-calibrate the magnetometer</strong>, which is the chip's most fragile
        leg.
      </p>
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>I²C clock-stretching bug.</strong> The famous one. The BNO055 stretches SCL low for ~600 µs during
          some internal operations. Most MCU I²C blocks handle this fine, but the ESP32's hardware I²C (especially the
          older arduino-esp32 versions) does not — it times out and returns an error. Workaround: drop to bit-banged
          I²C, or use Hugo Pristauz's <code>i2c_bno055</code> patched driver, or switch to the UART interface
          (115200 8N1, no flow control, set PS1=1).
        </li>
        <li>
          <strong>Magnetometer interference is everywhere.</strong> The fusion engine assumes a stable magnetic
          field. A speaker, a motor, a steel desk — anything ferrous within ~10 cm — pulls the heading. Symptom:
          slow yaw drift in a fixed direction whenever you're near the offending object. Mitigation: physically
          separate the sensor from anything magnetic, or use M4G / NDOF_FMC_OFF modes if the environment is fixed.
        </li>
        <li>
          <strong>The calibration is per-environment.</strong> Calibrate in your office, then take the device home,
          and the magnetometer cal is wrong (different local magnetic field, different ferrous metal nearby). For
          field-deployed products, expose a "recalibrate" button or run continuous mag auto-calibration even after
          the initial fit.
        </li>
        <li>
          <strong>Switching modes always goes via CONFIG.</strong> The driver writes <code>OPR_MODE = CONFIG</code>,
          waits 19 ms, then writes the new mode. If you forget the wait, the mode change silently fails. Use the
          library — don't poke registers directly unless you read the datasheet's mode-change timing diagram.
        </li>
        <li>
          <strong>Euler vs quaternion vs axis conventions.</strong> The BNO055 outputs Euler angles in degrees,
          ZYX intrinsic rotations (yaw-pitch-roll). The quaternion output is in the chip's "P0" axis convention,
          which doesn't match most aerospace conventions. There's a <code>setAxisRemap()</code> call to fix it, but
          if your "yaw" rotates the wrong direction or your "roll" is actually pitch, this is why.
        </li>
        <li>
          <strong>The on-die M0 is opaque firmware.</strong> Bosch ships a closed-source fusion blob; bugs (heading
          flipping 180°, calibration-score oscillation, occasional gyro stuck-at-zero) are reported in the wild and
          can't be fixed at the user level. Bosch issues firmware updates rarely. For high-reliability projects,
          plan around this — open-source fusion on a 6-DoF chip might be the more durable choice.
        </li>
        <li>
          <strong>External crystal makes a real difference.</strong> Without the optional 32.768 kHz crystal, the
          fusion runs on the chip's internal RC oscillator, which drifts and degrades the timing-sensitive parts of
          the algorithm. Every reputable breakout has a crystal — make sure <code>setExtCrystalUse(true)</code> is
          called.
        </li>
        <li>
          <strong>If you don't actually need absolute heading, consider a 6-DoF chip.</strong> The MPU6050 / ICM-
          20948 / LSM6DSOX are smaller, cheaper, lower-power. The BNO055's value is the magnetometer fusion. If your
          project only needs relative orientation (gimbal, balancing robot, head tracking), the BNO055 is overkill.
        </li>
      </ul>
    </>
  ),
  "c-ov2640": () => (
    <>
      <h2>What it is</h2>
      <p>
        OmniVision's 2-megapixel CMOS image sensor and ISP, launched 2006 and somehow still the default "give an MCU
        a camera" chip in 2026. A 1632 × 1232 active pixel array (UXGA), an on-die image signal processor that does
        white balance / gamma / sharpness / colour conversion / scaling, a JPEG encoder block, a parallel <strong>
        DVP</strong> (Digital Video Port) output, and a 2-wire <strong>SCCB</strong> control interface that's
        essentially I²C with one undocumented behavioural difference. Sells for ~$2 as a bare module with an M12
        lens mount.
      </p>
      <p>
        You almost never solder the OV2640 directly. The standard delivery vehicle is a small "camera-module" PCB
        — six wires across the bottom edge, a 24-pin FPC ribbon up top, and an M12 lens screwed on. That's what
        the ESP32-CAM, the ESP-EYE, the Arducam Mini, and a thousand AliExpress IP-camera boards all carry.
      </p>
      <h2>Datasheet at a glance</h2>
      <SpecTable
        rows={[
          [<>V<sub>DD-A</sub> (analog)</>, "2.5 – 3.0 V (typically 2.8 V from an LDO on the module)"],
          [<>V<sub>DD-C</sub> (core)</>, "1.2 – 1.3 V (LDO on the module)"],
          [<>V<sub>DD-IO</sub></>, "1.7 – 3.3 V (matches your MCU's I/O voltage)"],
          [<>I<sub>DD</sub></>, "~60 mA active, ~600 µA standby"],
          ["Active array", "1632 × 1232 pixels (~2 MP UXGA)"],
          ["Output formats", "RGB565 / RGB555 / YUV422 / YUV420 / Y-only / JPEG / Raw Bayer"],
          ["Output sizes (auto-scaled)", "UXGA 1600×1200, SXGA 1280×1024, SVGA 800×600, VGA 640×480, QVGA 320×240, QQVGA 160×120, plus CIF/QCIF"],
          ["Max frame rate", "15 fps @ UXGA, 30 fps @ SVGA, 60 fps @ CIF"],
          ["JPEG quality", "Adjustable Q-table, ~5:1 to 30:1 compression"],
          ["Interface", "8/10-bit DVP parallel + SCCB control"],
          ["SCCB address", "0x30 (read 0x61, write 0x60 — left-shifted by 1 in the I²C convention)"],
          ["Lens mount", "M12 × 0.5 thread, 6-pin FPC or 24-pin FPC connector"],
        ]}
      />
      <h2>The mechanism — CMOS image sensors in one paragraph</h2>
      <p>
        Each pixel is a photodiode (a reverse-biased pn junction) that accumulates charge proportional to the photons
        hitting it during an integration window. In a CMOS sensor (vs CCD), each pixel also has its own readout
        transistor and amplifier; the array is addressed like RAM, one row at a time. The OV2640 layers a Bayer-pattern
        colour filter array (RGGB) over the photodiodes — half the pixels see only green, a quarter only red, a quarter
        only blue — and the on-die ISP performs <strong>demosaicing</strong> to reconstruct RGB at every pixel
        location. After demosaic the ISP does white balance, gamma, colour matrix, edge sharpening, and finally either
        emits the bitmap or hands it to the JPEG encoder.
      </p>
      <Callout label="// rolling shutter">
        The OV2640 reads one row at a time from top to bottom — a <strong>rolling shutter</strong>. The bottom of an
        image is exposed milliseconds after the top. Fast-moving objects come out skewed (the iconic "rolling shutter
        wobble" on helicopter blades). For motion you want a global-shutter sensor (OV9281 / OV7251), which costs ~10×
        as much.
      </Callout>
      <h2>The DVP parallel interface</h2>
      <p>
        Most modern camera sensors use MIPI CSI-2 (serial differential pairs at gigabit rates), but the OV2640 still
        uses the older parallel "Digital Video Port" — 8 data wires plus three clocks. Total: 11 high-speed signals,
        plus the 2-wire SCCB for control. This is a lot of pins, which is why the OV2640 lives on chips with a
        dedicated camera peripheral (ESP32's DVP block, RP2040's PIO, STM32's DCMI) rather than bit-banging.
      </p>
      <SpecTable
        rows={[
          ["D0–D7", "8 data bits, one byte per pixel-clock edge"],
          ["PCLK (Pixel Clock)", "Output from the sensor — sample D0-D7 on its rising edge. Up to 36 MHz"],
          ["HREF / HSYNC", "High during the active part of each row, low during horizontal blanking"],
          ["VSYNC", "Goes high once per frame — the frame-start sync"],
          ["XCLK (External Clock)", "Master clock IN — typically 20 MHz from the MCU or an oscillator. The sensor PLLs up from this"],
          ["RESET", "Active-low reset. Pull HIGH to run, pulse LOW to force a register reset"],
          ["PWDN", "Power down. Pull LOW for normal operation, HIGH to suspend the analog blocks"],
        ]}
      />
      <h2>SCCB — almost I²C but not quite</h2>
      <p>
        OmniVision's "Serial Camera Control Bus" is electrically and protocol-ly nearly identical to I²C — same start/
        stop conditions, same byte format, same address+register+data structure — but with one footgun:{" "}
        <strong>SCCB does not require ACK</strong> on the master's transmitted bytes. Some chips (the OV2640
        specifically) tolerate I²C masters that wait for ACK; others go silent or repeat bytes if they see one. The
        ESP32's hardware I²C handles this fine in master-write mode; the RP2040's Synopsys block needs a workaround.
      </p>
      <p>
        Configuration happens by writing 8-bit register addresses + 8-bit values. The OV2640 has hundreds of
        registers and the datasheet doesn't document most of them; the canonical config sequence is a 100+ line
        magic-number register dump captured from OmniVision's reference firmware. Every camera driver carries this
        table in a header file labelled something like <code>ov2640_settings.h</code>.
      </p>
      <h2>Wiring an OV2640 to an ESP32-CAM</h2>
      <p>
        The ESP32-CAM board (AI-Thinker, Espressif) carries an ESP32-S WROOM module, an OV2640 in a 24-pin FPC slot,
        an SD-card socket, a high-current LED, and almost no GPIO left over. The DVP signals are routed internally;
        you only ever see the result through ESP32's camera driver:
      </p>
      <CodeBlock
        language="cpp"
        filename="esp32_cam_capture.ino"
        code={`// Arduino-ESP32 with the esp32-camera component (bundled in the framework)
#include "esp_camera.h"

// Pin map for the AI-Thinker ESP32-CAM (board variants differ — check yours)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26   // SCCB SDA
#define SIOC_GPIO_NUM     27   // SCCB SCL
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void setup() {
  Serial.begin(115200);
  camera_config_t c = {};
  c.ledc_channel = LEDC_CHANNEL_0;
  c.ledc_timer   = LEDC_TIMER_0;
  c.pin_d0 = Y2_GPIO_NUM;  c.pin_d1 = Y3_GPIO_NUM;
  c.pin_d2 = Y4_GPIO_NUM;  c.pin_d3 = Y5_GPIO_NUM;
  c.pin_d4 = Y6_GPIO_NUM;  c.pin_d5 = Y7_GPIO_NUM;
  c.pin_d6 = Y8_GPIO_NUM;  c.pin_d7 = Y9_GPIO_NUM;
  c.pin_xclk = XCLK_GPIO_NUM;
  c.pin_pclk = PCLK_GPIO_NUM;
  c.pin_vsync = VSYNC_GPIO_NUM;
  c.pin_href  = HREF_GPIO_NUM;
  c.pin_sscb_sda = SIOD_GPIO_NUM;
  c.pin_sscb_scl = SIOC_GPIO_NUM;
  c.pin_pwdn  = PWDN_GPIO_NUM;
  c.pin_reset = RESET_GPIO_NUM;
  c.xclk_freq_hz = 20000000;          // 20 MHz to the sensor
  c.pixel_format = PIXFORMAT_JPEG;    // sensor compresses on-die
  c.frame_size   = FRAMESIZE_SVGA;    // 800×600, 30 fps capable
  c.jpeg_quality = 12;                // 0–63, lower = higher quality
  c.fb_count     = 2;                 // double-buffered in PSRAM
  esp_camera_init(&c);
}

void loop() {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) { Serial.println("capture failed"); return; }
  Serial.printf("got JPEG, %u bytes (%dx%d)\\n", fb->len, fb->width, fb->height);
  // send fb->buf over Wi-Fi, save to SD, decode, etc.
  esp_camera_fb_return(fb);
  delay(1000);
}`}
      />
      <h2>Memory: why this needs PSRAM</h2>
      <p>
        A raw RGB565 SVGA frame is 800 × 600 × 2 = 960 KB. UXGA is 3.84 MB. The ESP32's internal SRAM is 520 KB total,
        not nearly enough — which is why the ESP32-CAM board has a 4 or 8 MB <strong>PSRAM</strong> chip on the back.
        The camera driver allocates frame buffers in PSRAM and the JPEG encoder runs from there. <strong>Without
        PSRAM, the OV2640 driver caps at QVGA (320 × 240) in JPEG mode and silently fails at larger sizes</strong>.
        If you're designing your own board, the PSRAM line is non-optional.
      </p>
      <h2>Other OmniVision sensors worth knowing</h2>
      <Compare
        header={["", "Resolution", "Notable"]}
        rows={[
          ["OV7670 / OV7725", "640×480 (VGA)", "1990s-vintage. No on-die JPEG. Cheap, hard to drive — only use if forced"],
          ["OV2640", "1600×1200 (UXGA)", "This page. On-die JPEG, the ESP32-CAM default"],
          ["OV3660", "2048×1536 (QXGA)", "3 MP successor. Drop-in for OV2640 in ESP32 driver"],
          ["OV5640", "2592×1944 (QSXGA)", "5 MP, on-die autofocus VCM driver. Used in better ESP32-S3-CAM modules"],
          ["OV7251 / OV9281", "0.3 / 1 MP global shutter", "Mono only. The right sensor for SLAM / drone vision"],
        ]}
      />
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>The OV2640 needs PSRAM for anything above QVGA in JPEG mode.</strong> Already flagged but the
          single most common "my ESP32-CAM only shows tiny pictures" question on every maker forum. Confirm PSRAM
          is detected at boot — the driver prints it.
        </li>
        <li>
          <strong>The 24-pin FPC connector is fragile.</strong> The latch is plastic, the contacts are 0.5 mm pitch.
          Lift the latch fully before inserting the ribbon, and double-check the contact-side orientation. Inserted
          backwards and the camera reports "all white" or doesn't enumerate at all.
        </li>
        <li>
          <strong>The flash LED on the ESP32-CAM is on GPIO4, which is also the SD-card SDIO_DAT1.</strong> Use the
          LED and the SD card and they'll fight. The fix is to drop GPIO4 from the SD card by using 1-bit SDIO mode,
          which most camera-with-storage firmware does anyway.
        </li>
        <li>
          <strong>20 MHz XCLK is the practical max on many ESP32-CAMs.</strong> The datasheet allows up to 48 MHz
          but PCB layout, FPC length, and the lack of impedance control on cheap modules cap the reliable rate.
          Some camera examples set XCLK to 24 MHz and report visual corruption; drop to 20 MHz.
        </li>
        <li>
          <strong>Auto white balance fights you in colour-temperature-stable environments.</strong> AWB assumes the
          scene contains a mix of colours averaging to grey. Point the camera at a solid blue wall and AWB will
          slowly drag the white-point until the image is yellow. Lock AWB if you control the lighting.
        </li>
        <li>
          <strong>The M12 lens that ships with cheap modules is terrible.</strong> Plastic, no IR-cut filter (so
          your reds are oversaturated), low MTF. The single biggest image-quality upgrade you can make is to swap
          the lens for a $5 glass M12 with an IR-cut. Adafruit / Arducam / Aliexpress all sell better ones.
        </li>
        <li>
          <strong>SCCB writes can fail silently.</strong> Misconfigure the I²C/SCCB block and your register writes
          just don't take — the sensor keeps using defaults, and you have no error to tell you. Always read back
          a known register after init (the "PID/VER" pair at 0x0A / 0x0B should be 0x26 / 0x42 for OV2640) to
          confirm the bus works.
        </li>
        <li>
          <strong>Heat affects image quality.</strong> CMOS sensors get noisier and develop hot pixels as they heat
          up. The OV2640 in an unventilated enclosure running continuous video will produce visibly worse images
          after 5 minutes than after 5 seconds. For continuous-capture products either ventilate or accept the
          noise floor.
        </li>
      </ul>
    </>
  ),
  "c-dc-motor": () => (
    <>
      <h2>What it is</h2>
      <p>
        A <strong>brushed DC motor</strong> is the oldest practical electric motor design — Faraday's setup with
        better magnets. A rotor wound with several coils of copper sits inside a stator made of permanent magnets
        (or, for industrial parts, more electromagnets). Current through a rotor coil pushes against the stator
        field via the Lorentz force, twisting the rotor. To keep the twist going past 90°, a mechanical{" "}
        <strong>commutator</strong> on the rotor shaft swaps which coil is energised every time the rotor passes
        a magnetic pole, using sprung carbon <strong>brushes</strong> as the sliding contact. Apply DC, get
        continuous rotation; reverse polarity, reverse direction.
      </p>
      <p>
        This page covers the small-to-medium brushed DC motor you'll find in any maker context: the canonical
        "yellow gear motor" (~$2), Pololu micro metal gearmotors (~$15), the larger 12 V hobby motor (RS-555,
        ~$8), and the 130-size toy motors in cheap kits. For the drive electronics, we anchor on Toshiba's{" "}
        <strong>TB6612FNG</strong> dual H-bridge — the ~$2 chip that has eclipsed the older L298N for any project
        that values efficiency over a heatsink.
      </p>
      <h2>Motor specs at a glance</h2>
      <SpecTable
        rows={[
          ["Rated voltage", "1.5 V (toy motor), 3 V (TT gear motor), 6 V (micro metal), 12 V (RS-555, hobby)"],
          ["No-load current", "20–100 mA depending on size — the bearing friction + windage tax"],
          ["Stall current", "5–20× no-load — the current at zero RPM when the motor is mechanically locked"],
          ["Free-run speed", "5,000–20,000 RPM at the shaft. Gear motors knock this down by 50–500×"],
          ["Stall torque", "Tens to hundreds of mN·m on small motors. Linearly proportional to current"],
          ["Efficiency", "30–70 % at the best operating point, much worse at the extremes"],
          ["Lifetime", "Brushed: 1k–10k hours, set by brush wear. Brushless: 10k–100k hours"],
        ]}
      />
      <h2>How it actually works</h2>
      <p>
        Apply voltage to the brushes. Current flows through one rotor coil at a time (the commutator picks which).
        The coil sits in the stator's magnetic field; current × field × length = force on the wire (the Lorentz
        force), which becomes torque about the shaft. The rotor turns. As it turns, the commutator switches to the
        next coil, so torque is always applied in the rotational direction.
      </p>
      <p>
        But the same moving coil generating mechanical rotation also{" "}
        <strong>generates a voltage of its own</strong> — the magnetic field changing as the coil moves induces an
        EMF opposing the applied voltage (Faraday again, this time backwards). This is the{" "}
        <strong>back-EMF</strong>, and it's the most important behaviour to understand about DC motors:
      </p>
      <Callout label="// math">
        V<sub>applied</sub> = I · R<sub>winding</sub> + K<sub>e</sub> · ω &nbsp;·&nbsp; T<sub>shaft</sub> = K
        <sub>t</sub> · I &nbsp;·&nbsp; K<sub>e</sub> ≈ K<sub>t</sub> (in SI units)
      </Callout>
      <ul>
        <li>
          At <strong>stall</strong> (ω = 0): no back-EMF, only winding resistance limits current — that's why stall
          current is so high.
        </li>
        <li>
          At <strong>free run</strong> (no load): the motor accelerates until back-EMF nearly equals applied voltage.
          Tiny current, just enough to overcome friction.
        </li>
        <li>
          In between: speed self-regulates around the operating point where (V − K<sub>e</sub>·ω) / R provides exactly
          the current to make the torque match the load.
        </li>
      </ul>
      <h2>The H-bridge — TB6612FNG</h2>
      <p>
        A motor needs four switches in an "H" configuration to be driven bidirectionally: two high-side switches and
        two low-side switches around the motor terminals. Close the diagonals to push current one way; close the
        other diagonal to reverse. Close both bottoms (or both tops) to short the motor terminals — that's the brake.
        Open everything for coast.
      </p>
      <p>
        Doing this with discrete MOSFETs is a six-component circuit per side. The TB6612FNG packs both H-bridges,
        the gate drivers, the level shifter, and shoot-through protection into one SSOP-24 for under $2:
      </p>
      <SpecTable
        rows={[
          [<>V<sub>M</sub></>, "Motor supply, 4.5 – 13.5 V"],
          [<>V<sub>CC</sub></>, "Logic supply, 2.7 – 5.5 V (matches your MCU)"],
          ["Output current", "1.2 A continuous per channel, 3.2 A peak"],
          [<>R<sub>DS(on)</sub></>, "0.5 Ω high-side + 0.5 Ω low-side per channel"],
          ["Inputs per motor", "AIN1, AIN2 (direction), PWMA (speed). Same for B"],
          ["STBY", "Active-low standby — pull HIGH to enable both bridges"],
          ["PWM frequency", "Up to 100 kHz — but 20 kHz is a sweet spot (above audible, below switching losses)"],
        ]}
      />
      <h2>The four motor states</h2>
      <SpecTable
        rows={[
          [
            <>AIN1=1, AIN2=0, PWM</>,
            <><strong>Forward</strong> at duty fraction. High-side A and low-side B switch ON for the PWM
            duty fraction; both low-sides ON during the off fraction (synchronous freewheel)</>,
          ],
          [
            <>AIN1=0, AIN2=1, PWM</>,
            <><strong>Reverse</strong> at duty fraction. Mirror of forward</>,
          ],
          [
            <>AIN1=1, AIN2=1, any PWM</>,
            <><strong>Brake</strong>. Both low-side switches ON — motor terminals shorted, back-EMF dumps as
            current through the bridge, motor decelerates fast</>,
          ],
          [
            <>AIN1=0, AIN2=0, any PWM</>,
            <><strong>Coast</strong>. All four switches OFF. Motor freewheels, no current, decelerates slowly
            via friction only</>,
          ],
        ]}
      />
      <p>
        PWM speed control on the TB6612FNG uses <strong>sign + magnitude</strong>: AIN1/AIN2 set the direction,
        PWMA modulates the duty cycle. This is the "fast decay" mode — between PWM pulses the bridge actively
        brakes (synchronous freewheel through the low-sides), giving the best speed control linearity. The L298N's
        "slow decay" alternative coasts between pulses, which is less linear but easier on the supply.
      </p>
      <CodeBlock
        language="cpp"
        filename="tb6612_drive.ino"
        code={`// One motor on the A side of a TB6612FNG.
const int AIN1 = 4, AIN2 = 5, PWMA = 6, STBY = 7;

void setup() {
  pinMode(AIN1, OUTPUT); pinMode(AIN2, OUTPUT);
  pinMode(PWMA, OUTPUT); pinMode(STBY, OUTPUT);
  digitalWrite(STBY, HIGH);    // enable the bridge
}

void drive(int signedSpeed) {
  // signedSpeed: -255 to +255
  if (signedSpeed >= 0) {
    digitalWrite(AIN1, HIGH); digitalWrite(AIN2, LOW);
    analogWrite(PWMA, signedSpeed);
  } else {
    digitalWrite(AIN1, LOW);  digitalWrite(AIN2, HIGH);
    analogWrite(PWMA, -signedSpeed);
  }
}

void brake()  { digitalWrite(AIN1, HIGH); digitalWrite(AIN2, HIGH); }
void coast()  { digitalWrite(AIN1, LOW);  digitalWrite(AIN2, LOW);  }

void loop() {
  drive(200);  delay(1000);    // forward fast
  drive(0);    delay(200);
  drive(-100); delay(1000);    // reverse slow
  brake();     delay(500);
}`}
      />
      <h2>Driver alternatives</h2>
      <Compare
        header={["", "Voltage / Current", "Notable"]}
        rows={[
          ["TB6612FNG", "4.5–13.5 V / 1.2 A cont", "This page. MOSFET bridge, efficient, no heatsink needed"],
          ["L298N", "5–46 V / 2 A cont", "Bipolar darlington bridge. ~2 V drop per side, hot. Legacy"],
          ["DRV8833", "2.7–10.7 V / 1.5 A cont", "TI's MOSFET bridge. Lower voltage than TB6612 but smaller"],
          ["DRV8871", "6.5–45 V / 3.6 A cont", "Higher-voltage TI part for larger motors"],
          [<>BTS7960 / IBT-2</>, "5.5–27 V / 43 A peak", "Half-bridges paired for big motors (RC cars, e-bikes)"],
          [<>VNH5019 / Pololu</>, "5.5–24 V / 12 A cont", "ST's auto-grade smart half-bridge with current sense"],
        ]}
      />
      <h2>Closing the loop with an encoder</h2>
      <p>
        Open-loop PWM gets you ~80 % of motor control: set duty cycle, get approximate speed. For the last 20 %
        (constant RPM under varying load, position control, dead reckoning), add a quadrature{" "}
        <strong>encoder</strong> on the shaft and a PID loop in firmware. The micro metal gearmotors come with
        magnetic encoders (Hall sensor on a magnet on the back of the rotor); larger motors get optical encoders.
        See <a href="#/pr-pid">pr-pid</a> for the loop math.
      </p>
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>Brushed DC motors generate inductive flyback.</strong> When you switch off current to an
          inductor (the motor windings are inductive), the field collapses and induces a high-voltage spike that
          can punch through your driver's body diodes or worse. The TB6612FNG handles it with internal Schottky
          flyback diodes; if you build your own H-bridge from discrete MOSFETs, add Schottky diodes across each
          switch and a ceramic across each motor terminal.
        </li>
        <li>
          <strong>EMI from the brushes.</strong> Mechanical commutation arcs at high frequency, which gets
          radiated through the motor leads as broadband noise. Symptom: USB drops, sensor reads garbage, Wi-Fi
          throughput halves the moment a motor spins. Mitigation: a <strong>100 nF ceramic across the motor
          terminals</strong> (right on the motor case), plus 10 nF from each terminal to the motor's case if it's
          grounded. Ferrite beads on the leads help further.
        </li>
        <li>
          <strong>Stall current can be 10× nominal.</strong> A "1 A nominal" motor draws 8 A when you ask it to
          turn against a locked rotor. If your driver is sized to nominal and your code doesn't detect stall,
          you'll trip the driver's over-current shutdown or melt something. Always size the driver for stall, or
          implement a stall-current trip in firmware.
        </li>
        <li>
          <strong>Back-EMF can charge your supply.</strong> Stop a motor that's spinning at speed and the back-EMF
          dumps energy back into V<sub>M</sub>. If V<sub>M</sub> is from a battery, it sinks the energy fine. If
          it's from an LDO or a small switcher with no sink, the rail voltage climbs and resets your MCU. Mitigate
          with a beefy bulk cap (470 µF +) on V<sub>M</sub>, or a TVS to clamp the spike.
        </li>
        <li>
          <strong>The L298N is obsolete; don't use it for new designs.</strong> ~4 V total drop across the bridge
          (bipolar darlingtons), enormous heatsink required, only 60 % of your supply voltage actually reaches the
          motor. The TB6612FNG / DRV8833 are better in every dimension for sub-2 A loads. Tutorials still
          recommend the L298N because the modules are everywhere — ignore them.
        </li>
        <li>
          <strong>PWM frequency below 20 kHz is audible.</strong> 1 kHz PWM through a motor gives the unmistakable
          1 kHz whine that's the soundtrack of every cheap RC car. Above 20 kHz human ears stop hearing it (cats
          and dogs disagree). Stay below ~50 kHz to avoid switching losses in the bridge.
        </li>
        <li>
          <strong>Brushed motors have a lifetime.</strong> Carbon brushes wear, the commutator pits, and after
          a few thousand hours of use the motor stops conducting reliably. For products that need to run for
          years (HVAC fans, fridge compressors), use a brushless DC (BLDC) motor and a more elaborate driver — see
          the DRV8323 page for FOC drive.
        </li>
        <li>
          <strong>Don't share a supply between the motor and a sensitive analog rail.</strong> Motor switching
          transients on V<sub>M</sub> couple through any shared ground or supply impedance, polluting ADC reads
          and analog references. Split rails (separate buck for motors, LDO for analog), star-grounding, and a
          ferrite between domains are the canonical fixes.
        </li>
      </ul>
    </>
  ),
  "c-stepper": () => (
    <>
      <h2>What it is</h2>
      <p>
        A <strong>stepper motor</strong> moves in discrete angular steps — most commonly <strong>1.8° per step</strong>{" "}
        (200 steps per revolution) — by energising two coil pairs in a specific sequence. Unlike a brushed DC motor,
        there's no commutator; the rotor is a permanent magnet (or a toothed iron core) and the driver electronics
        decide which coils get power and in what direction. The result is{" "}
        <strong>open-loop position control</strong>: you tell the driver "step 200 times" and the shaft rotates
        exactly once, no encoder required.
      </p>
      <p>
        That open-loop guarantee is the killer feature — it's why every cheap 3D printer, CNC, pen plotter, and pick-
        and-place machine uses steppers instead of DC motors. The trade-off is that steppers are inefficient (full
        current flows whenever the motor is holding position, even at zero RPM), they can <strong>lose steps</strong>{" "}
        if pushed past their torque envelope (with no encoder, the firmware doesn't notice), and they're loud unless
        you microstep aggressively.
      </p>
      <p>
        This page anchors on a <strong>NEMA 17 bipolar stepper</strong> (the 42 × 42 mm flange that's standard in
        desktop CNC and 3D printers) driven by the <strong>Allegro A4988</strong> — the ~$3 chopper driver that's
        been on every RAMPS-style RepRap board for fifteen years.
      </p>
      <h2>Motor specs at a glance</h2>
      <SpecTable
        rows={[
          ["Frame size", "NEMA 17 (42 mm flange) is the maker default. NEMA 23 (57 mm) for heavier loads"],
          ["Step angle", "1.8° / step = 200 steps/rev (standard). 0.9° = 400 steps/rev exists but is less common"],
          ["Rated current", "1.0–2.0 A per phase typical. 'Pancake' low-profile motors are ~0.4 A"],
          ["Rated voltage", "Misleading — see below. The motor's specced voltage is the V at which I·R = I_rated"],
          ["Holding torque", "Up to ~5 N·m on a NEMA 23, ~0.3–0.6 N·m on a typical NEMA 17"],
          ["Phase resistance", "Often 2–4 Ω per phase"],
          ["Phase inductance", "2–10 mH per phase — important: this is what limits max speed"],
          ["Steps per revolution", "200 full steps. With ×16 microstepping that's 3200 microsteps/rev"],
        ]}
      />
      <h2>How it works — bipolar vs unipolar</h2>
      <p>
        A bipolar stepper has <strong>two coils</strong> (= two phases, four wires out). At any moment one coil is
        energised in one direction, then the other, then the first in the opposite direction, then the second in the
        opposite direction. That four-step sequence ("full-step mode") rotates the rotor by one step angle for each
        transition. Reverse the sequence and the motor steps the other way.
      </p>
      <p>
        Unipolar steppers have an extra centre-tap on each coil (= 5 or 6 wires) and can be driven by simpler single-
        ended switches — the cheap <strong>28BYJ-48</strong> + ULN2003 set from every Arduino kit is unipolar. They
        give up half the torque (only half each coil is energised at once) and are basically obsolete for serious
        work. Maker context defaults to bipolar.
      </p>
      <h2>The current-chopping driver — A4988</h2>
      <p>
        A stepper motor's coil is a series RL circuit. If you apply the rated voltage directly, current rises
        exponentially with τ = L/R — slowly. By the time the current reaches its rated value (~30 ms for typical
        motors), the next step is already overdue. Result: high-speed steppers stall.
      </p>
      <p>
        The trick is to power the motor from a <strong>much higher voltage</strong> than its "rated" voltage (12–35 V
        is common for a "3 V rated" motor) and use a <strong>current-chopping driver</strong> to keep the actual
        coil current at the target value. The driver rapidly switches the coil ON, sees the current rise (via a
        small sense resistor), and switches the coil OFF when it hits the target — then back on, then off, at
        20–50 kHz. The motor sees average current = target, but the high V<sub>BB</sub> means the rise time is fast.
      </p>
      <Callout label="// math (current-limit set-point)">
        I<sub>trip</sub> = V<sub>REF</sub> / (8 · R<sub>S</sub>) &nbsp;·&nbsp; for the A4988's typical R<sub>S</sub>
        = 0.05 Ω: I<sub>trip</sub> = V<sub>REF</sub> / 0.4 (amps when V<sub>REF</sub> is in volts)
      </Callout>
      <SpecTable
        rows={[
          [<>V<sub>BB</sub></>, "Motor supply, 8 – 35 V"],
          [<>V<sub>DD</sub></>, "Logic supply, 3 – 5.5 V"],
          ["Max output current", "2 A per phase with adequate heatsinking (1 A without)"],
          ["Microstepping", "Full / 1/2 / 1/4 / 1/8 / 1/16 — selected by MS1 / MS2 / MS3 pins"],
          ["Interface", "STEP (rising edge = advance one microstep), DIR (HIGH/LOW = forward/reverse)"],
          ["ENABLE", "Active-low. Pull LOW to energise; HIGH disables the outputs (motor freewheels)"],
          ["RESET", "Pull HIGH for normal use"],
          ["SLEEP", "Pull HIGH for normal use; LOW shuts down the analog blocks"],
          [<>V<sub>REF</sub></>, "Sets the current limit via the on-board trim pot"],
        ]}
      />
      <h2>Microstepping</h2>
      <p>
        Energising one coil at a time gives 200 full steps per revolution. Energise both coils at equal current
        ("half-step mode") and the rotor settles at the magnetic midpoint between two full-step positions — that's
        400 effective steps per revolution. Vary the ratio of current between coils smoothly (a quarter sine wave
        in coil A and a quarter cosine in coil B) and you can hold the rotor at any angle in between.
      </p>
      <p>
        The A4988 implements this internally — set MS1/MS2/MS3 to select the division (full, 1/2, 1/4, 1/8, 1/16)
        and each STEP rising edge advances the internal sine-table index by one microstep. Common configurations:
      </p>
      <SpecTable
        rows={[
          [
            "Full step",
            <>200 steps/rev, max torque, noisy. 3D printer Z axes sometimes still use this</>,
          ],
          [
            "1/2 step",
            <>400 steps/rev, ~70 % full torque, quieter than full. The original "half-step mode"</>,
          ],
          [
            "1/4, 1/8 step",
            <>800 / 1600 microsteps/rev. Quieter, smoother — but actual <em>positional</em> accuracy isn't 4×
            or 8× better; the rotor only weakly snaps between microsteps because the holding torque is sin(θ)-shaped</>,
          ],
          [
            "1/16 step",
            <>3200 microsteps/rev. The 3D-printer default. Gets you to silent operation and smooth motion at the
            cost of some torque headroom</>,
          ],
          [
            "1/256 step (TMC2208 / TMC2209)",
            <>Modern Trinamic drivers go this fine. The motion is glassy-smooth but no end-effector benefits — the
            motor's own mechanical resolution doesn't go that low</>,
          ],
        ]}
      />
      <Callout>
        Microstepping makes motion smoother but doesn't multiply the motor's <em>true</em> resolution by the
        microstep count. The rotor's actual positional accuracy at 1/16 step is closer to 1/4 step due to detent
        torque + friction. Use microstepping for noise and vibration; don't budget it as precision.
      </Callout>
      <h2>Wiring an A4988 to a NEMA 17 + MCU</h2>
      <SpecTable
        rows={[
          [<>V<sub>BB</sub> + GND</>, "Motor supply. Add a 100 µF electrolytic close to the driver"],
          [<>V<sub>DD</sub> + GND</>, "Logic supply, 3.3 or 5 V"],
          ["1A 1B 2A 2B", "Motor coil A and coil B. Identify pairs with a multimeter (continuity)"],
          ["STEP", "GPIO → one rising edge = one microstep"],
          ["DIR", "GPIO → HIGH/LOW = direction"],
          ["ENABLE", "Tie to GND for always-on, or GPIO for software disable"],
          ["MS1/MS2/MS3", "Microstep selectors. Often tied to GND for full step or 5 V for 1/16"],
          ["RESET + SLEEP", "Tie together to 5 V for normal use"],
          [<>V<sub>REF</sub></>, "Tiny trim pot on the board. Measure with a multimeter while motor is at rest"],
        ]}
      />
      <CodeBlock
        language="cpp"
        filename="stepper_drive.ino"
        code={`#include <AccelStepper.h>
const int STEP_PIN = 3;
const int DIR_PIN  = 4;
const int EN_PIN   = 5;

// Driver type 1 = step + dir, 200 steps/rev hardware
AccelStepper stepper(AccelStepper::DRIVER, STEP_PIN, DIR_PIN);

void setup() {
  pinMode(EN_PIN, OUTPUT);
  digitalWrite(EN_PIN, LOW);          // enable the driver
  stepper.setMaxSpeed(2000);          // microsteps per second
  stepper.setAcceleration(1000);      // microsteps/s²
  stepper.moveTo(3200);               // one full revolution at 1/16 microstep
}

void loop() {
  stepper.run();
  if (stepper.distanceToGo() == 0) {
    stepper.moveTo(-stepper.currentPosition());   // bounce back
  }
}`}
      />
      <h2>Driver alternatives</h2>
      <Compare
        header={["", "Current / Voltage", "Notable"]}
        rows={[
          ["A4988", "2 A / 35 V", "This page. The classic. Loud chopping noise at high speeds"],
          ["DRV8825", "2.2 A / 45 V", "TI's step up from the A4988 — pin-compatible, higher V_BB, microsteps to 1/32"],
          ["TMC2208 (standalone)", "1.2 A / 36 V", "Trinamic's first silent driver. StealthChop PWM, no audible chopping"],
          ["TMC2209 (UART)", "2 A / 36 V", "Adds UART configurability and StallGuard — sensorless homing"],
          ["TMC5160", "3 A / 60 V", "High-current with SPI control, internal motion controller"],
          ["ULN2003 + 28BYJ-48", "~0.2 A / 5 V", "The Arduino-kit cheap-stepper combo. Toy-grade, fine for slow indicators"],
          ["L298N (used as stepper driver)", "2 A / 46 V", "Possible but inefficient — same downsides as on the DC motor page"],
        ]}
      />
      <h2>Gotchas</h2>
      <ul>
        <li>
          <strong>Setting V_REF wrong cooks the motor.</strong> The trim pot on the A4988 sets the current limit. Set
          it too high and the coils run hot; set it too low and the motor skips steps under load. Procedure:
          measure V<sub>REF</sub> with a multimeter (probe between the pot wiper and GND) while the motor is
          stationary and energised. For a 1 A motor with R<sub>S</sub> = 0.05 Ω, target V<sub>REF</sub> = 0.4 V.
        </li>
        <li>
          <strong>Don't plug or unplug the motor with power on.</strong> Hot-plugging a stepper to an A4988 can
          punch through the internal H-bridge MOSFETs — there are body-diode current paths that survive but
          repeated abuse kills the driver. Always power down V<sub>BB</sub> first.
        </li>
        <li>
          <strong>"Lost steps" are silent.</strong> If the motor is asked to move faster than its torque envelope
          allows (high speed, heavy load, bad acceleration ramp), it stalls one or more steps without telling
          the driver. The firmware keeps incrementing its position counter, the actual position drifts further
          and further behind. Fix: accelerate gently (200–2000 microsteps/s² ramps), keep V<sub>BB</sub> high
          for fast moves, or use a TMC2209 with StallGuard which detects stalls electrically.
        </li>
        <li>
          <strong>The "rated voltage" on the motor label is misleading.</strong> A motor specced "3 V / 1.7 A"
          is meant to be driven by a current-controlled chopper from 24 V (or whatever). The 3 V is just
          V = I · R<sub>winding</sub>. Drive it from 3 V directly and you'll get terrible high-speed performance.
        </li>
        <li>
          <strong>Heatsink the driver above 1 A.</strong> The A4988 has an exposed pad under the chip; the
          breakout boards usually have a small heatsink that you can stick on top. Without it, at 2 A the chip's
          internal thermal-shutdown trips after 30 seconds and the motor freezes.
        </li>
        <li>
          <strong>Identify coils with a multimeter, not the wire colours.</strong> NEMA 17 colour conventions
          vary by manufacturer — black/green/red/blue from one brand isn't the same coil grouping as another's.
          A continuity check between every pair finds the two coils (the two pairs that beep). Get this wrong
          and the motor vibrates without rotating.
        </li>
        <li>
          <strong>Step pulses need a minimum width.</strong> The A4988 datasheet requires STEP high for ≥ 1 µs.
          GPIO toggles at 100 kHz pass this; bit-banged STEP at 1 MHz from a tight loop on a fast MCU may not.
          Symptom: motor moves fewer steps than commanded at high rates. Fix: add a 1 µs delay between the
          rising and falling edge of STEP, or use a hardware timer for the pulse generation.
        </li>
        <li>
          <strong>The A4988 squeals at low speeds.</strong> The chopper PWM modulates at a frequency that can
          land in audible territory (10–15 kHz). The motor coil becomes a speaker. Trinamic drivers (TMC2208+)
          use a high-frequency PWM scheme specifically to push the chopping noise out of human hearing.
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
