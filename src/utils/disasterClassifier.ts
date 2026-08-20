import { DisasterCategory } from '../types/disaster';

export interface ClassificationResult {
  category: DisasterCategory;
  matchedKeywords: string[];
  confidence: number;
}

// Keyword dictionary for rule-based disaster classification
const KEYWORD_RULES: Record<Exclude<DisasterCategory, 'Other'>, string[]> = {
  Flood: [
    'flood', 'floods', 'flooded', 'flooding', 'inundat', 'deluge', 'submerge', 
    'heavy rain', 'downpour', 'overflow', 'waterlog'
  ],
  Cyclone: [
    'cyclone', 'cyclones', 'cyclonic', 'typhoon', 'hurricane', 'storm', 
    'depression', 'gale', 'tempest', 'landfall'
  ],
  Earthquake: [
    'earthquake', 'earthquakes', 'quake', 'tremor', 'seismic', 'aftershock', 
    'magnitude', 'richter', 'tsunami'
  ],
  Wildfire: [
    'wildfire', 'wildfires', 'bushfire', 'forest fire', 'blaze', 'firestorm', 
    'inferno', 'brushfire'
  ],
};

/**
 * Classifies an article based on title and description content using keyword matching.
 * ISOLATED UTILITY: Replace this function implementation when integrating the trained BERT model.
 */
export function classifyDisaster(title: string, description: string = ''): ClassificationResult {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const combinedText = `${titleLower} ${descLower}`;

  const categoryScores: Record<Exclude<DisasterCategory, 'Other'>, { count: number; keywords: string[] }> = {
    Flood: { count: 0, keywords: [] },
    Cyclone: { count: 0, keywords: [] },
    Earthquake: { count: 0, keywords: [] },
    Wildfire: { count: 0, keywords: [] },
  };

  // Check each category's rules
  (Object.keys(KEYWORD_RULES) as Array<keyof typeof KEYWORD_RULES>).forEach((cat) => {
    KEYWORD_RULES[cat].forEach((keyword) => {
      // Title matches carry higher weight (3x)
      if (titleLower.includes(keyword)) {
        categoryScores[cat].count += 3;
        if (!categoryScores[cat].keywords.includes(keyword)) {
          categoryScores[cat].keywords.push(keyword);
        }
      } else if (descLower.includes(keyword)) {
        categoryScores[cat].count += 1;
        if (!categoryScores[cat].keywords.includes(keyword)) {
          categoryScores[cat].keywords.push(keyword);
        }
      }
    });
  });

  // Find the category with the highest score
  let maxCategory: DisasterCategory = 'Other';
  let maxScore = 0;
  let matchedKeywords: string[] = [];

  (Object.keys(categoryScores) as Array<keyof typeof categoryScores>).forEach((cat) => {
    if (categoryScores[cat].count > maxScore) {
      maxScore = categoryScores[cat].count;
      maxCategory = cat;
      matchedKeywords = categoryScores[cat].keywords;
    }
  });

  // Calculate confidence score (normalized approximation for rule-based matching)
  const confidence = maxScore > 0 ? Math.min(0.65 + maxScore * 0.08, 0.98) : 0.40;

  return {
    category: maxCategory,
    matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : ['General Monitoring'],
    confidence: Number(confidence.toFixed(2)),
  };
}

/**
 * Returns color classes for disaster category badges (Muted enterprise style)
 */
export function getCategoryBadgeStyle(category: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const cat = (category || '').toLowerCase();
  if (cat.includes('flood')) {
    return { bg: 'bg-sky-950/60', text: 'text-sky-400', border: 'border-sky-800/60', dot: 'bg-sky-400' };
  } else if (cat.includes('earthquake')) {
    return { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/60', dot: 'bg-amber-400' };
  } else if (cat.includes('wildfire') || cat.includes('fire')) {
    return { bg: 'bg-red-950/60', text: 'text-red-400', border: 'border-red-800/60', dot: 'bg-red-400' };
  } else if (cat.includes('weather') || cat.includes('storm') || cat.includes('cyclone')) {
    return { bg: 'bg-purple-950/60', text: 'text-purple-400', border: 'border-purple-800/60', dot: 'bg-purple-400' };
  } else if (cat.includes('drought') || cat.includes('heat')) {
    return { bg: 'bg-orange-950/60', text: 'text-orange-400', border: 'border-orange-800/60', dot: 'bg-orange-400' };
  } else if (cat.includes('volcan')) {
    return { bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-800/60', dot: 'bg-rose-400' };
  } else if (cat.includes('tsunami')) {
    return { bg: 'bg-teal-950/60', text: 'text-teal-400', border: 'border-teal-800/60', dot: 'bg-teal-400' };
  } else if (cat.includes('epidemic') || cat.includes('bio')) {
    return { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60', dot: 'bg-emerald-400' };
  } else if (cat.includes('societal') || cat.includes('terror')) {
    return { bg: 'bg-pink-950/60', text: 'text-pink-400', border: 'border-pink-800/60', dot: 'bg-pink-400' };
  } else if (cat.includes('industrial') || cat.includes('accident')) {
    return { bg: 'bg-yellow-950/60', text: 'text-yellow-400', border: 'border-yellow-800/60', dot: 'bg-yellow-400' };
  } else if (cat.includes('non-disaster')) {
    return { bg: 'bg-slate-800/60', text: 'text-slate-400', border: 'border-slate-700/60', dot: 'bg-slate-400' };
  } else {
    return { bg: 'bg-indigo-950/60', text: 'text-indigo-400', border: 'border-indigo-800/60', dot: 'bg-indigo-400' };
  }
}
