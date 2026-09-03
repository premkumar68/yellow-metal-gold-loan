/**
 * Utility functions for currency, weight, phone masking and dates.
 */

export const formatINR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatWeight = (grams, decimals = 2) => {
  if (grams === null || grams === undefined || isNaN(grams)) return '0.00 g';
  return `${Number(grams).toFixed(decimals)} g`;
};

export const maskMobile = (mobileNumber) => {
  if (!mobileNumber) return '';
  const digits = String(mobileNumber).replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 4)}XXXX${digits.slice(8)}`;
  }
  return mobileNumber;
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

// Client-side quick calculation helpers
export const computePureGold = (netWeight, karat) => {
  const net = parseFloat(netWeight) || 0;
  const k = parseInt(karat, 10) || 24;
  if (net <= 0) return 0;
  return Math.round((net * (k / 24)) * 1000) / 1000;
};

export const computeMaxEligibleLoan = (pureGoldGrams, rate24K, ltv = 75) => {
  if (!pureGoldGrams || !rate24K) return 0;
  const marketVal = pureGoldGrams * rate24K;
  const cap = Math.min(Number(ltv) || 75, 75) / 100;
  return Math.floor(marketVal * cap);
};
