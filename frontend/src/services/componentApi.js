import axiosInstance from './axiosInstance';

export const componentApi = {
  getAll: (params) => axiosInstance.get('/components', { params }),
  getAllNoPagination: (params) => axiosInstance.get('/components/all', { params }),
  create: (data) => axiosInstance.post('/components', data),
  update: (id, data) => axiosInstance.put(`/components/${id}`, data),
  delete: (id) => axiosInstance.delete(`/components/${id}`),
};
