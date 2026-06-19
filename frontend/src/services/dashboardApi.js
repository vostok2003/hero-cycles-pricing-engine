import axiosInstance from './axiosInstance';

export const dashboardApi = {
  getSummary: () => axiosInstance.get('/dashboard/summary'),
  getRecentPriceUpdates: () => axiosInstance.get('/dashboard/recent-price-updates'),
};
