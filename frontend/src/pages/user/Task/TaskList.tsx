
import React, { useState } from 'react';
import { useGetTasks, useDeleteTask } from '../../../hooks/useTaskQueries';
import { type IGetTasksQueryParams } from '../../../types/interface/taskInterface';
import TaskCard from '../../../components/taskComponent/TaskCard';
import TaskFilters from '../../../components/taskComponent/TaskFilters';
import TaskModal from '../../../components/taskComponent/TaskModal';
import BulkTaskModal from '../../../components/taskComponent/BulkTaskModal';
import ConfirmationDialog from '../../../components/ConfirmationDialog'; 
import { useNavigate } from 'react-router-dom';
import './css/TaskList.css';

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<IGetTasksQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskTitleToDelete, setTaskTitleToDelete] = useState<string>('');

  const { data, isLoading, error } = useGetTasks(filters);
  const { mutate: deleteTask } = useDeleteTask();

  const handleFilterChange = (newFilters: Partial<IGetTasksQueryParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (taskId: string, taskTitle: string) => {
    setTaskToDelete(taskId);
    setTaskTitleToDelete(taskTitle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
          setTaskTitleToDelete('');
        },
      });
    }
  };

  const handleEdit = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsCreateModalOpen(true);
  };

  const handleViewDetails = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSelectedTaskId(null);
  };

  const getErrorMessage = (error: unknown): string => {
    const err = error as ErrorResponse;
    return err?.response?.data?.message || err?.message || 'Something went wrong';
  };

  if (error) {
    return (
      <div className="tasklist-error-container">
        <div className="tasklist-error-content">
          <h2 className="tasklist-error-title">Error Loading Tasks</h2>
          <p className="tasklist-error-message">{getErrorMessage(error)}</p>
          <button
            onClick={() => window.location.reload()}
            className="tasklist-error-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tasklist-container">
      <div className="tasklist-wrapper">
        {/* Header */}
        <div className="tasklist-header">
          <h1 className="tasklist-title">Task Management</h1>
          <p className="tasklist-subtitle">
            Manage your tasks efficiently with advanced filtering and organization
          </p>
          <div className="tasklist-actions">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="tasklist-btn tasklist-btn-primary"
            >
              <svg
                className="tasklist-btn-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Task
            </button>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="tasklist-btn tasklist-btn-success"
            >
              <svg
                className="tasklist-btn-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Bulk Create
            </button>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Task List */}
        {isLoading ? (
          <div className="tasklist-loading">
            <div className="tasklist-spinner"></div>
            <p className="tasklist-loading-text">Loading tasks...</p>
          </div>
        ) : data?.data?.tasks && data.data.tasks.length > 0 ? (
          <>
            {/* Results Summary */}
            <div className="tasklist-summary">
              Showing {(data.data.page - 1) * (filters.limit || 10) + 1} to{' '}
              {Math.min(data.data.page * (filters.limit || 10), data.data.total)} of{' '}
              {data.data.total} tasks
            </div>

            {/* Task Grid */}
            <div className="tasklist-grid">
              {data.data.tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={() => handleDeleteClick(task._id, task.title)}
                  onView={handleViewDetails}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.data.totalPages > 1 && (
              <div className="tasklist-pagination">
                <button
                  onClick={() => handlePageChange(data.data.page - 1)}
                  disabled={!data.data.hasPrevPage}
                  className="pagination-btn pagination-prev"
                >
                  <svg
                    className="pagination-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: data.data.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      const current = data.data.page;
                      return (
                        page === 1 ||
                        page === data.data.totalPages ||
                        (page >= current - 1 && page <= current + 1)
                      );
                    })
                    .map((page, index, array) => {
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="pagination-ellipsis">...</span>
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`pagination-number ${
                                page === data.data.page ? 'active' : ''
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`pagination-number ${
                            page === data.data.page ? 'active' : ''
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(data.data.page + 1)}
                  disabled={!data.data.hasNextPage}
                  className="pagination-btn pagination-next"
                >
                  <svg
                    className="pagination-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="tasklist-empty">
            <svg
              className="empty-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="empty-title">No tasks found</p>
            <p className="empty-message">
              {filters.search || filters.status || filters.priority
                ? 'Try adjusting your filters or create a new task'
                : 'Get started by creating your first task'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="empty-button"
            >
              Create Your First Task
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <TaskModal taskId={selectedTaskId} onClose={handleCloseModal} />
      )}

      {isBulkModalOpen && <BulkTaskModal onClose={() => setIsBulkModalOpen(false)} />}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
          setTaskTitleToDelete('');
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskTitleToDelete}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default TaskList;