import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateTask, useUpdateTask, useGetTaskById } from '../../hooks/useTaskQueries';
import { TaskStatus, TaskPriority, type ICreateTaskDTO, type IUpdateTaskDTO } from '../../types/interface/taskInterface';
import { formatFileSize, getFileIcon, getFileTypeFromMime } from '../../types/interface/fileInterface';
import UserSearchInput from '../UserSearchInput';
import './css/TaskModal.css';

interface TaskModalProps {
  taskId?: string | null;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  const isEditMode = !!taskId;
  const { data: taskData } = useGetTaskById(taskId || '', isEditMode);
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  
  // File state for new task creation
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>('');

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
      assignedTo: '',
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
        assignedTo: task.assignedTo?._id || '',
      });
    }
  }, [taskData, isEditMode, reset]);

  // File handling functions
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    const validationErrors: string[] = [];
    
    fileArray.forEach(file => {
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        validationErrors.push(`${file.name}: File size exceeds 10MB limit`);
      }
    });
    
    if (validationErrors.length > 0) {
      setFileError(validationErrors.join(', '));
      return;
    }
    
    setFileError('');
    setFiles(prev => [...prev, ...fileArray]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearFiles = () => {
    setFiles([]);
    setFileError('');
  };

  const onSubmit = (data: ICreateTaskDTO) => {
    if (isEditMode && taskId) {
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
        { onSuccess: onClose }
      );
    } else {
      const createData: ICreateTaskDTO = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        assignedTo: data.assignedTo || undefined,
      };

      createTask(
        { data: createData, files: files.length > 0 ? files : undefined },
        { onSuccess: onClose }
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode ? (canOnlyEditStatus ? 'Update Task Status' : 'Edit Task') : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        {/* Warning message for assigned users */}
        {canOnlyEditStatus && (
          <div className="modal-warning">
            <svg className="warning-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="warning-text">
              You are assigned to this task. You can only update the status. Contact the task owner to modify other fields.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Title <span className="required-star">*</span>
            </label>
            <input
              type="text"
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
                maxLength: { value: 200, message: 'Title must not exceed 200 characters' },
              })}
              disabled={canOnlyEditStatus}
              className={`form-input ${canOnlyEditStatus ? 'input-disabled' : ''}`}
              placeholder="Enter task title"
            />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              {...register('description', {
                maxLength: { value: 2000, message: 'Description must not exceed 2000 characters' },
              })}
              rows={4}
              disabled={canOnlyEditStatus}
              className={`form-textarea ${canOnlyEditStatus ? 'input-disabled' : ''}`}
              placeholder="Enter task description"
            />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          {/* Status and Priority */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Status <span className="required-star">*</span>
              </label>
              <select
                {...register('status')}
                className="form-select"
              >
                {Object.values(TaskStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                {...register('priority')}
                disabled={canOnlyEditStatus}
                className={`form-select ${canOnlyEditStatus ? 'input-disabled' : ''}`}
              >
                {Object.values(TaskPriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              {...register('dueDate')}
              min={new Date().toISOString().split('T')[0]}
              disabled={canOnlyEditStatus}
              className={`form-input ${canOnlyEditStatus ? 'input-disabled' : ''}`}
            />
          </div>

          {/* Tags */}
          {!canOnlyEditStatus && (
            <div className="form-group">
              <label className="form-label">Tags</label>
              
              <Controller
                name="tags"
                control={control}
                render={({ field }) => {
                  const addTag = (tag: string) => {
                    const trimmedTag = tag.trim().toLowerCase();
                    const currentTags = field.value || [];
                    
                    if (trimmedTag && 
                        !currentTags.includes(trimmedTag) && 
                        currentTags.length < 10 &&
                        trimmedTag.length <= 20) {
                      field.onChange([...currentTags, trimmedTag]);
                    }
                  };

                  const removeTag = (indexToRemove: number) => {
                    const currentTags = field.value || [];
                    field.onChange(currentTags.filter((_, i) => i !== indexToRemove));
                  };

                  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    } else if (e.key === 'Backspace' && !e.currentTarget.value) {
                      const currentTags = field.value || [];
                      if (currentTags.length > 0) {
                        removeTag(currentTags.length - 1);
                      }
                    }
                  };

                  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
                    if (e.target.value) {
                      addTag(e.target.value);
                      e.target.value = '';
                    }
                  };

                  const currentTags = field.value || [];

                  return (
                    <div className="tags-container">
                      <div className="tags-input-wrapper">
                        <div className="tags-list">
                          {currentTags.map((tag, index) => (
                            <span key={index} className="tag-item">
                              <span className="tag-hash">#</span>
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="tag-remove"
                              >
                                <svg className="tag-remove-icon" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </span>
                          ))}
                          
                          <input
                            type="text"
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            placeholder={currentTags.length ? '' : 'Type and press Enter or comma to add tags...'}
                            className="tag-input"
                            disabled={currentTags.length >= 10}
                            defaultValue=""
                          />
                        </div>
                      </div>

                      <div className="tags-footer">
                        <p className="tags-hint">
                          Press Enter or comma to add. Max 10 tags, 20 characters each.
                        </p>
                        <span className="tags-counter">
                          {currentTags.length}/10
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              
              {errors.tags && <p className="form-error">{errors.tags.message}</p>}
            </div>
          )}

          {/* Assigned To */}
          {!canOnlyEditStatus && (
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <Controller
                name="assignedTo"
                control={control}
                render={({ field }) => (
                  <UserSearchInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    disabled={canOnlyEditStatus}
                    placeholder="Search and select a user to assign..."
                    error={errors.assignedTo?.message}
                  />
                )}
              />
            </div>
          )}

          {/* File Upload Section (only for new task creation) */}
          {!isEditMode && (
            <div className="form-group">
              <div className="file-upload-header">
                <label className="form-label">Attach Files (Optional)</label>
                <span className="file-upload-limit">Max 10MB per file</span>
              </div>
              
              <div
                className="file-upload-area"
                onClick={() => document.getElementById('task-file-input')?.click()}
              >
                <div className="file-upload-content">
                  <div className="file-upload-icon-wrapper">
                    <svg className="file-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="file-upload-text">Click to add files</p>
                  <p className="file-upload-hint">or drag and drop</p>
                </div>
                <input
                  id="task-file-input"
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="file-upload-input"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                />
              </div>

              {fileError && (
                <div className="file-error">
                  <p className="file-error-text">{fileError}</p>
                </div>
              )}

              {files.length > 0 && (
                <div className="file-list">
                  <div className="file-list-header">
                    <h4 className="file-list-title">Selected Files ({files.length})</h4>
                    <button
                      type="button"
                      onClick={handleClearFiles}
                      className="file-clear-all"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="file-items">
                    {files.map((file, index) => {
                      const fileType = getFileTypeFromMime(file.type);
                      const fileIcon = getFileIcon(fileType);
                      
                      return (
                        <div key={`${file.name}-${index}`} className="file-item">
                          <div className="file-item-content">
                            <span className="file-icon">{fileIcon}</span>
                            <div className="file-info">
                              <p className="file-name">{file.name}</p>
                              <div className="file-meta">
                                <span>{formatFileSize(file.size)}</span>
                                <span className="file-meta-separator">•</span>
                                <span className="file-type">{fileType}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="file-remove"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-cancel">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="btn btn-submit"
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