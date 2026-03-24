# Overview

SecureBioSim is a simulation-based cybersecurity framework designed for Biomedical Cyber-Physical Systems (Bio-CPS), specifically pacemaker environments.

The system simulates real-time physiological data such as ECG, heart rate, and pulse, and allows controlled cyberattacks to be injected into the communication channel. These attacks include Data Injection, Replay, Man-in-the-Middle (MITM), and Denial of Service (DoS).

A hybrid intrusion detection system is implemented:
- Rule-based detection for known attack patterns
- Machine learning-based detection using an LSTM Autoencoder

The system identifies anomalies in real-time and applies mitigation strategies such as blocking malicious data, resetting telemetry, and issuing alerts.

This framework provides a safe and extensible environment to study cybersecurity threats in Internet-of-Medical-Things (IoMT) devices without requiring real hardware.
