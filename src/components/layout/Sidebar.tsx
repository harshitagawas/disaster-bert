import React from 'react';
import { LayoutDashboard, MapPin, Rss, BarChart3, Bot } from 'lucide-react';

export type ActivePage = 'dashboard' | 'map' | 'live-feed' | 'analytics';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  totalArticlesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  totalArticlesCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActivePage,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'map' as ActivePage,
      label: 'Disaster Map',
      icon: MapPin,
      badge: 'Live Map',
    },
    {
      id: 'live-feed' as ActivePage,
      label: 'Live Feed',
      icon: Rss,
      badge: totalArticlesCount > 0 ? totalArticlesCount : null,
    },
    {
      id: 'analytics' as ActivePage,
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-xs">
      <div>
        {/* Logo / Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            AI
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">India Disaster Intel</h1>
            <p className="text-[10px] text-slate-500 font-mono">BERT AI Monitoring</p>
          </div>
        </div>

        {/* Navigation Menu Header */}
        <div className="px-4 pt-4 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Main Navigation
        </div>

        {/* Navigation Items */}
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System info footer - Fine-Tuned BERT Status */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/80">
        <div className="flex items-center space-x-2 text-xs text-slate-700 mb-1">
          <Bot className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-900">Fine-Tuned BERT AI</span>
        </div>
        <div className="text-[11px] text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>Model Repo:</span>
            <span className="text-blue-700 font-mono font-semibold text-[10px]">harry2708/disaster-bert</span>
          </div>
          <div className="flex justify-between">
            <span>Compute Device:</span>
            <span className="text-emerald-700 font-semibold font-mono">CUDA GPU</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
