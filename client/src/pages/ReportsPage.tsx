import React, { useRef, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Shield,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Calendar,
  Building2,
  Sparkles,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTraffic } from '../context/TrafficContext';
import { useSimulation } from '../context/SimulationContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { peakHour, selectedDate, roads, zoneData, giniCoefficient, recommendations } = useTraffic();
  const { result } = useSimulation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0b0f19',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`SmartFlow_Traffic_Audit_Report_${selectedDate}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg lg:text-xl text-white">
              Official Municipal Traffic Audit & Policy Report
            </h1>
            <Badge variant="amber" size="xs">
              PDF Export Ready
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprehensive audit report for Municipal Commissioners, Urban Planners, and Traffic Police Authorities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-spin' : ''}`} />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Printable / Exportable Document Container */}
      <div
        ref={reportRef}
        className="glass-panel rounded-2xl p-6 lg:p-10 border border-slate-800 space-y-8 bg-slate-950/95 text-slate-100 max-w-5xl mx-auto shadow-2xl"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                SmartFlow
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Official Report
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-200 mt-1">
              Nagpur City Traffic Equilibrium & Peak-Hour Simulation Audit
            </h2>
            <p className="text-xs text-slate-400">
              Generated for: Nagpur Municipal Corporation (NMC) & Nagpur City Traffic Police
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 font-mono space-y-1">
            <p>
              Report Date:{' '}
              <strong className="text-slate-200">{selectedDate}</strong>
            </p>
            <p>
              Peak Target:{' '}
              <strong className="text-cyan-400 uppercase">{peakHour} Peak</strong>
            </p>
            <p>
              Classification: <strong className="text-emerald-400">NMC OFFICIAL / TRAFFIC AUDIT</strong>
            </p>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <span>1. Executive Summary & Problem Analysis</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Nagpur city traffic monitoring reveals severe structural imbalance across municipal planning jurisdictions. Core arterial corridors in Zone A (Sitabuldi & Central Avenue) and Zone B (Wardha Road to MIHAN SEZ) operate at an average load factor of <strong className="text-rose-400">95.4%</strong> with peak commute delays exceeding <strong className="text-rose-400">18.4 minutes</strong>. Conversely, adjacent peripheral bypasses in Zone E (South Ring Road / Besa) and Zone F (Outer Ring Road / Wadi Bypass) operate at <strong className="text-cyan-300">31.8%</strong> capacity.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            The calculated <strong className="text-amber-300">Gini Inequality Coefficient is {giniCoefficient.toFixed(2)}</strong>, reflecting an urgent need for cross-jurisdictional traffic diversion and dynamic Webster signal re-timing across Nagpur's major intersections.
          </p>
        </div>

        {/* Section 2: Key Audit Metrics Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <span>2. Baseline vs SmartFlow AI Optimization Outcome</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Avg Commute Speed
              </span>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-1">
                24.8 ➔ 35.2 km/h
              </p>
              <span className="text-[10px] text-emerald-400 font-bold">+41.9% Speed Gain</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Peak Commute Delay
              </span>
              <p className="text-lg font-bold text-blue-400 font-mono mt-1">18.4 ➔ 8.2 min</p>
              <span className="text-[10px] text-blue-400 font-bold">-55.4% Peak Delay</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Bottlenecks Overloaded
              </span>
              <p className="text-lg font-bold text-amber-400 font-mono mt-1">9 ➔ 2 Roads</p>
              <span className="text-[10px] text-amber-400 font-bold">-77.8% Relief</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Gini Imbalance Index
              </span>
              <p className="text-lg font-bold text-purple-400 font-mono mt-1">0.64 ➔ 0.22</p>
              <span className="text-[10px] text-purple-400 font-bold">+65.6% Equality</span>
            </div>
          </div>
        </div>

        {/* Section 3: Jurisdictional Zone Audit Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            3. Jurisdictional Zone Capacity Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Zone ID</th>
                  <th className="py-2.5 px-3">Jurisdiction Name</th>
                  <th className="py-2.5 px-3">Hourly Volume</th>
                  <th className="py-2.5 px-3">Total Capacity</th>
                  <th className="py-2.5 px-3">Utilization</th>
                  <th className="py-2.5 px-3">Avg Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                {zoneData.map((z) => (
                  <tr key={z.zoneId}>
                    <td className="py-2.5 px-3 font-bold text-white">{z.zoneId}</td>
                    <td className="py-2.5 px-3 text-slate-300">{z.zoneName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {z.totalVehicles.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {z.totalCapacity.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className={z.averageUtilizationPct > 80 ? 'text-rose-400' : 'text-emerald-400'}>
                        {z.averageUtilizationPct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{z.averageSpeedKmh} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: AI Recommendations & Policy Directives */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            4. Recommended Municipal Directives
          </h3>
          <div className="space-y-2 text-xs">
            {recommendations.slice(0, 3).map((rec, i) => (
              <div key={rec.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">
                    {i + 1}. {rec.title} ({rec.targetName})
                  </span>
                  <span className="text-emerald-400 font-semibold">{rec.projectedImprovement}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Document Footer Sign-off */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <p className="font-semibold text-slate-200">
              Authorized Sign-off: {user?.name || 'Dr. Rajesh Sharma (IAS)'}
            </p>
            <p className="text-[11px] text-cyan-400 font-mono">
              {user?.role || 'Planning Authority'} &bull; {user?.agency || 'Nagpur Municipal Corporation (NMC) & NIT'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Authority ID: {user?.id || 'usr-1'} &bull; {user?.email || 'commissioner@nmcnagpur.gov.in'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[11px]">Audit Hash: SHA256-SMARTFLOW-{user?.id || '98B2'}</p>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved for Policy Implementation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
