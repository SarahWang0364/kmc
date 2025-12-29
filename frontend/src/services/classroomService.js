import api from './api';

const classroomService = {
  // Get all classrooms
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) params.append(key, filters[key]);
    });
    const response = await api.get(`/classrooms?${params}`);
    return response.data;
  },

  // Get single classroom
  getById: async (id) => {
    const response = await api.get(`/classrooms/${id}`);
    return response.data;
  },

  // Create classroom
  create: async (classroomData) => {
    const response = await api.post('/classrooms', classroomData);
    return response.data;
  },

  // Update classroom
  update: async (id, classroomData) => {
    const response = await api.put(`/classrooms/${id}`, classroomData);
    return response.data;
  },

  // Delete classroom
  delete: async (id) => {
    await api.delete(`/classrooms/${id}`);
  }
};

export default classroomService;
