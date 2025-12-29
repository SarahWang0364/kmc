import api from './api';

const followupService = {
  // Get all followups
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) params.append(key, filters[key]);
    });
    const response = await api.get(`/followups?${params}`);
    return response.data;
  },

  // Get single followup
  getById: async (id) => {
    const response = await api.get(`/followups/${id}`);
    return response.data;
  },

  // Create followup
  create: async (followupData) => {
    const response = await api.post('/followups', followupData);
    return response.data;
  },

  // Update followup
  update: async (id, followupData) => {
    const response = await api.put(`/followups/${id}`, followupData);
    return response.data;
  },

  // Mark followup as complete
  markComplete: async (id) => {
    const response = await api.patch(`/followups/${id}/complete`);
    return response.data;
  },

  // Delete followup
  delete: async (id) => {
    await api.delete(`/followups/${id}`);
  }
};

export default followupService;
