import React from 'react';
import { DisasterArticle, FilterOptions } from '../../types/disaster';
import { getCategoryBadgeStyle } from '../../utils/disasterClassifier';
import { Search, Filter, ArrowUpDown, Eye, Clock, Building2, MapPin, Gauge, ShieldAlert } from 'lucide-react';

interface ArticlesTableProps {
  articles: DisasterArticle[];
  allSources: string[];
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onSelectArticle: (article: DisasterArticle) => void;
}

export const ArticlesTable: React.FC<ArticlesTableProps> = ({
  articles,
  allSources,
  filters,
  setFilters,
  onSelectArticle,
}) => {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffMinutes < 60) {
        return `${Math.max(1, diffMinutes)}m ago`;
      }
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) {
        return `${diffHours}h ago`;
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Recent';
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl flex flex-col shadow-sm">
      {/* Controls Bar Above Table */}
      <div className="p-4 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/80 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>AI Disaster News & Prediction Telemetry</span>
          </h2>
          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-blue-100 text-blue-800 rounded-full border border-blue-200">
            {articles.length} alerts
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, location, or source..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors shadow-2xs"
            />
          </div>

          {/* Filter: Disaster Type */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.disasterType}
              onChange={(e) => setFilters((prev) => ({ ...prev, disasterType: e.target.value }))}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option value="All">All Disasters</option>
              <option value="Flood">Flood</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Severe Weather & Storms">Severe Weather</option>
              <option value="Wildfire & Fire">Wildfire</option>
              <option value="Drought & Extreme Heat">Drought</option>
              <option value="Industrial & Transportation Accident">Accident</option>
              <option value="Non-Disaster">Non-Disaster</option>
            </select>
          </div>

          {/* Filter: Source */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.source}
              onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value }))}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer max-w-[130px] truncate font-medium"
            >
              <option value="All">All Sources</option>
              {allSources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value as 'newest' | 'oldest' }))
              }
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-[100px]">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Time</span>
                </div>
              </th>
              <th className="py-3.5 px-4 w-[140px]">
                <div className="flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Source</span>
                </div>
              </th>
              <th className="py-3.5 px-4">Title</th>
              <th className="py-3.5 px-4 w-[140px]">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location</span>
                </div>
              </th>
              <th className="py-3.5 px-4 w-[140px]">Disaster Type</th>
              <th className="py-3.5 px-4 w-[150px]">
                <div className="flex items-center space-x-1">
                  <Gauge className="w-3.5 h-3.5 text-slate-400" />
                  <span>BERT Confidence</span>
                </div>
              </th>
              <th className="py-3.5 px-4 w-[90px]">Severity</th>
              <th className="py-3.5 px-4 text-right w-[70px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 font-normal text-slate-800">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                  No matching disaster incident reports found. Try adjusting your search filters.
                </td>
              </tr>
            ) : (
              articles.map((article) => {
                const confPct = article.confidence_percent !== undefined 
                  ? article.confidence_percent 
                  : Math.round((article.confidenceScore || article.confidence || 0.85) * 100);

                return (
                  <tr
                    key={article.id}
                    onClick={() => onSelectArticle(article)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* Time */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {formatTime(article.isoDate)}
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700 truncate max-w-[130px]">
                      {article.source}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 text-slate-900 group-hover:text-blue-600 font-bold transition-colors">
                      <div className="line-clamp-2">{article.title}</div>
                    </td>

                    {/* Location (NER Extracted) */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="truncate max-w-[130px]" title={article.location || article.state || 'India'}>
                          {article.location || article.state || 'India'}
                        </span>
                      </div>
                    </td>

                    {/* Disaster Type Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
                        {article.disasterType}
                      </span>
                    </td>

                    {/* MODEL CONFIDENCE SCORE COLUMN */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between space-x-2">
                          <span className="font-mono font-extrabold text-emerald-700 text-[12px]">
                            {confPct.toFixed(2)}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({(confPct / 100).toFixed(4)})
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              confPct >= 90
                                ? 'bg-emerald-500'
                                : confPct >= 75
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${confPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getSeverityBadge(article.severity)}`}>
                        {article.severity || 'Moderate'}
                      </span>
                    </td>

                    {/* Action button */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectArticle(article)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="View Disaster Alert Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
