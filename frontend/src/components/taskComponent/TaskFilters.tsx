

import React, { useState } from 'react';
import { TaskStatus, TaskPriority, type IGetTasksQueryParams } from '../../types/interface/taskInterface';
import './css/TaskFilter.css'

interface TaskFiltersProps {
  filters: IGetTasksQueryParams;
  onFilterChange: (filters: Partial<IGetTasksQueryParams>) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onFilterChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof IGetTasksQueryParams, value: string | number | undefined) => {
    onFilterChange({ [field]: value || undefined });
  };

  const handleClearFilters = () => {
    onFilterChange({
      status: undefined,
      priority: undefined,
      search: undefined,
      tags: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="filters-container">
      <div className="filters-header">
        <h2 className="filters-title">Filters</h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="filters-toggle"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>
      </div>

      <div className="filters-grid">
        {/* Search */}
        <div className="filter-item">
          <label className="filter-label">
            Search
          </label>
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="filter-input"
          />
        </div>

        {/* Status Filter */}
        <div className="filter-item">
          <label className="filter-label">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            {Object.values(TaskStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="filter-item">
          <label className="filter-label">
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            {Object.values(TaskPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="advanced-filters">
          {/* Due Date From */}
          <div className="filter-item">
            <label className="filter-label">
              Due Date From
            </label>
            <input
              type="date"
              value={filters.dueDateFrom || ''}
              onChange={(e) => handleInputChange('dueDateFrom', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Due Date To */}
          <div className="filter-item">
            <label className="filter-label">
              Due Date To
            </label>
            <input
              type="date"
              value={filters.dueDateTo || ''}
              onChange={(e) => handleInputChange('dueDateTo', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Tags */}
          <div className="filter-item">
            <label className="filter-label">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="tag1, tag2"
              value={filters.tags || ''}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Sort By */}
          <div className="filter-item">
            <label className="filter-label">
              Sort By
            </label>
            <select
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
              className="filter-select"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="filter-item">
            <label className="filter-label">
              Sort Order
            </label>
            <select
              value={filters.sortOrder || 'desc'}
              onChange={(e) => handleInputChange('sortOrder', e.target.value)}
              className="filter-select"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Items per page */}
          <div className="filter-item">
            <label className="filter-label">
              Items per page
            </label>
            <select
              value={filters.limit || 10}
              onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
              className="filter-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      <div className="filters-footer">
        <button
          onClick={handleClearFilters}
          className="filters-clear-btn"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;