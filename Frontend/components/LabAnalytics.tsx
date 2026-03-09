
import React, { useState, useEffect } from 'react';
import { LabMetrics, Patient } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area } from 'recharts';

interface LabProps {
  metrics: LabMetrics;
  patients: Patient[];
  onSave: (name: string) => void;
  onLoad: (name: string) => void;
}

const LabAnalytics: React.FC<LabProps> = ({ metrics, patients, onSave, onLoad }) => {
  const [checkpointName, setCheckpointName] = useState('');
  const [existingCheckpoints, setExistingCheckpoints] = useState<string[]>([]);
  
  const precision = metrics.tp / (metrics.tp + metrics.fp) || 0;
  const recall = metrics.tp / (metrics.tp + metrics.fn) || 0;
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('checkpoint_'));
    setExistingCheckpoints(keys.map(k => k.replace('checkpoint_', '')));
  }, []);

  const handleSave = () => {
    if (!checkpointName) return;
    onSave(checkpointName);
    const keys = Object.keys(localStorage).filter(k => k.startsWith('checkpoint_'));
    setExistingCheckpoints(keys.map(k => k.replace('checkpoint_', '')));
    setCheckpointName('');
  };

  const matrixData = [
    { name: 'True Positives', value: metrics.tp, color: '#10b981' },
    { name: 'False Positives', value: metrics.fp, color: '#f59e0b' },
    { name: 'False Negatives', value: metrics.fn, color: '#ef4444' },
    { name: 'True Negatives', value: metrics.tn, color: '#3b82f6' },
  ];

  return (
    <div className="h-full bg-slate-50 overflow-y-auto p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="border-b border-slate-200 pb-6">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Evaluation Lab</h2>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Quantitative Performance Analysis</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-bookmark text-blue-500"></i> Checkpoint Management
          </h3>
          <div className="flex gap-4 mb-6">
            <input 
              type="text" 
              value={checkpointName}
              onChange={(e) => setCheckpointName(e.target.value)}
              placeholder="Scenario Name..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono"
            />
            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Create Checkpoint</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {existingCheckpoints.map(cp => (
              <div key={cp} className="p-4 bg-slate-900 rounded-2xl flex justify-between items-center group">
                <span className="text-white font-mono text-[10px] uppercase truncate mr-2">{cp}</span>
                <button onClick={() => onLoad(cp)} className="text-[10px] font-black text-emerald-400 uppercase hover:underline">Restore</button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Precision', val: `${(precision * 100).toFixed(1)}%`, color: 'text-emerald-600' },
            { label: 'Recall', val: `${(recall * 100).toFixed(1)}%`, color: 'text-blue-600' },
            { label: 'F1 Score', val: f1.toFixed(3), color: 'text-violet-600' },
            { label: 'Detections', val: metrics.detections, color: 'text-slate-600' }
          ].map((m, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</div>
              <div className={`text-4xl font-mono font-black ${m.color}`}>{m.val}</div>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 border-l-4 border-emerald-500 pl-4">Confusion Matrix</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matrixData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {matrixData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabAnalytics;
