import React from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';

export const FilterBar = ({
  searchTerm,
  setSearchTerm,
  planFilter,
  setPlanFilter,
  purityFilter,
  setPurityFilter,
  onRefresh,
  isRefreshing,
  onExportCSV,
  totalResults,
}) => {
  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer or mobile..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-950/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Filter Dropdowns & Export Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
        {/* Plan Filter */}
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-950/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        >
          <option value="ALL">All Loan Schemes</option>
          <option value="YM-BULLET-9.5">Bullet Repayment (9.5%)</option>
          <option value="YM-EMI-11.0">Monthly EMI (11.0%)</option>
        </select>

        {/* Purity Filter */}
        <select
          value={purityFilter}
          onChange={(e) => setPurityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-950/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        >
          <option value="ALL">All Purities</option>
          <option value="24">24 Karat</option>
          <option value="22">22 Karat</option>
          <option value="18">18 Karat</option>
        </select>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
          title="Refresh Leads Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
        </button>

        {/* Export CSV Button */}
        <button
          type="button"
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-amber-500 text-xs font-semibold transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV ({totalResults})</span>
        </button>
      </div>
    </div>
  );
};
