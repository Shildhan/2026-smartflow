import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  Navigation,
  Sparkles,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  Play,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { IRoad, IJunction, PeakHourType } from '../../types';

interface TrafficNetworkHeroProps {
  roads: IRoad[];
  junctions: IJunction[];
  peakHour: PeakHourType;
  giniCoefficient: number;
  onSelectJunction?: (junction: IJunction) => void;
  onSelectRoad?: (road: IRoad) => void;
}

interface NetworkNode {
  id: string;
  name: string;
  code: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  zone: string;
  status: 'green' | 'yellow' | 'red';
  vehicles: number;
  waitSec: number;
}

interface NetworkLink {
  id: string;
  name: string;
  from: string;
  to: string;
  congestion: 'low' | 'moderate' | 'heavy' | 'severe';
  speed: number;
  utilization: number;
  isBypass?: boolean;
}

export const TrafficNetworkHero: React.FC<TrafficNetworkHeroProps> = ({
  roads,
  junctions,
  peakHour,
  giniCoefficient,
  onSelectJunction,
  onSelectRoad,
}) => {
  const [activeNode, setActiveNode] = useState<NetworkNode | null>(null);
  const [animationTick, setAnimationTick] = useState(0);

  // Smooth animation frame for vehicle particles
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationTick((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Spatial nodes layout mapping the Nagpur Conurbation
  const nodes: NetworkNode[] = [
    { id: 'J2', name: 'RBI Sq (Zero Mile)', code: 'J-RBI', x: 48, y: 18, zone: 'Zone A - CBD', status: 'red', vehicles: 2950, waitSec: 98 },
    { id: 'J1', name: 'Variety Sq (Sitabuldi)', code: 'J-VAR', x: 46, y: 38, zone: 'Zone A - CBD', status: 'red', vehicles: 2680, waitSec: 84 },
    { id: 'J3', name: 'Lokmat Sq', code: 'J-LOK', x: 44, y: 55, zone: 'Zone B - Tech', status: 'yellow', vehicles: 2450, waitSec: 72 },
    { id: 'J5', name: 'Chhatrapati Sq', code: 'J-CHT', x: 42, y: 78, zone: 'Zone B - Tech', status: 'red', vehicles: 3100, waitSec: 105 },
    { id: 'J11', name: 'Shankar Nagar Sq', code: 'J-SHK', x: 22, y: 46, zone: 'Zone C - West', status: 'yellow', vehicles: 2100, waitSec: 60 },
    { id: 'J10', name: 'Law College Sq', code: 'J-LAW', x: 20, y: 24, zone: 'Zone C - West', status: 'green', vehicles: 1950, waitSec: 52 },
    { id: 'J7', name: 'Medical Sq', code: 'J-MED', x: 74, y: 44, zone: 'Zone D - Medical', status: 'yellow', vehicles: 2200, waitSec: 64 },
    { id: 'J8', name: 'Sakkardara Sq', code: 'J-SAK', x: 78, y: 68, zone: 'Zone D - Medical', status: 'red', vehicles: 2750, waitSec: 86 },
    { id: 'J12', name: 'Automotive Ring Sq', code: 'J-AUT', x: 80, y: 16, zone: 'Zone F - Ring Bypass', status: 'green', vehicles: 1150, waitSec: 24 },
  ];

  // Interconnecting arterial and bypass links
  const links: NetworkLink[] = [
    // Arterial CBD Corridors (Choked)
    { id: 'R1', name: 'Wardha Road CBD Arterial', from: 'J2', to: 'J1', congestion: 'severe', speed: 14, utilization: 96 },
    { id: 'R2', name: 'Sitabuldi High-Density Spine', from: 'J1', to: 'J3', congestion: 'severe', speed: 18, utilization: 94 },
    { id: 'R5', name: 'Wardha Road Flyover Link', from: 'J3', to: 'J5', congestion: 'heavy', speed: 22, utilization: 88 },
    // Western Arterials
    { id: 'R7', name: 'WHC Dharampeth Commercial Road', from: 'J1', to: 'J11', congestion: 'heavy', speed: 24, utilization: 82 },
    { id: 'R18', name: 'Amravati Road Institutional Link', from: 'J11', to: 'J10', congestion: 'moderate', speed: 38, utilization: 62 },
    { id: 'R16', name: 'Seminary Hills Scenic Link', from: 'J10', to: 'J2', congestion: 'low', speed: 45, utilization: 42, isBypass: true },
    // South-Eastern Arterials
    { id: 'R6', name: 'Great Nag Road Arterial', from: 'J1', to: 'J7', congestion: 'heavy', speed: 20, utilization: 86 },
    { id: 'R10', name: 'Medical Square to Umred Spine', from: 'J7', to: 'J8', congestion: 'severe', speed: 16, utilization: 91 },
    // Outer Peripheral Bypasses (Underutilized Opportunities)
    { id: 'R22', name: 'Koradi Thermal Bypass Link', from: 'J2', to: 'J12', congestion: 'low', speed: 60, utilization: 37, isBypass: true },
    { id: 'R23', name: 'Outer Ring Logistics Connector', from: 'J8', to: 'J12', congestion: 'low', speed: 52, utilization: 40, isBypass: true },
    { id: 'R20', name: 'South Ring Manewada Bypass', from: 'J5', to: 'J8', congestion: 'low', speed: 48, utilization: 34, isBypass: true },
  ];

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'red':
        return '#ef4444';
      case 'yellow':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  const getLinkColor = (congestion: string) => {
    switch (congestion) {
      case 'severe':
        return '#ef4444';
      case 'heavy':
        return '#f97316';
      case 'moderate':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 lg:p-6 border border-slate-800 space-y-4 relative overflow-hidden bg-slate-950/80">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner: Real-Time Dynamic Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Live Arterial Network Topology</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {peakHour === 'morning' ? 'Morning Peak Inflow (9:00 AM – 12:00 PM)' : 'Evening Peak Dispersal (4:00 PM – 7:00 PM)'}
            </span>
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-white font-outfit mt-1">
            Nagpur Metropolitan Intelligent Mobility Network
          </h2>
        </div>

        {/* Dynamic Flow & Load Balancing Legend */}
        <div className="flex items-center gap-2 text-[10px] bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-slate-300">
          <span className="text-rose-400 font-bold">1. Choked Arterial (96%)</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-cyan-400 font-bold">2. Webster + AI Diversion</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-emerald-400 font-bold">3. Balanced Ring (65%)</span>
        </div>
      </div>

      {/* Interactive 2D Network Canvas */}
      <div className="relative w-full h-[340px] sm:h-[400px] bg-slate-950 rounded-xl border border-slate-800/90 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]" />

        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          {/* 1. Render Arterial and Bypass Corridors (Lines) */}
          {links.map((link) => {
            const fromNode = nodes.find((n) => n.id === link.from);
            const toNode = nodes.find((n) => n.id === link.to);
            if (!fromNode || !toNode) return null;

            const strokeColor = getLinkColor(link.congestion);
            const isSevere = link.congestion === 'severe';
            const isBypass = link.isBypass;

            return (
              <g key={link.id}>
                {/* Outer Heat Glow for Severe Corridors */}
                {isSevere && (
                  <line
                    x1={`${fromNode.x}%`}
                    y1={`${fromNode.y}%`}
                    x2={`${toNode.x}%`}
                    y2={`${toNode.y}%`}
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                  />
                )}

                {/* Main Corridor Line */}
                <line
                  x1={`${fromNode.x}%`}
                  y1={`${fromNode.y}%`}
                  x2={`${toNode.x}%`}
                  y2={`${toNode.y}%`}
                  stroke={strokeColor}
                  strokeWidth={isSevere ? '5' : isBypass ? '2.5' : '3.5'}
                  strokeDasharray={isBypass ? '4 4' : undefined}
                  strokeOpacity="0.85"
                  strokeLinecap="round"
                />

                {/* Animated Moving Vehicle Particles */}
                {Array.from({ length: isSevere ? 4 : isBypass ? 2 : 3 }).map((_, pIdx) => {
                  const speedFactor = isSevere ? 0.35 : isBypass ? 1.4 : 0.8;
                  const progress = ((animationTick * speedFactor + pIdx * (100 / 3)) % 100) / 100;
                  const px = fromNode.x + (toNode.x - fromNode.x) * progress;
                  const py = fromNode.y + (toNode.y - fromNode.y) * progress;

                  return (
                    <circle
                      key={pIdx}
                      cx={`${px}%`}
                      cy={`${py}%`}
                      r={isSevere ? '3.5' : '2.5'}
                      fill={isSevere ? '#ffffff' : isBypass ? '#38bdf8' : '#fbbf24'}
                      opacity={0.9}
                      className="shadow-lg"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* 2. Interactive Junction Nodes */}
        {nodes.map((node) => {
          const isSelected = activeNode?.id === node.id;
          const nodeColor = getNodeColor(node.status);

          return (
            <motion.div
              key={node.id}
              onClick={() => {
                setActiveNode(node);
                const realJunc = junctions.find((j) => j.code === node.code || j.id === node.id);
                if (realJunc && onSelectJunction) onSelectJunction(realJunc);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              whileHover={{ scale: 1.15 }}
            >
              {/* Pulsing Beacon Ring */}
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ backgroundColor: nodeColor, margin: '-6px' }}
              />

              {/* Central Signal Disc */}
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950 border-2 flex items-center justify-center shadow-xl transition-all"
                style={{
                  borderColor: nodeColor,
                  boxShadow: `0 0 14px ${nodeColor}88`,
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: nodeColor }}
                />
              </div>

              {/* Code Label */}
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-slate-900/90 text-[9px] font-mono font-bold text-white px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow-md pointer-events-none group-hover:border-cyan-400 group-hover:text-cyan-300">
                {node.code}
              </div>
            </motion.div>
          );
        })}

        {/* 3. Active Node Inspector Tooltip */}
        {activeNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-3 left-3 bg-slate-900/95 border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl z-30 max-w-xs text-xs backdrop-blur-md space-y-2"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">{activeNode.code}</span>
                <h4 className="font-bold text-white font-outfit">{activeNode.name}</h4>
              </div>
              <button
                onClick={() => setActiveNode(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Traffic Flow</span>
                <span className="font-bold text-white">{activeNode.vehicles.toLocaleString()} v/h</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Queue Delay</span>
                <span className={`font-bold ${activeNode.waitSec > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {activeNode.waitSec}s wait
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Status Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">CBD Bottleneck Severity</span>
          <span className="font-bold text-rose-400 font-mono text-sm">96% Saturation</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">Outer Bypass Spare Capacity</span>
          <span className="font-bold text-emerald-400 font-mono text-sm">69% Available</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">Gini Concentration Imbalance</span>
          <span className="font-bold text-purple-400 font-mono text-sm">{giniCoefficient.toFixed(2)} (High)</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">Simulated Speed Recovery</span>
          <span className="font-bold text-cyan-400 font-mono text-sm">+41.9% via Webster</span>
        </div>
      </div>
    </div>
  );
};
