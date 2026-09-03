import React from 'react';
import {
  Calculator,
  ShieldAlert,
  Percent,
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatINR, computePureGold, computeMaxEligibleLoan } from '../../utils/formatters';

export const Step2Calculator = ({
  formData,
  setFormData,
  schemes,
  goldRateData,
  onNext,
  onBack,
}) => {
  const rate24K = goldRateData?.rates?.['24K'] || 6000;
  const pureGoldGrams = computePureGold(formData.netWeightGrams, formData.purityKarat);
  const marketValue = Math.round(pureGoldGrams * rate24K);

  // Selected scheme details
  const selectedScheme = schemes.find((s) => s.schemeId === formData.selectedPlanId) || schemes[0];
  const maxLTV = selectedScheme ? selectedScheme.maxLTV : 75;
  const maxEligibleLoan = computeMaxEligibleLoan(pureGoldGrams, rate24K, maxLTV);

  // Repayment simulation based on selected scheme
  const tenure = selectedScheme?.tenureMonths || 12;
  const annualRate = selectedScheme?.interestRate || 9.5;
  const isBullet = selectedScheme?.type === 'Bullet Repayment Plan';

  let monthlyAmount = 0;
  let totalInterest = 0;
  let totalRepayable = 0;

  if (maxEligibleLoan > 0) {
    if (isBullet) {
      totalInterest = Math.round(maxEligibleLoan * (annualRate / 100) * (tenure / 12));
      monthlyAmount = Math.round(totalInterest / tenure);
      totalRepayable = maxEligibleLoan + totalInterest;
    } else {
      const r = annualRate / 12 / 100;
      const factor = Math.pow(1 + r, tenure);
      monthlyAmount = Math.round((maxEligibleLoan * r * factor) / (factor - 1));
      totalRepayable = monthlyAmount * tenure;
      totalInterest = totalRepayable - maxEligibleLoan;
    }
  }

  const handleSelectScheme = (schemeId) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlanId: schemeId,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Gold Valuation & LTV Banner */}
      <div className="glass-card rounded-2xl p-6 border border-amber-500/30 shadow-gold-glow bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-gold-glow">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Gold Valuation & 75% LTV Cap
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Statutory valuation calculated at live benchmark rates.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
            RBI Regulated 75% LTV
          </span>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Pure Gold Weight */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pure Gold Collateral</span>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {pureGoldGrams.toFixed(3)} <span className="text-xs font-semibold text-slate-400">grams</span>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 block">
              {formData.netWeightGrams}g @ {formData.purityKarat}K purity
            </span>
          </div>

          {/* Applied Live 24K Benchmark Rate */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live 24K Gold Rate</span>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {formatINR(rate24K)}
              <span className="text-xs font-semibold text-slate-400">/g</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Live Market Feed
            </span>
          </div>

          {/* Max Eligible Sanction Amount */}
          <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/50 shadow-gold-glow">
            <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold uppercase tracking-wider">
              Max Eligible Loan (75% LTV)
            </span>
            <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatINR(maxEligibleLoan)}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Collateral Value: {formatINR(marketValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Selectable Loan Scheme Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Select Your Repayment Scheme
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Compare plans tailored to your cash flow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schemes.map((scheme) => {
            const isSelected = formData.selectedPlanId === scheme.schemeId;
            return (
              <div
                key={scheme.schemeId}
                onClick={() => handleSelectScheme(scheme.schemeId)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/10 shadow-gold-glow ring-2 ring-amber-500'
                    : 'glass-card border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 text-amber-500 dark:text-amber-400">
                    <CheckCircle className="w-5 h-5 fill-amber-500 text-slate-950 dark:text-slate-900" />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {scheme.type === 'Bullet Repayment Plan' ? 'Bullet Repayment' : 'Amortized EMI'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {scheme.tenureMonths} Months
                  </span>
                </div>

                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  {scheme.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {scheme.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Interest Rate</span>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                      {scheme.interestRate}% <span className="text-xs font-normal">p.a.</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Max LTV Cap</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {scheme.maxLTV}%
                    </span>
                  </div>
                </div>

                {scheme.bulletFeatures && (
                  <ul className="mt-3 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    {scheme.bulletFeatures.slice(0, 2).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Repayment Breakdown Projection */}
      {maxEligibleLoan > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-amber-500" />
            Estimated Repayment Breakdown ({selectedScheme?.name})
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 block">Principal Sanction</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                {formatINR(maxEligibleLoan)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 block">
                {isBullet ? 'Monthly Interest' : 'Monthly EMI'}
              </span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1 block">
                {formatINR(monthlyAmount)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 block">Total Interest (12M)</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                {formatINR(totalInterest)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 block">Total Repayment</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                {formatINR(totalRepayable)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 italic">
            * Note: {isBullet ? 'In the Bullet Repayment plan, pay monthly interest only and repay principal amount at tenure completion.' : 'In the Monthly EMI plan, pay fixed monthly installments reducing principal and interest concurrently.'}
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Details</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold gold-gradient-btn"
        >
          <span>Review & Submit Application</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
