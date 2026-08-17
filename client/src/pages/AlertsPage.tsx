import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Info,
  Clock,
  MapPin,
  ArrowRight,
  CheckCheck,
  ShieldAlert,
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';
import { Badge } from '../components/common/Badge';

export const AlertsPage: React.FC = () => {
  const { alerts, markAlertRead, unreadAlertsCount } = useTraffic();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'unread') return !a.isRead;
    if (filterType === 'critical') return a.type === 'critical';
    if (filterType === 'warning') return a.type === 'warning';
    return true;
  });

  const handleMarkAllRead = () => {
    alerts.forEach((a) => {
      if (!a.isRead) markAlertRead(a.id);
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg lg:text-xl text-white font-outfit">
              Real-Time Traffic Incident & Bottleneck Alerts
            </h1>
            {unreadAlertsCount > 0 && (
              <Badge variant="rose" size="xs" dot pulse>
                {unreadAlertsCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated alerts dispatched when corridor density, queue spillover, or weather delays exceed thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadAlertsCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all active:scale-95"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Alerts ({alerts.length})</option>
            <option value="unread">Unread Only</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings</option>
          </select>
        </div>
      </div>

      {/* Alert Items List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-sm text-white">No active incidents matching filter</h3>
            <p className="text-xs text-slate-400">All corridors operating within normal density parameters.</p>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => {
            const isCritical = alert.type === 'critical';
            const isWarning = alert.type === 'warning';
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                onClick={() => markAlertRead(alert.id)}
                className={`glass-panel rounded-2xl p-4 lg:p-5 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                  alert.isRead
                    ? 'border-slate-800/60 opacity-60 hover:opacity-100'
                    : isCritical
                    ? 'border-rose-500/50 bg-rose-950/20'
                    : isWarning
                    ? 'border-amber-500/50 bg-amber-950/20'
                    : 'border-blue-500/40 bg-blue-950/20'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 glow-rose'
                        : isWarning
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 glow-amber'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}
                  >
                    {isCritical ? <Flame className="w-5 h-5" /> : isWarning ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm lg:text-base text-white font-outfit">{alert.title}</h3>
                      <Badge
                        variant={isCritical ? 'rose' : isWarning ? 'amber' : 'blue'}
                        size="xs"
                        dot={!alert.isRead}
                      >
                        {alert.type.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{alert.timestamp}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  <Link
                    to="/route-optimization"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
                  >
                    <span>Mitigate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
