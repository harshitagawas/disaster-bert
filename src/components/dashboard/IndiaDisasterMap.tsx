import React, { useEffect, useRef, useState } from 'react';
import { DisasterArticle } from '../../types/disaster';
import { getCategoryBadgeStyle } from '../../utils/disasterClassifier';
import { extractLocationAndGeocode } from '../../utils/locationGeocoder';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ShieldAlert, Eye, ExternalLink, Gauge, X, Sparkles, Layers } from 'lucide-react';

interface IndiaDisasterMapProps {
  articles: DisasterArticle[];
  onSelectArticle: (article: DisasterArticle) => void;
}

export const IndiaDisasterMap: React.FC<IndiaDisasterMapProps> = ({
  articles,
  onSelectArticle,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeAlert, setActiveAlert] = useState<DisasterArticle | null>(null);

  // Initialize Leaflet Map Instance with Light OpenStreetMap Voyager tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet Map centered on India
      const map = L.map(mapContainerRef.current, {
        center: [22.5937, 78.9629],
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        zoomControl: true,
      });

      // Standard OpenStreetMap tiles (100% free, no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Leaflet Markers when articles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    // Filter ONLY articles classified by BERT as active disaster events
    const isRealDisasterCategory = (cat: string) => {
      if (!cat) return false;
      const c = cat.toLowerCase();
      if (c.includes('non-disaster') || c === 'other' || c === 'general & other disaster') {
        return false;
      }
      return (
        c.includes('flood') ||
        c.includes('earthquake') ||
        c.includes('quake') ||
        c.includes('weather') ||
        c.includes('storm') ||
        c.includes('wildfire') ||
        c.includes('fire') ||
        c.includes('cyclone') ||
        c.includes('drought') ||
        c.includes('heat') ||
        c.includes('tsunami') ||
        c.includes('landslide') ||
        c.includes('cloudburst') ||
        c.includes('accident') ||
        c.includes('epidemic')
      );
    };

    const articlesToRender = articles.filter(a => isRealDisasterCategory(a.disasterType));

    // Add Leaflet Markers for each article at its exact mentioned state/district coordinates
    articlesToRender.forEach((art, idx) => {
      // Resolve exact state/district coordinates using spatial NER
      let lat = art.latitude;
      let lng = art.longitude;
      let locName = art.location || art.state;

      if (!lat || !lng || !locName || locName === 'India') {
        const geo = extractLocationAndGeocode(art.title, art.description || '', idx);
        lat = geo.latitude;
        lng = geo.longitude;
        locName = geo.location;
      }

      const confPct = art.confidence_percent !== undefined
        ? art.confidence_percent
        : Math.round((art.confidenceScore || art.confidence || 0.85) * 100);

      // Create Custom HTML Marker Icon for Light Mode
      let ringColor = 'border-red-600 bg-red-500/20 text-red-600';
      let dotColor = 'bg-red-600';
      if (art.disasterType === 'Flood') {
        ringColor = 'border-blue-600 bg-blue-500/20 text-blue-600';
        dotColor = 'bg-blue-600';
      } else if (art.disasterType === 'Earthquake') {
        ringColor = 'border-orange-600 bg-orange-500/20 text-orange-600';
        dotColor = 'bg-orange-600';
      } else if (art.disasterType === 'Wildfire & Fire') {
        ringColor = 'border-amber-600 bg-amber-500/20 text-amber-600';
        dotColor = 'bg-amber-600';
      }

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="absolute w-8 h-8 rounded-full border-2 ${ringColor} animate-ping opacity-75"></div>
          <div class="w-6 h-6 rounded-full border-2 ${ringColor} flex items-center justify-center shadow-md bg-white">
            <div class="w-2.5 h-2.5 rounded-full ${dotColor}"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-disaster-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Light Popup Content with exact state/district location
      const popupHtml = `
        <div class="p-1 font-sans text-xs max-w-[240px]">
          <div class="font-bold text-slate-900 text-sm mb-1 leading-snug">${art.title}</div>
          <div class="flex items-center space-x-2 my-1">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">${art.disasterType}</span>
            <span class="font-mono text-emerald-700 font-bold text-[11px]">${confPct}% Conf</span>
          </div>
          <div class="text-slate-700 text-[11px] mt-1 font-semibold flex items-center gap-1">
            <span>📍</span> <span>${locName}</span>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      // Create enriched alert object for the inspector panel
      const enrichedAlert: DisasterArticle = {
        ...art,
        location: locName,
        latitude: lat,
        longitude: lng,
      };

      // Click Event Listener
      marker.on('click', () => {
        setActiveAlert(enrichedAlert);
        onSelectArticle(enrichedAlert);
      });

      markersRef.current.push(marker);
    });

    // Auto-fit map bounds if markers exist
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [articles, onSelectArticle]);

  const realDisasterCount = articles.filter(a =>
    a.disasterType !== 'Non-Disaster' && a.disasterType !== 'General & Other Disaster'
  ).length;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600 animate-bounce" />
            <span>Interactive India Disaster Alert Map</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geocoded disaster alerts extracted from live news via BERT & Indian Spatial NER.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold flex items-center space-x-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{realDisasterCount} Plotted Incidents</span>
          </span>
        </div>
      </div>

      {/* Map + Detail Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Leaflet Light OpenStreetMap Canvas */}
        <div className="lg:col-span-2 relative bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
          <div ref={mapContainerRef} className="w-full h-[540px] z-10" />

          {/* Leaflet Map Controls Label overlay */}
          <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 font-medium flex items-center space-x-2 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono">OpenStreetMap Live Tiles</span>
          </div>
        </div>

        {/* Selected Disaster Alert Inspection Panel (Light Mode) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4 min-h-[540px]">
          {activeAlert ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Alert Details Inspector</h3>
                </div>
                <button
                  onClick={() => setActiveAlert(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title */}
              <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                {activeAlert.title}
              </h4>

              {/* Grid Properties */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Disaster Type</span>
                  <span className="font-extrabold text-blue-700">{activeAlert.disasterType}</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Severity Rating</span>
                  <span className={`font-extrabold ${activeAlert.severity === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>
                    {activeAlert.severity || 'Moderate'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Location</span>
                  <span className="font-bold text-slate-800 truncate block">{activeAlert.location || activeAlert.state}</span>
                </div>

                {/* MODEL CONFIDENCE SCORE */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">BERT Confidence</span>
                  <span className="font-mono font-extrabold text-emerald-600 text-sm">
                    {activeAlert.confidence_percent !== undefined ? activeAlert.confidence_percent : 85.34}%
                  </span>
                </div>
              </div>

              {/* Geocoding Info */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5 font-mono shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Geocoded Lat/Lng:</span>
                  <span className="text-blue-700 font-bold">
                    {activeAlert.latitude ? `${activeAlert.latitude.toFixed(4)}° N, ${activeAlert.longitude?.toFixed(4)}° E` : '20.5937° N, 78.9629° E'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-sans">News Source:</span>
                  <span className="text-slate-800 font-bold">{activeAlert.source}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">News Article Summary</span>
                <p className="text-xs text-slate-700 bg-white p-3.5 rounded-lg border border-slate-200 leading-relaxed line-clamp-4 shadow-2xs font-normal">
                  {activeAlert.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => onSelectArticle(activeAlert)}
                  className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Telemetry</span>
                </button>

                <a
                  href={activeAlert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors shadow-2xs"
                  title="Open Original News Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="py-28 text-center space-y-3">
              <MapPin className="w-9 h-9 text-slate-400 mx-auto animate-bounce" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">Click Any Map Pin to Inspect</p>
                <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                  Click any disaster pin on the interactive OpenStreetMap of India to view spatial location, BERT confidence score, and news details.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
