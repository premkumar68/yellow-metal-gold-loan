const axios = require('axios');

/**
 * In-memory cache for live gold rates to prevent external API quota throttling.
 * Cache Duration: 10 minutes (10 * 60 * 1000 ms = 600,000 ms)
 */
let cachedGoldRate = null;

const CACHE_DURATION_MS = parseInt(process.env.CACHE_DURATION_MS, 10) || 10 * 60 * 1000;
const FALLBACK_GOLD_RATE_24K = parseFloat(process.env.FALLBACK_GOLD_RATE_24K) || 6000;
const GOLD_API_URL = process.env.GOLD_API_URL || 'https://www.goldapi.io/api/XAU/INR';
const GOLD_API_KEY = process.env.GOLD_API_KEY || '';

/**
 * Computes rates for 24K, 22K, and 18K given a 24K base rate.
 * @param {number} rate24K 
 * @param {string} source 'LIVE_API' | 'FALLBACK_CONFIG' | 'CACHE'
 * @returns {object}
 */
const formatRates = (rate24K, source = 'LIVE_API') => {
  const rounded24K = Math.round(Number(rate24K));
  const rate22K = Math.round(rounded24K * (22 / 24));
  const rate18K = Math.round(rounded24K * (18 / 24));

  return {
    currency: 'INR',
    unit: 'gram',
    rates: {
      '24K': rounded24K,
      '22K': rate22K,
      '18K': rate18K,
    },
    rate24K: rounded24K,
    rate22K,
    rate18K,
    source,
    cached: source === 'CACHE',
    timestamp: Date.now(),
    nextCacheRefreshAt: Date.now() + CACHE_DURATION_MS,
  };
};

/**
 * Fetches the live 24K gold rate with 10-minute caching and graceful fallback.
 * @param {boolean} forceRefresh - If true, bypasses the in-memory cache
 * @returns {Promise<object>}
 */
const getLiveGoldRates = async (forceRefresh = false) => {
  const now = Date.now();

  // 1. Check in-memory cache
  if (!forceRefresh && cachedGoldRate && (now - cachedGoldRate.timestamp < CACHE_DURATION_MS)) {
    return {
      ...cachedGoldRate,
      cached: true,
      cacheRemainingSeconds: Math.round((cachedGoldRate.nextCacheRefreshAt - now) / 1000),
    };
  }

  // 2. Fetch from Live API if API key is provided
  if (GOLD_API_KEY && GOLD_API_KEY.trim() !== '') {
    try {
      const response = await axios.get(GOLD_API_URL, {
        headers: {
          'x-access-token': GOLD_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5s timeout
      });

      let rate24K = null;
      if (response.data) {
        if (response.data.price_gram_24k) {
          rate24K = response.data.price_gram_24k;
        } else if (response.data.price) {
          // 1 troy ounce = 31.1034768 grams
          rate24K = response.data.price / 31.1034768;
        }
      }

      if (rate24K && rate24K > 0) {
        const freshRates = formatRates(rate24K, 'LIVE_API');
        cachedGoldRate = freshRates;
        return {
          ...freshRates,
          cached: false,
          cacheRemainingSeconds: Math.round(CACHE_DURATION_MS / 1000),
        };
      }
    } catch (apiError) {
      console.warn(
        `[GoldRateService] GoldAPI request failed (${apiError.message}). Utilizing fallback rate ₹${FALLBACK_GOLD_RATE_24K}/g`
      );
    }
  } else {
    // API key not configured, inform and use fallback
    console.info(
      `[GoldRateService] No GOLD_API_KEY configured. Utilizing calibrated benchmark rate: ₹${FALLBACK_GOLD_RATE_24K}/g`
    );
  }

  // 3. Fallback rate mechanism
  const fallbackRates = formatRates(FALLBACK_GOLD_RATE_24K, 'FALLBACK_CONFIG');
  cachedGoldRate = fallbackRates;

  return {
    ...fallbackRates,
    cached: false,
    cacheRemainingSeconds: Math.round(CACHE_DURATION_MS / 1000),
  };
};

/**
 * Resets the in-memory cache (primarily used in automated testing).
 */
const clearCache = () => {
  cachedGoldRate = null;
};

module.exports = {
  getLiveGoldRates,
  clearCache,
  CACHE_DURATION_MS,
};
