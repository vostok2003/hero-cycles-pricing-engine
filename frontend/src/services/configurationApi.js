import axiosInstance from './axiosInstance';

export const configurationApi = {
  getAll: (params) => axiosInstance.get('/configurations', { params }),
  getById: (id) => axiosInstance.get(`/configurations/${id}`),
  create: (data) => axiosInstance.post('/configurations', data),
  update: (id, data) => axiosInstance.put(`/configurations/${id}`, data),
  delete: (id) => axiosInstance.delete(`/configurations/${id}`),
  updateComponents: (id, components) =>
    axiosInstance.post(`/configurations/${id}/components`, { components }),
};
