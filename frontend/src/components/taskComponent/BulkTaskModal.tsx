// components/tasks/BulkTaskModal.tsx

import React, { useState } from 'react';
import { useBulkCreateTasks } from '../../hooks/useTaskQueries';
import { TaskStatus, TaskPriority, type ICreateTaskDTO, type TaskStatusType, type TaskPriorityType } from '../../types/interface/taskInterface';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Create Tasks</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create up to 100 tasks at once ({tasks.length}/100)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4 mb-6">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Task {index + 1}
                  </h3>
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => updateTask(index, 'title', e.target.value)}
                      placeholder="Task title (required, min 3 chars)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <textarea
                      value={task.description || ''}
                      onChange={(e) => updateTask(index, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <select
                      value={task.status}
                      onChange={(e) => updateTask(index, 'status', e.target.value as TaskStatusType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(TaskStatus).map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <select
                      value={task.priority}
                      onChange={(e) => updateTask(index, 'priority', e.target.value as TaskPriorityType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(TaskPriority).map((priority) => (
                        <option key={priority} value={priority}>
                          {priority.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <input
                      type="date"
                      value={
                        task.dueDate
                          ? new Date(task.dueDate).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Tags */}
                  <div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors mb-6"
            >
              + Add Another Task
            </button>
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
              disabled={isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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