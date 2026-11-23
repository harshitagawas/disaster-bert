import React, { useState } from 'react';
import { useDisasterFeed } from './hooks/useDisasterFeed';
import { Header } from './components/layout/Header';
import { Sidebar, ActivePage } from './components/layout/Sidebar';
import { KpiCards } from './components/dashboard/KpiCards';
import { DistributionChart } from './components/dashboard/DistributionChart';
import { SourceChart } from './components/dashboard/SourceChart';
import { ArticlesTable } from './components/dashboard/ArticlesTable';
import { IndiaDisasterMap } from './components/dashboard/IndiaDisasterMap';
import { LiveFeedTimeline } from './components/feed/LiveFeedTimeline';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ArticleDrawer } from './components/drawer/ArticleDrawer';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  const {
    articles,
    filteredArticles,
    stats,
    availableSources,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    selectedArticle,
    setSelectedArticle,
    filters,
    setFilters,
    refresh,
  } = useDisasterFeed();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        totalArticlesCount={articles.length}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={refresh}
          totalArticles={articles.length}
        />

        {/* Main Body Content Scroll Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Loading state indicator on first load */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">
                  Ingesting Live GDELT Disaster News & Processing BERT Inference...
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  GDELT DOC 2.0 API ➔ Fine-Tuned BERT ➔ Indian Spatial NER ➔ Geocoding
                </p>
              </div>
            </div>
          ) : error ? (
            /* Error alert state */
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center space-x-2 text-red-700 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Live Feed Ingestion Error</span>
              </div>
              <p className="text-xs text-red-600 font-sans">{error}</p>
              <button
                onClick={refresh}
                className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Fetching Live Feed</span>
              </button>
            </div>
          ) : (
            /* Main Content Views */
            <>
              {/* PAGE 1: MAIN DASHBOARD */}
              {activePage === 'dashboard' && (
                <div className="space-y-6">
                  {/* KPI Metric Cards */}
                  <KpiCards stats={stats} />

                  {/* Row 1 Charts */}
                  {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
                    {/* <DistributionChart stats={stats} />
                    <SourceChart articles={articles} /> */}
                  {/* </div> */}

                  {/* Recent Articles Telemetry Table */}
                  <ArticlesTable
                    articles={filteredArticles}
                    allSources={availableSources}
                    filters={filters}
                    setFilters={setFilters}
                    onSelectArticle={setSelectedArticle}
                  />
                </div>
              )}

              {/* PAGE 2: DISASTER MAP (SEPARATE PAGE) */}
              {activePage === 'map' && (
                <div className="space-y-6">
                  <IndiaDisasterMap
                    articles={filteredArticles}
                    onSelectArticle={setSelectedArticle}
                  />
                </div>
              )}

              {/* PAGE 3: LIVE FEED TIMELINE */}
              {activePage === 'live-feed' && (
                <LiveFeedTimeline
                  articles={filteredArticles}
                  onSelectArticle={setSelectedArticle}
                />
              )}

              {/* PAGE 4: ANALYTICS */}
              {activePage === 'analytics' && (
                <AnalyticsView articles={articles} stats={stats} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Right-side Article Inspection Drawer */}
      <ArticleDrawer
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
};

export default App;
