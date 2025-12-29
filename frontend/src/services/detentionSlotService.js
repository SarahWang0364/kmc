import api from './api';

const detentionSlotService = {
  // Get all detention slots
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) params.append(key, filters[key]);
    });
    const response = await api.get(`/detention-slots?${params}`);
    return response.data;
  },

  // Get single detention slot
  getById: async (id) => {
    const response = await api.get(`/detention-slots/${id}`);
    return response.data;
  },

  // Create detention slot(s)
  create: async (slotData) => {
    const response = await api.post('/detention-slots', slotData);
    return response.data;
  },

  // Create multiple slots (batch)
  createBatch: async (dates, startTime, endTime, classroom) => {
    const response = await api.post('/detention-slots', {
      dates,
      startTime,
      endTime,
      classroom
    });
    return response.data;
  },

  // Update detention slot
  update: async (id, slotData) => {
    const response = await api.put(`/detention-slots/${id}`, slotData);
    return response.data;
  },

  // Delete detention slot
  delete: async (id) => {
    await api.delete(`/detention-slots/${id}`);
  },

  // Get grid for term and classroom
  getGrid: async (term, classroom) => {
    const response = await api.get(`/detention-slots/grid?term=${term}&classroom=${classroom}`);
    return response.data;
  },

  // Batch toggle slot
  batchToggle: async (term, classroom, week, dayOfWeek, slotNumber, enable) => {
    const response = await api.post('/detention-slots/batch-toggle', {
      term,
      classroom,
      week,
      dayOfWeek,
      slotNumber,
      enable
    });
    return response.data;
  }
};

export default detentionSlotService;
