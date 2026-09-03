const assert = require('assert');
const http = require('http');
const { app } = require('../src/server');
const { connectDB, disconnectDB } = require('../src/config/db');
const Lead = require('../src/models/Lead');
const LoanScheme = require('../src/models/LoanScheme');

let server;
let port;
let baseUrl;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runApiIntegrationTests() {
  console.log('----------------------------------------------------');
  console.log(' Starting Yellow Metal API Integration Tests');
  console.log('----------------------------------------------------');

  let passed = 0;
  let failed = 0;

  function recordPass(msg) {
    console.log(`   PASS: ${msg}`);
    passed++;
  }
  function recordFail(msg, err) {
    console.error(`   FAIL: ${msg}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }

  try {
    // 1. Setup in-memory DB and start server on random available port
    await connectDB();
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`Test server running at ${baseUrl}`);
        resolve();
      });
    });

    // Test: Health check
    try {
      const res = await request('GET', '/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'healthy');
      recordPass('GET /health returns 200 healthy');
    } catch (e) {
      recordFail('GET /health returns 200 healthy', e);
    }

    // Test: GET /api/v1/gold-rate
    try {
      const res = await request('GET', '/api/v1/gold-rate');
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data.rates['24K'] > 0);
      assert.ok(res.data.data.rates['22K'] > 0);
      assert.ok(res.data.data.rates['18K'] > 0);
      assert.strictEqual(res.data.data.rates['22K'], Math.round(res.data.data.rates['24K'] * (22 / 24)));
      recordPass('GET /api/v1/gold-rate returns live 24K, 22K, and 18K breakdown');
    } catch (e) {
      recordFail('GET /api/v1/gold-rate returns breakdown', e);
    }

    // Test: GET /api/v1/loan-schemes (auto-seed)
    try {
      const res = await request('GET', '/api/v1/loan-schemes');
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data.length >= 2);
      const bullet = res.data.data.find((s) => s.type === 'Bullet Repayment Plan');
      const emi = res.data.data.find((s) => s.type === 'Monthly EMI Plan');
      assert.ok(bullet, 'Bullet plan auto-seeded');
      assert.ok(emi, 'Monthly EMI plan auto-seeded');
      assert.strictEqual(bullet.interestRate, 9.5);
      assert.strictEqual(emi.interestRate, 11);
      assert.strictEqual(bullet.maxLTV, 75);
      recordPass('GET /api/v1/loan-schemes auto-seeds and returns Bullet and EMI schemes');
    } catch (e) {
      recordFail('GET /api/v1/loan-schemes returns schemes', e);
    }

    // Test: POST /api/v1/leads/submit with net weight > gross weight (should return 400)
    try {
      const invalidWeightPayload = {
        customerName: 'Aarav Sharma',
        mobileNumber: '9876543210',
        grossWeightGrams: 20,
        netWeightGrams: 25, // Invalid: Net > Gross
        purityKarat: 22,
        selectedPlanId: 'YM-BULLET-9.5',
      };
      const res = await request('POST', '/api/v1/leads/submit', invalidWeightPayload);
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.message.includes('Net weight cannot be greater than gross weight'));
      recordPass('POST /api/v1/leads/submit rejects netWeight > grossWeight with 400');
    } catch (e) {
      recordFail('POST /api/v1/leads/submit weight validation', e);
    }

    // Test: POST /api/v1/leads/submit with invalid mobile (should return 400)
    try {
      const invalidMobilePayload = {
        customerName: 'Aarav Sharma',
        mobileNumber: '1234567890', // Invalid: does not start with 6-9
        grossWeightGrams: 30,
        netWeightGrams: 28,
        purityKarat: 22,
        selectedPlanId: 'YM-BULLET-9.5',
      };
      const res = await request('POST', '/api/v1/leads/submit', invalidMobilePayload);
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.message.includes('Invalid Indian mobile number'));
      recordPass('POST /api/v1/leads/submit rejects non-Indian mobile regex with 400');
    } catch (e) {
      recordFail('POST /api/v1/leads/submit mobile regex validation', e);
    }

    // Test: POST /api/v1/leads/submit valid submission (should return 201)
    let createdLeadId = null;
    try {
      const validPayload = {
        customerName: 'Rohan Verma',
        mobileNumber: '9811223344',
        grossWeightGrams: 40,
        netWeightGrams: 36, // 36g @ 22K -> 33g pure gold
        purityKarat: 22,
        selectedPlanId: 'YM-BULLET-9.5',
      };
      const res = await request('POST', '/api/v1/leads/submit', validPayload);
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.data.applicationId);
      assert.ok(res.data.data.appliedGoldRate24K > 0);
      assert.ok(res.data.data.calculatedLoanAmount > 0);
      assert.strictEqual(res.data.data.pureGoldGrams, 33);
      createdLeadId = res.data.data.applicationId;
      recordPass('POST /api/v1/leads/submit saves lead and returns 201 with loan calculation');
    } catch (e) {
      recordFail('POST /api/v1/leads/submit valid submission', e);
    }

    // Test: POST /api/v1/leads/submit 7-day duplicate check (should return 409 Conflict)
    try {
      const duplicatePayload = {
        customerName: 'Rohan Verma (Re-apply)',
        mobileNumber: '9811223344', // Same mobile number within 7 days
        grossWeightGrams: 50,
        netWeightGrams: 45,
        purityKarat: 24,
        selectedPlanId: 'YM-EMI-11.0',
      };
      const res = await request('POST', '/api/v1/leads/submit', duplicatePayload);
      assert.strictEqual(res.status, 409, `Expected 409 Conflict, got ${res.status}`);
      assert.strictEqual(res.data.message, 'Application already submitted within the last 7 days.');
      assert.ok(res.data.details.existingApplicationId);
      recordPass('POST /api/v1/leads/submit enforces 7-day deduplication and returns 409 Conflict');
    } catch (e) {
      recordFail('POST /api/v1/leads/submit 7-day deduplication', e);
    }

    // Test: GET /api/v1/leads & GET /api/v1/leads/stats
    try {
      const resList = await request('GET', '/api/v1/leads');
      assert.strictEqual(resList.status, 200);
      assert.ok(resList.data.data.length >= 1);
      const lead = resList.data.data.find((l) => l._id.toString() === createdLeadId.toString());
      assert.ok(lead);
      assert.strictEqual(lead.maskedMobile, '9811XXXX44');

      const resStats = await request('GET', '/api/v1/leads/stats');
      assert.strictEqual(resStats.status, 200);
      assert.strictEqual(resStats.data.data.totalApplications, resList.data.data.length);
      recordPass('GET /api/v1/leads and /api/v1/leads/stats return formatted leads and KPI metrics');
    } catch (e) {
      recordFail('GET /api/v1/leads and /stats', e);
    }
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }

  console.log('----------------------------------------------------');
  console.log(`Integration Test Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runApiIntegrationTests();
