import React, { useState } from 'react';
import { useBulkCreateTasks } from '../../hooks/useTaskQueries';
import { TaskStatus, TaskPriority, type ICreateTaskDTO, type TaskStatusType, type TaskPriorityType } from '../../types/interface/taskInterface';
import UserSearchInput from '../UserSearchInput';
import './css/BulkTaskModal.css';

interface BulkTaskModalProps {
  onClose: () => void;
}

const BulkTaskModal: React.FC<BulkTaskModalProps> = ({ onClose }) => {
  const { mutate: bulkCreateTasks, isPending } = useBulkCreateTasks();
  const [tasks, setTasks] = useState<ICreateTaskDTO[]>([
    {
      title: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
    },
  ]);

  const addTask = () => {
    if (tasks.length < 100) {
      setTasks([
        ...tasks,
        {
          title: '',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
        },
      ]);
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof ICreateTaskDTO, value: string | string[] | TaskStatusType | TaskPriorityType | Date | string | undefined) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      [field]: value,
    };
    setTasks(updatedTasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate tasks
    const validTasks = tasks.filter(task => task.title && task.title.trim().length >= 3);
    
    if (validTasks.length === 0) {
      alert('Please add at least one valid task with a title of 3+ characters');
      return;
    }

    const formattedTasks = validTasks.map(task => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
      assignedTo: task.assignedTo || undefined,
    }));

    bulkCreateTasks(
      { tasks: formattedTasks },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="bulk-modal-overlay">
      <div className="bulk-modal-container">
        {/* Header */}
        <div className="bulk-modal-header">
          <div>
            <h2 className="bulk-modal-title">Bulk Create Tasks</h2>
            <p className="bulk-modal-subtitle">
              Create up to 100 tasks at once ({tasks.length}/100)
            </p>
          </div>
          <button onClick={onClose} className="bulk-modal-close">
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bulk-modal-form">
          <div className="bulk-tasks-list">
            {tasks.map((task, index) => (
              <div key={index} className="bulk-task-card">
                <div className="bulk-task-header">
                  <h3 className="bulk-task-title">Task {index + 1}</h3>
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="bulk-task-remove"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="bulk-task-grid">
                  {/* Title */}
                  <div className="bulk-task-field-full">
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => updateTask(index, 'title', e.target.value)}
                      placeholder="Task title (required, min 3 chars)"
                      className="bulk-task-input"
                    />
                  </div>

                  {/* Description */}
                  <div className="bulk-task-field-full">
                    <textarea
                      value={task.description || ''}
                      onChange={(e) => updateTask(index, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      className="bulk-task-textarea"
                    />
                  </div>

                  {/* Status */}
                  <div className="bulk-task-field">
                    <select
                      value={task.status}
                      onChange={(e) => updateTask(index, 'status', e.target.value as TaskStatusType)}
                      className="bulk-task-select"
                    >
                      {Object.values(TaskStatus).map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="bulk-task-field">
                    <select
                      value={task.priority}
                      onChange={(e) => updateTask(index, 'priority', e.target.value as TaskPriorityType)}
                      className="bulk-task-select"
                    >
                      {Object.values(TaskPriority).map((priority) => (
                        <option key={priority} value={priority}>
                          {priority.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div className="bulk-task-field">
                    <input
                      type="date"
                      value={
                        task.dueDate
                          ? new Date(task.dueDate).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="bulk-task-input"
                    />
                  </div>

                  {/* Tags */}
                  <div className="bulk-task-field">
                    <input
                      type="text"
                      value={task.tags?.join(', ') || ''}
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter((tag) => tag.length > 0)
                          .slice(0, 10);
                        updateTask(index, 'tags', tags);
                      }}
                      placeholder="Tags (comma-separated)"
                      className="bulk-task-input"
                    />
                  </div>

                  {/* Assigned To */}
                  <div className="bulk-task-field-full">
                    <label className="bulk-task-label">
                      Assign To
                    </label>
                    <UserSearchInput
                      value={task.assignedTo || ''}
                      onChange={(userId) => updateTask(index, 'assignedTo', userId)}
                      placeholder="Search and select a user..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Task Button */}
          {tasks.length < 100 && (
            <button
              type="button"
              onClick={addTask}
              className="bulk-add-button"
            >
              + Add Another Task
            </button>
          )}

          {/* Actions */}
          <div className="bulk-modal-actions">
            <button type="button" onClick={onClose} className="btn btn-cancel">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-submit"
            >
              {isPending ? 'Creating...' : `Create ${tasks.filter(t => t.title.trim().length >= 3).length} Tasks`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkTaskModal;