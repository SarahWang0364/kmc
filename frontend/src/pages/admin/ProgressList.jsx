import { useState, useEffect } from 'react';
import progressService from '../../services/progressService';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import './AdminPages.css';

const ProgressList = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    {
      key: 'term',
      label: 'Term',
      sortable: false,
      render: (row) => row.term?.name || 'N/A'
    },
    {
      key: 'weeklyContent',
      label: 'Weeks',
      sortable: false,
      render: (row) => row.weeklyContent?.length || 0
    }
  ];

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const data = await progressService.getAll();
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (progressItem) => {
    if (!confirm(`Delete progress template ${progressItem.name}?`)) return;

    try {
      await progressService.delete(progressItem._id);
      loadProgress();
    } catch (error) {
      console.error('Error deleting progress:', error);
      alert('Failed to delete progress template');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Progress Templates</h1>
        <Button>Add Progress</Button>
      </div>

      <DataTable
        columns={columns}
        data={progress}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProgressList;
