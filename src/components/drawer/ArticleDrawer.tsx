import React from 'react';
import { DisasterArticle } from '../../types/disaster';
import {
  X, ExternalLink, Clock, Building2, Tag, Bot, Sparkles,
  AlertTriangle, ShieldAlert, Cpu, CheckCircle2, MapPin, Gauge, Layers
} from 'lucide-react';

interface ArticleDrawerProps {
  article: DisasterArticle | null;
  onClose: () => void;
}

export const ArticleDrawer: React.FC<ArticleDrawerProps> = ({ article, onClose }) => {
  if (!article) return null;

  const confPct = article.confidence_percent !== undefined
    ? article.confidence_percent
    : Math.round((article.confidenceScore || article.confidence || 0.85) * 100);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString([], {
        weekday: 'long',
        year: 'numeric',
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      {/* Backdrop click listener */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Drawer Panel (Light Theme) */}
      <div className="relative w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl h-full flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-20">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                AI Disaster Intelligence Inspection
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Title & Metadata Header */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mr-1.5"></span>
                  {article.disasterType}
                </span>

                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${getSeverityBadge(article.severity)}`}>
                  {article.severity || 'Moderate'} Severity
                </span>

                <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                  BERT AI Active
                </span>
              </div>

              <h1 className="text-lg font-extrabold text-slate-900 leading-snug">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 border-y border-slate-200 py-2.5">
                <div className="flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">{article.source}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(article.isoDate)}</span>
                </div>
              </div>
            </div>

            {/* Description / Content Preview */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Article News Summary
              </h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-normal shadow-2xs">
                {article.description}
              </div>
            </div>

            {/* BERT MODEL CONFIDENCE SCORE & CLASSIFICATION */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900">Fine-Tuned BERT Model Intelligence</h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Classified (harry2708/disaster-bert)
                </span>
              </div>

              {/* Confidence Score Gauge */}
              <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-slate-700 font-bold">Model Confidence Score</span>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-emerald-700">
                    {confPct.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${confPct}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold">Disaster Category</span>
                  <span className="font-extrabold text-slate-900">{article.disasterType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold">Severity Rating</span>
                  <span className="font-extrabold text-slate-900">{article.severity || 'Moderate'}</span>
                </div>
              </div>
            </div>

            {/* NER LOCATION EXTRACTION & GEOCODING */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <h3 className="text-xs font-bold text-slate-900">NER Location Extraction & Geocoding</h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 rounded">
                  Spatial Intel
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-medium">Extracted Location:</span>
                  <span className="font-bold text-slate-900">{article.location || article.state || 'India'}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-medium">State / District:</span>
                  <span className="font-bold text-slate-900">{article.state || 'India'} / {article.district || 'National'}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs font-mono">
                  <span className="text-slate-500 font-sans font-medium">Geocoded Coordinates:</span>
                  <span className="text-blue-700 font-bold">
                    {article.latitude ? `${article.latitude.toFixed(4)}° N, ${article.longitude?.toFixed(4)}° E` : '20.5937° N, 78.9629° E'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 font-medium">Duplicate Alert Detection:</span>
                  </div>
                  <span className={`font-bold ${article.isDuplicate ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {article.isDuplicate ? 'Duplicate Event Report' : 'Unique Incident Alert'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <span>Read Original Source Article</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
