import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { IRoad, IJunction, CongestionLevel } from '../../types';
import { Zap, Navigation, Clock, Gauge, Car, Layers, Crosshair } from 'lucide-react';
import { CongestionBadge } from '../common/Badge';
import { TrafficDensityIndicator } from '../visualizations/TrafficDensityIndicator';

interface TrafficMapProps {
  roads: IRoad[];
  junctions: IJunction[];
  selectedRoad?: IRoad | null;
  onSelectRoad?: (road: IRoad) => void;
  selectedJunction?: IJunction | null;
  onSelectJunction?: (junction: IJunction) => void;
  onOptimizeJunction?: (junctionId: string) => void;
  showJunctions?: boolean;
  showDiversions?: boolean;
  filterCongestion?: string;
  filterZone?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

// Custom View Reset Helper
const MapController: React.FC<{ center: [number, number]; zoom: number; trigger: any }> = ({
  center,
  zoom,
  trigger,
}) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [trigger, center, zoom, map]);
  return null;
};

// Create Custom Smart City Junction Icon with pulsating beacon
const createJunctionIcon = (junc: IJunction, isSelected: boolean) => {
  const phaseColors = {
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
  };
  const activeColor = phaseColors[junc.currentPhase] || '#10b981';
  const isCongested = junc.congestionLevel === 'severe' || junc.congestionLevel === 'heavy';

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
      ${
        isCongested
          ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${activeColor}; opacity: 0.4; animation: pulseDot 1.8s infinite ease-in-out;"></div>`
          : ''
      }
      <div style="
        position: relative;
        width: ${isSelected ? '28px' : '24px'};
        height: ${isSelected ? '28px' : '24px'};
        border-radius: 50%;
        background: radial-gradient(circle, #0f172a 60%, #070b14 100%);
        border: 2.5px solid ${isSelected ? '#38bdf8' : activeColor};
        box-shadow: 0 0 14px ${activeColor}99;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.25s ease;
      ">
        <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${activeColor}; box-shadow: 0 0 10px ${activeColor};"></div>
      </div>
      <div style="
        position: absolute;
        bottom: -18px;
        background: rgba(11, 17, 32, 0.9);
        color: #f1f5f9;
        font-size: 9px;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        padding: 1px 5px;
        border-radius: 4px;
        border: 1px solid rgba(59, 130, 246, 0.4);
        box-shadow: 0 2px 6px rgba(0,0,0,0.6);
        white-space: nowrap;
        pointer-events: none;
      ">
        ${junc.code}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-junction-marker',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

export const TrafficMapComponent: React.FC<TrafficMapProps> = ({
  roads,
  junctions,
  selectedRoad,
  onSelectRoad,
  selectedJunction,
  onSelectJunction,
  onOptimizeJunction,
  showJunctions = true,
  showDiversions = true,
  filterCongestion = 'all',
  filterZone = 'all',
  height = '560px',
  center = [21.1458, 79.0882],
  zoom = 13,
}) => {
  const [resetKey, setResetKey] = useState(0);
  const [tileMode, setTileMode] = useState<'dark' | 'standard'>('dark');

  const filteredRoads = roads.filter((road) => {
    if (filterCongestion !== 'all' && road.congestionLevel !== filterCongestion) return false;
    if (filterZone !== 'all' && !road.zone.toLowerCase().includes(filterZone.toLowerCase())) return false;
    return true;
  });

  const getRoadColor = (level: CongestionLevel, isAlt?: boolean) => {
    if (isAlt) return '#06b6d4'; // Cyan for alternative route
    switch (level) {
      case 'low':
        return '#10b981'; // emerald
      case 'moderate':
        return '#f59e0b'; // amber
      case 'heavy':
        return '#f97316'; // orange
      case 'severe':
        return '#ef4444'; // rose/red
      default:
        return '#3b82f6';
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl glass-panel group">
      {/* Floating Map Controls overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setResetKey((k) => k + 1)}
          title="Center on Nagpur Core"
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          aria-label="Center map"
        >
          <Crosshair className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={() => setTileMode((prev) => (prev === 'dark' ? 'standard' : 'dark'))}
          title="Toggle Tile Style"
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          aria-label="Toggle map tile theme"
        >
          <Layers className="w-4 h-4 text-blue-400" />
        </button>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] p-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-xl hidden sm:block">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
          Live Traffic Density Legend
        </p>
        <div className="flex items-center gap-3.5 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span>
            <span>&lt;40% Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500"></span>
            <span>40-65% Mod</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500"></span>
            <span>65-85% Heavy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500 animate-pulse"></span>
            <span>&gt;85% Severe</span>
          </div>
          {showDiversions && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 rounded-full bg-cyan-400 border border-dashed border-cyan-300"></span>
              <span>Alt Route</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <MapController center={center} zoom={zoom} trigger={resetKey} />

        {/* Tile Layer: CartoDB Dark Matter */}
        {tileMode === 'dark' ? (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* Roads Polylines */}
        {filteredRoads.map((road) => {
          const isSelected = selectedRoad?.id === road.id;
          const color = getRoadColor(road.congestionLevel, road.isAlternativeRoute);
          const weight = isSelected ? 8 : road.congestionLevel === 'severe' ? 6 : 4.5;
          const opacity = isSelected ? 1 : 0.85;

          return (
            <Polyline
              key={road.id}
              positions={road.coordinates}
              pathOptions={{
                color,
                weight,
                opacity,
                dashArray: road.isAlternativeRoute ? '8, 8' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              eventHandlers={{
                click: () => onSelectRoad && onSelectRoad(road),
              }}
            >
              <Popup>
                <div className="p-2.5 space-y-2.5 min-w-[230px]">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-700/80 pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-white font-outfit">{road.name}</h4>
                      <p className="text-[10px] text-cyan-400 font-mono">
                        {road.code} • {road.zone}
                      </p>
                    </div>
                    <CongestionBadge level={road.congestionLevel} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Gauge className="w-3 h-3 text-blue-400" />
                        <span>Speed</span>
                      </div>
                      <p className="font-semibold text-white font-mono mt-0.5">
                        {road.averageSpeedKmh} / {road.speedLimitKmh} km/h
                      </p>
                    </div>

                    <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Car className="w-3 h-3 text-emerald-400" />
                        <span>Volume</span>
                      </div>
                      <p className="font-semibold text-white font-mono mt-0.5">
                        {road.currentTrafficVeh.toLocaleString()} veh/h
                      </p>
                    </div>

                    <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Delay</span>
                      </div>
                      <p className="font-semibold text-amber-400 font-mono mt-0.5">+{road.estimatedDelayMin} min</p>
                    </div>

                    <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Zap className="w-3 h-3 text-purple-400" />
                        <span>Utilization</span>
                      </div>
                      <p className="font-semibold text-white font-mono mt-0.5">{road.utilizationPct}%</p>
                    </div>
                  </div>

                  {/* Road Density Cross-Section Indicator */}
                  <TrafficDensityIndicator
                    utilizationPct={road.utilizationPct}
                    congestionLevel={road.congestionLevel}
                    lanes={road.lanes || 4}
                    currentTrafficVeh={road.currentTrafficVeh}
                    averageSpeedKmh={road.averageSpeedKmh}
                  />
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Junctions Markers */}
        {showJunctions &&
          junctions.map((junc) => {
            const isSelected = selectedJunction?.id === junc.id;
            return (
              <Marker
                key={junc.id}
                position={[junc.location.lat, junc.location.lng]}
                icon={createJunctionIcon(junc, isSelected)}
                eventHandlers={{
                  click: () => onSelectJunction && onSelectJunction(junc),
                }}
              >
                <Popup>
                  <div className="p-2.5 space-y-2.5 min-w-[230px]">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-700/80 pb-2">
                      <div>
                        <h4 className="font-bold text-sm text-white font-outfit">{junc.name}</h4>
                        <p className="text-[10px] text-cyan-400 font-mono">
                          {junc.code} • {junc.zone}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          junc.currentPhase === 'green'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 glow-emerald'
                            : junc.currentPhase === 'yellow'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40 glow-rose'
                        }`}
                      >
                        {junc.currentPhase} Phase
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Queue Length</span>
                        <span className="font-bold text-white font-mono text-sm">{junc.queueLengthVeh} veh</span>
                      </div>
                      <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Wait Time</span>
                        <span className="font-bold text-amber-400 font-mono text-sm">{junc.averageWaitingTimeSec}s</span>
                      </div>
                      <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Cycle Time</span>
                        <span className="font-bold text-white font-mono">{junc.signalCycleSec}s</span>
                      </div>
                      <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Green / Red</span>
                        <span className="font-bold text-cyan-400 font-mono">
                          {junc.greenDurationSec}s / {junc.redDurationSec}s
                        </span>
                      </div>
                    </div>

                    {onOptimizeJunction && (
                      <button
                        onClick={() => onOptimizeJunction(junc.id)}
                        className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-600/30 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Auto-Optimize Webster Signal</span>
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

