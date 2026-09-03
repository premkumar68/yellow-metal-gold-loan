const LoanScheme = require('../models/LoanScheme');

const DEFAULT_SCHEMES = [
  {
    schemeId: 'YM-BULLET-9.5',
    name: 'Bullet Repayment Plan',
    type: 'Bullet Repayment Plan',
    interestRate: 9.5,
    maxLTV: 75,
    tenureMonths: 12,
    description: 'Pay only nominal monthly interest. Repay total principal lump-sum at maturity. Ideal for traders & business cycles.',
    bulletFeatures: [
      '9.5% per annum fixed interest',
      'Maximum 75% LTV sanctioned',
      'Pay principal at loan closure',
      'Zero monthly principal burden',
    ],
  },
  {
    schemeId: 'YM-EMI-11.0',
    name: 'Monthly EMI Plan',
    type: 'Monthly EMI Plan',
    interestRate: 11.0,
    maxLTV: 75,
    tenureMonths: 12,
    description: 'Disciplined amortized payments combining principal and interest. Gradually lowers debt burden every month.',
    bulletFeatures: [
      '11.0% per annum reducing balance',
      'Maximum 75% LTV sanctioned',
      'Predictable fixed monthly EMI',
      'Automatic collateral release eligibility upon completion',
    ],
  },
];

/**
 * Ensures initial default schemes exist in the database.
 */
const seedDefaultSchemes = async () => {
  for (const scheme of DEFAULT_SCHEMES) {
    await LoanScheme.findOneAndUpdate(
      { schemeId: scheme.schemeId },
      { $setOnInsert: scheme },
      { upsert: true, new: true }
    );
  }
};

/**
 * Controller to fetch all active loan schemes.
 * Auto-seeds default Yellow Metal schemes if not present.
 * GET /api/v1/loan-schemes
 */
const getLoanSchemes = async (req, res, next) => {
  try {
    let schemes = await LoanScheme.find().sort({ interestRate: 1 });

    if (schemes.length === 0) {
      await seedDefaultSchemes();
      schemes = await LoanScheme.find().sort({ interestRate: 1 });
    }

    return res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getLoanSchemes,
  seedDefaultSchemes,
};
