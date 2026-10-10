import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ship,
  Map,
  ArrowRightLeft,
  Sliders,
  TrendingUp,
  HelpCircle,
  FileText,
  Database,
  Droplets,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/exports', label: 'Export Water Footprint', icon: Ship },
  { path: '/regions', label: 'Regional Explorer', icon: Map },
  { path: '/crop-shift', label: 'Crop-Shift Simulator', icon: ArrowRightLeft },
  { path: '/optimization', label: 'Resource Optimization', icon: Sliders },
  { path: '/sensitivity', label: 'Sensitivity Analysis', icon: TrendingUp },
  { path: '/explain', label: 'Explain Analysis', icon: HelpCircle },
  { path: '/receipts', label: 'Decision Receipts', icon: FileText },
  { path: '/methodology', label: 'Data & Methodology', icon: Database },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#14532D] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/60 border border-emerald-400/40 flex items-center justify-center text-emerald-100 shadow-inner">
                <Droplets className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white block leading-tight">
                  WATER SHADOW
                </span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-300 block">
                  Environmental Intelligence
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-emerald-200 hover:text-white md:hidden"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-800/90 text-white shadow-xs font-semibold'
                        : 'text-emerald-100/80 hover:bg-emerald-800/40 hover:text-white'
                    }`
                  }
                  end={item.path === '/'}
                >
                  <Icon className="w-4 h-4 shrink-0 text-emerald-300" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Metadata */}
        <div className="p-4 border-t border-white/10 text-[11px] text-emerald-200/70">
          <div className="flex items-center justify-between mb-1">
            <span>FastAPI Analytics</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300">
              v0.1.0
            </span>
          </div>
          <p className="text-[10px] leading-tight text-emerald-300/60">
            India Agricultural Water Footprint & Resource Model
          </p>
        </div>
      </aside>
    </>
  );
};
