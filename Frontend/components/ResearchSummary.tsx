
import React from 'react';

const ResearchSummary: React.FC = () => {
  return (
    <div className="h-full bg-slate-900 text-white overflow-y-auto p-12 selection:bg-blue-500">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <h2 className="text-5xl font-black tracking-tighter italic uppercase">Research Thesis</h2>
          <div className="h-1 w-24 bg-blue-500"></div>
          <p className="text-xl text-slate-400 font-light leading-relaxed">
            Mitigating Cyber-Physical Threats in Implantable Medical Devices through LSTM-based Anomaly Detection and Hardware Failsafes.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">The Problem</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Modern pacemakers rely on telemetry streams that are susceptible to adversarial injection. 
              Traditional threshold-based alarms fail to detect subtle rhythmic drifts introduced by 
              Man-in-the-Middle (MitM) or Replay attacks.
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">The Solution</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              We propose a dual-layer defense: a Neural IDS using LSTM Autoencoders for high-precision 
              anomaly detection, coupled with an Emergency Hardware Pacing (EHP) failsafe that overrides 
              malicious commands during active mitigation phases.
            </p>
          </div>
        </section>

        <section className="bg-white/5 p-8 rounded-3xl border border-white/10">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-center">Experimental Pipeline</h3>
          <div className="flex justify-between items-center px-10">
             {[
               { icon: 'fa-wave-square', label: 'Signal' },
               { icon: 'fa-skull', label: 'Attack' },
               { icon: 'fa-brain', label: 'Inference' },
               { icon: 'fa-shield-heart', label: 'Block' }
             ].map((step, i) => (
               <div key={i} className="flex flex-col items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 border border-slate-700">
                   <i className={`fa-solid ${step.icon}`}></i>
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-widest">{step.label}</span>
               </div>
             ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResearchSummary;
