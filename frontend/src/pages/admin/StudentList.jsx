import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './AdminPages.css';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    year: '',
    isActive: 'true'
  });
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    year: '',
    notes: ''
  });

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => <Link to={`/admin/students/${row._id}`} className="link">{row.name}</Link>
    },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'school', label: 'School', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    {
      key: 'isActive',
      label: 'Status',
      sortable: false,
      render: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-danger'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  useEffect(() => {
    loadStudents();
  }, [filters]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await userService.getStudents(filters);
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      school: student.school || '',
      year: student.year || '',
      notes: student.notes || ''
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (student) => {
    try {
      if (student.isActive) {
        await userService.deactivateUser(student._id);
      } else {
        await userService.reactivateUser(student._id);
      }
      loadStudents();
    } catch (error) {
      console.error('Error toggling student status:', error);
      alert('Failed to update student status');
    }
  };

  const handleDelete = async (student) => {
    if (!confirm(`Delete student ${student.name}? This action cannot be undone.`)) return;

    try {
      await userService.deleteUser(student._id);
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await userService.updateUser(editingStudent._id, formData);
      } else {
        await userService.createUser({
          ...formData,
          isStudent: true,
          initialPasswordUsed: false
        });
      }
      setShowModal(false);
      setEditingStudent(null);
      loadStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student');
    }
  };

  const handleAddNew = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      school: '',
      year: '',
      notes: ''
    });
    setShowModal(true);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Students</h1>
        <Button onClick={handleAddNew}>Add Student</Button>
      </div>

      <div className="filters">
        <Input
          placeholder="Search by name or email"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
        >
          <option value="">All Years</option>
          <option value="Y6">Y6</option>
          <option value="Y7">Y7</option>
          <option value="Y8">Y8</option>
          <option value="Y9">Y9</option>
          <option value="Y10">Y10</option>
          <option value="Y11">Y11</option>
          <option value="Y12">Y12</option>
        </select>
        <select
          value={filters.isActive}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
          <option value="">All</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showDeleteOnlyWhenInactive={true}
      />

      {showModal && (
        <Modal
          title={editingStudent ? 'Edit Student' : 'Add Student'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="form">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="School"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            />
            <div className="form-group">
              <label>Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                <option value="">Select Year</option>
                <option value="Y6">Y6</option>
                <option value="Y7">Y7</option>
                <option value="Y8">Y8</option>
                <option value="Y9">Y9</option>
                <option value="Y10">Y10</option>
                <option value="Y11">Y11</option>
                <option value="Y12">Y12</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
              />
            </div>
            <div className="form-actions">
              <Button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </Button>
              <Button type="submit">
                {editingStudent ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StudentList;
