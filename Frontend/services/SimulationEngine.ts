import MD5 from "crypto-js/md5";
import { AttackType, MitigationStatus, Patient } from "../types";

/**
 * Checksum helper (must match backend)
 */
function computeChecksum(ecg: number[]) {
  const rounded = ecg.map(v => v.toFixed(5));
  const data = rounded.join(",");
  return MD5(data).toString();
}

interface BackendDecision {
  attack_detected: boolean;
  attack_type?: string;
  inferred_attack_type?: string;
  reconstruction_error?: number;
  mitigation_status?: string;
  mitigation_actions?: string[];
  mitigation_message?: string;
}

let replayBuffer: number[] | null = null;
let replayIndex = 0;
const inferenceCache = new Map<string, BackendDecision>();

function mapAttackType(inferredAttack?: string): AttackType {
  switch (inferredAttack) {
    case "MITM":
      return AttackType.MITM;
    case "Replay":
      return AttackType.REPLAY;
    case "DoS":
      return AttackType.DOS;
    case "Data Injection":
      return AttackType.DATA_INJECTION;
    default:
      return AttackType.NONE;
  }
}

function mapMitigationStatus(status?: string, actions: string[] = []): MitigationStatus {
  if (actions.includes("reset") || status === "blocked") {
    return MitigationStatus.BLOCKED;
  }

  if (actions.includes("block") || status === "mitigating") {
    return MitigationStatus.MITIGATING;
  }

  if (actions.includes("alert")) {
    return MitigationStatus.IDENTIFIED;
  }

  return MitigationStatus.NORMAL;
}

/**
 * ML observer (does not mutate state directly)
 */
