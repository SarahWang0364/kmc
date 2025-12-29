import api from './api';

const progressService = {
  // Get all progress
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/progress?${params}`);
    return response.data;
  },

  // Get single progress
  getById: async (id) => {
    const response = await api.get(`/progress/${id}`);
    return response.data;
  },

  // Create progress
  create: async (progressData) => {
    const response = await api.post('/progress', progressData);
    return response.data;
  },

  // Update progress
  update: async (id, progressData) => {
    const response = await api.put(`/progress/${id}`, progressData);
    return response.data;
  },

  // Update week content
  updateWeekContent: async (id, week, weekData) => {
    const response = await api.patch(`/progress/${id}/week/${week}`, weekData);
    return response.data;
  },

  // Delete progress
  delete: async (id) => {
    await api.delete(`/progress/${id}`);
  }
};

export default progressService;
