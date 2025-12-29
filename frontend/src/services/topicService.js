import api from './api';

const topicService = {
  // Get all topics
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/topics?${params}`);
    return response.data;
  },

  // Get single topic
  getById: async (id) => {
    const response = await api.get(`/topics/${id}`);
    return response.data;
  },

  // Create topic
  create: async (topicData) => {
    const response = await api.post('/topics', topicData);
    return response.data;
  },

  // Update topic
  update: async (id, topicData) => {
    const response = await api.put(`/topics/${id}`, topicData);
    return response.data;
  },

  // Delete topic
  delete: async (id) => {
    await api.delete(`/topics/${id}`);
  }
};

export default topicService;