async function runML(patientId: string, ecg: number[], attack: AttackType) {
  try {
    const ecgWindow = ecg.slice(-140);

    let payload;

    if (attack === AttackType.REPLAY) {
      if (!replayBuffer) replayBuffer = [...ecgWindow];

      const ecgToSend = [...replayBuffer];

      payload = {
        attack_type: "Replay",
        ecg: ecgToSend,
        checksum: computeChecksum(ecgToSend)
      };
    }
    else if (attack === AttackType.MITM) {
      const manipulated = ecgWindow.map(v => v * 0.6);

      payload = {
        attack_type: "MITM",
        ecg: manipulated,
        checksum: computeChecksum(ecgWindow)
      };
    }
    else if (attack === AttackType.DATA_INJECTION) {
      payload = {
        attack_type: "Data Injection",
        ecg: ecgWindow,
        checksum: computeChecksum(ecgWindow)
      };
    }
    else if (attack === AttackType.DOS) {
      payload = {
        attack_type: "DoS",
        ecg: ecgWindow,
        checksum: computeChecksum(ecgWindow)
      };
    }
    else {
      payload = {
        attack_type: "Normal",
        ecg: ecgWindow,
        checksum: computeChecksum(ecgWindow)
      };
    }

    const res = await fetch("http://localhost:8000/infer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return null;

    const result = await res.json();
    inferenceCache.set(patientId, result);
    return result;
  }
  catch {
    return null;
  }
}

/**
 * ECG signal generator
 */
export const generateEcgPoint = (
  time: number,
  hr: number,
  attack: AttackType
): number => {
  let scaledTime = time * 0.4;

  if (attack === AttackType.MITM)
    scaledTime += 15 * Math.sin(time / 200);

  const period = (60 / Math.max(hr, 1)) * 1000;
  const phase = (scaledTime % period) / period;

  if (attack === AttackType.DOS)
    return (Math.random() - 0.5) * 2.0;

  if (attack === AttackType.REPLAY && !replayBuffer) {
    const replayTime = scaledTime % 1000;
    return generateEcgPoint(replayTime / 0.4, 72, AttackType.NONE);
  }

  let signal = 0;

  if (phase > 0.43 && phase < 0.49)
    signal += 1.4 * Math.sin((phase - 0.43) * Math.PI / 0.06);

  if (phase > 0.28 && phase < 0.38)
    signal += 0.15 * Math.sin((phase - 0.28) * Math.PI / 0.10);

  if (phase > 0.58 && phase < 0.80)
    signal += 0.25 * Math.sin((phase - 0.58) * Math.PI / 0.22);

  if (attack === AttackType.MITM) {
    signal *= (0.8 + Math.random() * 0.4);
    signal += 0.1 * Math.sin(time / 500);
  }

  if (attack === AttackType.DATA_INJECTION) {
    if (Math.random() > 0.85)
      signal += (Math.random() - 0.5) * 2.0;
  }

  return signal;
};

/**
 * Simulation engine
 */
export const updatePatientVitals = (
  patient: Patient,
  currentTime: number
): Patient => {
  const { activeAttack } = patient;

  const lastTimestamp =
    patient.vitals.timestamp || currentTime - 33;

  let targetHR = patient.vitals.heartRate;

  /**
   * Physiological drift + attack effects
   */
  if (activeAttack === AttackType.DATA_INJECTION) {
    targetHR += (190 - targetHR) * 0.12;
  }
  else if (activeAttack === AttackType.DOS) {
    targetHR += (0 - targetHR) * 0.18;
  }
  else if (activeAttack === AttackType.MITM) {
    targetHR += (120 - targetHR) * 0.06;
  }
  else if (activeAttack === AttackType.NONE) {
    targetHR += (72 - targetHR) * 0.1;
    replayBuffer = null;
  }

  /**
   * Replay buffer init
   */
  if (activeAttack === AttackType.REPLAY) {
    if (!replayBuffer) {
      replayBuffer = [...patient.vitals.ecg].slice(-140);
      replayIndex = 0;
    }
  }

  const stepSize = 10;
  const elapsed = currentTime - lastTimestamp;

  const numSteps = Math.min(
    30,
    Math.max(1, Math.floor(elapsed / stepSize))
  );

  let newEcg = [...patient.vitals.ecg];

  for (let i = 1; i <= numSteps; i++) {
    const sampleTime = lastTimestamp + i * stepSize;

    if (activeAttack === AttackType.REPLAY && replayBuffer) {
      const sample = replayBuffer[replayIndex];
      newEcg.push(sample);
      replayIndex = (replayIndex + 1) % replayBuffer.length;
    }
    else {
      newEcg.push(
        generateEcgPoint(sampleTime, targetHR, activeAttack)
      );

      if (activeAttack !== AttackType.REPLAY)
        replayIndex = 0;
    }
  }

  const finalEcg = newEcg.slice(-160);

  /**
   * ML observer
   */
  if (currentTime % 1500 < 40) {
    runML(patient.id, finalEcg, activeAttack);
  }

  const latestDecision = inferenceCache.get(patient.id);
  const inferredAttack = mapAttackType(
    latestDecision?.inferred_attack_type || latestDecision?.attack_type
  );
  const mitigationActions = latestDecision?.mitigation_actions || [];
  const mitigationStatus = mapMitigationStatus(
    latestDecision?.mitigation_status,
    mitigationActions
  );
  const attackDetected = latestDecision?.attack_detected === true;
  const shouldReset = mitigationActions.includes("reset");

  let status: Patient["status"] = "Stable";
  if (attackDetected) {
    status = "Attack Detected";
  }
  else if (targetHR > 130 || targetHR < 45) {
    status = "Critical";
  }

  return {
    ...patient,
    activeAttack: shouldReset ? AttackType.NONE : patient.activeAttack,
    identifiedAttack: attackDetected ? inferredAttack : AttackType.NONE,
    mitigation: mitigationStatus,
    mitigationStrategy: latestDecision?.mitigation_message || "",
    mitigationTimeRemaining: 0,
    anomalyScore: latestDecision?.reconstruction_error !== undefined
      ? Math.min(1.0, latestDecision.reconstruction_error)
      : patient.anomalyScore,
    systemAlert: attackDetected
      ? `${latestDecision?.inferred_attack_type || latestDecision?.attack_type || "Anomaly"} Detected - ${latestDecision?.mitigation_message || "Mitigation triggered"}`
      : undefined,
    status,
    vitals: {
      ...patient.vitals,
      heartRate: Math.round(targetHR),
      pulse: Math.max(
        0,
        Math.round(targetHR - Math.random() * 2)
      ),
      ecg: finalEcg,
      timestamp: currentTime
    }
  };
};
