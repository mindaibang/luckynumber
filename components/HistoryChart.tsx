
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { HistoryItem } from '../types';

interface HistoryChartProps {
  history: HistoryItem[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
  const chartData = useMemo(() => {
    if (history.length === 0) return [];

    const allNumbers = history.flatMap(item => item.results);
    if (allNumbers.length === 0) return [];

    const min = Math.min(...allNumbers);
    const max = Math.max(...allNumbers);
    
    const binCount = 6;
    const range = max - min;
    const binSize = range === 0 ? 1 : Math.ceil((range + 1) / binCount);
    
    const bins = Array.from({ length: binCount }, (_, i) => {
      const start = min + i * binSize;
      const end = Math.min(max, start + binSize - 1);
      return {
        name: start === end ? `${start}` : `${start}-${end}`,
        start,
        end,
        count: 0
      };
    });

    allNumbers.forEach(num => {
      const binIndex = Math.min(binCount - 1, Math.floor((num - min) / binSize));
      if (binIndex >= 0 && bins[binIndex]) {
        bins[binIndex].count++;
      }
    });

    return bins.filter(b => b.start <= max);
  }, [history]);

  if (history.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center opacity-20">
      <div className="text-3xl mb-2">📊</div>
      <p className="text-[10px] font-bold uppercase">Thống kê trống</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h2 className="text-[10px] font-black text-slate-500 uppercase mb-6 flex items-center gap-2">
        Phân phối quả cầu
      </h2>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -35, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#475569', fontSize: 9, fontWeight: '700' }}
              interval={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#475569', fontSize: 9 }} 
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: '#0f172a' }}
              contentStyle={{ 
                backgroundColor: '#020617',
                borderRadius: '8px', 
                border: '1px solid #1e293b', 
                fontSize: '10px',
                fontWeight: '700'
              }}
              labelStyle={{ color: '#6366f1' }}
            />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#4f46e5' : '#1e293b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[8px] text-slate-600 mt-4 text-center font-bold italic uppercase">Tần suất xuất hiện theo khu vực</p>
    </div>
  );
};

export default HistoryChart;
