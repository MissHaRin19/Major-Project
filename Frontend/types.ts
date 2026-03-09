
export enum AttackType {
  DATA_INJECTION = 'Data Injection',
  REPLAY = 'Replay Attack',
  MITM = 'Man-in-the-Middle',
  DOS = 'Denial of Service (DoS)',
  NONE = 'None'
}

export enum MitigationStatus {
  NORMAL = 'Monitoring',
  DETECTING = 'Analyzing Traffic...',
  IDENTIFIED = 'Threat Identified',
  MITIGATING = 'Mitigation in Progress',
  BLOCKED = 'Attack Blocked'
}

export interface Vitals {
  heartRate: number;
  pulse: number;
  ecg: number[];
  timestamp: number;
}

/**
 * Added AuditEntry interface to track system events and security alerts
 */
export interface AuditEntry {
  eventId: string;
  timestamp: number;
  action: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

/**
 * Added LabMetrics interface for performance evaluation of the IDS
 */
export interface LabMetrics {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  totalLatency: number;
  detections: number;
  lastDetectionLatency: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  recordId: string;
  status: 'Stable' | 'Critical' | 'Attack Detected';
  activeAttack: AttackType;
  identifiedAttack: AttackType; // New: AI's identification
  mitigation: MitigationStatus;
  mitigationStrategy: string; // New: Detail on how it will be stopped
  mitigationTimeRemaining: number; // New: Countdown in seconds
  anomalyScore: number;
  systemAlert?: string; // New: Backend security alert message
  vitals: Vitals;
  medicalHistory: string;
  riskFactor: 'Low' | 'Moderate' | 'High';
  vulnerability: string;
  /**
   * Added auditLog to Patient to store historical security events
   */
  auditLog?: AuditEntry[];
}

export interface SimulationState {
  patients: Patient[];
  activePatientId: string | null;
}
