import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Map,
  PlaySquare,
  History,
  GitCompare,
  PieChart,
  Split,
  Navigation,
  TrendingUp,
  Sparkles,
  Bell,
  FileText,
  Settings,
  Shield,
  ExternalLink,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTraffic } from '../../context/TrafficContext';

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { user } = useAuth();
  const { unreadAlertsCount, recommendations } = useTraffic();

  const navSections: NavSection[] = [
    {
      title: 'Command Center',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        {
          name: 'Traffic Map',
          path: '/map',
          icon: Map,
          badge: 'GIS',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        },
        { name: 'Junction Management', path: '/junctions', icon: Split },
      ],
    },
    {
      title: 'Simulation & Analytics',
      items: [
        {
          name: 'Simulation Studio',
          path: '/simulation',
          icon: PlaySquare,
          badge: 'Physics',
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        },
        {
          name: 'Simulation Archive',
          path: '/simulation-history',
          icon: History,
          badge: 'DB',
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        },
        {
          name: 'Before vs After',
          path: '/comparison',
          icon: GitCompare,
          badge: '+41%',
          badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        },
        { name: 'Traffic Distribution', path: '/distribution', icon: PieChart },
        { name: 'Peak Hour Dynamics', path: '/peak-hour', icon: TrendingUp },
      ],
    },
    {
      title: 'Intelligent Policies',
      items: [
        { name: 'Route Optimization', path: '/route-optimization', icon: Navigation },
        {
          name: 'AI Directives',
          path: '/recommendations',
          icon: Sparkles,
          badge: recommendations.length.toString(),
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        },
        {
          name: 'Incident Alerts',
          path: '/alerts',
          icon: Bell,
          badge: unreadAlertsCount > 0 ? unreadAlertsCount.toString() : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        },
      ],
    },
    {
      title: 'System & Governance',
      items: [
        {
          name: 'Reports & Export',
          path: '/reports',
          icon: FileText,
          badge: 'PDF',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        },
        { name: 'Settings & Model', path: '/settings', icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <aside className="w-64 glass-panel border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-full overflow-hidden bg-slate-950/95 backdrop-blur-xl">
      {/* Mobile Drawer Header */}
      {onCloseMobile && (
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
          <span className="font-bold text-sm text-white font-outfit">Navigation Menu</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="py-3 px-3 space-y-4 overflow-y-auto flex-1">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {section.title}
            </p>

            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group ${
                      isActive
                        ? 'text-blue-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Background Pill */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarIndicator"
                          className="absolute inset-0 bg-blue-600/15 border border-blue-500/30 rounded-xl shadow-sm shadow-blue-500/10"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}

                      <div className="relative z-10 flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${
                            isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`relative z-10 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                            item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom User Info & Quick Portal Link */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Authority User'}</p>
              <p className="text-[10px] text-cyan-400 font-mono truncate">{user?.role || 'Planning Authority'}</p>
            </div>
          </div>
          <Link
            to="/landing"
            target="_blank"
            title="Open Landing Page in new tab"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-[calc(100vh-61px)] sticky top-[61px]">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="relative z-10 h-full w-64 max-w-[80vw] shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

