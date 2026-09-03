import React from 'react';
import { User, Phone, Scale, Sparkles, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { computePureGold } from '../../utils/formatters';

export const Step1Details = ({ formData, setFormData, onNext, isWeightValid, isMobileValid }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pureGoldEstimate = computePureGold(formData.netWeightGrams, formData.purityKarat);

  const canProceed =
    formData.customerName.trim().length >= 2 &&
    isMobileValid &&
    parseFloat(formData.grossWeightGrams) > 0 &&
    parseFloat(formData.netWeightGrams) > 0 &&
    isWeightValid;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Step 1: Customer & Gold Collateral Details
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Provide applicant profile and exact weight measurements for purity assessment.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {/* Customer Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Full Customer Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => handleChange('customerName', e.target.value)}
              placeholder="e.g., Prem kumar"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-950/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Indian Mobile Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Mobile Number (10 Digits) <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex rounded-xl shadow-sm">
            <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-sm font-semibold">
              🇮🇳 +91
            </span>
            <input
              type="tel"
              required
              maxLength={10}
              value={formData.mobileNumber}
              onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="98765 XXXXX"
              className="w-full px-4 py-2.5 rounded-r-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-950/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors"
            />
          </div>
          {formData.mobileNumber.length > 0 && !isMobileValid && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.
            </p>
          )}
          {isMobileValid && (
            <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Valid mobile number format. (7-day duplicate check applies upon submit)
            </p>
          )}
        </div>

        {/* Weights Grid: Gross & Net */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gross Weight */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Gross Weight (Grams) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Scale className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={formData.grossWeightGrams}
                onChange={(e) => handleChange('grossWeightGrams', e.target.value)}
                placeholder="Total jewelry weight, e.g. 24.50"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-950/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors"
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-medium text-slate-400">
                grams
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Includes stone, enamel, hooks</span>
          </div>

          {/* Net Weight */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Net Weight (Grams) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Scale className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={formData.netWeightGrams}
                onChange={(e) => handleChange('netWeightGrams', e.target.value)}
                placeholder="Excluding stones, e.g. 22.00"
                className={`w-full pl-10 pr-12 py-2.5 rounded-xl border ${
                  !isWeightValid
                    ? 'border-rose-500 focus:ring-rose-500/40 focus:border-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500/40 focus:border-amber-500'
                } bg-white/70 dark:bg-slate-950/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-colors`}
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-medium text-slate-400">
                grams
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Pure metal weight only</span>
          </div>
        </div>

        {/* Dynamic Error Banner if Net > Gross */}
        {!isWeightValid && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <div>
              <strong className="font-semibold">Weight Math Violation:</strong> Net Weight (
              {formData.netWeightGrams || 0}g) cannot exceed Gross Weight ({formData.grossWeightGrams || 0}g).
            </div>
          </div>
        )}

        {/* Purity Karat Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Gold Purity Karat <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { karat: 24, label: '24K', desc: '99.9% Pure Bullion' },
              { karat: 22, label: '22K', desc: '91.6% Standard Jewelry' },
              { karat: 18, label: '18K', desc: '75.0% Diamond Jewelry' },
            ].map((item) => {
              const isSelected = Number(formData.purityKarat) === item.karat;
              return (
                <button
                  key={item.karat}
                  type="button"
                  onClick={() => handleChange('purityKarat', item.karat)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">{item.label}</span>
                    <Sparkles className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Pure Gold Calculation Pill */}
        {isWeightValid && parseFloat(formData.netWeightGrams) > 0 && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Computed Pure Gold Equivalent ({formData.purityKarat}K):
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
              {pureGoldEstimate.toFixed(4)} grams
            </span>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
            canProceed
              ? 'gold-gradient-btn'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <span>Continue to Dynamic Calculation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
