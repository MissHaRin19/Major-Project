from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
import hashlib

# -----------------------------
# App setup
# -----------------------------

app = FastAPI(title="SecureBioSim ML Inference Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Model parameters
# -----------------------------

MODEL_PATH = "lstm_ecg_autoencoder.keras"
WINDOW_SIZE = 140
THRESHOLD = 0.15
DOS_STD_THRESHOLD = 0.55
DOS_ZERO_CROSSING_THRESHOLD = 45
DATA_INJECTION_SPIKE_THRESHOLD = 8
DATA_INJECTION_DELTA_THRESHOLD = 0.9
DATA_INJECTION_RANGE_THRESHOLD = 2.2

model = None
model_load_error = None

# Replay detection memory
CHECKSUM_HISTORY = []
MAX_HISTORY = 50


# -----------------------------
# Load ML model
# -----------------------------

@app.on_event("startup")
def load_model():
    global model, model_load_error

    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        model_load_error = None
        print("ML model loaded")
    except Exception as exc:  # pragma: no cover - defensive path for runtime startup
        model = None
        model_load_error = str(exc)
        print(f"Failed to load ML model: {exc}")


# -----------------------------
# Request schema
# -----------------------------

class ECGInput(BaseModel):
    ecg: list[float]
    checksum: str


# -----------------------------
# Health endpoint
# -----------------------------

@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "running",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "model_error": model_load_error,
    }


# -----------------------------
# Checksum helper
# -----------------------------


def compute_checksum(window):
    rounded = [f"{x:.5f}" for x in window]
    payload = ",".join(rounded)
    return hashlib.md5(payload.encode()).hexdigest()


# -----------------------------
# Replay detection
# -----------------------------


def detect_replay(checksum):
    global CHECKSUM_HISTORY

    if checksum in CHECKSUM_HISTORY:
        return True

    CHECKSUM_HISTORY.append(checksum)

    if len(CHECKSUM_HISTORY) > MAX_HISTORY:
        CHECKSUM_HISTORY.pop(0)

    return False


# -----------------------------
# ML anomaly detection
# -----------------------------


def detect_anomaly(ecg):
    if model is None:
        raise RuntimeError("model_unavailable")

    input_data = ecg.reshape(1, WINDOW_SIZE, 1)
    reconstruction = model.predict(input_data, verbose=0)
    error = float(np.mean((input_data - reconstruction) ** 2))
    return error


# -----------------------------
# Signal feature helpers
# -----------------------------


def zero_crossings(ecg):
    return int(np.sum(np.diff(np.signbit(ecg)) != 0))



def spike_count(ecg):
    return int(np.sum(np.abs(np.diff(ecg)) > DATA_INJECTION_DELTA_THRESHOLD))



def infer_attack_type(ecg, checksum_mismatch, replay_detected, reconstruction_error):
    if checksum_mismatch:
        return "MITM"

    if replay_detected:
        return "Replay"

    if reconstruction_error <= THRESHOLD:
        return "Normal"

    signal_std = float(np.std(ecg))
    signal_range = float(np.max(ecg) - np.min(ecg))
    crossings = zero_crossings(ecg)
    spikes = spike_count(ecg)

    if signal_std >= DOS_STD_THRESHOLD and crossings >= DOS_ZERO_CROSSING_THRESHOLD:
        return "DoS"

    if spikes >= DATA_INJECTION_SPIKE_THRESHOLD or signal_range >= DATA_INJECTION_RANGE_THRESHOLD:
        return "Data Injection"

    return "Anomalous Telemetry"


# -----------------------------
# Mitigation planner
# -----------------------------


def mitigation_plan(inferred_attack_type):
    if inferred_attack_type == "MITM":
        return {
            "mitigation_status": "blocked",
            "mitigation_actions": ["alert", "block"],
            "mitigation_message": "Tampered telemetry blocked and secure channel isolation initiated.",
        }

    if inferred_attack_type == "Replay":
        return {
            "mitigation_status": "blocked",
            "mitigation_actions": ["alert", "block", "reset"],
            "mitigation_message": "Replay stream rejected and fresh telemetry re-synchronization requested.",
        }

    if inferred_attack_type == "DoS":
        return {
            "mitigation_status": "mitigating",
            "mitigation_actions": ["alert", "block", "reset"],
            "mitigation_message": "Traffic flood throttled and fallback pacing reset initiated.",
        }

    if inferred_attack_type in {"Data Injection", "Anomalous Telemetry"}:
        return {
            "mitigation_status": "mitigating",
            "mitigation_actions": ["alert", "block"],
            "mitigation_message": "Suspicious telemetry quarantined while anomaly filters protect pacing output.",
        }

    return {
        "mitigation_status": "monitoring",
        "mitigation_actions": [],
        "mitigation_message": "Telemetry stable. No mitigation required.",
    }


# -----------------------------
# Response helper
# -----------------------------


def attack_response(detected, inferred_attack_type, error=None):
    mitigation = mitigation_plan(inferred_attack_type)

    return {
        "attack_detected": detected,
        "attack_type": inferred_attack_type,
        "inferred_attack_type": inferred_attack_type,
        "reconstruction_error": error,
        "mitigation_status": mitigation["mitigation_status"],
        "mitigation_actions": mitigation["mitigation_actions"],
        "mitigation_message": mitigation["mitigation_message"],
    }


# -----------------------------
# Inference endpoint
# -----------------------------

@app.post("/infer")
def infer(packet: ECGInput):
    if model is None:
        raise HTTPException(status_code=503, detail="model_unavailable")

    ecg = np.array(packet.ecg, dtype=np.float32)

    if len(ecg) != WINDOW_SIZE:
        raise HTTPException(status_code=400, detail="invalid_window")

    expected_checksum = compute_checksum(ecg.tolist())
    checksum_mismatch = packet.checksum != expected_checksum
    replay_detected = detect_replay(expected_checksum)
    reconstruction_error = detect_anomaly(ecg)
    inferred_attack_type = infer_attack_type(
        ecg,
        checksum_mismatch,
        replay_detected,
        reconstruction_error,
    )
    attack_detected = inferred_attack_type != "Normal"

    if attack_detected:
        print(f"{inferred_attack_type.upper()} ATTACK DETECTED")

    return attack_response(
        attack_detected,
        inferred_attack_type,
        reconstruction_error,
    )
