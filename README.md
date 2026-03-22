# SecureBioSim

## Introduction

**SecureBioSim** is a simulation-based cybersecurity framework designed for **Biomedical Cyber-Physical Systems (Bio-CPS)**, specifically pacemaker monitoring environments.

The platform simulates **real-time patient telemetry** such as ECG signals, heart rate, and pulse through a web dashboard. It also allows controlled cyberattacks to be injected into the pacemaker communication channel and uses an **AI-based anomaly detection model** to analyze the telemetry stream.

The project demonstrates how attacks such as **Man-in-the-Middle (MITM), Replay, Data Injection, and Denial of Service (DoS)** can affect medical device communication and how **machine learning models** can detect abnormal patterns in physiological telemetry.

SecureBioSim provides a **safe research environment** to study cybersecurity threats in **Internet-of-Medical-Things (IoMT)** devices without requiring real medical hardware.

---

# Project Execution

Running this project requires **two terminals**:

1. **Frontend Simulation Server**
2. **Backend AI Detection Server**

---

# Terminal 1 – Frontend Server

## macOS / Linux

Run the following commands:

```bash
cd frontend
python3 -m venv venv
source venv/bin/activate

pip install fastapi uvicorn tensorflow numpy

npm install
npm run dev
```

The frontend dashboard will start at:

```
http://localhost:5173
```

---

## Windows

Open **Command Prompt** or **PowerShell** and run:

```bash
cd frontend
python -m venv venv
venv\Scripts\activate

pip install fastapi uvicorn tensorflow numpy

npm install
npm run dev
```

The frontend dashboard will run at:

```
http://localhost:5173
```

---

# Terminal 2 – Backend Server

This server runs the **FastAPI application and ML inference engine**.

## macOS / Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend will run at:

```
http://127.0.0.1:8000
```

---

## Windows

```bash
cd backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend will run at:

```
http://127.0.0.1:8000
```
---

# Running the Simulation

1. Start the **Frontend Server (Terminal 1)**.
2. Start the **Backend Server (Terminal 2)**.
3. Open the **frontend dashboard** in your browser.
4. Launch **attack simulations** from the dashboard and observe system behavior.

The dashboard will display:

- Real-time **ECG waveform**
- **Heart rate** and **pulse values**
- **Pacemaker monitoring status**
- **Cyberattack alerts**
- **Anomaly detection results**

---

# Technology Stack

## Frontend

- React  
- TypeScript  
- Vite  
- Recharts  

## Backend

- Python  
- FastAPI  
- TensorFlow / Keras  
- NumPy  

---

# Purpose of the Project

SecureBioSim demonstrates how **machine learning and cybersecurity techniques** can be applied to protect **biomedical cyber-physical systems** from communication-based attacks.

The framework provides a **research platform** for experimenting with cyberattack scenarios and **AI-based detection techniques** in critical healthcare devices.
