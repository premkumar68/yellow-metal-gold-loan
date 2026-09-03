const { getLiveGoldRates } = require('../services/goldRateService');

/**
 * Controller to fetch live gold rates with 24K, 22K, 18K breakdown.
 * GET /api/v1/gold-rate
 */
const getGoldRate = async (req, res, next) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const rateData = await getLiveGoldRates(forceRefresh);

    return res.status(200).json({
      success: true,
      data: rateData,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getGoldRate };
