import { useState, useEffect } from 'react';
import topicService from '../../services/topicService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './AdminPages.css';

const TopicList = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: '',
    term: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    year: '',
    term: ''
  });

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    { key: 'term', label: 'Term', sortable: true },
    { key: 'content', label: 'Content', sortable: false }
  ];

  useEffect(() => {
    loadTopics();
  }, [filters]);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await topicService.getAll(filters);
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      content: topic.content || '',
      year: topic.year,
      term: topic.term
    });
    setShowModal(true);
  };

  const handleDelete = async (topic) => {
    if (!confirm(`Delete topic ${topic.name}?`)) return;

    try {
      await topicService.delete(topic._id);
      loadTopics();
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Failed to delete topic');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTopic) {
        await topicService.update(editingTopic._id, formData);
      } else {
        await topicService.create(formData);
      }
      setShowModal(false);
      setEditingTopic(null);
      loadTopics();
    } catch (error) {
      console.error('Error saving topic:', error);
      alert('Failed to save topic');
    }
  };

  const handleAddNew = () => {
    setEditingTopic(null);
    setFormData({ name: '', content: '', year: '', term: '' });
    setShowModal(true);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Topics</h1>
        <Button onClick={handleAddNew}>Add Topic</Button>
      </div>

      <div className="filters">
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
          <option value="Y12 3U">Y12 3U</option>
          <option value="Y12 4U">Y12 4U</option>
        </select>
        <select
          value={filters.term}
          onChange={(e) => setFilters({ ...filters, term: e.target.value })}
        >
          <option value="">All Terms</option>
          <option value="T1">T1</option>
          <option value="T2">T2</option>
          <option value="T3">T3</option>
          <option value="T4">T4</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={topics}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <Modal
          title={editingTopic ? 'Edit Topic' : 'Add Topic'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="form">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="form-group">
              <label>Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              >
                <option value="">Select Year</option>
                <option value="Y6">Y6</option>
                <option value="Y7">Y7</option>
                <option value="Y8">Y8</option>
                <option value="Y9">Y9</option>
                <option value="Y10">Y10</option>
                <option value="Y11">Y11</option>
                <option value="Y12">Y12</option>
                <option value="Y12 3U">Y12 3U</option>
                <option value="Y12 4U">Y12 4U</option>
              </select>
            </div>
            <div className="form-group">
              <label>Term</label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                required
              >
                <option value="">Select Term</option>
                <option value="T1">T1</option>
                <option value="T2">T2</option>
                <option value="T3">T3</option>
                <option value="T4">T4</option>
              </select>
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="4"
              />
            </div>
            <div className="form-actions">
              <Button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </Button>
              <Button type="submit">
                {editingTopic ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TopicList;
