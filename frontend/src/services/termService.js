import api from './api';

const termService = {
  // Get all terms
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/terms?${params}`);
    return response.data;
  },

  // Get current term
  getCurrent: async () => {
    const response = await api.get('/terms/current');
    return response.data;
  },

  // Get current week info
  getCurrentWeek: async () => {
    const response = await api.get('/terms/current-week');
    return response.data;
  },

  // Get single term
  getById: async (id) => {
    const response = await api.get(`/terms/${id}`);
    return response.data;
  },

  // Create term
  create: async (termData) => {
    const response = await api.post('/terms', termData);
    return response.data;
  },

  // Update term
  update: async (id, termData) => {
    const response = await api.put(`/terms/${id}`, termData);
    return response.data;
  },

  // Delete term
  delete: async (id) => {
    await api.delete(`/terms/${id}`);
  }
};

export default termService;
