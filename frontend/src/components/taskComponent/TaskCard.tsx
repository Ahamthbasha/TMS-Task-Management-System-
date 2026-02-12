import React from 'react';
import { type ITask, TaskStatus, TaskPriority, type TaskStatusType, type TaskPriorityType } from '../../types/interface/taskInterface';
import { format } from 'date-fns';
import './css/TaskCard.css';

interface TaskCardProps {
  task: ITask;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onView?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onView }) => {
  const getCurrentUser = () => {
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
  };

  const currentUser = getCurrentUser();
  const isTaskOwner = currentUser && task.createdBy._id === currentUser._id;
  const isAssigned = currentUser && task.assignedTo && task.assignedTo._id === currentUser._id;

  const getStatusColorClass = (status: TaskStatusType) => {
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

  const getPriorityColorClass = (priority: TaskPriorityType) => {
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
    if (!date) return null;
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return null;
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;

  return (
    <div 
      className="task-card"
      onClick={() => onView && onView(task._id)}
    >
      {/* Header */}
      <div className="task-card-header">
        <h3 className="task-title">
          {task.title}
        </h3>
        <span className={`task-priority ${getPriorityColorClass(task.priority)}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="task-description">
          {task.description}
        </p>
      )}

      {/* Status */}
      <div className="task-status-container">
        <span className={`task-status ${getStatusColorClass(task.status)}`}>
          {task.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="task-tag">
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="task-tag">
              +{task.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className={`task-due-date ${isOverdue ? 'task-overdue' : ''}`}>
          <span className="task-due-label">Due: </span>
          {formatDate(task.dueDate)}
          {isOverdue && ' (Overdue)'}
        </div>
      )}

      {/* Assigned To */}
      {task.assignedTo && (
        <div className="task-assigned">
          <div className="task-assigned-avatar">
            {task.assignedTo.name.charAt(0).toUpperCase()}
          </div>
          <span className="task-assigned-label">Assigned to: </span>
          <span className="task-assigned-name">{task.assignedTo.name}</span>
        </div>
      )}

      {/* Footer */}
      <div className="task-footer">
        <div className="task-created">
          Created {formatDate(task.createdAt)}
        </div>
        <div className="task-actions" onClick={(e) => e.stopPropagation()}>
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(task._id);
              }}
              className="task-btn task-btn-view"
            >
              View
            </button>
          )}
          {/* Show Edit button to both owner and assigned users */}
          {(isTaskOwner || isAssigned) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task._id);
              }}
              className="task-btn task-btn-edit"
            >
              {isTaskOwner ? 'Edit' : 'Update Status'}
            </button>
          )}
          {/* Only show delete button to task owner */}
          {isTaskOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              className="task-btn task-btn-delete"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;