import { useState, useEffect, useCallback, useMemo } from 'react';
import { DisasterArticle, DisasterStats, FilterOptions } from '../types/disaster';
import { fetchDisasterFeed } from '../services/rssService';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useDisasterFeed() {
  const [articles, setArticles] = useState<DisasterArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<DisasterArticle | null>(null);

  // Filters state
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    disasterType: 'All',
    source: 'All',
    sortBy: 'newest',
  });

  const loadFeed = useCallback(async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchDisasterFeed();
      setArticles(data.articles);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to load disaster feed:', err);
      setError(err.message || 'Failed to fetch live RSS feed');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load + 5-minute interval timer
  useEffect(() => {
    loadFeed();

    const intervalId = setInterval(() => {
      console.log('[Auto Refresh] 5-minute interval triggered. Fetching updated disaster feed...');
      loadFeed(true);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadFeed]);

  // Compute KPI statistics
  const stats: DisasterStats = useMemo(() => {
    const counts: DisasterStats = {
      total: articles.length,
      flood: 0,
      cyclone: 0,
      earthquake: 0,
      wildfire: 0,
      other: 0,
    };

    articles.forEach((art) => {
      switch (art.disasterType) {
        case 'Flood':
          counts.flood++;
          break;
        case 'Cyclone':
          counts.cyclone++;
          break;
        case 'Earthquake':
          counts.earthquake++;
          break;
        case 'Wildfire':
          counts.wildfire++;
          break;
        case 'Other':
        default:
          counts.other++;
          break;
      }
    });

    return counts;
  }, [articles]);

  // Compute unique news sources for filter dropdowns
  const availableSources = useMemo(() => {
    const sources = new Set<string>();
    articles.forEach((a) => {
      if (a.source) sources.add(a.source);
    });
    return Array.from(sources).sort();
  }, [articles]);

  // Filtered & sorted articles list
  const filteredArticles = useMemo(() => {
    return articles
      .filter((art) => {
        // Search query matching title, source, or description
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = art.title.toLowerCase().includes(q);
          const matchSource = art.source.toLowerCase().includes(q);
          const matchDesc = art.description.toLowerCase().includes(q);
          if (!matchTitle && !matchSource && !matchDesc) return false;
        }

        // Disaster type filter
        if (filters.disasterType !== 'All' && art.disasterType !== filters.disasterType) {
          return false;
        }

        // Source filter
        if (filters.source !== 'All' && art.source !== filters.source) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.isoDate).getTime();
        const timeB = new Date(b.isoDate).getTime();
        return filters.sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [articles, filters]);

  return {
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
    refresh: () => loadFeed(true),
  };
}
