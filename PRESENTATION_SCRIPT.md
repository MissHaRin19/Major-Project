# SecureBioSim Presentation Script

## Title Slide (0:00 – 0:30)
“Good [morning/afternoon], everyone.

Our project is **SecureBioSim: AI-Driven Cybersecurity Simulation and Anomaly Detection for Bio-CPS Devices**.

In simple terms, we built a simulation platform for pacemaker telemetry where we can:
1) stream real-time patient vitals,
2) inject realistic cyberattacks,
3) detect anomalies using AI,
4) and trigger mitigation to restore safe operation.”

---

## Problem & Motivation (0:30 – 1:30)
“Why does this matter?

Pacemakers are life-critical IoMT devices. If communication is compromised, patient safety is directly at risk.

But real pacemaker infrastructure is difficult to access for research because of cost, safety, and regulatory constraints.

So our goal was to create a **safe, reproducible simulation testbed** that demonstrates end-to-end cybersecurity behavior for Bio-CPS environments.”

---

## Project Objective (1:30 – 2:00)
“Our objective is to show the full defense loop:
- normal monitoring,
- attack injection,
- AI-based detection,
- and mitigation/recovery.

This gives both a technical demo and a research platform for evaluating security strategies in medical telemetry systems.”

---

## Architecture Walkthrough (2:00 – 3:30)
“SecureBioSim has four layers:

### 1) Website Simulation Layer
A React dashboard continuously shows ECG, heart rate, pulse, and patient status.

### 2) Attack Simulation Layer
We inject four common IoMT attacks:
- Data Injection,
- Replay,
- Man-in-the-Middle,
- Denial of Service.

### 3) AI Detection & Inference Layer
A FastAPI backend loads an LSTM autoencoder model and evaluates telemetry windows for anomalies.

### 4) Mitigation & Recovery Layer
Once attack behavior is detected, mitigation logic is triggered and the system transitions toward recovery and stable monitoring.”

---

## Dataset & Model Choice (3:30 – 4:30)
“For modeling normal cardiac behavior, we use an LSTM autoencoder approach with 140-sample ECG windows.

Our approach combines:
- literature-validated cardiac signal assumptions,
- synthetic streaming for real-time simulation,
- and trained anomaly modeling exported as a Keras model.

This hybrid approach is practical for a demo setting where true pacemaker communication datasets are limited publicly.”

---

## Live Demo Script (4:30 – 7:00)
“Now I’ll walk through the demo flow.

### Step A: Normal State
- Open Monitoring Dashboard.
- Highlight stable ECG and normal anomaly score.
- Mention backend model synchronization indicator.

### Step B: Launch Attack
- Switch to Exploit Dashboard.
- Start one attack (for example Data Injection).
- Return to Monitoring Dashboard.
- Show telemetry distortion and alert transition.

### Step C: Detection
- Explain that telemetry windows are sent to backend inference.
- Show anomaly score increase and attack-detected state.

### Step D: Mitigation
- Show identification/mitigation sequence.
- Explain response actions: isolation/blocking/reset behavior in simulation.
- Show status returning to stable.

### Step E: Repeat Quickly for 1–2 More Attacks
- Replay: show stale telemetry behavior.
- MITM or DoS: show modified/noisy/blocked pattern.
- Emphasize that different attack classes create different signal/system effects.”

---

## Key Results & Takeaways (7:00 – 8:00)
“From this project, we demonstrated:
1) A working cyber-physical simulation loop for pacemaker telemetry.
2) Practical visualization of four high-impact attack types.
3) AI-assisted anomaly detection integrated with runtime dashboards.
4) Mitigation-oriented state transitions for recovery.

So, the platform is already valuable as a **research and educational prototype** for Bio-CPS security.”

---

## Current Limitations (8:00 – 8:45)
“To be transparent, there are still improvements needed for full production-grade finalization:
- stronger backend-driven attack classification,
- complete automated test coverage and CI,
- reproducible training pipeline documentation,
- and deployment hardening.

These are identified and prioritized in our finalization checklist.”

---

## Future Work (8:45 – 9:30)
“Next steps include:
- richer multi-class AI attack classification,
- backend policy enforcement for mitigation,
- expanded evaluation metrics across scenarios,
- and robust deployment packaging.

Long term, this framework can generalize beyond pacemakers to other Bio-CPS devices like insulin pumps and neurostimulators.”

---

## Closing (9:30 – 10:00)
“To conclude:

SecureBioSim shows how AI and cybersecurity can be integrated in a realistic simulation pipeline to improve medical IoMT resilience.

Thank you — we’re happy to take questions.”

---

# Q&A Backup Answers (Optional)

## Q1: Why these four attacks?
“They are high-impact and commonly cited in IoMT security literature, and together they cover data-layer, channel-layer, and network-layer risks.”

## Q2: Why not use real pacemaker traffic?
“Public real pacemaker communication datasets are very limited due to privacy/safety constraints, so we use a hybrid simulation strategy with medically informed signal behavior.”

## Q3: Is this production-ready?
“Not yet. It is a strong prototype. We have a clear path for finalization: backend policy hardening, reproducible evaluation, and CI-backed quality gates.”

## Q4: What is the AI model doing exactly?
“It learns normal ECG sequence patterns and flags abnormal reconstruction error to support anomaly detection during simulated attack conditions.”
