import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  AlertOctagon,
  Calendar,
  Sparkles,
  User,
  Phone,
  Scale,
  Award,
} from 'lucide-react';
import { formatINR, formatWeight, maskMobile, formatDate } from '../../utils/formatters';

export const Step3Confirmation = ({
  formData,
  schemes,
  goldRateData,
  onSubmit,
  isSubmitting,
  submissionResult,
  conflictError,
  onReset,
  onBack,
  onGoToDashboard,
}) => {
  const [copied, setCopied] = useState(false);

  const selectedScheme = schemes.find((s) => s.schemeId === formData.selectedPlanId) || schemes[0];
  const rate24K = goldRateData?.rates?.['24K'] || 6000;
  const netGrams = parseFloat(formData.netWeightGrams) || 0;
  const pureGoldGrams = (netGrams * (Number(formData.purityKarat) / 24)).toFixed(3);
  const marketVal = Math.round(pureGoldGrams * rate24K);
  const eligibleLoan = Math.floor(marketVal * (selectedScheme ? selectedScheme.maxLTV / 100 : 0.75));

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 1. Success State View
  if (submissionResult) {
    const { applicationId, calculatedLoanAmount, appliedGoldRate24K, createdAt } = submissionResult;

    return (
      <div className="glass-card rounded-2xl p-8 border border-emerald-500/30 shadow-xl text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-md">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <span className="inline-block mt-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Lead Sanctioned & Recorded
        </span>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
          Application Successfully Submitted!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
          Your Yellow Metal loan application has been registered with locked live bullion pricing.
        </p>

        {/* Application ID Card */}
        <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Application ID
            </span>
            <div className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
              {applicationId}
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(applicationId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Sanction Details Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-left">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Sanctioned Loan
            </span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400 block mt-0.5">
              {formatINR(calculatedLoanAmount)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Applied 24K Rate
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">
              {formatINR(appliedGoldRate24K)}/g
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Submission Time
            </span>
            <span className="text-xs font-semibold text-slate-900 dark:text-white block mt-1">
              {formatDate(createdAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Submit Another Application
          </button>
          <button
            type="button"
            onClick={onGoToDashboard}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold gold-gradient-btn"
          >
            View in Admin Summary Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 409 Conflict Error Alert Modal / Banner */}
      {conflictError && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-left shadow-lg animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Application Duplicate Conflict (HTTP 409)
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {conflictError.message || 'Application already submitted within the last 7 days.'}
              </p>
              {conflictError.details && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/20 text-[11px] space-y-1 text-slate-800 dark:text-slate-200">
                  <div>
                    <strong>Existing Application ID:</strong>{' '}
                    <span className="font-mono">{conflictError.details.existingApplicationId}</span>
                  </div>
                  <div>
                    <strong>Prior Submission Date:</strong>{' '}
                    {formatDate(conflictError.details.submittedAt)}
                  </div>
                  <div>
                    <strong>Mobile Number:</strong> {conflictError.details.mobileNumberMasked}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Under Yellow Metal risk governance, borrowers may only submit one application every 7 days per mobile number.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Step 3: Review Application & Statutory Loan Cap
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify collateral measurements and chosen scheme before instant registration.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Pre-Disbursal Review
          </span>
        </div>

        {/* Breakdown Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer & Collateral Card */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              Applicant & Collateral
            </h3>

            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Applicant Name</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formData.customerName}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Mobile Number</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                +91 {maskMobile(formData.mobileNumber)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Gross Weight</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatWeight(formData.grossWeightGrams)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Net Weight</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatWeight(formData.netWeightGrams)}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Assessed Purity</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {formData.purityKarat} Karat ({pureGoldGrams}g pure gold)
              </span>
            </div>
          </div>

          {/* Pricing & Loan Valuation Card */}
          <div className="p-5 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Financing Terms & 75% LTV
            </h3>

            <div className="flex justify-between py-1.5 border-b border-amber-500/20">
              <span className="text-slate-600 dark:text-slate-300">Selected Scheme</span>
              <span className="font-bold text-slate-900 dark:text-white">{selectedScheme?.name}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-amber-500/20">
              <span className="text-slate-600 dark:text-slate-300">Scheme Type</span>
              <span className="font-semibold text-slate-900 dark:text-white">{selectedScheme?.type}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-amber-500/20">
              <span className="text-slate-600 dark:text-slate-300">Interest Rate</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {selectedScheme?.interestRate}% p.a.
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-amber-500/20">
              <span className="text-slate-600 dark:text-slate-300">Live 24K Rate Applied</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatINR(rate24K)}/g</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-600 dark:text-slate-300">Max Loan Disbursal (75% LTV)</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {formatINR(eligibleLoan)}
              </span>
            </div>
          </div>
        </div>

        {/* Compliance Footer Note */}
        <div className="mt-6 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            By proceeding, you certify accuracy of collateral measurements and agree to the Yellow Metal 7-day single-lead submission policy.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Modify Details</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold gold-gradient-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting to Yellow Metal...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit Application to Yellow Metal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
