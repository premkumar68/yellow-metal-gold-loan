import axios from 'axios';

const API_BASE = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  // Fetch live 24K, 22K, 18K rates
  getGoldRate: async (forceRefresh = false) => {
    const res = await apiClient.get(`/gold-rate${forceRefresh ? '?refresh=true' : ''}`);
    return res.data;
  },

  // Fetch loan schemes (Bullet & Monthly EMI)
  getLoanSchemes: async () => {
    const res = await apiClient.get('/loan-schemes');
    return res.data;
  },

  // Submit lead application
  submitLead: async (payload) => {
    const res = await apiClient.post('/leads/submit', payload);
    return res.data;
  },

  // Get all leads
  getLeads: async () => {
    const res = await apiClient.get('/leads');
    return res.data;
  },

  // Get KPI stats
  getLeadStats: async () => {
    const res = await apiClient.get('/leads/stats');
    return res.data;
  },
};
