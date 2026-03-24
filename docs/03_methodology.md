# Methodology

SecureBioSim follows a four-phase architecture:

## 1. Simulation Layer
Generates real-time physiological signals such as ECG, heart rate, and pulse using synthetic data models.

## 2. Attack Injection Layer
Simulates cyberattacks on the data stream:
- Data Injection
- Replay Attack
- Man-in-the-Middle (MITM)
- Denial of Service (DoS)

## 3. Detection Layer
Implements a hybrid intrusion detection system:
- Rule-based detection for pattern-based attacks
- LSTM Autoencoder for anomaly detection in time-series data

## 4. Mitigation Layer
Applies response mechanisms:
- Blocking corrupted data
- Resetting telemetry streams
- Alerting users via dashboard

## System Flow

Simulation → Attack Injection → Detection → Mitigation → Dashboard
