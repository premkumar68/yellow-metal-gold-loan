const express = require('express');
const router = express.Router();

const { getGoldRate } = require('../controllers/goldRateController');
const { getLoanSchemes } = require('../controllers/loanSchemeController');
const { submitLead, getLeads, getLeadStats } = require('../controllers/leadController');

// Live Gold Rate Endpoints
router.get('/gold-rate', getGoldRate);

// Loan Scheme Endpoints
router.get('/loan-schemes', getLoanSchemes);

// Lead / Application Endpoints
router.post('/leads/submit', submitLead);
router.get('/leads', getLeads);
router.get('/leads/stats', getLeadStats);

module.exports = router;
