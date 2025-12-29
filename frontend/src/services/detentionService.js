import api from './api';

const detentionService = {
  // Get all detentions
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/detentions?${params}`);
    return response.data;
  },

  // Get single detention
  getById: async (id) => {
    const response = await api.get(`/detentions/${id}`);
    return response.data;
  },

  // Create detention (assign)
  create: async (detentionData) => {
    const response = await api.post('/detentions', detentionData);
    return response.data;
  },

  // Book detention slot
  bookSlot: async (detentionId, slotId) => {
    const response = await api.patch(`/detentions/${detentionId}/book`, {
      slotId
    });
    return response.data;
  },

  // Update detention status
  updateStatus: async (detentionId, completionStatus) => {
    const response = await api.patch(`/detentions/${detentionId}/status`, {
      completionStatus
    });
    return response.data;
  },

  // Delete detention
  delete: async (id) => {
    await api.delete(`/detentions/${id}`);
  },

  // Get today's detentions
  getTodaysDetentions: async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/detention-slots?date=${today}`);
    // This would need backend support to get booked detentions for today
    return response.data;
  },

  // Get unbooked detentions
  getUnbooked: async () => {
    const response = await api.get('/detentions?status=assigned');
    return response.data;
  }
};

export default detentionService;
