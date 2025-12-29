import api from './api';

const testService = {
  // Get all tests
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/tests?${params}`);
    return response.data;
  },

  // Get single test
  getById: async (id) => {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  // Create test
  create: async (testData) => {
    const response = await api.post('/tests', testData);
    return response.data;
  },

  // Update test
  update: async (id, testData) => {
    const response = await api.put(`/tests/${id}`, testData);
    return response.data;
  },

  // Delete test
  delete: async (id) => {
    await api.delete(`/tests/${id}`);
  }
};

export default testService;
