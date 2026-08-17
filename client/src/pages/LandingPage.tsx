import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  TrendingUp,
  MapPin,
  Sparkles,
  GitCompare,
  PieChart,
  Split,
  Layers,
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 lg:px-16 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                  SmartFlow
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Enterprise
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
            >
              <span>Launch Live Command</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 lg:px-16 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Generation Municipal Traffic Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight font-outfit">
            Intelligent Traffic Management &{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Peak-Hour Simulation
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminating uneven traffic distribution across municipal planning jurisdictions in <strong className="text-white">Nagpur, Maharashtra</strong>. SmartFlow unifies NMC, NIT, and City Traffic Police with real-time Webster signal optimization, Greenshields physics simulation, and dynamic cross-corridor vehicle diversion.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Explore Live Traffic Command</span>
            </Link>

            <Link
              to="/simulation"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Run Physics Simulation</span>
            </Link>
          </div>

          {/* Key Impact Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <p className="text-3xl font-extrabold text-emerald-400 font-mono">+41.9%</p>
              <span className="text-xs text-slate-400 mt-1 block">Metropolitan Speed Gain</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <p className="text-3xl font-extrabold text-cyan-400 font-mono">-55.4%</p>
              <span className="text-xs text-slate-400 mt-1 block">Peak Commute Delay</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <p className="text-3xl font-extrabold text-amber-400 font-mono">-77.8%</p>
              <span className="text-xs text-slate-400 mt-1 block">Severe Bottlenecks</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <p className="text-3xl font-extrabold text-purple-400 font-mono">0.22</p>
              <span className="text-xs text-slate-400 mt-1 block">Balanced Gini Index</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-20 px-6 lg:px-16 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-outfit">
              Engineered for Inter-Jurisdictional Mobility
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Addressing the fundamental flaw in metropolitan planning: uncoordinated zoning and siloed traffic light operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Uneven Distribution Solver</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculates Gini coefficient across Municipal Planning Jurisdictions, identifying underutilized peripheral bypasses to relieve choked central arterials.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Greenshields Physics Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Simulates vehicular queue build-ups, braking shockwaves, and weather friction coefficients over 15 to 180-minute peak windows.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Split className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Webster Signal Re-Timing</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Computes optimal signal cycle times and dynamic green ratios in real-time, clearing junction queues before spillover occurs.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-purple-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Policy & Tactical Dispatch</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generates high-confidence actionable directives with 1-click execution for municipal commissioners and traffic police command.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>SmartFlow — Intelligent Traffic Management & Peak-Hour Simulation Platform</p>
        <p className="mt-1">Urban Mobility & Traffic Optimization System</p>
      </footer>
    </div>
  );
};
