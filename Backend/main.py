from fastapi import FastAPI
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

model = None

# Replay detection memory
CHECKSUM_HISTORY = []
MAX_HISTORY = 50


# -----------------------------
# Load ML model
# -----------------------------

@app.on_event("startup")
def load_model():
    global model
    model = tf.keras.models.load_model(MODEL_PATH)
    print("ML model loaded")


# -----------------------------
# Request schema
# -----------------------------

class ECGInput(BaseModel):
    attack_type: str
    ecg: list[float]
    checksum: str


# -----------------------------
# Health endpoint
# -----------------------------

@app.get("/health")
def health():
    return {
        "status": "running",
        "model_loaded": model is not None
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

    input_data = ecg.reshape(1, WINDOW_SIZE, 1)

    reconstruction = model.predict(input_data, verbose=0)

    error = float(np.mean((input_data - reconstruction) ** 2))

    return error


# -----------------------------
# Response helper
# -----------------------------

def attack_response(detected, attack_type, error=None):

    return {
        "attack_detected": detected,
        "attack_type": attack_type,
        "reconstruction_error": error
    }


# -----------------------------
# Inference endpoint
# -----------------------------

@app.post("/infer")
def infer(packet: ECGInput):

    ecg = np.array(packet.ecg, dtype=np.float32)

    if len(ecg) != WINDOW_SIZE:
        return {"error": "invalid_window"}

    attack = packet.attack_type

    # -----------------------------
    # MITM detection
    # -----------------------------

    if attack == "MITM":

        expected_checksum = compute_checksum(ecg.tolist())

        if packet.checksum != expected_checksum:

            print("MITM ATTACK DETECTED")

            return attack_response(True, "MITM")

        return attack_response(False, "Normal")

    # -----------------------------
    # Replay detection
    # -----------------------------

    if attack == "Replay":

        if detect_replay(packet.checksum):

            print("REPLAY ATTACK DETECTED")

            return attack_response(True, "Replay")

        return attack_response(False, "Normal")

    # -----------------------------
    # DoS detection (explicit)
    # -----------------------------

    if attack == "DoS":

        print("DOS ATTACK DETECTED")

        return attack_response(True, "DoS")

    # -----------------------------
    # Data Injection detection
    # -----------------------------

    if attack == "Data Injection":

        error = detect_anomaly(ecg)

        if error > THRESHOLD:

            print("DATA INJECTION ATTACK DETECTED")

            return attack_response(True, "Data Injection", error)

        return attack_response(False, "Normal", error)

    # -----------------------------
    # Normal telemetry
    # -----------------------------

    error = detect_anomaly(ecg)

    return attack_response(False, "Normal", error)
