import React, { useState, useCallback } from 'react';
import { useUploadMultipleFiles } from '../../hooks/useFileQueries';
import { type IUploadFileDTO } from '../../types/interface/fileInterface';
import { formatFileSize, getFileIcon, getFileTypeFromMime } from '../../types/interface/fileInterface';
import './css/FileUpload.css';

interface FileUploadProps {
  taskId?: string;
  commentId?: string;
  onUploadSuccess?: () => void;
  onFileSelect?: (files: File[]) => void;
  multiple?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  className?: string;
  allowDirectUpload?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  taskId,
  commentId,
  onUploadSuccess,
  onFileSelect,
  multiple = true,
  maxSize = 10 * 1024 * 1024,
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
  allowDirectUpload = true,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  
  const { mutate: uploadFiles, isPending: isUploading } = useUploadMultipleFiles();

  const validateFiles = useCallback((fileList: File[]): string[] => {
    const errors: string[] = [];
    
    if (allowDirectUpload && !taskId && !commentId) {
      errors.push('Either taskId or commentId must be provided');
    }
    
    fileList.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type`);
      }
      
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
    <div className={`fileupload-container ${className}`}>
      {/* Upload Area */}
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="upload-content">
          <div className="upload-icon-wrapper">
            <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h3 className="upload-title">
            Drop files here or click to upload
          </h3>
          <p className="upload-subtitle">
            {multiple ? 'Drag & drop multiple files' : 'Select a single file'}
          </p>
          <p className="upload-hint">
            Max size: {formatFileSize(maxSize)} • Supported: Images, Documents, PDFs, Archives
          </p>
        </div>
        <input
          id="file-input"
          type="file"
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="file-input"
          accept={allowedTypes.join(',')}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p className="error-text">{error}</p>
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="selected-files">
          <div className="selected-files-header">
            <h4 className="selected-files-title">
              Selected Files ({files.length})
            </h4>
            <button
              onClick={handleClear}
              className="clear-all-btn"
              type="button"
            >
              Clear All
            </button>
          </div>
          
          <div className="selected-files-list">
            {files.map((file, index) => {
              const fileType = getFileTypeFromMime(file.type);
              const fileIcon = getFileIcon(fileType);
              
              return (
                <div key={`${file.name}-${index}`} className="selected-file-item">
                  <div className="selected-file-info">
                    <span className="file-icon">{fileIcon}</span>
                    <div className="file-details">
                      <p className="file-name">{file.name}</p>
                      <div className="file-meta">
                        <span>{formatFileSize(file.size)}</span>
                        <span className="meta-separator">•</span>
                        <span>{fileType}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="remove-file-btn"
                    type="button"
                  >
                    <svg className="remove-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Upload Button - Conditionally render */}
          {allowDirectUpload && (
            <div className="upload-actions">
              <button
                onClick={handleClear}
                className="btn btn-cancel"
                type="button"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn btn-upload"
                type="button"
              >
                {isUploading ? (
                  <>
                    <div className="spinner spinner-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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