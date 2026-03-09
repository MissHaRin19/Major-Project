
import React from 'react';
import { Patient, MitigationStatus, AttackType } from '../types';
import EcgChart from './EcgChart';

interface DefenderProps {
  patients: Patient[];
  onSelectPatient: (id: string) => void;
  selectedId: string | null;
  autoMitigate: boolean;
  onToggleAutoMitigate: (val: boolean) => void;
}

const DefenderDashboard: React.FC<DefenderProps> = ({ 
  patients, 
  onSelectPatient, 
  selectedId,
  autoMitigate,
  onToggleAutoMitigate
}) => {
  const selectedPatient = patients.find(p => p.id === selectedId) || patients[0];
  const isAlert = selectedPatient.status === 'Attack Detected';
  const timer = selectedPatient.mitigationTimeRemaining;
  const activeAttack = selectedPatient.identifiedAttack;
  const isMitigated = selectedPatient.mitigation === MitigationStatus.BLOCKED;

  // Analysis stages mapped to the 10-second countdown
  const getStageStatus = (stage: number) => {
    if (isMitigated) return 'complete';
    if (!isAlert || activeAttack === AttackType.NONE) return 'idle';
    
    if (stage === 1) { // Detection Phase
      return timer > 8 ? 'processing' : 'complete';
    }
    if (stage === 2) { // Identification Phase
      if (timer > 7) return 'pending';
      return timer > 3 ? 'processing' : 'complete';
    }
    if (stage === 3) { // Mitigation Phase
      if (timer > 3) return 'pending';
      return timer > 0 ? 'processing' : 'complete';
    }
    return 'idle';
  };

  const renderPoint = (stage: number, title: string, description: string) => {
    const status = getStageStatus(stage);
    
    const statusStyles = {
      idle: 'opacity-20 border-slate-800 bg-transparent',
      pending: 'opacity-40 border-slate-800 bg-transparent',
      processing: 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      complete: 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'
    };

    return (
      <div className={`p-4 rounded-xl border transition-all duration-700 ${statusStyles[status]} overflow-hidden relative`}>
        {status === 'processing' && (
          <div className="absolute top-0 left-0 h-full w-1 bg-blue-500 animate-pulse"></div>
        )}
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-5 h-5">
            {status === 'processing' ? (
              <i className="fa-solid fa-spinner fa-spin text-blue-400 text-xs"></i>
            ) : status === 'complete' ? (
              <i className="fa-solid fa-check-double text-emerald-400 text-xs"></i>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            )}
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h4>
        </div>
        <p className="text-[10px] font-mono leading-tight opacity-70 ml-8 italic">
          {status === 'processing' ? `[EXECUTING] ${description}...` : status === 'complete' ? `[VERIFIED] ${description}` : `Waiting for phase ${stage}...`}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      <header className={`px-6 py-3 flex justify-between items-center shadow-lg border-b transition-all duration-700 ${
        isAlert ? 'bg-red-950 border-red-500' : 'bg-slate-900 border-blue-900/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-inner transition-colors ${
            isAlert ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
          }`}>
            <i className={`fa-solid text-xl text-white ${isAlert ? 'fa-triangle-exclamation' : 'fa-heart-pulse'}`}></i>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none text-white uppercase italic">Bio-CPS Sentinel</h1>
            <p className={`text-[10px] font-mono uppercase tracking-widest mt-1 ${isAlert ? 'text-red-300' : 'text-blue-400'}`}>
              {isAlert ? `THREAT DETECTED: ANALYSIS IN PROGRESS` : 'Network Node Health Monitor'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-white font-mono text-xs">
          <div className="bg-white/5 px-3 py-1 rounded border border-white/10 uppercase tracking-widest text-[9px]">
            System Time: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Patient Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
            <span className="font-black text-slate-400 uppercase text-[9px] tracking-[0.3em]">Patient Ward</span>
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">0{patients.length}</span>
          </div>
          {patients.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPatient(p.id)}
              className={`w-full p-4 flex items-center justify-between border-b transition-all ${
                selectedId === p.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
              }`}
            >
              <div className="text-left">
                <div className={`font-bold text-sm ${selectedId === p.id ? 'text-blue-900' : 'text-slate-800'}`}>{p.name}</div>
                <div className="text-[9px] text-slate-400 font-mono uppercase">NODE_ID: 0x{p.recordId}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                p.status === 'Attack Detected' ? 'bg-red-500 text-white animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {p.status}
              </span>
            </button>
          ))}
        </aside>

        <main className="flex-1 p-8 overflow-y-auto relative">
          <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
            
            {/* Primary Monitoring Column */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              
              {/* Alert Notification */}
              {isAlert && timer > 0 && (
                <div className="bg-red-600 text-white p-6 rounded-2xl shadow-2xl border-2 border-red-500 flex items-center justify-between animate-[bounce_2s_infinite]">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                       <i className="fa-solid fa-shield-virus text-3xl"></i>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Bio-IDS Response Triggered</div>
                      <div className="text-3xl font-black italic uppercase tracking-tighter">Analyzing Payload...</div>
                    </div>
                  </div>
                  <div className="bg-black/30 px-6 py-4 rounded-2xl border border-white/20 text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Lockdown T-Minus</div>
                    <div className="text-4xl font-mono font-black">{timer}s</div>
                  </div>
                </div>
              )}

              <div className={`bg-white rounded-3xl shadow-xl border p-8 transition-all duration-700 ${
                isAlert ? 'border-red-400 ring-[12px] ring-red-500/5' : 'border-slate-100 shadow-slate-200/50'
              }`}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{selectedPatient.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">PACEMAKER_V4_PRO</span>
                      <span className={`w-2 h-2 rounded-full ${isAlert ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                    </div>
                  </div>
                  <div className={`p-5 rounded-2xl border-2 transition-all ${isAlert ? 'bg-red-950 border-red-600' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Live Telemetry (HR)</div>
                    <div className="text-5xl font-mono font-black text-white leading-none tracking-tighter">{selectedPatient.vitals.heartRate}</div>
                  </div>
                </div>
                <EcgChart data={selectedPatient.vitals.ecg} isAlert={isAlert} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6">
                 {[
                   { label: 'Anomaly Threshold', value: `${(selectedPatient.anomalyScore * 100).toFixed(1)}%`, color: isAlert ? 'text-red-600' : 'text-emerald-600', icon: 'fa-microchip' },
                   { label: 'Pacing State', value: isAlert ? 'OVERRIDE' : 'SYNCHRONIZED', color: isAlert ? 'text-orange-600' : 'text-blue-600', icon: 'fa-heart-circle-bolt' },
                   { label: 'Encryption', value: 'AES-GCM-256', color: 'text-slate-600', icon: 'fa-lock' }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                     <i className={`fa-solid ${stat.icon} text-slate-300 text-lg mb-2`}></i>
                     <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                     <div className={`text-sm font-black font-mono ${stat.color}`}>{stat.value}</div>
                   </div>
                 ))}
              </div>
            </div>

            {/* POP-UP RESEARCH INTELLIGENCE PANEL */}
            <div className="col-span-12 lg:col-span-4 relative">
              {(isAlert || isMitigated) && (
                <div className="sticky top-8 bg-slate-900 rounded-3xl p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border-2 border-blue-500/30 flex flex-col gap-5 animate-[slideIn_0.6s_cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden">
                  {/* Decorative Scan Line Animation */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-[scan_3s_linear_infinite]"></div>
                  
                  <style>{`
                    @keyframes slideIn {
                      from { transform: translateX(50px); opacity: 0; }
                      to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes scan {
                      0% { transform: translateY(-10px); }
                      100% { transform: translateY(500px); }
                    }
                  `}</style>

                  <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-brain text-blue-500"></i>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Research Intel</h3>
                      </div>
                      {isMitigated && (
                        <div className="bg-emerald-500 text-white text-[8px] px-2 py-1 rounded-full font-black uppercase shadow-[0_0_10px_rgba(16,185,129,0.5)]">Node Secured</div>
                      )}
                  </div>

                  <div className="space-y-4">
                    {renderPoint(1, "Detection Phase", "LSTM analysis flagged 360Hz spectral drift in cardiac telemetry")}
                    {renderPoint(2, "Identification Phase", `Matched signature: ${activeAttack === AttackType.NONE && isMitigated ? 'CONFIRMED' : activeAttack || 'Scanning Database...'}`)}
                    {renderPoint(3, "Mitigation Plan", `${selectedPatient.mitigationStrategy || 'Preparing emergency payload block'}`)}
                  </div>

                  <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-slate-800 text-center">
                    <div className="text-[9px] font-bold text-slate-500 uppercase mb-2 tracking-widest">IDS Confidence Score</div>
                    <div className="flex items-center justify-center gap-3">
                       <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${isAlert ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${selectedPatient.anomalyScore * 100}%` }}></div>
                       </div>
                       <span className={`text-xs font-mono font-bold ${isAlert ? 'text-red-500' : 'text-emerald-500'}`}>{(selectedPatient.anomalyScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center opacity-40">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic">Core_Proc: SecureBioSim_v2</span>
                      <i className="fa-solid fa-fingerprint text-xs text-blue-900"></i>
                  </div>
                </div>
              )}

              {/* Placeholder when stable */}
              {(!isAlert && !isMitigated) && (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center opacity-60">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <i className="fa-solid fa-shield-halved text-slate-200 text-2xl"></i>
                   </div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Observation Mode</h4>
                   <p className="text-[10px] text-slate-300 font-mono">No active threats detected.<br/>Intelligent Brief will populate upon signal deviation.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DefenderDashboard;
