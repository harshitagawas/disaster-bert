import { DisasterArticle } from '../types/disaster';
import { classifyDisaster } from '../utils/disasterClassifier';

const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/doc/doc?query=' + 
  encodeURIComponent('(flood OR earthquake OR cyclone OR hurricane OR wildfire OR landslide OR tsunami OR drought OR "heat wave" OR cloudburst OR disaster) India sourcelang:english') +
  '&mode=ArtList&maxrecords=50&format=json&sort=DateDesc';

export interface RssFetchResponse {
  articles: DisasterArticle[];
  lastFetched: string;
  feedTitle: string;
}

/**
 * Strict English validator to filter out foreign Chinese/Asian non-English news.
 */
function isStrictEnglishArticle(title: string, domain: string = ''): boolean {
  if (!title || title.trim().length < 8) return false;

  // Filter CJK (Chinese, Japanese, Korean), Cyrillic, and Arabic characters
  if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff]/.test(title)) {
    return false;
  }

  // Filter non-English domains
  const blockedDomains = ['.cn', '163.com', 'sina.com', 'qq.com', 'sohu.com', 'xinhuanet', 'people.com.cn', 'baidu.com'];
  if (blockedDomains.some(b => domain.toLowerCase().includes(b))) {
    return false;
  }

  // Ensure high ASCII character ratio (>= 85% English letters & symbols)
  const asciiCount = title.split('').filter(c => /^[\x20-\x7E]$/.test(c)).length;
  return (asciiCount / title.length) >= 0.85;
}

/**
 * Direct client-side GDELT DOC 2.0 API fallback if backend proxy server is unreachable.
 */
async function fetchGdeltFallback(): Promise<RssFetchResponse> {
  const response = await fetch(GDELT_API_URL);
  
  if (!response.ok) {
    throw new Error(`HTTP error fetching GDELT API! status: ${response.status}`);
  }

  const data = await response.json();
  const rawItems = data.articles || [];
  const items = rawItems.filter((item: any) => isStrictEnglishArticle(item.title || '', item.domain || ''));

  const articles: DisasterArticle[] = items.map((item: any, index: number) => {
    const title = item.title || 'Untitled Disaster Incident';
    const link = item.url || '#';
    const pubDateStr = item.seendate || new Date().toISOString();
    const source = item.domain || item.source || 'Global News';
    const imageUrl = item.socialimage || null;
    
    // Classify using rule-based fallback if backend offline
    const classification = classifyDisaster(title, title);

    return {
      id: item.url || `gdelt-fb-${index}-${Date.now()}`,
      title,
      link,
      pubDate: pubDateStr,
      isoDate: new Date().toISOString(),
      source,
      creator: source,
      description: title,
      imageUrl,
      disasterType: classification.category,
      matchedKeywords: classification.matchedKeywords,
      confidenceScore: classification.confidence,
    };
  });

  return {
    articles,
    lastFetched: new Date().toISOString(),
    feedTitle: 'GDELT 2.0 Live Disaster Intelligence Feed',
  };
}

/**
 * Main service method to fetch real-time disaster news from GDELT + fine-tuned BERT backend.
 */
export async function fetchDisasterFeed(): Promise<RssFetchResponse> {
  try {
    // Fetch from FastAPI backend (/api/rss) which ingests GDELT and predicts with fine-tuned BERT
    const response = await fetch('/api/rss', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok' && Array.isArray(data.items)) {
        // Filter strict English titles
        const validItems = data.items.filter((item: any) => isStrictEnglishArticle(item.title || '', item.source || ''));

        const articles: DisasterArticle[] = validItems.map((item: any) => {
          const bertClass = item.disasterType || item.disaster_type || 'General & Other Disaster';
          const confidence = item.confidenceScore !== undefined ? item.confidenceScore : (item.confidence !== undefined ? item.confidence : 0.85);
          const confidencePct = item.confidence_percent !== undefined ? item.confidence_percent : Math.round(confidence * 100);
          
          return {
            id: item.id,
            title: item.title,
            link: item.link || item.url || '#',
            pubDate: item.pubDate,
            isoDate: item.isoDate,
            source: item.source,
            creator: item.creator,
            description: item.description || item.title,
            imageUrl: item.imageUrl,
            disasterType: bertClass,
            disaster_type: bertClass,
            matchedKeywords: item.matchedKeywords || [`BERT AI (${confidencePct}%)`],
            confidenceScore: confidence,
            confidence_percent: confidencePct,
            location: item.location,
            state: item.state,
            district: item.district,
            latitude: item.latitude,
            longitude: item.longitude,
            severity: item.severity,
            isDuplicate: item.isDuplicate
          };
        });

        return {
          articles,
          lastFetched: data.lastFetched || new Date().toISOString(),
          feedTitle: data.feedTitle || 'GDELT 2.0 Live Disaster Intelligence Feed',
        };
      }
    }
    
    console.warn('Backend GDELT-BERT proxy unreachable. Switching to direct GDELT API fallback...');
    return await fetchGdeltFallback();
  } catch (err) {
    console.warn('Error connecting to backend GDELT-BERT proxy:', err);
    return await fetchGdeltFallback();
  }
}
