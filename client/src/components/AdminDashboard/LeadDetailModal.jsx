import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Scale, Award, Calendar, Phone, User } from 'lucide-react';
import { formatINR, formatWeight, maskMobile, formatDate } from '../../utils/formatters';

export const LeadDetailModal = ({ lead, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const copyId = () => {
    navigator.clipboard.writeText(lead._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="glass-card w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Application Inspection Dossier
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Application ID Card */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Application MongoDB ID
              </span>
              <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                {lead._id}
              </span>
            </div>
            <button
              onClick={copyId}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:text-amber-500"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Applicant & Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block font-medium">Customer Name</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                {lead.customerName}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block font-medium">Contact Phone</span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                +91 {lead.maskedMobile || maskMobile(lead.mobileNumber)}
              </span>
            </div>
          </div>

          {/* Collateral Weight & Purity Audit */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px] flex items-center gap-1">
              <Scale className="w-3 h-3 text-amber-500" /> Collateral Breakdown
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Gross Weight</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatWeight(lead.grossWeightGrams)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Net Weight</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatWeight(lead.netWeightGrams)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">Assessed Karat</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{lead.purityKarat}K</span>
              </div>
            </div>
            <div className="text-center pt-1">
              <span className="text-slate-500 text-[11px]">
                Net Pure Gold Content (24K Equivalent):{' '}
                <strong className="text-amber-600 dark:text-amber-400">{formatWeight(lead.pureGoldGrams, 4)}</strong>
              </span>
            </div>
          </div>

          {/* Loan Sanction & Rate Valuation */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 text-[10px] flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-500" /> Sanction Valuation (75% LTV)
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-600 dark:text-slate-300">Applied Live 24K Rate:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatINR(lead.appliedGoldRate24K)}/g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Selected Scheme ID:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{lead.selectedPlanId}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-amber-500/20">
              <span className="text-slate-700 dark:text-slate-200 font-bold">Total Sanctioned Loan:</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">
                {formatINR(lead.calculatedLoanAmount)}
              </span>
            </div>
          </div>

          {/* Submission Timestamp */}
          <div className="text-slate-400 text-[11px] flex items-center justify-between pt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Registered on:
            </span>
            <span className="font-medium text-slate-600 dark:text-slate-300">{formatDate(lead.createdAt)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
