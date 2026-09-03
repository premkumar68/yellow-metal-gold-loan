# AI Engineering & Audit Log: Yellow Metal Gold Loan System

This document captures the generative AI engineering lifecycle, architectural prompts, audit trails, and concrete bug rectifications employed during the design and development of the **Yellow Metal** gold loan platform.

---

## 1. AI Tools Used
- **Antigravity AI (Google DeepMind)**: Full-stack MERN architecture design, financial math formalization, React 18 multi-step wizard state management, and Tailwind CSS dark/light theme engineering.
- **Node.js & Mongoose AI Copilot**: Database schema modeling, MongoMemoryServer zero-config fallback, and compound indexing for 7-day deduplication queries.

---

## 2. Key Prompts Used

### Prompt 1: Multi-Step Wizard State Management & Persistent Dark/Light Theme Switching
```text
Design an enterprise-grade React 18 frontend for Yellow Metal (a modern gold loan fintech portal) featuring:
1. A global ThemeContext leveraging Tailwind CSS class strategy ('dark' class on document.documentElement) that prevents theme flickering on page reload by hydrating directly from localStorage, supporting smooth transitions across cards, inputs, tables, and typography.
2. An interactive 3-step Application Intake Wizard:
   - Step 1: Customer details & gold weight inputs with strict real-time validation (Indian mobile regex /^[6-9]\d{9}$/ and Net Weight <= Gross Weight check with visual alert banners).
   - Step 2: Live gold collateral valuation widget (fetching live 24K benchmark rate, calculating pure gold grams = netWeight * karat / 24, capping loan eligibility strictly at 75% LTV), with interactive cards for Bullet Repayment Plan (9.5% p.a.) and Monthly EMI Plan (11% p.a.) including amortized payment breakdowns.
   - Step 3: Final confirmation review, loading CTA, and graceful error handling catching HTTP 409 Conflict.
```

### Prompt 2: 7-Day Database Deduplication Guard & Dynamic Live Gold Rate Calculation
```text
Construct an Express.js controller and service architecture for Yellow Metal's POST /api/v1/leads/submit endpoint adhering to statutory lending policies:
1. Deduplication Rule: Reject any submission with HTTP status 409 Conflict if the same mobileNumber has submitted an application within the past 7 days using a MongoDB $gte query on createdAt with compound indexing ({ mobileNumber: 1, createdAt: -1 }), returning details of the existing application.
2. Live Bullion Pricing: Query https://www.goldapi.io/api/XAU/INR to fetch live 24K gold rate per gram in INR. Implement a 10-minute in-memory cache (CACHE_DURATION_MS = 10 * 60 * 1000) to eliminate API rate-limiting throttling, with automatic fallback to FALLBACK_GOLD_RATE_24K=6000.
3. Server-side Validation & Audit: Re-compute pure gold weight and cap loan amount at 75% LTV on the server side, record appliedGoldRate24K for historical auditability, and persist the lead returning HTTP 201 with the created applicationId.
```

---

## 3. AI Audit & Manual Fix Example

### Edge-Case Bug Identified
**Issue:** During automated stress testing of the live gold rate integration service, when the external gold price API experienced network latency (>5000ms), timed out, or returned an unparsed payload without `price_gram_24k`, the initial AI-generated code produced `undefined` or `NaN` for `rate24K`. This cascaded through the calculation pipeline:
$$\text{Pure Gold} \times \text{NaN} = \text{NaN}$$
$$\text{Max Eligible Loan} = \text{NaN}$$
When this payload reached Mongoose validation (`calculatedLoanAmount: { type: Number, required: true }`), Mongoose threw a generic cast error `CastError: Cast to Number failed for value "NaN" at path "calculatedLoanAmount"`, causing an unhandled HTTP 500 error instead of a graceful fallback.

### Root Cause Analysis
1. The external API response structure varied between currency endpoints (sometimes returning `price` per troy ounce and other times `price_gram_24k`).
2. There was no numerical validation guard (`typeof rate === 'number' && !isNaN(rate) && rate > 0`) before persisting rates into the in-memory cache.
3. The fallback rate was not invoked on silent JSON schema mismatches.

### Concrete Code Remediation

#### Flawed Implementation (Before Audit):
```javascript
// Buggy implementation: Directly accessed nested property without fallback guard
const response = await axios.get(GOLD_API_URL, { headers: { 'x-access-token': apiKey } });
const rate24K = response.data.price_gram_24k; // Undefined if structure differs or times out
cachedGoldRate = { rate24K, timestamp: Date.now() };
return cachedGoldRate; // Passes undefined/NaN down to financialMath
```

#### Corrected & Hardened Implementation (After Manual Audit):
```javascript
// Hardened implementation in src/services/goldRateService.js:
try {
  const response = await axios.get(GOLD_API_URL, {
    headers: { 'x-access-token': GOLD_API_KEY, 'Content-Type': 'application/json' },
    timeout: 5000,
  });

  let rate24K = null;
  if (response.data) {
    if (typeof response.data.price_gram_24k === 'number' && response.data.price_gram_24k > 0) {
      rate24K = response.data.price_gram_24k;
    } else if (typeof response.data.price === 'number' && response.data.price > 0) {
      // Convert troy ounce to gram (1 troy ounce = 31.1034768 grams)
      rate24K = response.data.price / 31.1034768;
    }
  }

  if (rate24K && !isNaN(rate24K) && rate24K > 0) {
    const freshRates = formatRates(rate24K, 'LIVE_API');
    cachedGoldRate = freshRates;
    return freshRates;
  }
} catch (apiError) {
  console.warn(`[GoldRateService] GoldAPI failed (${apiError.message}). Falling back to calibrated benchmark.`);
}

// Deterministic fallback prevents NaN poisoning and guarantees 100% service uptime
const fallbackRates = formatRates(FALLBACK_GOLD_RATE_24K, 'FALLBACK_CONFIG');
cachedGoldRate = fallbackRates;
return fallbackRates;
```

---

## 4. Architectural Schematics & Educational Directives

### Backend Server Lifecycle:
![]()
- **Tag:** `https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcS5dtn_QY30e5sR_DWdls_W2iHG9TS1OKLVJ9fc5iA5CrGawJClDH6oCDotjBy94I-8-K43rYi-0Q0xxls`

### Financial Math & Valuation Engine:
![]()
- **Tag:** ``
- **Net vs. Gross Weight:** $\text{Net Weight} \le \text{Gross Weight}$
- **Pure Gold Conversion:** $\text{Pure Gold (g)} = \text{Net Weight (g)} \times \frac{\text{Purity Karat}}{24}$
- **Collateral Market Valuation:** $\text{Market Value (₹)} = \text{Pure Gold (g)} \times \text{24K Rate (₹/g)}$
- **Statutory Loan Cap:** $\text{Max Eligible Loan (₹)} = \lfloor \text{Market Value} \times 0.75 \rfloor$
