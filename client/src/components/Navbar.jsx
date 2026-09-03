import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Coins,
  Sun,
  Moon,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Info,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const Navbar = ({
  activeTab,
  setActiveTab,
  goldRateData,
  onRefreshGoldRate,
  isRefreshingRate,
}) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [showRatesModal, setShowRatesModal] = useState(false);

  const rate24K = goldRateData?.rates?.['24K'] || 6000;
  const rate22K = goldRateData?.rates?.['22K'] || Math.round((6000 * 22) / 24);
  const rate18K = goldRateData?.rates?.['18K'] || Math.round((6000 * 18) / 24);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-[2px] shadow-gold-glow flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                YELLOW <span className="text-amber-500">METAL</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Gold Loan Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              RBI Compliant 75% LTV Lending Platform
            </p>
          </div>
        </div>

        {/* Center: Live Gold Ticker Badge */}
        <div className="relative">
          <div
            onClick={() => setShowRatesModal(!showRatesModal)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-medium cursor-pointer transition-all duration-200 group"
            title="Click to view karat breakdown"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-700 dark:text-slate-200">
              ⚡ 24K: <strong className="text-amber-600 dark:text-amber-400">{formatINR(rate24K)}/g</strong>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRefreshGoldRate();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-amber-500 transition-colors"
              title="Force Refresh Rates"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingRate ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>

          {/* Rate Breakdown Flyout */}
          {showRatesModal && (
            <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl glass-card border border-amber-500/30 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  Live Market Rates (INR/g)
                </span>
                <span className="text-[10px] text-slate-400">10m Cache</span>
              </div>
              <div className="mt-2.5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center py-1 px-2 rounded bg-amber-500/10 font-medium">
                  <span className="text-slate-600 dark:text-slate-300">24 Karat (99.9% Pure)</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{formatINR(rate24K)}/g</span>
                </div>
                <div className="flex justify-between items-center py-1 px-2 rounded bg-slate-100 dark:bg-slate-800/50">
                  <span className="text-slate-600 dark:text-slate-300">22 Karat (91.6% Pure)</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{formatINR(rate22K)}/g</span>
                </div>
                <div className="flex justify-between items-center py-1 px-2 rounded bg-slate-100 dark:bg-slate-800/50">
                  <span className="text-slate-600 dark:text-slate-300">18 Karat (75.0% Pure)</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{formatINR(rate18K)}/g</span>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <Info className="w-3 h-3" />
                Rates updated from live gold market
              </p>
            </div>
          )}
        </div>

        {/* Right: Navigation Tabs & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tabs */}
          <nav className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs font-medium">
            <button
              onClick={() => setActiveTab('intake')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'intake'
                  ? 'bg-white dark:bg-amber-500 text-slate-900 dark:text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Partner Intake</span>
              <span className="sm:hidden">Apply</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-white dark:bg-amber-500 text-slate-900 dark:text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Dashboard</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </nav>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/40 transition-all duration-200 shadow-sm"
            aria-label="Toggle Theme"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

      </div>
    </header>
  );
};
