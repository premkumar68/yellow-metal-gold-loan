/**
 * Yellow Metal Financial Math & Risk Assessment Engine
 * 
 * Flow & Valuation Architecture:
 * 
 * Net Weight (g) ───► Pure Gold (g) = Net * (Karat/24) ───► Market Value = Pure Gold * 24K Rate
 *                                                                    │
 *                                                                    ▼
 *                                                        Max Eligible Loan (75% LTV Cap)
 */

/**
 * Validates whether net weight is strictly less than or equal to gross weight.
 * @param {number} grossWeight 
 * @param {number} netWeight 
 * @returns {boolean}
 */
const validateWeights = (grossWeight, netWeight) => {
  if (typeof grossWeight !== 'number' || typeof netWeight !== 'number') return false;
  if (grossWeight <= 0 || netWeight <= 0) return false;
  return netWeight <= grossWeight;
};

/**
 * Validates Indian 10-digit mobile number format.
 * Matches starting digits 6, 7, 8, 9 followed by 9 digits.
 * @param {string} mobileNumber 
 * @returns {boolean}
 */
const validateIndianMobile = (mobileNumber) => {
  if (!mobileNumber || typeof mobileNumber !== 'string') return false;
  const cleaned = mobileNumber.trim();
  const indianMobileRegex = /^[6-9]\d{9}$/;
  return indianMobileRegex.test(cleaned);
};

/**
 * Masks a 10-digit mobile number in standard format: 9876XXXX10
 * @param {string} mobileNumber 
 * @returns {string}
 */
const maskMobileNumber = (mobileNumber) => {
  if (!mobileNumber || typeof mobileNumber !== 'string') return '';
  const digits = mobileNumber.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 4)}XXXX${digits.slice(8)}`;
  }
  return mobileNumber;
};

/**
 * Calculates pure gold weight in grams based on purity karat.
 * Pure Gold = Net Weight * (Purity Karat / 24)
 * @param {number} netWeightGrams 
 * @param {number} purityKarat 
 * @returns {number} Pure gold grams rounded to 4 decimal places
 */
const calculatePureGoldGrams = (netWeightGrams, purityKarat) => {
  if (!netWeightGrams || !purityKarat || netWeightGrams <= 0) return 0;
  const karat = Number(purityKarat);
  if (![18, 22, 24].includes(karat)) {
    throw new Error('Unsupported purity karat. Accepted values: 18, 22, 24.');
  }
  const pure = Number(netWeightGrams) * (karat / 24);
  return Math.round(pure * 10000) / 10000;
};

/**
 * Calculates market value of gold collateral based on pure gold weight and 24K rate.
 * @param {number} pureGoldGrams 
 * @param {number} marketPricePerGram24K 
 * @returns {number} Market value rounded to 2 decimal places
 */
const calculateMarketValue = (pureGoldGrams, marketPricePerGram24K) => {
  if (!pureGoldGrams || !marketPricePerGram24K || pureGoldGrams <= 0 || marketPricePerGram24K <= 0) {
    return 0;
  }
  return Math.round(pureGoldGrams * marketPricePerGram24K * 100) / 100;
};

/**
 * Computes maximum eligible loan amount strictly capped at 75% LTV.
 * Max Eligible Loan = marketValue * 0.75
 * @param {number} marketValue 
 * @param {number} customLTV - default 75, hard capped at 75
 * @returns {number} Max loan rounded down to integer for safe disbursement
 */
const calculateMaxEligibleLoan = (marketValue, customLTV = 75) => {
  if (!marketValue || marketValue <= 0) return 0;
  const ltvRatio = Math.min(Math.max(Number(customLTV) || 75, 1), 75) / 100;
  return Math.floor(marketValue * ltvRatio);
};

/**
 * Calculates repayment breakdown for Bullet vs Monthly EMI scheme
 * @param {number} principal 
 * @param {number} annualRate 
 * @param {number} tenureMonths 
 * @param {string} planType 'Bullet Repayment Plan' | 'Monthly EMI Plan'
 */
const calculateRepaymentBreakdown = (principal, annualRate, tenureMonths = 12, planType) => {
  if (!principal || principal <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalRepayable: 0,
    };
  }

  const P = Number(principal);
  const R = Number(annualRate);
  const N = Number(tenureMonths);

  if (planType === 'Bullet Repayment Plan') {
    // Interest calculated simply per annum; principal repaid at maturity
    const totalInterest = Math.round(P * (R / 100) * (N / 12));
    const monthlyInterest = Math.round(totalInterest / N);
    return {
      monthlyPayment: monthlyInterest, // Monthly interest payment, principal at end
      monthlyInterestOnly: monthlyInterest,
      totalInterest,
      totalRepayable: P + totalInterest,
      bulletPrincipalAtEnd: P,
    };
  } else {
    // Monthly EMI Plan (Reducing balance amortization)
    const monthlyRate = R / 12 / 100;
    if (monthlyRate === 0) {
      const emi = Math.round(P / N);
      return {
        monthlyPayment: emi,
        totalInterest: 0,
        totalRepayable: P,
      };
    }
    const factor = Math.pow(1 + monthlyRate, N);
    const emi = Math.round((P * monthlyRate * factor) / (factor - 1));
    const totalRepayable = emi * N;
    const totalInterest = totalRepayable - P;

    return {
      monthlyPayment: emi,
      totalInterest,
      totalRepayable,
    };
  }
};

module.exports = {
  validateWeights,
  validateIndianMobile,
  maskMobileNumber,
  calculatePureGoldGrams,
  calculateMarketValue,
  calculateMaxEligibleLoan,
  calculateRepaymentBreakdown,
};
