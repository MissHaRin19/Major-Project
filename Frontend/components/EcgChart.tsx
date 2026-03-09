
import React from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis, CartesianGrid } from 'recharts';

interface EcgChartProps {
  data: number[];
  isAlert: boolean;
}

const EcgChart: React.FC<EcgChartProps> = ({ data, isAlert }) => {
  // Ensure the data array is always full to prevent X-axis jitter
  const paddedData = [...Array(160).fill(0), ...data].slice(-160);
  const chartData = paddedData.map((val, idx) => ({ idx, val }));

  return (
    <div className={`h-48 w-full rounded-lg bg-black p-2 border-2 transition-colors duration-500 ${isAlert ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-emerald-900/50'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2e23" vertical={false} />
          {/* Fixed Y domain is critical to prevent the wave from "dancing" vertically */}
          <YAxis domain={[-0.6, 1.6]} hide />
          <Line 
            type="monotone" 
            dataKey="val" 
            stroke={isAlert ? "#ff4444" : "#00ff41"} 
            strokeWidth={2.5} 
            dot={false}
            isAnimationActive={false} // Disable animation to prevent "dancing"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EcgChart;
