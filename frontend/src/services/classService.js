import api from './api';

const classService = {
  // Get all classes
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/classes?${params}`);
    return response.data;
  },

  // Get single class
  getById: async (id) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  // Create class
  create: async (classData) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  // Update class
  update: async (id, classData) => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },

  // Delete class
  delete: async (id) => {
    await api.delete(`/classes/${id}`);
  },

  // Mark attendance
  markAttendance: async (classId, week, attendanceData) => {
    const response = await api.post(`/classes/${classId}/attendance`, {
      week,
      attendanceData
    });
    return response.data;
  },

  // Grade homework
  gradeHomework: async (classId, week, homeworkData) => {
    const response = await api.post(`/classes/${classId}/homework`, {
      week,
      homeworkData
    });
    return response.data;
  },

  // Enter test marks
  enterTestMarks: async (classId, week, testId, marks) => {
    const response = await api.post(`/classes/${classId}/test-marks`, {
      week,
      testId,
      marks
    });
    return response.data;
  },

  // Add student to class
  addStudent: async (classId, studentId, joinedWeek = 1) => {
    const response = await api.post(`/classes/${classId}/students`, {
      studentId,
      joinedWeek
    });
    return response.data;
  },

  // Remove student from class
  removeStudent: async (classId, studentId) => {
    await api.delete(`/classes/${classId}/students/${studentId}`);
  },

  // Get today's classes
  getTodaysClasses: async () => {
    const response = await api.get('/classes/today');
    return response.data;
  }
};

export default classService;
