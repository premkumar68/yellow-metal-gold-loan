import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { formatINR, formatWeight, maskMobile, formatDate } from '../../utils/formatters';

export const LeadTable = ({ leads, onSelectLead, isLoading }) => {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlanBadge = (planId) => {
    if (planId?.includes('BULLET')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          Bullet (9.5%)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
        EMI (11.0%)
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading loan applications from database...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No applications found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
          No records match your active search or filter criteria. Try clearing filters or submit a new application.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Table Header */}
          <thead className="bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3.5 px-4">Application ID</th>
              <th className="py-3.5 px-4">Customer Name</th>
              <th className="py-3.5 px-4">Masked Mobile</th>
              <th className="py-3.5 px-4 text-right">Net Wt. (g)</th>
              <th className="py-3.5 px-4 text-right">Pure Gold (g)</th>
              <th className="py-3.5 px-4 text-right">Applied Rate</th>
              <th className="py-3.5 px-4">Plan Selected</th>
              <th className="py-3.5 px-4 text-right">Sanctioned Loan</th>
              <th className="py-3.5 px-4">Submission Date</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {leads.map((lead) => {
              const shortId = lead._id ? `${lead._id.substring(0, 6)}...${lead._id.substring(lead._id.length - 4)}` : '—';
              const isCopied = copiedId === lead._id;

              return (
                <tr
                  key={lead._id}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-amber-500/5 dark:hover:bg-amber-500/5 cursor-pointer transition-colors group"
                >
                  {/* Application ID */}
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span>{shortId}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, lead._id)}
                        className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Copy full Application ID"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>

                  {/* Customer Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {lead.customerName}
                  </td>

                  {/* Masked Mobile Number */}
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {lead.maskedMobile || maskMobile(lead.mobileNumber)}
                  </td>

                  {/* Net Weight */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                    {formatWeight(lead.netWeightGrams)}
                  </td>

                  {/* Pure Gold */}
                  <td className="py-3.5 px-4 text-right font-semibold text-amber-600 dark:text-amber-400">
                    {formatWeight(lead.pureGoldGrams, 3)}
                  </td>

                  {/* Applied Rate */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                    {formatINR(lead.appliedGoldRate24K)}/g
                  </td>

                  {/* Plan Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getPlanBadge(lead.selectedPlanId)}
                  </td>

                  {/* Sanctioned Loan (75% LTV) */}
                  <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                    {formatINR(lead.calculatedLoanAmount)}
                  </td>

                  {/* Submission Date */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>

                  {/* Action / View */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center text-slate-400 group-hover:text-amber-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
