// src/pages/tasks/TaskDetail.tsx

import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTaskById, useDeleteTask } from '../../../hooks/useTaskQueries';
import { useGetAllTaskFiles } from '../../../hooks/useFileQueries';
import { TaskStatus, TaskPriority, type TaskStatusType, type TaskPriorityType } from '../../../types/interface/taskInterface';
import { format } from 'date-fns';
import TaskModal from '../../../components/taskComponent/TaskModal';
import CommentList from '../../../components/commentComponent/CommentList';
import FileUploadModal from '../../../components/fileComponent/FileUploadModal';
import FileList from '../../../components/fileComponent/FileList';
import ConfirmationDialog from '../../../components/ConfirmationDialog'; 
import './css/TaskDetail.css';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const currentUser = useMemo(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return {
        ...user,
        _id: user._id || user.userId || user.id,
        id: user._id || user.userId || user.id
      };
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  }, []);

  const { data: taskData, isLoading, error } = useGetTaskById(id || '', !!id);
  const { data: filesData, refetch: refetchFiles } = useGetAllTaskFiles(id || '');
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const handleDelete = () => {
    deleteTask(id!, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        navigate('/tasks');
      },
    });
  };

  const handleBack = () => {
    navigate('/tasks');
  };

  const getStatusClass = (status: TaskStatusType) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'status-todo';
      case TaskStatus.IN_PROGRESS:
        return 'status-progress';
      case TaskStatus.COMPLETED:
        return 'status-completed';
      case TaskStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return 'status-todo';
    }
  };

  const getPriorityClass = (priority: TaskPriorityType) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'priority-low';
      case TaskPriority.MEDIUM:
        return 'priority-medium';
      case TaskPriority.HIGH:
        return 'priority-high';
      case TaskPriority.URGENT:
        return 'priority-urgent';
      default:
        return 'priority-medium';
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not set';
    try {
      return format(new Date(date), 'MMMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return 'Not set';
    try {
      return format(new Date(date), 'MMMM dd, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="taskdetail-loading-container">
        <div className="taskdetail-loading-content">
          <div className="taskdetail-spinner"></div>
          <p className="taskdetail-loading-text">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !taskData?.data) {
    const errorMessage = error 
      ? (error as Error)?.message || 'An error occurred'
      : 'Task not found';
    
    return (
      <div className="taskdetail-error-container">
        <div className="taskdetail-error-content">
          <h2 className="taskdetail-error-title">Error Loading Task</h2>
          <p className="taskdetail-error-message">{errorMessage}</p>
          <button onClick={handleBack} className="taskdetail-error-button">
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const task = taskData.data;
  
  const isOverdue = task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== TaskStatus.COMPLETED;

  const isTaskOwner = currentUser && task.createdBy._id === currentUser._id;
  const isAssigned = currentUser && task.assignedTo && task.assignedTo._id === currentUser._id;

  return (
    <div className="taskdetail-container">
      <div className="taskdetail-wrapper">
        {/* Header */}
        <div className="taskdetail-header">
          <button onClick={handleBack} className="taskdetail-back-btn">
            <svg
              className="back-icon"
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
            Back to Tasks
          </button>
        </div>

        <div className="taskdetail-grid">
          {/* Task Details - Left Column */}
          <div className="taskdetail-main">
            {/* Main Task Card */}
            <div className="taskdetail-card">
              {/* Header Section */}
              <div className="taskdetail-card-header">
                <div className="taskdetail-card-header-content">
                  <h1 className="taskdetail-title">{task.title}</h1>
                  <div className="taskdetail-badges">
                    <span className={`taskdetail-badge ${getStatusClass(task.status)}`}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`taskdetail-badge ${getPriorityClass(task.priority)}`}>
                      {task.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="taskdetail-content">
                {/* Description */}
                {task.description && (
                  <div className="taskdetail-section">
                    <h2 className="section-title">Description</h2>
                    <div className="description-box">
                      <p className="taskdetail-description">{task.description}</p>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="taskdetail-info-grid">
                  {/* Due Date */}
                  <div className="info-item">
                    <div className="info-icon">📅</div>
                    <div className="info-content">
                      <h3 className="info-label">Due Date</h3>
                      <p className={`info-value ${isOverdue ? 'overdue' : ''}`}>
                        {formatDate(task.dueDate)}
                        {isOverdue && (
                          <span className="overdue-badge">Overdue</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Created By */}
                  <div className="info-item">
                    <div className="info-icon">👤</div>
                    <div className="info-content">
                      <h3 className="info-label">Created By</h3>
                      <div className="user-info">
                        <div className="user-avatar creator-avatar">
                          {task.createdBy.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <p className="user-name">{task.createdBy.name}</p>
                          <p className="user-email">{task.createdBy.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned To */}
                  {task.assignedTo && (
                    <div className="info-item">
                      <div className="info-icon">👥</div>
                      <div className="info-content">
                        <h3 className="info-label">Assigned To</h3>
                        <div className="user-info">
                          <div className="user-avatar assigned-avatar">
                            {task.assignedTo.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-details">
                            <p className="user-name">{task.assignedTo.name}</p>
                            <p className="user-email">{task.assignedTo.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Created At */}
                  <div className="info-item">
                    <div className="info-icon">⏱️</div>
                    <div className="info-content">
                      <h3 className="info-label">Created</h3>
                      <p className="info-value">{formatDateTime(task.createdAt)}</p>
                    </div>
                  </div>

                  {/* Updated At */}
                  <div className="info-item">
                    <div className="info-icon">🔄</div>
                    <div className="info-content">
                      <h3 className="info-label">Last Updated</h3>
                      <p className="info-value">{formatDateTime(task.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="taskdetail-section">
                    <h3 className="section-title">Tags</h3>
                    <div className="tags-container">
                      {task.tags.map((tag, index) => (
                        <span key={index} className="tag-item">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Section */}
              <div className="taskdetail-actions">
                {(isTaskOwner || isAssigned) && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="action-btn edit-btn"
                  >
                    <svg
                      className="action-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    {isTaskOwner ? 'Edit Task' : 'Update Status'}
                  </button>
                )}
                
                {isTaskOwner && (
                  <button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isDeleting}
                    className="action-btn delete-btn"
                  >
                    <svg
                      className="action-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {isDeleting ? 'Deleting...' : 'Delete Task'}
                  </button>
                )}
              </div>
            </div>

            {/* Files Section */}
            <div className="taskdetail-files">
              <div className="files-header">
                <h2 className="files-title">
                  Files {filesData?.data ? `(${filesData.data.length})` : ''}
                </h2>
                <button
                  onClick={() => setIsFileUploadModalOpen(true)}
                  className="files-add-btn"
                >
                  <svg
                    className="add-icon"
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
                  Add Files
                </button>
              </div>

              {filesData?.data && (
                <FileList
                  files={filesData.data}
                  showTask={true}
                  showComment={true}
                  onDeleteSuccess={refetchFiles}
                  currentUserId={currentUser?._id}
                />
              )}
            </div>
          </div>

          {/* Comments Section - Right Column */}
          <div className="taskdetail-comments">
            <div className="comments-card">
              <CommentList 
                taskId={task._id} 
                currentUserId={currentUser?._id} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <TaskModal taskId={id!} onClose={() => setIsEditModalOpen(false)} />
      )}

      {isFileUploadModalOpen && (
        <FileUploadModal
          isOpen={isFileUploadModalOpen}
          onClose={() => setIsFileUploadModalOpen(false)}
          taskId={id}
          onUploadSuccess={refetchFiles}
          title="Upload Files to Task"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default TaskDetail;