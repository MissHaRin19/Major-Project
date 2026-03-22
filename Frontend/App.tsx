import React, { useState, useEffect, useRef } from 'react';
import { Patient, AttackType, MitigationStatus, AuditEntry } from './types';
import { INITIAL_PATIENTS } from './constants';
import { updatePatientVitals } from './services/SimulationEngine';
import DefenderDashboard from './components/DefenderDashboard';
import AttackerDashboard from './components/AttackerDashboard';
import MLSyncStatus from './components/MLSyncStatus';

const App: React.FC = () => {
  const [view, setView] = useState<'defender' | 'attacker'>('defender');
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(INITIAL_PATIENTS[0].id);
  const [autoMitigate, setAutoMitigate] = useState<boolean>(true);

  const lastUpdateRef = useRef<number>(0);

  const addAuditEntry = (patient: Patient, entry: Omit<AuditEntry, 'timestamp' | 'eventId'>): Patient => {
    const newEntry: AuditEntry = {
      ...entry,
      timestamp: Date.now(),
      eventId: 'EVT-' + Math.random().toString(16).slice(2, 8).toUpperCase()
    };
    return { ...patient, auditLog: [newEntry, ...patient.auditLog || []].slice(0, 50) };
  };

  useEffect(() => {
    const runSimulation = (timestamp: number) => {
      const delta = timestamp - lastUpdateRef.current;

      if (delta >= 33) {
        lastUpdateRef.current = timestamp;

        setPatients(currentPatients => currentPatients.map(patient => {
          const previousAlert = patient.systemAlert;
          const previousMitigation = patient.mitigation;
          let updated = updatePatientVitals(patient, timestamp);

          if (updated.systemAlert && updated.systemAlert !== previousAlert) {
            updated = addAuditEntry(updated, {
              action: updated.systemAlert,
              severity: 'Critical'
            });
          }

          if (
            previousMitigation !== MitigationStatus.BLOCKED &&
            updated.mitigation === MitigationStatus.BLOCKED
          ) {
            updated = addAuditEntry(updated, {
              action: 'Backend mitigation applied. Telemetry channel blocked/reset by server policy.',
              severity: 'Info'
            });
          }

          return updated;
        }));
      }

      requestAnimationFrame(runSimulation);
    };

    const animId = requestAnimationFrame(runSimulation);
    return () => cancelAnimationFrame(animId);
  }, [autoMitigate]);

  const launchAttack = (id: string, attack: AttackType) => {
    setPatients(prev => prev.map(p =>
      p.id === id ? addAuditEntry({
        ...p,
        activeAttack: attack,
        identifiedAttack: AttackType.NONE,
        mitigation: MitigationStatus.NORMAL,
        mitigationStrategy: '',
        anomalyScore: 0.15,
        mitigationTimeRemaining: 0,
        status: 'Stable',
        systemAlert: undefined
      }, { action: `Remote telemetry exploit: Node ${p.recordId} compromised.`, severity: 'Warning' }) : p
    ));
  };

  const stopAttack = (id: string) => {
    setPatients(prev => prev.map(p =>
      p.id === id ? {
        ...p,
        activeAttack: AttackType.NONE,
        identifiedAttack: AttackType.NONE,
        mitigation: MitigationStatus.NORMAL,
        mitigationStrategy: '',
        mitigationTimeRemaining: 0,
        anomalyScore: 0.05,
        status: 'Stable',
        systemAlert: undefined
      } : p
    ));
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-900">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_blue]"></span>
            <span className="text-white font-bold text-xs tracking-widest uppercase italic">SecureBioSim</span>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-md">
            {[
              { id: 'defender', label: 'MONITORING', color: 'bg-blue-600' },
              { id: 'attacker', label: 'EXPLOIT', color: 'bg-red-700' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as any)}
                className={`px-4 py-1 rounded text-[10px] font-black tracking-widest transition-all ${view === tab.id ? `${tab.color} text-white shadow-lg` : 'text-slate-400 hover:text-slate-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase">
           <MLSyncStatus />
        </div>
      </nav>
      <div className="flex-1 relative overflow-hidden bg-white">
        {view === 'defender' && (
          <DefenderDashboard
            patients={patients}
            selectedId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            autoMitigate={autoMitigate}
            onToggleAutoMitigate={setAutoMitigate}
          />
        )}
        {view === 'attacker' && (
          <AttackerDashboard
            patients={patients}
            selectedId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            onLaunchAttack={launchAttack}
            onStopAttack={stopAttack}
          />
        )}
      </div>
    </div>
  );
};

export default App;
