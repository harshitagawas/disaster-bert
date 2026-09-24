import React from 'react';
import { RefreshCw, Radio, Clock } from 'lucide-react';

interface HeaderProps {
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  totalArticles: number;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  isRefreshing,
  onRefresh,
  totalArticles,
}) => {
  const formatTime = (date: Date | null) => {
    if (!date) return 'Updating...';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 py-4 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Title Block */}
        <div className="flex items-start space-x-3.5">
          <img
            src="/logo.png"
            alt="CrisisTrace Logo"
            className="w-11 h-11 object-contain rounded-xl shrink-0 p-1 bg-white border border-slate-200/90 shadow-xs mt-0.5"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                CrisisTrace
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                LIVE GDELT + BERT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Real-time Indian disaster news monitoring, fine-tuned BERT classification, NER spatial extraction & geocoding.
            </p>
          </div>
        </div>

        {/* Right Status & Action Controls */}
        <div className="flex items-center space-x-4 self-end md:self-auto">
          {/* Feed Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="font-semibold text-slate-700">Pipeline Active</span>
            <span className="text-slate-300">|</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated: {formatTime(lastUpdated)}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:bg-slate-100 border border-slate-300 rounded-lg transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            title="Refresh GDELT live feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
