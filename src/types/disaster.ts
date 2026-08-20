export type DisasterCategory = 
  | 'Drought & Extreme Heat'
  | 'Earthquake'
  | 'Epidemic & Biological'
  | 'Flood'
  | 'General & Other Disaster'
  | 'Industrial & Transportation Accident'
  | 'Non-Disaster'
  | 'Severe Weather & Storms'
  | 'Societal Event & Terrorism'
  | 'Tsunami'
  | 'Volcanic Eruption'
  | 'Wildfire & Fire'
  | 'Cyclone'
  | 'Landslide'
  | 'Cloudburst'
  | 'Extreme Rainfall'
  | string;

export interface DisasterArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  isoDate: string;
  source: string;
  creator: string;
  description: string;
  imageUrl: string | null;
  disasterType: DisasterCategory;
  disaster_type?: string;
  matchedKeywords: string[];
  confidenceScore: number;
  confidence?: number;
  confidence_percent?: number;
  // Enhanced Location, Geocoding & Severity Data
  location?: string;
  state?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  severity?: 'Critical' | 'High' | 'Moderate' | 'Low';
  isDuplicate?: boolean;
}

export interface FilterOptions {
  searchQuery: string;
  disasterType: string;
  source: string;
  sortBy: 'newest' | 'oldest';
  severity?: string;
}

export interface DisasterStats {
  total: number;
  flood: number;
  cyclone: number;
  earthquake: number;
  wildfire: number;
  other: number;
  [key: string]: number;
}

export interface KeywordFrequency {
  keyword: string;
  count: number;
  category: DisasterCategory;
}

export interface SourceCount {
  source: string;
  count: number;
}

export interface TimelineDataPoint {
  date: string;
  Flood?: number;
  Cyclone?: number;
  Earthquake?: number;
  Wildfire?: number;
  Other?: number;
  Total: number;
  [key: string]: any;
}
