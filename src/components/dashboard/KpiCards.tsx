import React from 'react';
import { DisasterStats } from '../../types/disaster';
import { Layers, Waves, Wind, Activity, HelpCircle } from 'lucide-react';

interface KpiCardsProps {
  stats: DisasterStats;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Articles',
      count: stats.total,
      icon: Layers,
      colorClass: 'text-blue-600',
      borderClass: 'border-slate-200',
      bgClass: 'bg-white',
      subtext: 'Ingested from live feed',
    },
    {
      title: 'Flood Articles',
      count: stats.flood,
      icon: Waves,
      colorClass: 'text-sky-600',
      borderClass: 'border-sky-200',
      bgClass: 'bg-sky-50/50',
      subtext: `${stats.total > 0 ? Math.round((stats.flood / stats.total) * 100) : 0}% of total feed`,
    },
    {
      title: 'Cyclone Articles',
      count: stats.cyclone,
      icon: Wind,
      colorClass: 'text-purple-600',
      borderClass: 'border-purple-200',
      bgClass: 'bg-purple-50/50',
      subtext: `${stats.total > 0 ? Math.round((stats.cyclone / stats.total) * 100) : 0}% of total feed`,
    },
    {
      title: 'Earthquake Articles',
      count: stats.earthquake,
      icon: Activity,
      colorClass: 'text-amber-600',
      borderClass: 'border-amber-200',
      bgClass: 'bg-amber-50/50',
      subtext: `${stats.total > 0 ? Math.round((stats.earthquake / stats.total) * 100) : 0}% of total feed`,
    },
    {
      title: 'Other Disasters',
      count: stats.wildfire + stats.other,
      icon: HelpCircle,
      colorClass: 'text-slate-600',
      borderClass: 'border-slate-200',
      bgClass: 'bg-slate-50/50',
      subtext: `Wildfire (${stats.wildfire}) + Other (${stats.other})`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl border ${card.borderClass} ${card.bgClass} flex flex-col justify-between hover:border-slate-300 transition-all shadow-2xs hover:shadow-xs`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
                  {card.title}
                </span>
                <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-slate-100">
                  <Icon className={`w-4 h-4 ${card.colorClass}`} />
                </div>
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {card.count}
                </span>
              </div>
            </div>
            <div className="mt-3 text-[11px] font-medium text-slate-500 flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span>{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
