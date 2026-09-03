# Yellow Metal: Modern Fintech Gold Loan Portal

**Yellow Metal** is a modern, high-converting, dark/light theme-supported web-based Gold Loan Application & Data Collection System built using the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

---

## Architecture & Diagrams

### 1. Backend Server Setup & Architectural Blueprint
![Backend Architecture](https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcS5dtn_QY30e5sR_DWdls_W2iHG9TS1OKLVJ9fc5iA5CrGawJClDH6oCDotjBy94I-8-K43rYi-0Q0xxls)

### 2. Financial Math & Collateral Valuation Flow
![Financial Valuation Flow]()

```
Collateral Input
 (Gross & Net Wt.) ──► Purity Karat (18/22/24) ──► Pure Gold = Net * (Karat/24)
                                                          │
                                                          ▼
 Market Value = Pure Gold * 24K Live Rate ◄──── Live Gold API (10-min Cache)
         │
         ▼
 Max Eligible Loan = Market Value * 0.75 (Strict 75% LTV Cap)
         │
         ▼
 Scheme Options: Bullet Repayment (9.5%) vs. Monthly EMI (11.0%)
```

---

## Core Business Rules & Financial Math

1. **Net vs. Gross Weight:** `netWeightGrams` MUST be strictly `<= grossWeightGrams`.
2. **Pure Gold Calculation:**
   $$\text{Pure Gold (g)} = \text{Net Weight (g)} \times \left(\frac{\text{Purity Karat}}{24}\right)$$
3. **Live Gold Rate & 10-Minute Caching:**
   - Fetches live 24K rate from `https://www.goldapi.io/api/XAU/INR` (fallback rate: `FALLBACK_GOLD_RATE_24K=6000`).
   - Cached in memory for 10 minutes (`CACHE_DURATION_MS = 600000`) to avoid API rate-limit throttling.
   - Computes market value: $\text{marketValue} = \text{pureGoldGrams} \times \text{marketPricePerGram24K}$.
4. **Statutory 75% LTV Cap:** Maximum loan eligibility is strictly capped at 75% LTV:
   $$\text{maxEligibleLoan} = \lfloor \text{marketValue} \times 0.75 \rfloor$$
5. **Indian Mobile Validation:** Strict 10-digit regex `/^[6-9]\d{9}$/`.
6. **7-Day Deduplication Conflict (HTTP 409):** Rejects any submission if the same `mobileNumber` has submitted an application within the past 7 days (`$gte` on `createdAt`).

---

## Project Structure

```
d:/smile/
├── AI_LOG.md                             # AI tooling, key prompts, audit and bug fixes
├── README.md                             # Full documentation & setup guide
├── server/                               # Express & MongoDB backend
│   ├── .env                              # Port, MongoDB URI, GoldAPI key, Fallback rate
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── config/db.js                  # MongoMemoryServer zero-config fallback
│   │   ├── models/
│   │   │   ├── LoanScheme.js             # Bullet & EMI scheme schema
│   │   │   └── Lead.js                   # Application schema with compound index
│   │   ├── services/goldRateService.js   # Live GoldAPI + 10-min cache + fallback
│   │   ├── utils/financialMath.js        # Pure gold calc, 75% LTV, EMI schedule, mobile masking
│   │   ├── controllers/
│   │   │   ├── goldRateController.js     # GET /api/v1/gold-rate
│   │   │   ├── loanSchemeController.js   # GET /api/v1/loan-schemes
│   │   │   └── leadController.js         # POST /api/v1/leads/submit, GET /api/v1/leads, stats
│   │   ├── routes/api.js                 # API route definitions
│   │   └── server.js                     # Express app setup and middleware
│   └── tests/
│       ├── financial_and_api.test.js     # Unit test suite for financial math and caching
│       └── api_integration.test.js       # Integration tests for all endpoints and 409 conflict
└── client/                               # React 18 + Vite + Tailwind CSS frontend
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js                # Custom Yellow Metal theme (gold/amber palette, dark mode)
    └── src/
        ├── context/ThemeContext.jsx      # Dark/Light theme manager (persisted in localStorage)
        ├── services/api.js               # Axios client for backend endpoints
        ├── utils/formatters.js           # INR currency, weight, and mobile masking (9876XXXX10)
        ├── components/
        │   ├── Navbar.jsx                # Brand logo, live gold rate ticker, theme toggle, nav tabs
        │   ├── StepWizard/               # Interactive 3-step application intake wizard
        │   │   ├── StepIndicator.jsx
        │   │   ├── Step1Details.jsx      # Weight & mobile validation
        │   │   ├── Step2Calculator.jsx   # Live calculator, scheme picker, repayment preview
        │   │   └── Step3Confirmation.jsx # Review summary, submit spinner, 409 error modal
        │   └── AdminDashboard/           # Admin Analytics & Records
        │       ├── KpiCards.jsx          # Sanctioned volume, count, avg purity, pledged weight
        │       ├── FilterBar.jsx         # Search, filter by plan/purity, CSV export
        │       ├── LeadTable.jsx         # Masked mobile, loan amount, badges, formatted dates
        │       └── LeadDetailModal.jsx   # Full dossier inspection
        ├── App.jsx                       # Tab switcher & application state
        └── main.jsx
```

---

## Quickstart Guide

### 1. Backend Setup
```bash
cd server
npm install
npm start
```
The server will run on `http://localhost:5000`. If local MongoDB is not running, it automatically spins up an embedded `mongodb-memory-server` for zero-configuration testing!

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Running Automated Tests

```bash
cd server
# Run unit tests for financial math, validation, and caching:
npm test

# Run full end-to-end API integration tests (including 409 Conflict):
node tests/api_integration.test.js
```

Both test suites run completely self-contained and execute against all business and financial logic rules.
