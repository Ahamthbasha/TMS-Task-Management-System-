// // components/tasks/TaskModal.tsx

// import React, { useEffect, useMemo } from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import { useCreateTask, useUpdateTask, useGetTaskById } from '../../hooks/useTaskQueries';
// import { TaskStatus, TaskPriority, type ICreateTaskDTO, type IUpdateTaskDTO } from '../../types/interface/taskInterface';

// interface TaskModalProps {
//   taskId?: string | null;
//   onClose: () => void;
// }

// const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
//   const isEditMode = !!taskId;
//   const { data: taskData } = useGetTaskById(taskId || '', isEditMode);
//   const { mutate: createTask, isPending: isCreating } = useCreateTask();
//   const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

//   // Get current user from localStorage
//   const currentUser = useMemo(() => {
//     try {
//       const userStr = localStorage.getItem("user");
//       if (!userStr) return null;
//       const user = JSON.parse(userStr);
//       return {
//         ...user,
//         _id: user._id || user.userId || user.id,
//         id: user._id || user.userId || user.id
//       };
//     } catch (error) {
//       console.error("Failed to parse user from localStorage:", error);
//       return null;
//     }
//   }, []);

//   // Check if current user is the task owner
//   const isTaskOwner = useMemo(() => {
//     if (!isEditMode || !taskData?.data || !currentUser) return false;
//     return taskData.data.createdBy._id === currentUser._id;
//   }, [isEditMode, taskData, currentUser]);

//   // If editing and user is assigned (not owner), they can only edit status
//   const canOnlyEditStatus = useMemo(() => {
//     if (!isEditMode || !taskData?.data || !currentUser) return false;
//     const isAssigned = taskData.data.assignedTo?._id === currentUser._id;
//     return isAssigned && !isTaskOwner;
//   }, [isEditMode, taskData, currentUser, isTaskOwner]);

//   const {
//     register,
//     handleSubmit,
//     control,
//     reset,
//     formState: { errors },
//   } = useForm<ICreateTaskDTO>({
//     defaultValues: {
//       title: '',
//       description: '',
//       status: TaskStatus.TODO,
//       priority: TaskPriority.MEDIUM,
//       tags: [],
//     },
//   });

//   useEffect(() => {
//     if (isEditMode && taskData?.data) {
//       const task = taskData.data;
//       reset({
//         title: task.title,
//         description: task.description || '',
//         status: task.status,
//         priority: task.priority,
//         dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined,
//         tags: task.tags || [],
//         assignedTo: task.assignedTo?._id,
//       });
//     }
//   }, [taskData, isEditMode, reset]);

//   const onSubmit = (data: ICreateTaskDTO) => {
//     if (isEditMode && taskId) {
//       // If user can only edit status, only send status field in IUpdateTaskDTO format
//       const updateData: IUpdateTaskDTO = canOnlyEditStatus
//         ? { status: data.status }
//         : {
//             title: data.title,
//             description: data.description,
//             status: data.status,
//             priority: data.priority,
//             dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
//             tags: data.tags,
//             assignedTo: data.assignedTo || undefined,
//           };

//       updateTask(
//         { taskId, data: updateData },
//         {
//           onSuccess: () => {
//             onClose();
//           },
//         }
//       );
//     } else {
//       // Create mode - send full ICreateTaskDTO
//       const createData: ICreateTaskDTO = {
//         ...data,
//         dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
//         assignedTo: data.assignedTo || undefined,
//       };

//       createTask(createData, {
//         onSuccess: () => {
//           onClose();
//         },
//       });
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//           <h2 className="text-2xl font-bold text-gray-900">
//             {isEditMode ? (canOnlyEditStatus ? 'Update Task Status' : 'Edit Task') : 'Create New Task'}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-2xl"
//           >
//             ×
//           </button>
//         </div>

//         {/* Warning message for assigned users */}
//         {canOnlyEditStatus && (
//           <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//             <div className="flex items-start">
//               <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//               <p className="text-sm text-yellow-800">
//                 You are assigned to this task. You can only update the status. Contact the task owner to modify other fields.
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
//           {/* Title - Disabled for assigned users */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               {...register('title', {
//                 required: 'Title is required',
//                 minLength: { value: 3, message: 'Title must be at least 3 characters' },
//                 maxLength: { value: 200, message: 'Title must not exceed 200 characters' },
//               })}
//               disabled={canOnlyEditStatus}
//               className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 canOnlyEditStatus ? 'bg-gray-100 cursor-not-allowed' : ''
//               }`}
//               placeholder="Enter task title"
//             />
//             {errors.title && (
//               <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
//             )}
//           </div>

