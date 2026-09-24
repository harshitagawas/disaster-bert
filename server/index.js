import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/doc/doc?query=' + 
  encodeURIComponent('(flood OR earthquake OR cyclone OR hurricane OR wildfire OR landslide OR tsunami OR drought OR "heat wave" OR cloudburst OR disaster) India sourcelang:english') +
  '&mode=ArtList&maxrecords=50&format=json&sort=DateDesc';

app.use(cors());
app.use(express.json());

/**
 * Strict English validator to filter non-English content and foreign domains.
 */
function isStrictEnglish(title = '', domain = '') {
  if (!title || title.trim().length < 8) return false;
  // CJK, Cyrillic, Arabic check
  if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff]/.test(title)) {
    return false;
  }
  const blocked = ['.cn', '163.com', 'sina.com', 'qq.com', 'sohu.com', 'xinhuanet', 'people.com.cn', 'baidu.com'];
  if (blocked.some(b => domain.toLowerCase().includes(b))) {
    return false;
  }
  const asciiCount = title.split('').filter(c => /^[\x20-\x7E]$/.test(c)).length;
  return (asciiCount / title.length) >= 0.85;
}

function parseGdeltDate(dateStr) {
  if (!dateStr || dateStr.length < 8) {
    const now = new Date();
    return { pubDate: now.toUTCString(), isoDate: now.toISOString() };
  }
  try {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const hour = dateStr.slice(9, 11) || '00';
    const min = dateStr.slice(11, 13) || '00';
    const sec = dateStr.slice(13, 15) || '00';
    const iso = `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
    const d = new Date(iso);
    return { pubDate: d.toUTCString(), isoDate: d.toISOString() };
  } catch (e) {
    const now = new Date();
    return { pubDate: now.toUTCString(), isoDate: now.toISOString() };
  }
}

app.get('/api/rss', async (req, res) => {
  try {
    const response = await fetch(GDELT_API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`GDELT API responded with HTTP status ${response.status}`);
    }

    const data = await response.json();
    const rawArticles = data.articles || [];
    const filtered = rawArticles.filter(a => isStrictEnglish(a.title || '', a.domain || a.source || ''));

    const articles = filtered.map((item, index) => {
      const title = item.title || 'Untitled Disaster Incident';
      const source = item.domain || item.source || 'Global News';
      const dates = parseGdeltDate(item.seendate);

      return {
        id: item.url || `gdelt-node-${index}-${Date.now()}`,
        title,
        link: item.url || '#',
        pubDate: dates.pubDate,
        isoDate: dates.isoDate,
        source,
        creator: source,
        description: title,
        imageUrl: item.socialimage || null,
        contentRaw: title,
      };
    });

    res.json({
      status: 'ok',
      feedTitle: 'GDELT 2.0 Live Disaster Intelligence Feed',
      lastFetched: new Date().toISOString(),
      totalArticles: articles.length,
      items: articles,
    });
  } catch (error) {
    console.error('[server] Error fetching GDELT feed:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch live disaster feed from GDELT',
      error: error.message,
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'GDELT 2.0 Feed Proxy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[GDELT Server] Listening on http://localhost:${PORT}`);
  console.log(`[GDELT Server] Live Stream: GDELT 2.0 Global Intelligence Feed`);
});
