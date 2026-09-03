import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StepIndicator } from './components/StepWizard/StepIndicator';
import { Step1Details } from './components/StepWizard/Step1Details';
import { Step2Calculator } from './components/StepWizard/Step2Calculator';
import { Step3Confirmation } from './components/StepWizard/Step3Confirmation';
import { KpiCards } from './components/AdminDashboard/KpiCards';
import { FilterBar } from './components/AdminDashboard/FilterBar';
import { LeadTable } from './components/AdminDashboard/LeadTable';
import { LeadDetailModal } from './components/AdminDashboard/LeadDetailModal';
import { Toast } from './components/common/Toast';
import { api } from './services/api';
import { ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const App = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState('intake'); // 'intake' | 'admin'

  // Live Market & Schemes Data
  const [goldRateData, setGoldRateData] = useState(null);
  const [isRefreshingRate, setIsRefreshingRate] = useState(false);
  const [schemes, setSchemes] = useState([]);

  // Multi-step Wizard Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    grossWeightGrams: '',
    netWeightGrams: '',
    purityKarat: 22,
    selectedPlanId: 'YM-BULLET-9.5',
  });

  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [conflictError, setConflictError] = useState(null);

  // Admin Dashboard State
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [purityFilter, setPurityFilter] = useState('ALL');
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState(null);

  // Global Toast State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // 1. Fetch initial Live Rates & Loan Schemes
  const fetchGoldRate = async (forceRefresh = false) => {
    setIsRefreshingRate(true);
    try {
      const res = await api.getGoldRate(forceRefresh);
      if (res.success) {
        setGoldRateData(res.data);
        if (forceRefresh) {
          setToast({
            message: `Gold rates refreshed (24K: ₹${res.data.rates['24K']}/g)`,
            type: 'success',
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch gold rates:', err);
    } finally {
      setIsRefreshingRate(false);
    }
  };

  const fetchSchemes = async () => {
    try {
      const res = await api.getLoanSchemes();
      if (res.success && res.data.length > 0) {
        setSchemes(res.data);
        if (!formData.selectedPlanId) {
          setFormData((prev) => ({ ...prev, selectedPlanId: res.data[0].schemeId }));
        }
      }
    } catch (err) {
      console.error('Failed to load loan schemes:', err);
    }
  };

  const fetchAdminData = async () => {
    setIsLoadingLeads(true);
    try {
      const [leadsRes, statsRes] = await Promise.all([api.getLeads(), api.getLeadStats()]);
      if (leadsRes.success) setLeads(leadsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load admin leads:', err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchGoldRate();
    fetchSchemes();
  }, []);

  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminData();
    }
  }, [activeTab]);

  // Real-time Validations
  const gross = parseFloat(formData.grossWeightGrams);
  const net = parseFloat(formData.netWeightGrams);
  const isWeightValid =
    !isNaN(gross) &&
    !isNaN(net) &&
    gross > 0 &&
    net > 0 &&
    net <= gross;

  const isMobileValid = /^[6-9]\d{9}$/.test(formData.mobileNumber.trim());

  // Submit Application
  const handleSubmitLead = async () => {
    setIsSubmitting(true);
    setConflictError(null);

    const payload = {
      customerName: formData.customerName.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      grossWeightGrams: parseFloat(formData.grossWeightGrams),
      netWeightGrams: parseFloat(formData.netWeightGrams),
      purityKarat: parseInt(formData.purityKarat, 10),
      selectedPlanId: formData.selectedPlanId,
    };

    try {
      const response = await api.submitLead(payload);
      if (response.success) {
        setSubmissionResult(response.data);
        setToast({
          message: 'Application successfully sanctioned and registered!',
          type: 'success',
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // 7-day duplicate conflict
        setConflictError(error.response.data);
        setToast({
          message: 'Duplicate application detected within 7-day window.',
          type: 'error',
        });
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Submission failed';
        setToast({
          message: errorMsg,
          type: 'error',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      customerName: '',
      mobileNumber: '',
      grossWeightGrams: '',
      netWeightGrams: '',
      purityKarat: 22,
      selectedPlanId: schemes[0]?.schemeId || 'YM-BULLET-9.5',
    });
    setSubmissionResult(null);
    setConflictError(null);
    setCurrentStep(1);
  };

  // Admin Search & Filter Logic
  const filteredLeads = leads.filter((lead) => {
    // Search query
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      lead.customerName.toLowerCase().includes(query) ||
      lead.mobileNumber.includes(query) ||
      (lead.maskedMobile && lead.maskedMobile.includes(query)) ||
      (lead._id && lead._id.includes(query));

    // Scheme filter
    const matchesPlan =
      planFilter === 'ALL' || lead.selectedPlanId === planFilter;

    // Purity filter
    const matchesPurity =
      purityFilter === 'ALL' || String(lead.purityKarat) === String(purityFilter);

    return matchesSearch && matchesPlan && matchesPurity;
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      setToast({ message: 'No leads available to export.', type: 'error' });
      return;
    }

    const headers = [
      'Application ID',
      'Customer Name',
      'Masked Mobile',
      'Gross Wt (g)',
      'Net Wt (g)',
      'Purity (K)',
      'Pure Gold (g)',
      'Applied Rate 24K',
      'Selected Plan',
      'Loan Amount (INR)',
      'Submission Date',
    ];

    const rows = filteredLeads.map((l) => [
      `"${l._id}"`,
      `"${l.customerName}"`,
      `"${l.maskedMobile || l.mobileNumber}"`,
      l.grossWeightGrams,
      l.netWeightGrams,
      l.purityKarat,
      l.pureGoldGrams,
      l.appliedGoldRate24K,
      `"${l.selectedPlanId}"`,
      l.calculatedLoanAmount,
      `"${new Date(l.createdAt).toISOString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `yellow_metal_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({
      message: `Exported ${filteredLeads.length} leads to CSV successfully.`,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        goldRateData={goldRateData}
        onRefreshGoldRate={() => fetchGoldRate(true)}
        isRefreshingRate={isRefreshingRate}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: PARTNER INTAKE WIZARD */}
        {activeTab === 'intake' && (
          <div className="max-w-4xl mx-auto">
            {/* Header Hero */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-3 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Gold Loan Evaluation & Lead Capture</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Gold Loan Application Wizard
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Accurately evaluate gold jewelry weight, lock in live bullion pricing, and sanction loans under statutory 75% LTV regulations.
              </p>
            </div>

            {/* Step Indicator */}
            <StepIndicator
              currentStep={currentStep}
              setStep={(step) => {
                if (step < currentStep || (step === 2 && isWeightValid && isMobileValid)) {
                  setCurrentStep(step);
                }
              }}
              isStep1Valid={isWeightValid && isMobileValid}
              isStep2Valid={Boolean(formData.selectedPlanId)}
            />

            {/* Wizard Steps */}
            {currentStep === 1 && (
              <Step1Details
                formData={formData}
                setFormData={setFormData}
                onNext={() => setCurrentStep(2)}
                isWeightValid={isWeightValid}
                isMobileValid={isMobileValid}
              />
            )}

            {currentStep === 2 && (
              <Step2Calculator
                formData={formData}
                setFormData={setFormData}
                schemes={schemes}
                goldRateData={goldRateData}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <Step3Confirmation
                formData={formData}
                schemes={schemes}
                goldRateData={goldRateData}
                onSubmit={handleSubmitLead}
                isSubmitting={isSubmitting}
                submissionResult={submissionResult}
                conflictError={conflictError}
                onReset={handleResetForm}
                onBack={() => setCurrentStep(2)}
                onGoToDashboard={() => setActiveTab('admin')}
              />
            )}
          </div>
        )}

        {/* VIEW 2: ADMIN SUMMARY DASHBOARD */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Admin Analytics & Lead Records
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Real-time portfolio overview, collateral risk audit, and lead management.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('intake')}
                className="self-start sm:self-auto gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold"
              >
                + Create New Lead
              </button>
            </div>

            {/* KPI Summary Cards */}
            <KpiCards stats={stats} />

            {/* Search & Filter Toolbar */}
            <FilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              planFilter={planFilter}
              setPlanFilter={setPlanFilter}
              purityFilter={purityFilter}
              setPurityFilter={setPurityFilter}
              onRefresh={fetchAdminData}
              isRefreshing={isLoadingLeads}
              onExportCSV={handleExportCSV}
              totalResults={filteredLeads.length}
            />

            {/* Lead Records Table */}
            <LeadTable
              leads={filteredLeads}
              onSelectLead={(lead) => setSelectedLeadForDetail(lead)}
              isLoading={isLoadingLeads}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} <strong>Yellow Metal</strong> Fintech Portal. All rights reserved.
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            75% Maximum Statutory LTV Compliance
          </span>
        </div>
      </footer>

      {/* Modals & Toasts */}
      {selectedLeadForDetail && (
        <LeadDetailModal
          lead={selectedLeadForDetail}
          onClose={() => setSelectedLeadForDetail(null)}
        />
      )}

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}
    </div>
  );
};
