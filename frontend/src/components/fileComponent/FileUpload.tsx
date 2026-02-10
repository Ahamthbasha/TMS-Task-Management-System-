// // components/fileComponent/FileUpload.tsx
// import React, { useState, useCallback } from 'react';
// import { useUploadMultipleFiles } from '../../hooks/useFileQueries';
// import { type IUploadFileDTO } from '../../types/interface/fileInterface';
// import { formatFileSize, getFileIcon, getFileTypeFromMime } from '../../types/interface/fileInterface';

// interface FileUploadProps {
//   taskId?: string;
//   commentId?: string;
//   onUploadSuccess?: () => void;
//   multiple?: boolean;
//   maxSize?: number; // in bytes
//   allowedTypes?: string[];
//   className?: string;
// }

// const FileUpload: React.FC<FileUploadProps> = ({
//   taskId,
//   commentId,
//   onUploadSuccess,
//   multiple = true,
//   maxSize = 10 * 1024 * 1024, // 10MB default
//   allowedTypes = [
//     'image/jpeg',
//     'image/png',
//     'image/gif',
//     'image/webp',
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'application/vnd.ms-excel',
//     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     'application/vnd.ms-powerpoint',
//     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//     'text/plain',
//     'application/zip',
//     'application/x-rar-compressed',
//   ],
//   className = '',
// }) => {
//   const [files, setFiles] = useState<File[]>([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const [error, setError] = useState<string>('');
  
//   const { mutate: uploadFiles, isPending: isUploading } = useUploadMultipleFiles();

//   // Validate files
//   const validateFiles = useCallback((fileList: File[]): string[] => {
//     const errors: string[] = [];
    
//     fileList.forEach(file => {
//       // Check file type
//       if (!allowedTypes.includes(file.type)) {
//         errors.push(`${file.name}: Invalid file type`);
//       }
      
//       // Check file size
//       if (file.size > maxSize) {
//         errors.push(`${file.name}: File size exceeds ${formatFileSize(maxSize)} limit`);
//       }
      
//       // Check if taskId or commentId is provided
//       if (!taskId && !commentId) {
//         errors.push('Either taskId or commentId must be provided');
//       }
//     });
    
//     return errors;
//   }, [allowedTypes, maxSize, taskId, commentId]);

//   const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
//     if (!selectedFiles) return;
    
//     const fileArray = Array.from(selectedFiles);
//     const validationErrors = validateFiles(fileArray);
    
//     if (validationErrors.length > 0) {
//       setError(validationErrors.join(', '));
//       return;
//     }
    
//     setError('');
    
//     if (multiple) {
//       setFiles(prev => [...prev, ...fileArray]);
//     } else {
//       setFiles(fileArray.slice(0, 1));
//     }
//   }, [multiple, validateFiles]);

//   const handleDragOver = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   }, []);

//   const handleDragLeave = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//   }, []);

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
    
//     const droppedFiles = e.dataTransfer.files;
//     handleFileSelect(droppedFiles);
//   }, [handleFileSelect]);

//   const removeFile = useCallback((index: number) => {
//     setFiles(prev => prev.filter((_, i) => i !== index));
//   }, []);

//   const handleUpload = useCallback(() => {
//     if (files.length === 0) {
//       setError('Please select files to upload');
//       return;
//     }
    
//     if (!taskId && !commentId) {
//       setError('Either taskId or commentId must be provided');
//       return;
//     }
    
//     const uploadData: IUploadFileDTO[] = files.map(file => ({
//       file,
//       taskId,
//       commentId,
//     }));
    
//     uploadFiles(uploadData, {
//       onSuccess: () => {
//         setFiles([]);
//         setError('');
//         if (onUploadSuccess) {
//           onUploadSuccess();
//         }
//       },
//       onError: (error) => {
//         setError(error?.response?.data?.message || 'Upload failed');
//       },
//     });
//   }, [files, taskId, commentId, uploadFiles, onUploadSuccess]);

//   const handleClear = useCallback(() => {
//     setFiles([]);
//     setError('');
//   }, []);

//   return (
//     <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
//       {/* Upload Area */}
//       <div
//         className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
//           isDragging
//             ? 'border-blue-500 bg-blue-50'
//             : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
//         }`}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//         onClick={() => document.getElementById('file-input')?.click()}
//       >
//         <div className="flex flex-col items-center justify-center">
//           <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
//             <svg
//               className="w-6 h-6 text-blue-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//               />
//             </svg>
//           </div>
//           <h3 className="text-lg font-semibold text-gray-700 mb-1">
//             Drop files here or click to upload
//           </h3>
//           <p className="text-sm text-gray-500">
//             {multiple ? 'Drag & drop multiple files' : 'Select a single file'}
//           </p>
//           <p className="text-xs text-gray-400 mt-2">
//             Max size: {formatFileSize(maxSize)} • Supported: Images, Documents, PDFs, Archives
//           </p>
//         </div>
//         <input
//           id="file-input"
//           type="file"
//           multiple={multiple}
//           onChange={(e) => handleFileSelect(e.target.files)}
//           className="hidden"
//           accept={allowedTypes.join(',')}
//         />
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
//           <p className="text-sm text-red-600">{error}</p>
//         </div>
//       )}

//       {/* Selected Files List */}
//       {files.length > 0 && (
//         <div className="mt-4">
//           <div className="flex items-center justify-between mb-3">
//             <h4 className="font-medium text-gray-700">
//               Selected Files ({files.length})
//             </h4>
//             <button
//               onClick={handleClear}
//               className="text-sm text-red-600 hover:text-red-700"
//               type="button"
//             >
//               Clear All
//             </button>
//           </div>
          
