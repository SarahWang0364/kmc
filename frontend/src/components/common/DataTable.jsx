import { useState } from 'react';
import './DataTable.css';

const DataTable = ({
  columns,
  data,
  onSort,
  onEdit,
  onDelete,
  onToggleStatus,
  onRowClick,
  loading = false,
  showDeleteOnlyWhenInactive = false,
  toggleStatusLabels = { active: 'Deactivate', inactive: 'Activate' }
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (column) => {
    if (!column.sortable) return;

    const direction =
      sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';

    setSortColumn(column.key);
    setSortDirection(direction);

    if (onSort) {
      onSort(column.key, direction);
    }
  };

  if (loading) {
    return <div className="table-loading">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="table-empty">No data available</div>;
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column)}
                className={column.sortable ? 'sortable' : ''}
              >
                {column.label}
                {sortColumn === column.key && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </th>
            ))}
            {onToggleStatus && <th className="actions-header">Status</th>}
            {onEdit && <th className="actions-header">Edit</th>}
            {onDelete && <th className="actions-header">Delete</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row._id || row.id || index}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render
                    ? column.render(row)
                    : row[column.key]}
                </td>
              ))}
              {onToggleStatus && (
                <td className="actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(row);
                    }}
                    className={row.isActive ? "btn-status btn-deactivate" : "btn-status btn-activate"}
                  >
                    {row.isActive ? toggleStatusLabels.active : toggleStatusLabels.inactive}
                  </button>
                </td>
              )}
              {onEdit && (
                <td className="actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(row);
                    }}
                    className="btn-action btn-edit"
                  >
                    Edit
                  </button>
                </td>
              )}
              {onDelete && (
                <td className="actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!showDeleteOnlyWhenInactive || !row.isActive) {
                        onDelete(row);
                      }
                    }}
                    className="btn-action btn-delete"
                    disabled={showDeleteOnlyWhenInactive && row.isActive}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
