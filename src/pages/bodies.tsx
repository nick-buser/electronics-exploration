import type { ReactNode } from "react";
import { Callout, Compare } from "./elements";
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
  "pr-i2c": () => (
    <>
      <h2>The idea</h2>
      <p>
        Two wires (SDA and SCL), open-drain so anyone can pull them low but only the pull-up resistor pulls them high. Each
        device has a 7- or 10-bit address. The master clocks bits onto the bus, devices ACK by pulling SDA low for one clock
        period. That's it. Hundreds of sensors use it.
      </p>
      <DemoBus />
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
