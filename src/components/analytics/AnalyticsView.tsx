import React from 'react';
import { DisasterArticle, DisasterStats } from '../../types/disaster';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Tag, Building2, Layers } from 'lucide-react';

interface AnalyticsViewProps {
  articles: DisasterArticle[];
  stats: DisasterStats;
}

const CATEGORY_COLORS: Record<string, string> = {
  Flood: '#0284c7',
  Cyclone: '#8b5cf6',
  Earthquake: '#f59e0b',
  Wildfire: '#ef4444',
  Other: '#64748b',
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ articles, stats }) => {
  // 1. Disaster Distribution Data
  const distributionData = [
    { name: 'Flood', value: stats.flood, color: CATEGORY_COLORS.Flood },
    { name: 'Cyclone', value: stats.cyclone, color: CATEGORY_COLORS.Cyclone },
    { name: 'Earthquake', value: stats.earthquake, color: CATEGORY_COLORS.Earthquake },
    { name: 'Wildfire', value: stats.wildfire, color: CATEGORY_COLORS.Wildfire },
    { name: 'Other', value: stats.other, color: CATEGORY_COLORS.Other },
  ].filter((d) => d.value > 0);

  // 2. Articles By Source Data
  const sourceMap: Record<string, number> = {};
  articles.forEach((a) => {
    sourceMap[a.source] = (sourceMap[a.source] || 0) + 1;
  });
  const sourcesData = Object.entries(sourceMap)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 3. Articles By Day / Time Data
  const dayMap: Record<string, number> = {};
  articles.forEach((a) => {
    try {
      const day = new Date(a.isoDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
      dayMap[day] = (dayMap[day] || 0) + 1;
    } catch (e) {
      // ignore
    }
  });
  const dayData = Object.entries(dayMap)
    .map(([date, count]) => ({ date, count }))
    .reverse();

  // 4. Keyword Frequency Data
  const keywordMap: Record<string, number> = {};
  articles.forEach((a) => {
    a.matchedKeywords.forEach((kw) => {
      if (!kw.includes('BERT AI')) {
        keywordMap[kw] = (keywordMap[kw] || 0) + 1;
      }
    });
  });
  const keywordData = Object.entries(keywordMap)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 5. Top Sources List
  const topSources = sourcesData.slice(0, 5);

  // 6. Top Disaster Types List
  const topDisasters = [
    { type: 'Flood', count: stats.flood, color: CATEGORY_COLORS.Flood },
    { type: 'Cyclone', count: stats.cyclone, color: CATEGORY_COLORS.Cyclone },
    { type: 'Earthquake', count: stats.earthquake, color: CATEGORY_COLORS.Earthquake },
    { type: 'Wildfire', count: stats.wildfire, color: CATEGORY_COLORS.Wildfire },
    { type: 'Other', count: stats.other, color: CATEGORY_COLORS.Other },
  ].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-extrabold text-slate-900">AI Disaster Intelligence Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time statistical visual breakdown derived strictly from GDELT + fine-tuned BERT telemetry.
        </p>
      </div>

      {/* Grid of 6 Analytics Widgets (Light Mode) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Disaster Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between h-[340px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Disaster Category Distribution</h3>
            </div>
          </div>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData.length ? distributionData : [{ name: 'None', value: 1, color: '#e2e8f0' }]}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 2: Articles By Source */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between h-[340px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Articles By Source</h3>
            </div>
          </div>
          <div className="w-full h-[250px] pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourcesData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="source" stroke="#94a3b8" tick={{ fill: '#475569', fontSize: 10 }} interval={0} angle={-30} textAnchor="end" />
                <YAxis stroke="#94a3b8" tick={{ fill: '#475569', fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 3: Articles By Day */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between h-[340px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Ingestion Volume Over Time</h3>
            </div>
          </div>
          <div className="w-full h-[250px] pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dayData.length ? dayData : [{ date: 'Today', count: stats.total }]} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#475569', fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#475569', fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#10b981" fill="#d1fae5" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 4: Keyword Frequency */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between h-[340px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Keyword Frequency</h3>
            </div>
          </div>
          <div className="w-full h-[250px] pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={keywordData.length ? keywordData : [{ keyword: 'flood', count: stats.flood }]} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#475569', fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="keyword" type="category" stroke="#94a3b8" tick={{ fill: '#475569', fontSize: 11 }} width={70} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 5: Top News Sources */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between h-[340px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Top News Publishers</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">By Count</span>
          </div>
          <div className="space-y-3 pt-2">
            {topSources.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 truncate max-w-[170px]">
                  {idx + 1}. {item.source}
                </span>
                <span className="font-mono font-extrabold text-blue-700">{item.count} articles</span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 6: Top Disaster Types Matrix */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between h-[340px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-slate-900">Disaster Category Ratios</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Telemetry</span>
          </div>
          <div className="space-y-3 pt-2">
            {topDisasters.map((item, idx) => {
              const pct = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.type}</span>
                    <span className="text-slate-600 font-mono">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
