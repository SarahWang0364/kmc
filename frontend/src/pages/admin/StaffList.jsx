import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import './AdminPages.css';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: false,
      render: (row) => {
        const roles = [];
        if (row.isAdmin) roles.push('Admin');
        if (row.isTeacher) roles.push('Teacher');
        return roles.join(', ') || 'N/A';
      }
    },
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
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await userService.getStaff();
      setStaff(data);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (staffMember) => {
    try {
      if (staffMember.isActive) {
        await userService.deactivateUser(staffMember._id);
      } else {
        await userService.reactivateUser(staffMember._id);
      }
      loadStaff();
    } catch (error) {
      console.error('Error toggling staff status:', error);
      alert('Failed to update staff status');
    }
  };

  const handleDelete = async (staffMember) => {
    if (!confirm(`Delete staff member ${staffMember.name}? This action cannot be undone.`)) return;

    try {
      await userService.deleteUser(staffMember._id);
      loadStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Staff</h1>
        <Button>Add Staff</Button>
      </div>

      <DataTable
        columns={columns}
        data={staff}
        loading={loading}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        showDeleteOnlyWhenInactive={true}
      />
    </div>
  );
};

export default StaffList;
