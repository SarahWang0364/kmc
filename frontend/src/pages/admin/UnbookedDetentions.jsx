import { useState, useEffect } from 'react';
import detentionService from '../../services/detentionService';
import classService from '../../services/classService';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import './AdminPages.css';

const UnbookedDetentions = () => {
  const [detentions, setDetentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    class: '',
    student: '',
    week: 1,
    reason: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [detentionsData, classesData, studentsData] = await Promise.all([
        detentionService.getUnbooked(),
        classService.getAll(),
        userService.getStudents({ isActive: true })
      ]);

      // Sort by days since issued (oldest first)
      const sortedDetentions = detentionsData.sort((a, b) => {
        const dateA = new Date(a.assignedAt || a.createdAt);
        const dateB = new Date(b.assignedAt || b.createdAt);
        return dateA - dateB;
      });

      setDetentions(sortedDetentions);
      setClasses(classesData.filter(c => c.isActive));
      setStudents(studentsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load unbooked detentions');
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysSince = (date) => {
    const assignedDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today - assignedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddDetention = async (e) => {
    e.preventDefault();

    if (!formData.class || !formData.student || !formData.reason) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await detentionService.create({
        class: formData.class,
        student: formData.student,
        week: formData.week,
        reason: formData.reason,
        status: 'assigned'
      });

      alert('Detention assigned successfully!');
      setShowAddModal(false);
      setFormData({
        class: '',
        student: '',
        week: 1,
        reason: ''
      });
      loadData();
    } catch (err) {
      console.error('Error creating detention:', err);
      alert('Failed to assign detention: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (detention) => {
    if (confirm(`Delete detention for ${detention.student?.name}?`)) {
      try {
        await detentionService.delete(detention._id);
        loadData();
      } catch (err) {
        console.error('Error deleting detention:', err);
        alert('Failed to delete detention: ' + err.message);
      }
    }
  };

  const columns = [
    {
      key: 'daysSince',
      label: 'Days Since Issued',
      sortable: true,
      render: (row) => {
        const days = calculateDaysSince(row.assignedAt || row.createdAt);
        return (
          <span className={days > 7 ? 'text-danger' : days > 3 ? 'text-warning' : ''}>
            {days} {days === 1 ? 'day' : 'days'}
          </span>
        );
      }
    },
    {
      key: 'student',
      label: 'Student',
      sortable: true,
      render: (row) => row.student?.name || 'Unknown'
    },
    {
      key: 'email',
      label: 'Email',
      sortable: false,
      render: (row) => row.student?.email || 'N/A'
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false,
      render: (row) => row.student?.phone || 'N/A'
    },
    {
      key: 'class',
      label: 'Class',
      sortable: true,
      render: (row) => row.class?.name || 'N/A'
    },
    {
      key: 'week',
      label: 'Week',
      sortable: true
    },
    {
      key: 'reason',
      label: 'Reason',
      sortable: false,
      render: (row) => (
        <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.reason}>
          {row.reason}
        </div>
      )
    },
    {
      key: 'assignedAt',
      label: 'Assigned Date',
      sortable: true,
      render: (row) => new Date(row.assignedAt || row.createdAt).toLocaleDateString()
    }
  ];

  if (loading && !showAddModal) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Unbooked Detentions</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          Assign Detention
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {detentions.length === 0 && !loading ? (
        <div className="empty-state">
          <p>No unbooked detentions</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={detentions}
          loading={loading}
          onDelete={handleDelete}
        />
      )}

      {showAddModal && (
        <Modal
          title="Assign Detention"
          onClose={() => setShowAddModal(false)}
          size="medium"
        >
          <form onSubmit={handleAddDetention}>
            <div className="form-group">
              <label>Class *</label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Student *</label>
              <select
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} - {student.year} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Week *</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label>Reason *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="input"
                rows="4"
                placeholder="Describe the reason for detention..."
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Detention'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UnbookedDetentions;
