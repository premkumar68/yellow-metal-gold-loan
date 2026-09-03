import React from 'react';
import { FileSpreadsheet, IndianRupee, Sparkles, Scale } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export const KpiCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Applications',
      value: stats?.totalApplications ?? 0,
      subtext: 'Submitted leads in pipeline',
      icon: FileSpreadsheet,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Total Sanctioned Loan',
      value: formatINR(stats?.totalSanctionedAmount ?? 0),
      subtext: '75% LTV sanctioned collateral',
      icon: IndianRupee,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Average Gold Purity',
      value: `${stats?.averagePurity ? stats.averagePurity : '0.0'} K`,
      subtext: 'Collateral quality index',
      icon: Sparkles,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
    {
      title: 'Pure Gold Pledged',
      value: `${stats?.totalPureGoldGrams ? stats.totalPureGoldGrams.toFixed(2) : '0.00'} g`,
      subtext: 'Net pure gold backing',
      icon: Scale,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color} ${card.border} border`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
              {card.value}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
