import { useState, useEffect } from 'react';
import classroomService from '../../services/classroomService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './AdminPages.css';

const ClassroomList = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: ''
  });

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'capacity', label: 'Capacity', sortable: true },
    {
      key: 'isOccupied',
      label: 'Status',
      sortable: false,
      render: (row) => (
        <span className={`badge ${row.isOccupied ? 'badge-danger' : 'badge-success'}`}>
          {row.isOccupied ? 'Occupied' : 'Free'}
        </span>
      )
    }
  ];

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    setLoading(true);
    try {
      const data = await classroomService.getAll();
      setClassrooms(data);
    } catch (error) {
      console.error('Error loading classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom);
    setFormData({
      name: classroom.name,
      capacity: classroom.capacity
    });
    setShowModal(true);
  };

  const handleDelete = async (classroom) => {
    if (!confirm(`Delete classroom ${classroom.name}? This action cannot be undone.`)) return;

    try {
      await classroomService.delete(classroom._id);
      loadClassrooms();
    } catch (error) {
      console.error('Error deleting classroom:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete classroom';
      alert(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClassroom) {
        await classroomService.update(editingClassroom._id, formData);
      } else {
        await classroomService.create(formData);
      }
      setShowModal(false);
      setEditingClassroom(null);
      loadClassrooms();
    } catch (error) {
      console.error('Error saving classroom:', error);
      alert('Failed to save classroom');
    }
  };

  const handleAddNew = () => {
    setEditingClassroom(null);
    setFormData({ name: '', capacity: '' });
    setShowModal(true);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Classrooms</h1>
        <Button onClick={handleAddNew}>Add Classroom</Button>
      </div>

      <DataTable
        columns={columns}
        data={classrooms}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <Modal
          title={editingClassroom ? 'Edit Classroom' : 'Add Classroom'}
          onClose={() => setShowModal(false)}
          size="small"
        >
          <form onSubmit={handleSubmit} className="form">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
              min="1"
            />
            <div className="form-actions">
              <Button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </Button>
              <Button type="submit">
                {editingClassroom ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ClassroomList;
