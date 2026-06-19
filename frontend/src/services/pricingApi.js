import axiosInstance from './axiosInstance';

export const pricingApi = {
  updatePrice: (data) => axiosInstance.post('/prices/update', data),
  getHistory: (componentId, params) => axiosInstance.get(`/prices/history/${componentId}`, { params }),
  getAllHistory: (params) => axiosInstance.get('/prices/history', { params }),
  getBreakdown: (configurationId) => axiosInstance.get(`/pricing/${configurationId}`),
};
