import { useState, useEffect } from 'react';
import classService from '../../services/classService';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import './AdminPages.css';

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { key: 'name', label: 'Class Name', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    {
      key: 'teacher',
      label: 'Teacher',
      sortable: false,
      render: (row) => row.teacher?.name || 'N/A'
    },
    {
      key: 'classroom',
      label: 'Classroom',
      sortable: false,
      render: (row) => row.classroom?.name || 'N/A'
    },
    {
      key: 'students',
      label: 'Students',
      sortable: false,
      render: (row) => row.students?.length || 0
    },
    {
      key: 'term',
      label: 'Term',
      sortable: false,
      render: (row) => row.term?.name || 'N/A'
    }
  ];

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await classService.getAll();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classItem) => {
    if (!confirm(`Delete class ${classItem.name}?`)) return;

    try {
      await classService.delete(classItem._id);
      loadClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Classes</h1>
        <Button>Add Class</Button>
      </div>

      <DataTable
        columns={columns}
        data={classes}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ClassList;
