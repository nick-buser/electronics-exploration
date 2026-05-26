import type { ReactNode } from "react";
import { Callout } from "./elements";

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
