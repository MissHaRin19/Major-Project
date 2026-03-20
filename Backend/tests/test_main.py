import sys
import types
from pathlib import Path

if "tensorflow" not in sys.modules:
    tensorflow_stub = types.SimpleNamespace(
        keras=types.SimpleNamespace(
            models=types.SimpleNamespace(load_model=lambda _path: None)
        )
    )
    sys.modules["tensorflow"] = tensorflow_stub

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import main  # noqa: E402


class FakeModel:
    def predict(self, input_data, verbose=0):
        return input_data


@pytest.fixture()
def client(monkeypatch):
    main.CHECKSUM_HISTORY.clear()
    main.model = None

    def fake_load_model(_path):
        return FakeModel()

    monkeypatch.setattr(main.tf.keras.models, "load_model", fake_load_model)

    with TestClient(main.app) as test_client:
        yield test_client

    main.CHECKSUM_HISTORY.clear()
    main.model = None


@pytest.fixture()
def normal_ecg():
    return [0.01 * ((index % 10) - 5) for index in range(main.WINDOW_SIZE)]


def test_api_health_reports_model_loaded(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "running",
        "model_loaded": True,
    }


def test_infer_returns_normal_for_low_error_payload(client, normal_ecg):
    checksum = main.compute_checksum(normal_ecg)

    response = client.post(
        "/infer",
        json={
            "attack_type": "ignored",
            "ecg": normal_ecg,
            "checksum": checksum,
        },
    )

    assert response.status_code == 200
    assert response.json()["attack_detected"] is False
    assert response.json()["inferred_attack_type"] == "Normal"
    assert response.json()["mitigation_actions"] == []
    assert response.json()["mitigation_status"] == "monitoring"
    assert response.json()["reconstruction_error"] == pytest.approx(0.0)


def test_infer_flags_mitm_when_checksum_is_tampered(client, normal_ecg):
    response = client.post(
        "/infer",
        json={
            "attack_type": "ignored",
            "ecg": normal_ecg,
            "checksum": "tampered-checksum",
        },
    )

    assert response.status_code == 200
    assert response.json()["attack_detected"] is True
    assert response.json()["inferred_attack_type"] == "MITM"
    assert response.json()["mitigation_actions"] == ["alert", "block"]
    assert response.json()["mitigation_status"] == "blocked"


def test_infer_flags_replay_on_reused_checksum(client, normal_ecg):
    checksum = main.compute_checksum(normal_ecg)
    payload = {
        "attack_type": "ignored",
        "ecg": normal_ecg,
        "checksum": checksum,
    }

    first_response = client.post("/infer", json=payload)
    second_response = client.post("/infer", json=payload)

    assert first_response.status_code == 200
    assert first_response.json()["inferred_attack_type"] == "Normal"
    assert second_response.status_code == 200
    assert second_response.json()["attack_detected"] is True
    assert second_response.json()["inferred_attack_type"] == "Replay"
    assert second_response.json()["mitigation_actions"] == ["alert", "block", "reset"]
    assert second_response.json()["mitigation_status"] == "blocked"