//           <div className="space-y-2 max-h-60 overflow-y-auto">
//             {files.map((file, index) => {
//               const fileType = getFileTypeFromMime(file.type);
//               const fileIcon = getFileIcon(fileType);
              
//               return (
//                 <div
//                   key={`${file.name}-${index}`}
//                   className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
//                 >
//                   <div className="flex items-center gap-3 flex-1 min-w-0">
//                     <span className="text-xl">{fileIcon}</span>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-gray-900 truncate">
//                         {file.name}
//                       </p>
//                       <div className="flex items-center gap-2 text-xs text-gray-500">
//                         <span>{formatFileSize(file.size)}</span>
//                         <span>•</span>
//                         <span>{fileType}</span>
//                       </div>
//                     </div>
//                   </div>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       removeFile(index);
//                     }}
//                     className="ml-2 text-gray-400 hover:text-red-500"
//                     type="button"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//               );
//             })}
//           </div>
          
//           {/* Upload Button */}
//           <div className="mt-4 flex justify-end gap-3">
//             <button
//               onClick={handleClear}
//               className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//               type="button"
//               disabled={isUploading}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleUpload}
//               disabled={isUploading}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
//               type="button"
//             >
//               {isUploading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                   Uploading...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                   </svg>
//                   Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FileUpload;


// components/fileComponent/FileUpload.tsx (UPDATED)
import React, { useState, useCallback } from 'react';
import { useUploadMultipleFiles } from '../../hooks/useFileQueries';
import { type IUploadFileDTO } from '../../types/interface/fileInterface';
import { formatFileSize, getFileIcon, getFileTypeFromMime } from '../../types/interface/fileInterface';

interface FileUploadProps {
  taskId?: string;
  commentId?: string;
  onUploadSuccess?: () => void;
  onFileSelect?: (files: File[]) => void; // NEW: callback for selected files
  multiple?: boolean;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  className?: string;
  allowDirectUpload?: boolean; // NEW: whether to upload immediately or just select files
}

const FileUpload: React.FC<FileUploadProps> = ({
  taskId,
  commentId,
  onUploadSuccess,
  onFileSelect, // NEW
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
  ],
  className = '',
  allowDirectUpload = true, // NEW: default to true for backward compatibility
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  
  const { mutate: uploadFiles, isPending: isUploading } = useUploadMultipleFiles();

  // Validate files
  const validateFiles = useCallback((fileList: File[]): string[] => {
    const errors: string[] = [];
    
    // Check if taskId or commentId is provided (only for direct upload)
    if (allowDirectUpload && !taskId && !commentId) {
      errors.push('Either taskId or commentId must be provided');
    }
    
    fileList.forEach(file => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type`);
      }
      
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size exceeds ${formatFileSize(maxSize)} limit`);
      }
    });
    
    return errors;
  }, [allowedTypes, maxSize, taskId, commentId, allowDirectUpload]);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    const validationErrors = validateFiles(fileArray);
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setError('');
    
    let newFiles: File[];
    if (multiple) {
      newFiles = [...files, ...fileArray];
    } else {
      newFiles = fileArray.slice(0, 1);
    }
    
    setFiles(newFiles);
    
    // Notify parent component about selected files
    if (onFileSelect) {
      onFileSelect(newFiles);
    }
  }, [multiple, validateFiles, onFileSelect, files]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Notify parent about removed file
      if (onFileSelect) {
        onFileSelect(newFiles);
      }
      return newFiles;
    });
  }, [onFileSelect]);

  const handleUpload = useCallback(() => {
    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }
    
    if (!allowDirectUpload) {
      // If not allowing direct upload, just notify parent
      if (onFileSelect) {
        onFileSelect(files);
      }
      return;
    }
    
    if (!taskId && !commentId) {
      setError('Either taskId or commentId must be provided');
      return;
    }
    
    const uploadData: IUploadFileDTO[] = files.map(file => ({
      file,
      taskId,
      commentId,
    }));
    
    uploadFiles(uploadData, {
      onSuccess: () => {
        setFiles([]);
        setError('');
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      },
      onError: (error) => {
        setError(error?.response?.data?.message || 'Upload failed');
      },
    });
  }, [files, taskId, commentId, uploadFiles, onUploadSuccess, onFileSelect, allowDirectUpload]);

  const handleClear = useCallback(() => {
    setFiles([]);
    setError('');
    if (onFileSelect) {
      onFileSelect([]);
    }
  }, [onFileSelect]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Drop files here or click to upload
          </h3>
          <p className="text-sm text-gray-500">
            {multiple ? 'Drag & drop multiple files' : 'Select a single file'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Max size: {formatFileSize(maxSize)} • Supported: Images, Documents, PDFs, Archives
          </p>
        </div>
        <input
          id="file-input"
          type="file"
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept={allowedTypes.join(',')}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">
              Selected Files ({files.length})
            </h4>
            <button
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-700"
              type="button"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => {
              const fileType = getFileTypeFromMime(file.type);
              const fileIcon = getFileIcon(fileType);
              
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl">{fileIcon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{fileType}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="ml-2 text-gray-400 hover:text-red-500"
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Upload Button - Conditionally render */}
          {allowDirectUpload && (
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                type="button"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                type="button"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;