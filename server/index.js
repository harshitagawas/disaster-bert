import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';

const app = express();
const PORT = process.env.PORT || 3001;
const RSS_FEED_URL = 'https://rss.app/feeds/xW4HdAH1eJAyriQT.xml';

app.use(cors());
app.use(express.json());

const parser = new Parser({
  customFields: {
    item: [
      ['dc:creator', 'creator'],
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent'],
    ],
  },
});

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImage(item) {
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url;
  }
  const rawContent = item.contentEncoded || item.content || item.description || '';
  const imgMatch = rawContent.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  return null;
}

function extractSource(item, feedTitle) {
  if (item.creator && typeof item.creator === 'string' && item.creator.trim()) {
    return item.creator.trim();
  }
  if (item.title && item.title.includes(' - ')) {
    const parts = item.title.split(' - ');
    if (parts.length > 1) {
      const candidate = parts[parts.length - 1].trim();
      if (candidate.length > 2 && candidate.length < 40) {
        return candidate;
      }
    }
  }
  if (item.link) {
    try {
      const url = new URL(item.link);
      let host = url.hostname.replace(/^www\./, '');
      const domainParts = host.split('.');
      if (domainParts.length >= 2) {
        return domainParts[0].toUpperCase();
      }
      return host;
    } catch (e) {
      // ignore
    }
  }
  return feedTitle || 'Global News';
}

app.get('/api/rss', async (req, res) => {
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    
    const articles = (feed.items || []).map((item, index) => {
      const rawDesc = item.description || item.contentSnippet || item.contentEncoded || '';
      const cleanDesc = stripHtml(rawDesc);
      const imageUrl = extractImage(item);
      const source = extractSource(item, feed.title);
      
      let cleanTitle = item.title || 'Untitled Disaster Incident';

      return {
        id: item.guid || item.id || `article-${index}-${Date.now()}`,
        title: cleanTitle,
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        isoDate: item.isoDate || (item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()),
        source: source,
        creator: item.creator || source,
        description: cleanDesc || 'No summary available for this disaster report.',
        imageUrl: imageUrl,
        contentRaw: rawDesc,
      };
    });

    res.json({
      status: 'ok',
      feedTitle: feed.title || 'Google News - Disaster Feed',
      lastFetched: new Date().toISOString(),
      totalArticles: articles.length,
      items: articles,
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch live RSS feed from source',
      error: error.message,
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[RSS Backend Server] Listening on http://localhost:${PORT}`);
  console.log(`[RSS Backend Server] Polling source: ${RSS_FEED_URL}`);
});
