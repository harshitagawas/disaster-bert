import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DisasterArticle } from '../../types/disaster';
import { BarChart2 } from 'lucide-react';

interface SourceChartProps {
  articles: DisasterArticle[];
}

export const SourceChart: React.FC<SourceChartProps> = ({ articles }) => {
  // Aggregate articles per source
  const sourceCounts: Record<string, number> = {};
  articles.forEach((a) => {
    const src = a.source || 'Unknown';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  // Sort and take top 6
  const data = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between h-[340px] shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">News Volume by Publisher</h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Top Publishers</span>
      </div>

      <div className="w-full h-[250px] pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="source"
              stroke="#94a3b8"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-md text-xs font-sans">
                      <div className="font-bold text-slate-800">{item.source}</div>
                      <div className="text-blue-600 font-mono font-extrabold mt-0.5">{item.count} articles published</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
