// pages/user/Tasks/TaskDetail.tsx

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTaskById, useDeleteTask } from '../../../hooks/useTaskQueries';
import { TaskStatus, TaskPriority, type TaskStatusType, type TaskPriorityType } from '../../../types/interface/taskInterface';
import { format } from 'date-fns';
import TaskModal from '../../../components/taskComponent/TaskModal';
import CommentList from '../../../components/commentComponent/CommentList';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
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

  const { data, isLoading, error } = useGetTaskById(id || '', !!id);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(id!, {
        onSuccess: () => {
          navigate('/tasks');
        },
      });
    }
  };

  const handleBack = () => {
    navigate('/tasks');
  };

  const getStatusColor = (status: TaskStatusType) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-300';
      case TaskStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    const errorMessage = error 
      ? (error as Error)?.message || 'An error occurred'
      : 'Task not found';
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Task</h2>
          <p className="mb-4">{errorMessage}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const task = data.data;
  
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== TaskStatus.COMPLETED;

  // Check user permissions
  const isTaskOwner = currentUser && task.createdBy._id === currentUser._id;
  const isAssigned = currentUser && task.assignedTo && task.assignedTo._id === currentUser._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Details - Left Column */}
          <div className="lg:col-span-2">
            {/* Main Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="px-8 py-6">
                {/* Description */}
                {task.description && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Description
                    </h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Due Date */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Due Date</h3>
                    <p
                      className={`text-gray-900 ${
                        isOverdue ? 'text-red-600 font-semibold' : ''
                      }`}
                    >
                      {formatDate(task.dueDate)}
                      {isOverdue && (
                        <span className="ml-2 text-sm">(Overdue)</span>
                      )}
                    </p>
                  </div>

                  {/* Created By */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Created By</h3>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                        {task.createdBy.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-900">{task.createdBy.name}</p>
                        <p className="text-sm text-gray-500">{task.createdBy.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned To */}
                  {task.assignedTo && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">
                        Assigned To
                      </h3>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                          {task.assignedTo.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-gray-900">{task.assignedTo.name}</p>
                          <p className="text-sm text-gray-500">{task.assignedTo.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Created At */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Created</h3>
                    <p className="text-gray-900">{formatDateTime(task.createdAt)}</p>
                  </div>

                  {/* Updated At */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      Last Updated
                    </h3>
                    <p className="text-gray-900">{formatDateTime(task.updatedAt)}</p>
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Section */}
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                {/* Show edit button to both owner and assigned users */}
                {(isTaskOwner || isAssigned) && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
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
                
                {/* Only show delete button to owner */}
                {isTaskOwner && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
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
          </div>

          {/* Comments Section - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
              <CommentList 
                taskId={task._id} 
                currentUserId={currentUser?._id} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <TaskModal taskId={id!} onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  );
};

export default TaskDetail;