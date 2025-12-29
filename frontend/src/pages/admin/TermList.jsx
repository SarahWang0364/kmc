import { useState, useEffect } from 'react';
import termService from '../../services/termService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './AdminPages.css';

const TermList = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'school_term',
    startDate: '',
    weeks: 10,
    isFirstTermOfYear: false
  });

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row) => row.type === 'school_term' ? 'School Term' : 'Holiday'
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (row) => new Date(row.startDate).toLocaleDateString()
    },
    { key: 'weeks', label: 'Weeks', sortable: true },
    {
      key: 'isCurrent',
      label: 'Status',
      sortable: false,
      render: (row) => (
        <span className={`badge ${row.isCurrent ? 'badge-success' : 'badge-info'}`}>
          {row.isCurrent ? 'Current' : 'Inactive'}
        </span>
      )
    }
  ];

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const data = await termService.getAll();
      setTerms(data);
    } catch (error) {
      console.error('Error loading terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (term) => {
    setEditingTerm(term);
    setFormData({
      name: term.name,
      type: term.type,
      startDate: new Date(term.startDate).toISOString().split('T')[0],
      weeks: term.weeks,
      isFirstTermOfYear: term.isFirstTermOfYear
    });
    setShowModal(true);
  };

  const handleDelete = async (term) => {
    if (term.isCurrent) {
      alert('Cannot delete current term');
      return;
    }

    if (!confirm(`Delete term ${term.name}?`)) return;

    try {
      await termService.delete(term._id);
      loadTerms();
    } catch (error) {
      console.error('Error deleting term:', error);
      alert('Failed to delete term');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTerm) {
        await termService.update(editingTerm._id, formData);
      } else {
        await termService.create(formData);
      }
      setShowModal(false);
      setEditingTerm(null);
      loadTerms();
    } catch (error) {
      console.error('Error saving term:', error);
      alert(error.message || 'Failed to save term');
    }
  };

  const handleAddNew = () => {
    setEditingTerm(null);
    setFormData({
      name: '',
      type: 'school_term',
      startDate: '',
      weeks: 10,
      isFirstTermOfYear: false
    });
    setShowModal(true);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Terms</h1>
        <Button onClick={handleAddNew}>Add Term</Button>
      </div>

      <DataTable
        columns={columns}
        data={terms}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <Modal
          title={editingTerm ? 'Edit Term' : 'Add Term'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="form">
            <Input
              label="Name (e.g., 25T1 or 25H1)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const weeks = e.target.value === 'school_term' ? 10 : 2;
                  setFormData({ ...formData, type: e.target.value, weeks });
                }}
                required
              >
                <option value="school_term">School Term</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Weeks"
              type="number"
              value={formData.weeks}
              readOnly
            />
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isFirstTermOfYear}
                  onChange={(e) => setFormData({ ...formData, isFirstTermOfYear: e.target.checked })}
                />
                {' '}First term of year (increments student years)
              </label>
            </div>
            <div className="form-actions">
              <Button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </Button>
              <Button type="submit">
                {editingTerm ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TermList;
