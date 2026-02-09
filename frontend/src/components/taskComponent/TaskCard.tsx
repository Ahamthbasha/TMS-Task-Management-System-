// components/tasks/TaskCard.tsx

import React from 'react';
import { type ITask, TaskStatus, TaskPriority, type TaskStatusType, type TaskPriorityType } from '../../types/interface/taskInterface';
import { format } from 'date-fns';

interface TaskCardProps {
  task: ITask;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onView?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onView }) => {
  // Get current user to check permissions
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

  const getStatusColor = (status: TaskStatusType) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TaskStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TaskPriorityType) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-800 border-green-300';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onView && onView(task._id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2">
          {task.title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Status */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              +{task.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className={`text-sm mb-4 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
          <span className="font-medium">Due: </span>
          {formatDate(task.dueDate)}
          {isOverdue && ' (Overdue)'}
        </div>
      )}

      {/* Assigned To */}
      {task.assignedTo && (
        <div className="text-sm text-gray-600 mb-4 flex items-center">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
            {task.assignedTo.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">Assigned to: </span>
          <span className="ml-1">{task.assignedTo.name}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Created {formatDate(task.createdAt)}
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(task._id);
              }}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
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
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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