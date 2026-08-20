import React from 'react';
import { DisasterArticle } from '../../types/disaster';
import { getCategoryBadgeStyle } from '../../utils/disasterClassifier';
import { ExternalLink, Clock, Building2, Tag, Eye, MapPin, Gauge, ShieldAlert } from 'lucide-react';

interface LiveFeedTimelineProps {
  articles: DisasterArticle[];
  onSelectArticle: (article: DisasterArticle) => void;
}

export const LiveFeedTimeline: React.FC<LiveFeedTimelineProps> = ({
  articles,
  onSelectArticle,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <span>AI Disaster Alert Live Stream</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time chronological feed of GDELT news articles processed through fine-tuned BERT classification, NER, and Geocoding.
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-mono font-semibold bg-blue-50 text-blue-800 border border-blue-200 rounded-full">
          {articles.length} Live Alerts
        </span>
      </div>

      {/* Timeline Container */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6">
        {articles.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-sans">
            No active disaster feed items found matching criteria.
          </div>
        ) : (
          articles.map((article) => {
            const confPct = article.confidence_percent !== undefined
              ? article.confidence_percent
              : Math.round((article.confidenceScore || article.confidence || 0.85) * 100);

            return (
              <div key={article.id} className="relative group">
                {/* Timeline Dot Indicator */}
                <div
                  className="absolute -left-[31px] sm:-left-[39px] top-2 w-4 h-4 rounded-full border-2 border-white bg-blue-600 group-hover:scale-125 transition-transform shadow-xs"
                />

                {/* Article Card (Light Theme) */}
                <div className="bg-white border border-slate-200/80 hover:border-blue-400 rounded-xl p-5 shadow-xs transition-all hover:shadow-md">
                  {/* Card Top Metadata Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                    <div className="flex items-center space-x-3 text-slate-500">
                      <span className="flex items-center space-x-1 font-mono font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(article.isoDate)}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center space-x-1 font-bold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{article.source}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center space-x-1 text-slate-800 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        <span>{article.location || article.state || 'India'}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Severity Badge */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getSeverityBadge(article.severity)}`}>
                        {article.severity || 'Moderate'}
                      </span>

                      {/* Disaster Badge */}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
                        {article.disasterType}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onSelectArticle(article)}
                    className="text-base font-extrabold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer mb-2 leading-snug"
                  >
                    {article.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 font-normal">
                    {article.description}
                  </p>

                  {/* Card Footer: Model Confidence Score & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    {/* Model Confidence Score Display */}
                    <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-slate-600 text-[11px] font-medium">BERT Model Confidence:</span>
                      <span className="font-mono font-extrabold text-emerald-700 text-[12px]">
                        {confPct.toFixed(2)}%
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectArticle(article)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Alert</span>
                      </button>

                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <span>Original Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
