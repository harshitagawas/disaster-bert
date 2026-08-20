import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DisasterStats } from '../../types/disaster';
import { PieChart as PieIcon } from 'lucide-react';

interface DistributionChartProps {
  stats: DisasterStats;
}

const CATEGORY_COLORS = {
  Flood: '#0284c7',       // Sky Blue
  Cyclone: '#8b5cf6',     // Purple
  Earthquake: '#f59e0b',  // Amber
  Wildfire: '#ef4444',    // Red
  Other: '#64748b',       // Slate
};

export const DistributionChart: React.FC<DistributionChartProps> = ({ stats }) => {
  const data = [
    { name: 'Flood', value: stats.flood, color: CATEGORY_COLORS.Flood },
    { name: 'Cyclone', value: stats.cyclone, color: CATEGORY_COLORS.Cyclone },
    { name: 'Earthquake', value: stats.earthquake, color: CATEGORY_COLORS.Earthquake },
    { name: 'Wildfire', value: stats.wildfire, color: CATEGORY_COLORS.Wildfire },
    { name: 'Other', value: stats.other, color: CATEGORY_COLORS.Other },
  ].filter((d) => d.value > 0);

  // Fallback if all 0
  const displayData = data.length > 0 ? data : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between h-[340px] shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <PieIcon className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Disaster Category Distribution</h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">BERT Breakdown</span>
      </div>

      <div className="w-full h-[250px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="48%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataItem = payload[0];
                  return (
                    <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-md text-xs font-sans">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: dataItem.payload.color }}
                        ></span>
                        <span className="font-bold text-slate-800">{dataItem.name}:</span>
                        <span className="font-mono text-slate-900 font-extrabold">{dataItem.value} articles</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-slate-700 font-semibold px-1">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