//           {/* Description - Disabled for assigned users */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Description
//             </label>
//             <textarea
//               {...register('description', {
//                 maxLength: { value: 2000, message: 'Description must not exceed 2000 characters' },
//               })}
//               rows={4}
//               disabled={canOnlyEditStatus}
//               className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 canOnlyEditStatus ? 'bg-gray-100 cursor-not-allowed' : ''
//               }`}
//               placeholder="Enter task description"
//             />
//             {errors.description && (
//               <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
//             )}
//           </div>

//           {/* Status and Priority */}
//           <div className="grid grid-cols-2 gap-4">
//             {/* Status - ALWAYS ENABLED */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Status <span className="text-red-500">*</span>
//               </label>
//               <select
//                 {...register('status')}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {Object.values(TaskStatus).map((status) => (
//                   <option key={status} value={status}>
//                     {status.replace('_', ' ').toUpperCase()}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Priority - Disabled for assigned users */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Priority
//               </label>
//               <select
//                 {...register('priority')}
//                 disabled={canOnlyEditStatus}
//                 className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                   canOnlyEditStatus ? 'bg-gray-100 cursor-not-allowed' : ''
//                 }`}
//               >
//                 {Object.values(TaskPriority).map((priority) => (
//                   <option key={priority} value={priority}>
//                     {priority.toUpperCase()}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Due Date - Disabled for assigned users */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Due Date
//             </label>
//             <input
//               type="date"
//               {...register('dueDate')}
//               min={new Date().toISOString().split('T')[0]}
//               disabled={canOnlyEditStatus}
//               className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 canOnlyEditStatus ? 'bg-gray-100 cursor-not-allowed' : ''
//               }`}
//             />
//           </div>

//           {/* Tags - Hidden for assigned users */}
//           {!canOnlyEditStatus && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Tags (comma-separated, max 10)
//               </label>
//               <Controller
//                 name="tags"
//                 control={control}
//                 render={({ field }) => (
//                   <input
//                     type="text"
//                     value={field.value?.join(', ') || ''}
//                     onChange={(e) => {
//                       const tags = e.target.value
//                         .split(',')
//                         .map((tag) => tag.trim())
//                         .filter((tag) => tag.length > 0)
//                         .slice(0, 10);
//                       field.onChange(tags);
//                     }}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="work, urgent, personal"
//                   />
//                 )}
//               />
//               {errors.tags && (
//                 <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
//               )}
//             </div>
//           )}

//           {/* Assigned To - Hidden for assigned users */}
//           {!canOnlyEditStatus && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Assigned To (User ID)
//               </label>
//               <input
//                 type="text"
//                 {...register('assignedTo')}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter user ID"
//               />
//               {errors.assignedTo && (
//                 <p className="mt-1 text-sm text-red-600">{errors.assignedTo.message}</p>
//               )}
//             </div>
//           )}

//           {/* Actions */}
//           <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isCreating || isUpdating}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isCreating || isUpdating
//                 ? 'Saving...'
//                 : canOnlyEditStatus
//                 ? 'Update Status'
//                 : isEditMode
//                 ? 'Update Task'
//                 : 'Create Task'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default TaskModal;

























// components/taskComponent/TaskModal.tsx (Updated)
import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateTask, useUpdateTask, useGetTaskById } from '../../hooks/useTaskQueries';
import { TaskStatus, TaskPriority, type ICreateTaskDTO, type IUpdateTaskDTO } from '../../types/interface/taskInterface';
import { formatFileSize, getFileIcon, getFileTypeFromMime } from '../../types/interface/fileInterface';

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

  // File handling functions
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    const validationErrors: string[] = [];
    
    fileArray.forEach(file => {
      // Check file size (max 10MB)
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
      // If user can only edit status, only send status field
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
      // Create mode - send full data with files
      const createData: ICreateTaskDTO = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        assignedTo: data.assignedTo || undefined,
      };

      createTask(
        { data: createData, files: files.length > 0 ? files : undefined },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
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
          {/* Title */}
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

          {/* Description */}
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

          {/* Due Date */}
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

          {/* Tags */}
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

          {/* Assigned To */}
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

          {/* File Upload Section (only for new task creation) */}
          {!isEditMode && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Attach Files (Optional)
                </label>
                <span className="text-xs text-gray-500">
                  Max 10MB per file
                </span>
              </div>
              
              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors mb-3"
                onClick={() => document.getElementById('task-file-input')?.click()}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Click to add files</p>
                  <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
                </div>
                <input
                  id="task-file-input"
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                />
              </div>

              {/* File Error */}
              {fileError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600">{fileError}</p>
                </div>
              )}

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Selected Files ({files.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleClearFiles}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {files.map((file, index) => {
                      const fileType = getFileTypeFromMime(file.type);
                      const fileIcon = getFileIcon(fileType);
                      
                      return (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-lg">{fileIcon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>{formatFileSize(file.size)}</span>
                                <span>•</span>
                                <span className="capitalize">{fileType}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="ml-2 text-gray-400 hover:text-red-500 text-sm"
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