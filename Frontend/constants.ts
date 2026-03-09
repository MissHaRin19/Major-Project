
import { Patient, AttackType, MitigationStatus } from './types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'John Doe',
    age: 68,
    recordId: '100',
    status: 'Stable',
    activeAttack: AttackType.NONE,
    identifiedAttack: AttackType.NONE,
    mitigation: MitigationStatus.NORMAL,
    mitigationStrategy: '',
    mitigationTimeRemaining: 0,
    anomalyScore: 0.05,
    vitals: { heartRate: 72, pulse: 71, ecg: [], timestamp: Date.now() },
    medicalHistory: 'Chronic hypertension, previous myocardial infarction in 2018.',
    riskFactor: 'High',
    vulnerability: 'Legacy firmware v1.2 (Unauthenticated BLE)'
  },
  {
    id: 'p2',
    name: 'Jane Smith',
    age: 72,
    recordId: '101',
    status: 'Stable',
    activeAttack: AttackType.NONE,
    identifiedAttack: AttackType.NONE,
    mitigation: MitigationStatus.NORMAL,
    mitigationStrategy: '',
    mitigationTimeRemaining: 0,
    anomalyScore: 0.08,
    vitals: { heartRate: 65, pulse: 64, ecg: [], timestamp: Date.now() },
    medicalHistory: 'Type 2 Diabetes, atrial fibrillation.',
    riskFactor: 'Moderate',
    vulnerability: 'Weak encryption keys in telemetry stream'
  },
  {
    id: 'p3',
    name: 'Robert Wilson',
    age: 81,
    recordId: '103',
    status: 'Stable',
    activeAttack: AttackType.NONE,
    identifiedAttack: AttackType.NONE,
    mitigation: MitigationStatus.NORMAL,
    mitigationStrategy: '',
    mitigationTimeRemaining: 0,
    anomalyScore: 0.02,
    vitals: { heartRate: 78, pulse: 78, ecg: [], timestamp: Date.now() },
    medicalHistory: 'Congestive heart failure, stable on medication.',
    riskFactor: 'High',
    vulnerability: 'Hardcoded maintenance credentials'
  },
  {
    id: 'p4',
    name: 'Alice Brown',
    age: 59,
    recordId: '105',
    status: 'Stable',
    activeAttack: AttackType.NONE,
    identifiedAttack: AttackType.NONE,
    mitigation: MitigationStatus.NORMAL,
    mitigationStrategy: '',
    mitigationTimeRemaining: 0,
    anomalyScore: 0.04,
    vitals: { heartRate: 88, pulse: 87, ecg: [], timestamp: Date.now() },
    medicalHistory: 'Hyperthyroidism, occasional PVCs.',
    riskFactor: 'Low',
    vulnerability: 'Buffer overflow in pulse-command parser'
  },
  {
    id: 'p5',
    name: 'Sarah Jenkins',
    age: 64,
    recordId: '108',
    status: 'Stable',
    activeAttack: AttackType.NONE,
    identifiedAttack: AttackType.NONE,
    mitigation: MitigationStatus.NORMAL,
    mitigationStrategy: '',
    mitigationTimeRemaining: 0,
    anomalyScore: 0.03,
    vitals: { heartRate: 62, pulse: 61, ecg: [], timestamp: Date.now() },
    medicalHistory: 'Sinus node dysfunction. Competitive walker.',
    riskFactor: 'Low',
    vulnerability: 'Exposed telemetry port (No SSL)'
  },
  {
    id: 'p6',
    name: 'Michael Chen',
    age: 75,
    recordId: '111',
    status: 'Stable',
    activeAttack: AttackType.NONE,
    identifiedAttack: AttackType.NONE,
    mitigation: MitigationStatus.NORMAL,
    mitigationStrategy: '',
    mitigationTimeRemaining: 0,
    anomalyScore: 0.06,
    vitals: { heartRate: 70, pulse: 70, ecg: [], timestamp: Date.now() },
    medicalHistory: 'Second-degree heart block.',
    riskFactor: 'Moderate',
    vulnerability: 'Replay-susceptible handshake protocol'
  }
];

export const ATTACK_METADATA = {
  [AttackType.DATA_INJECTION]: {
    description: 'Injects false high heart rate values into telemetry.',
    impact: 'Potential clinical misdiagnosis or unnecessary shock.',
    severity: 'High',
    mitigation: 'Implementing cryptographic packet signing and outlier rejection filters to drop non-physiological telemetry spikes.'
  },
  [AttackType.REPLAY]: {
    description: 'Replays historical normal ECG to hide current cardiac events.',
    impact: 'Masks actual patient distress from clinicians.',
    severity: 'Medium',
    mitigation: 'Enforcing strict nonces and monotonic counter verification on all incoming telemetry frames to invalidate stale signatures.'
  },
  [AttackType.MITM]: {
    description: 'Modifies packets in transit with subtle rhythmic changes.',
    impact: 'Evades simple threshold detectors via gradual drift.',
    severity: 'Medium',
    mitigation: 'Triggering session re-handshake with Diffie-Hellman key exchange and enabling full AES-256-GCM payload encryption.'
  },
  [AttackType.DOS]: {
    description: 'Floods communication channel to prevent vitals updates.',
    impact: 'Zero visibility into patient state.',
    severity: 'Critical',
    mitigation: 'Activating Hardware Rate-Limiting and dynamic IP/MAC blacklisting to prioritize low-latency physiological pacing commands.'
  },
  [AttackType.NONE]: {
    description: 'No active cyber threats.',
    impact: 'None',
    severity: 'N/A',
    mitigation: 'N/A'
  }
};
