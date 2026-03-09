
import React from 'react';
import { Patient, AttackType, MitigationStatus } from '../types';
import { ATTACK_METADATA } from '../constants';

interface AttackerProps {
  patients: Patient[];
  selectedId: string | null;
  onSelectPatient: (id: string) => void;
  onLaunchAttack: (patientId: string, attack: AttackType) => void;
  onStopAttack: (patientId: string) => void;
}

const AttackerDashboard: React.FC<AttackerProps> = ({ patients, selectedId, onSelectPatient, onLaunchAttack, onStopAttack }) => {
  const [selectedAttack, setSelectedAttack] = React.useState<AttackType>(AttackType.DATA_INJECTION);

  const activePatient = patients.find(p => p.id === (selectedId || patients[0].id)) || patients[0];
  const isAttacking = activePatient.activeAttack !== AttackType.NONE;
  const isBlocked = activePatient.mitigation === MitigationStatus.BLOCKED || activePatient.mitigation === MitigationStatus.MITIGATING;

  return (
    <div className="h-full bg-[#050505] text-zinc-400 font-mono flex flex-col overflow-hidden selection:bg-red-600 selection:text-white">
      {/* Dark Hacker Header */}
      <header className="border-b border-red-900/40 bg-black px-6 py-3 flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-red-950/20 via-transparent to-transparent opacity-50"></div>
        <div className="flex items-center gap-4 relative">
          <div className="w-8 h-8 flex items-center justify-center border border-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            <i className="fa-solid fa-skull-crossbones text-red-500 text-sm animate-pulse"></i>
          </div>
          <div>
            <h1 className="text-red-600 font-black text-xl tracking-tighter uppercase italic flex items-center gap-2">
              BIO-NET EXPLOIT CONSOLE <span className="text-[10px] text-red-900 bg-red-950 px-2 py-0.5 rounded border border-red-900/50 not-italic tracking-normal">v6.2.0-STABLE</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-8 relative">
          <div className="text-right">
             <div className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Proxy Connection</div>
             <div className="text-red-500 text-xs font-bold flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_red]"></span>
                ONION_ROUTING: ACTIVE
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Network Target Explorer */}
        <aside className="w-72 border-r border-red-900/20 bg-black overflow-y-auto">
          <div className="p-4 border-b border-red-900/10 flex items-center justify-between">
            <span className="text-red-900 font-black text-[10px] uppercase tracking-[0.3em]">Scanned Targets</span>
            <span className="text-[10px] text-zinc-700">6 NODES FOUND</span>
          </div>
          {patients.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPatient(p.id)}
              className={`w-full p-4 flex flex-col border-b border-red-900/5 transition-all relative group ${
                selectedId === p.id 
                  ? 'bg-red-950/20 border-l-2 border-l-red-600' 
                  : 'hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex justify-between items-center w-full mb-1">
                <span className={`font-bold transition-colors ${selectedId === p.id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                  NODE::0x{p.recordId}
                </span>
                {p.activeAttack !== AttackType.NONE && (
                  <span className="text-[8px] bg-red-600 text-black font-black px-1.5 py-0.5 rounded uppercase animate-pulse">PWNING</span>
                )}
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="text-[9px] font-mono text-zinc-600">{p.name.replace(' ', '_').toUpperCase()}</span>
                <div className={`h-1 w-8 rounded-full ${p.status === 'Attack Detected' ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-zinc-800'}`}></div>
              </div>
            </button>
          ))}
        </aside>

        {/* Workspace */}
        <main className="flex-1 p-8 overflow-y-auto bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Reconnaissance & Vulnerability Intel */}
            <section className="bg-zinc-900/40 border border-zinc-800 rounded p-6 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <i className="fa-solid fa-microchip text-7xl text-red-500"></i>
               </div>
               <div className="flex items-center gap-6 mb-8 border-b border-zinc-800 pb-6 relative">
                  <div className="w-20 h-20 bg-black border border-red-900/50 rounded flex items-center justify-center text-4xl text-red-700 shadow-inner">
                    <i className="fa-solid fa-user-secret"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                      Target Intel: {activePatient.name}
                      {activePatient.riskFactor === 'High' && <span className="text-[10px] not-italic bg-red-900/50 text-red-400 px-2 py-1 rounded-full border border-red-900">HIGH VALUE</span>}
                    </h2>
                    <p className="text-zinc-500 text-xs mt-1 font-mono uppercase tracking-widest">Device: MEDTECH-SENTINEL v4.1 • Record ID: {activePatient.recordId}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                      <i className="fa-solid fa-bug"></i> Surface Analysis
                    </div>
                    <div className="p-4 bg-black/60 rounded border border-red-900/20 space-y-3">
                       <div>
                         <div className="text-[9px] text-zinc-600 font-bold uppercase mb-1">Identified Vulnerability</div>
                         <div className="text-sm font-bold text-red-400 font-mono tracking-tight">{activePatient.vulnerability}</div>
                       </div>
                       <div>
                         <div className="text-[9px] text-zinc-600 font-bold uppercase mb-1">Patient History (Recon)</div>
                         <div className="text-xs text-zinc-400 leading-relaxed italic line-clamp-2">
                           "{activePatient.medicalHistory}"
                         </div>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                      <i className="fa-solid fa-tower-broadcast"></i> Network Stats
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 bg-black/60 rounded border border-zinc-800">
                         <div className="text-[9px] text-zinc-600 font-bold uppercase mb-1">RSSI</div>
                         <div className="text-sm text-zinc-300 font-mono">-64 dBm</div>
                       </div>
                       <div className="p-3 bg-black/60 rounded border border-zinc-800">
                         <div className="text-[9px] text-zinc-600 font-bold uppercase mb-1">Protocol</div>
                         <div className="text-sm text-zinc-300 font-mono">BLE 5.2 (Prop)</div>
                       </div>
                    </div>
                  </div>
               </div>
            </section>

            {/* Exploit & Control Console */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
               <div className="md:col-span-7 bg-zinc-900/40 border border-zinc-800 rounded p-6">
                  <h3 className="text-zinc-500 font-black mb-6 flex items-center gap-2 uppercase text-xs tracking-[0.3em]">
                    <i className="fa-solid fa-flask"></i> Payload Selection
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.values(AttackType).filter(t => t !== AttackType.NONE).map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedAttack(type)}
                        disabled={isAttacking}
                        className={`group w-full p-4 rounded border text-left transition-all ${
                          selectedAttack === type 
                            ? 'bg-red-950/20 border-red-700 text-white shadow-[inset_0_0_20px_rgba(153,27,27,0.2)]' 
                            : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'
                        } ${isAttacking ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className={`font-bold uppercase tracking-tighter text-sm ${selectedAttack === type ? 'text-red-500' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                            {type}
                          </div>
                          <div className={`text-[8px] px-1.5 py-0.5 rounded border ${
                            ATTACK_METADATA[type].severity === 'High' || ATTACK_METADATA[type].severity === 'Critical' 
                            ? 'border-red-900 text-red-800' : 'border-zinc-800 text-zinc-700'
                          }`}>
                            SEV: {ATTACK_METADATA[type].severity}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono leading-tight opacity-60">
                          {ATTACK_METADATA[type].description}
                        </div>
                      </button>
                    ))}
                  </div>
               </div>

               <div className="md:col-span-5 flex flex-col gap-6">
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded p-6 flex-1 flex flex-col">
                    <h3 className="text-zinc-500 font-black mb-6 uppercase text-xs tracking-[0.3em] flex items-center gap-2">
                       <i className="fa-solid fa-play"></i> Execution
                    </h3>
                    
                    <div className="flex-1 flex flex-col justify-center gap-6">
                      {!isAttacking ? (
                        <div className="space-y-4">
                           <div className="text-center text-[10px] text-zinc-600 animate-pulse uppercase mb-2">Ready for payload injection</div>
                           <button
                            onClick={() => onLaunchAttack(activePatient.id, selectedAttack)}
                            className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-5 rounded transition-all active:scale-95 shadow-[0_5px_0_rgb(69,10,10)] active:shadow-none uppercase tracking-widest text-lg italic"
                           >
                            Launch Attack
                           </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                           <div className="p-5 border border-red-500/50 rounded bg-red-950/20 text-center relative overflow-hidden">
                              <div className="absolute top-0 left-0 h-full bg-red-600/10 animate-[pulse_2s_infinite]" style={{ width: '100%' }}></div>
                              <div className="text-red-500 font-black text-sm uppercase tracking-widest mb-2 relative">EXPLOITING NODE::{activePatient.recordId}</div>
                              <div className="text-[10px] text-red-900 font-bold mb-4 relative">{activePatient.activeAttack} ACTIVE</div>
                              <div className="w-full bg-black/60 h-1 rounded-full overflow-hidden relative">
                                <div className="bg-red-600 h-full w-[60%] animate-[shimmer_1.5s_infinite]"></div>
                              </div>
                           </div>
                           
                           {isBlocked && (
                             <div className="bg-red-900/10 border border-red-600/50 p-4 rounded text-red-500 text-[10px] font-bold text-center animate-pulse flex flex-col gap-2">
                                <div className="uppercase">!! SESSION TERMINATED !!</div>
                                <div className="opacity-70 text-[8px] font-mono uppercase">Reason: Peer_IDS_Detection_Drop</div>
                             </div>
                           )}

                           <button
                            onClick={() => onStopAttack(activePatient.id)}
                            className="w-full border border-zinc-700 hover:border-zinc-500 text-zinc-500 py-3 rounded text-[10px] font-black uppercase tracking-widest transition-colors"
                           >
                            Close Connection
                           </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-black border border-zinc-800 p-4 rounded h-32 overflow-hidden flex flex-col font-mono">
                    <div className="text-[10px] text-zinc-700 space-y-1">
                      <div>&gt; [SYSTEM] SESSION_ID: {Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
                      <div>&gt; [NETWORK] SCAN COMPLETED. 6 DEVICES ONLINE.</div>
                      {isAttacking && (
                        <>
                          <div className="text-red-800">&gt; [EXPLOIT] Tunneling via {activePatient.recordId}_PORT...</div>
                          <div className="text-red-800">&gt; [EXPLOIT] {activePatient.activeAttack} sync successful.</div>
                          {isBlocked && (
                             <div className="text-orange-900">&gt; [ALARM] PACKET_REJECTION AT PEER</div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
               </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AttackerDashboard;
