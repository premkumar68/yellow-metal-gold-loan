const Lead = require('../models/Lead');
const LoanScheme = require('../models/LoanScheme');
const { getLiveGoldRates } = require('../services/goldRateService');
const {
  validateWeights,
  validateIndianMobile,
  calculatePureGoldGrams,
  calculateMarketValue,
  calculateMaxEligibleLoan,
  maskMobileNumber,
} = require('../utils/financialMath');

/**
 * Controller to submit a new gold loan lead/application.
 * POST /api/v1/leads/submit
 */
const submitLead = async (req, res, next) => {
  try {
    const {
      customerName,
      mobileNumber,
      grossWeightGrams,
      netWeightGrams,
      purityKarat,
      selectedPlanId,
    } = req.body;

    // 1. Validate required fields
    if (
      !customerName ||
      !mobileNumber ||
      grossWeightGrams === undefined ||
      netWeightGrams === undefined ||
      purityKarat === undefined ||
      !selectedPlanId
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: customerName, mobileNumber, grossWeightGrams, netWeightGrams, purityKarat, selectedPlanId.',
      });
    }

    // 2. Validate mobile number format
    const cleanedMobile = String(mobileNumber).trim();
    if (!validateIndianMobile(cleanedMobile)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Indian mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9.',
      });
    }

    // 3. Validate weights
    const gross = parseFloat(grossWeightGrams);
    const net = parseFloat(netWeightGrams);
    if (isNaN(gross) || isNaN(net) || gross <= 0 || net <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Gross weight and net weight must be positive numbers.',
      });
    }

    if (!validateWeights(gross, net)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Net weight cannot be greater than gross weight.',
      });
    }

    // 4. Validate purity karat
    const karat = parseInt(purityKarat, 10);
    if (![18, 22, 24].includes(karat)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purity karat. Allowed values are 18, 22, or 24.',
      });
    }

    // 5. 7-Day Deduplication Check
    // Rejects submission with 409 Conflict if application exists with same mobileNumber in past 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existingDuplicateLead = await Lead.findOne({
      mobileNumber: cleanedMobile,
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: -1 });

    if (existingDuplicateLead) {
      return res.status(409).json({
        success: false,
        message: 'Application already submitted within the last 7 days.',
        details: {
          existingApplicationId: existingDuplicateLead._id,
          submittedAt: existingDuplicateLead.createdAt,
          mobileNumberMasked: maskMobileNumber(cleanedMobile),
        },
      });
    }

    // 6. Verify loan scheme exists (optional fallback to default if not found)
    const scheme = await LoanScheme.findOne({ schemeId: selectedPlanId });
    const maxLTV = scheme ? scheme.maxLTV : 75;

    // 7. Dynamic server-side financial math
    const rateData = await getLiveGoldRates();
    const appliedRate24K = rateData.rate24K;

    const pureGoldGrams = calculatePureGoldGrams(net, karat);
    const marketValue = calculateMarketValue(pureGoldGrams, appliedRate24K);
    const calculatedLoanAmount = calculateMaxEligibleLoan(marketValue, maxLTV);

    // 8. Create and persist lead in MongoDB
    const newLead = new Lead({
      customerName: customerName.trim(),
      mobileNumber: cleanedMobile,
      grossWeightGrams: gross,
      netWeightGrams: net,
      purityKarat: karat,
      pureGoldGrams,
      appliedGoldRate24K: appliedRate24K,
      calculatedLoanAmount,
      selectedPlanId,
      status: 'SUBMITTED',
      createdAt: new Date(),
    });

    await newLead.save();

    // 9. Return 201 Created with requested payload
    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully to Yellow Metal.',
      data: {
        applicationId: newLead._id,
        customerName: newLead.customerName,
        appliedGoldRate24K: newLead.appliedGoldRate24K,
        calculatedLoanAmount: newLead.calculatedLoanAmount,
        pureGoldGrams: newLead.pureGoldGrams,
        selectedPlanId: newLead.selectedPlanId,
        status: newLead.status,
        createdAt: newLead.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller to fetch all leads sorted by createdAt descending.
 * GET /api/v1/leads
 */
const getLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    // Format leads for safe presentation (masked mobile, populated scheme name)
    const formattedLeads = leads.map((lead) => {
      const obj = lead.toObject();
      obj.maskedMobile = maskMobileNumber(lead.mobileNumber);
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: formattedLeads.length,
      data: formattedLeads,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller for Admin KPI Summary Metrics.
 * GET /api/v1/leads/stats
 */
const getLeadStats = async (req, res, next) => {
  try {
    const leads = await Lead.find();

    const totalApplications = leads.length;
    const totalSanctionedAmount = leads.reduce((acc, curr) => acc + (curr.calculatedLoanAmount || 0), 0);
    const totalPureGoldGrams = leads.reduce((acc, curr) => acc + (curr.pureGoldGrams || 0), 0);
    const averagePurity = totalApplications > 0
      ? (leads.reduce((acc, curr) => acc + curr.purityKarat, 0) / totalApplications).toFixed(1)
      : '0.0';

    return res.status(200).json({
      success: true,
      data: {
        totalApplications,
        totalSanctionedAmount,
        totalPureGoldGrams: Math.round(totalPureGoldGrams * 100) / 100,
        averagePurity: Number(averagePurity),
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  submitLead,
  getLeads,
  getLeadStats,
};
