// components/tasks/TaskModal.tsx

import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateTask, useUpdateTask, useGetTaskById } from '../../hooks/useTaskQueries';
import { TaskStatus, TaskPriority, type ICreateTaskDTO, type IUpdateTaskDTO } from '../../types/interface/taskInterface';

interface TaskModalProps {
  taskId?: string | null;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  const isEditMode = !!taskId;
  const { data: taskData } = useGetTaskById(taskId || '', isEditMode);
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

  // Get current user from localStorage
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

  // Check if current user is the task owner
  const isTaskOwner = useMemo(() => {
    if (!isEditMode || !taskData?.data || !currentUser) return false;
    return taskData.data.createdBy._id === currentUser._id;
  }, [isEditMode, taskData, currentUser]);

  // If editing and user is assigned (not owner), they can only edit status
  const canOnlyEditStatus = useMemo(() => {
    if (!isEditMode || !taskData?.data || !currentUser) return false;
    const isAssigned = taskData.data.assignedTo?._id === currentUser._id;
    return isAssigned && !isTaskOwner;
  }, [isEditMode, taskData, currentUser, isTaskOwner]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ICreateTaskDTO>({
    defaultValues: {
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      tags: [],
    },
  });

  useEffect(() => {
    if (isEditMode && taskData?.data) {
      const task = taskData.data;
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined,
        tags: task.tags || [],
        assignedTo: task.assignedTo?._id,
      });
    }
  }, [taskData, isEditMode, reset]);

  const onSubmit = (data: ICreateTaskDTO) => {
    if (isEditMode && taskId) {
      // If user can only edit status, only send status field in IUpdateTaskDTO format
      const updateData: IUpdateTaskDTO = canOnlyEditStatus
        ? { status: data.status }
        : {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
            tags: data.tags,
            assignedTo: data.assignedTo || undefined,
          };

      updateTask(
        { taskId, data: updateData },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      // Create mode - send full ICreateTaskDTO
      const createData: ICreateTaskDTO = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        assignedTo: data.assignedTo || undefined,
      };

      createTask(createData, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? (canOnlyEditStatus ? 'Update Task Status' : 'Edit Task') : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Warning message for assigned users */}
        {canOnlyEditStatus && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-800">
                You are assigned to this task. You can only update the status. Contact the task owner to modify other fields.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title - Disabled for assigned users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
                maxLength: { value: 200, message: 'Title must not exceed 200 characters' },
              })}
              disabled={canOnlyEditStatus}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                canOnlyEditStatus ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description - Disabled for assigned users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description', {
                maxLength: { value: 2000, message: 'Description must not exceed 2000 characters' },
              })}
              rows={4}
              disabled={canOnlyEditStatus}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                canOnlyEditStatus ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Enter task description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status - ALWAYS ENABLED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(TaskStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority - Disabled for assigned users */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                {...register('priority')}
                disabled={canOnlyEditStatus}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  canOnlyEditStatus ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                {Object.values(TaskPriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date - Disabled for assigned users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              min={new Date().toISOString().split('T')[0]}
              disabled={canOnlyEditStatus}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                canOnlyEditStatus ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Tags - Hidden for assigned users */}
          {!canOnlyEditStatus && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated, max 10)
              </label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    value={field.value?.join(', ') || ''}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0)
                        .slice(0, 10);
                      field.onChange(tags);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="work, urgent, personal"
                  />
                )}
              />
              {errors.tags && (
                <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
              )}
            </div>
          )}

          {/* Assigned To - Hidden for assigned users */}
          {!canOnlyEditStatus && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To (User ID)
              </label>
              <input
                type="text"
                {...register('assignedTo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user ID"
              />
              {errors.assignedTo && (
                <p className="mt-1 text-sm text-red-600">{errors.assignedTo.message}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating
                ? 'Saving...'
                : canOnlyEditStatus
                ? 'Update Status'
                : isEditMode
                ? 'Update Task'
                : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;