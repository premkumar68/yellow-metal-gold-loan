const assert = require('assert');
const {
  validateWeights,
  validateIndianMobile,
  maskMobileNumber,
  calculatePureGoldGrams,
  calculateMarketValue,
  calculateMaxEligibleLoan,
  calculateRepaymentBreakdown,
} = require('../src/utils/financialMath');
const { getLiveGoldRates, clearCache, CACHE_DURATION_MS } = require('../src/services/goldRateService');

console.log('----------------------------------------------------');
console.log(' Starting Yellow Metal Financial & Business Logic Tests');
console.log('----------------------------------------------------');

let passed = 0;
let failed = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`   PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`   FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

async function itAsync(description, fn) {
  try {
    await fn();
    console.log(`   PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`   FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

async function runTests() {
  // Test 1: Weight Validation Rule
  it('Financial Math: Net weight must be strictly <= gross weight', () => {
    assert.strictEqual(validateWeights(20, 18), true, 'Net < Gross should be valid');
    assert.strictEqual(validateWeights(20, 20), true, 'Net == Gross should be valid');
    assert.strictEqual(validateWeights(18, 20), false, 'Net > Gross must be rejected');
    assert.strictEqual(validateWeights(0, 0), false, 'Zero weight must be rejected');
    assert.strictEqual(validateWeights(-5, 2), false, 'Negative gross weight must be rejected');
    assert.strictEqual(validateWeights(10, -2), false, 'Negative net weight must be rejected');
  });

  // Test 2: Mobile Number Regex Validation
  it('Validation: Indian 10-digit mobile regex (/^[6-9]\\d{9}$/)', () => {
    assert.strictEqual(validateIndianMobile('9876543210'), true, 'Valid 9-series');
    assert.strictEqual(validateIndianMobile('8123456789'), true, 'Valid 8-series');
    assert.strictEqual(validateIndianMobile('7012345678'), true, 'Valid 7-series');
    assert.strictEqual(validateIndianMobile('6301234567'), true, 'Valid 6-series');
    assert.strictEqual(validateIndianMobile('5123456789'), false, '5-series must be rejected');
    assert.strictEqual(validateIndianMobile('987654321'), false, '9 digits must be rejected');
    assert.strictEqual(validateIndianMobile('98765432100'), false, '11 digits must be rejected');
    assert.strictEqual(validateIndianMobile('98765abc10'), false, 'Alphanumeric must be rejected');
    assert.strictEqual(validateIndianMobile(''), false, 'Empty string must be rejected');
  });

  // Test 3: Mobile Number Masking
  it('Security: Mobile number masked to 9876XXXX10 format', () => {
    assert.strictEqual(maskMobileNumber('9876543210'), '9876XXXX10');
    assert.strictEqual(maskMobileNumber('8888999900'), '8888XXXX00');
  });

  // Test 4: Pure Gold Calculation
  it('Financial Math: Pure Gold = Net Weight * (Purity Karat / 24)', () => {
    // 24K: 10g net -> 10 * (24/24) = 10g
    assert.strictEqual(calculatePureGoldGrams(10, 24), 10);

    // 22K: 24g net -> 24 * (22/24) = 22g
    assert.strictEqual(calculatePureGoldGrams(24, 22), 22);

    // 18K: 24g net -> 24 * (18/24) = 18g
    assert.strictEqual(calculatePureGoldGrams(24, 18), 18);

    // 22K: 10g net -> 10 * 22/24 = 9.1667g
    assert.strictEqual(calculatePureGoldGrams(10, 22), 9.1667);
  });

  // Test 5: Market Valuation and 75% LTV Cap
  it('Financial Math: Maximum Loan Eligibility strictly capped at 75% LTV', () => {
    const rate24K = 6000;
    const pureGold = 10; // 10g
    const marketVal = calculateMarketValue(pureGold, rate24K); // 60,000 INR
    assert.strictEqual(marketVal, 60000, 'Market value should be 60,000');

    // 75% LTV of 60,000 = 45,000
    const maxLoan = calculateMaxEligibleLoan(marketVal, 75);
    assert.strictEqual(maxLoan, 45000, 'Max loan at 75% LTV should be 45,000');

    // Should strictly cap even if a higher LTV like 85% is requested
    const cappedLoan = calculateMaxEligibleLoan(marketVal, 85);
    assert.strictEqual(cappedLoan, 45000, 'LTV above 75% must be capped strictly at 75%');
  });

  // Test 6: Repayment Breakdown Math
  it('Financial Math: Bullet vs Monthly EMI calculations', () => {
    const principal = 100000;
    const bullet = calculateRepaymentBreakdown(principal, 9.5, 12, 'Bullet Repayment Plan');
    // Bullet interest for 1 year @ 9.5% = 9500
    assert.strictEqual(bullet.totalInterest, 9500);
    assert.strictEqual(bullet.totalRepayable, 109500);
    assert.strictEqual(bullet.monthlyPayment, Math.round(9500 / 12));

    const emi = calculateRepaymentBreakdown(principal, 11.0, 12, 'Monthly EMI Plan');
    // For 100k @ 11% for 12 months, EMI is approx 8838
    assert.ok(emi.monthlyPayment > 8500 && emi.monthlyPayment < 9200, 'EMI within expected range');
    assert.ok(emi.totalRepayable > principal, 'Total repayable exceeds principal');
  });

  // Test 7: Gold Rate In-Memory Caching & Fallback
  await itAsync('Service: In-memory 10-minute caching mechanism for Gold Rates', async () => {
    clearCache();
    const firstCall = await getLiveGoldRates();
    assert.ok(firstCall.rates['24K'] > 0, '24K rate exists');
    assert.strictEqual(firstCall.cached, false, 'First call should not be marked cached');

    // Second call immediately after should be cached
    const secondCall = await getLiveGoldRates();
    assert.strictEqual(secondCall.cached, true, 'Second call must be served from cache');
    assert.strictEqual(secondCall.rates['24K'], firstCall.rates['24K'], 'Cached rate matches first call');
    assert.ok(secondCall.cacheRemainingSeconds > 0, 'Cache countdown active');
  });

  console.log('----------------------------------------------------');
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
