// src/components/commentComponent/CommentFiles.tsx

import React, { useState } from 'react';
import { useDeleteFile, useDownloadFile } from '../../hooks/useFileQueries';
import { formatFileSize, getFileIcon, FileType } from '../../types/interface/fileInterface';
import type { ICommentFile } from '../../types/interface/commentInterface';
import ConfirmationDialog from '../ConfirmationDialog'; 
import './css/CommentFiles.css';

interface CommentFilesProps {
  files: ICommentFile[];
  currentUserId?: string;
  onDeleteSuccess?: () => void;
}

const CommentFiles: React.FC<CommentFilesProps> = ({ 
  files, 
  currentUserId, 
  onDeleteSuccess 
}) => {
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();
  const { mutate: downloadFile } = useDownloadFile();
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const handleDownload = (file: ICommentFile) => {
    setDownloadingFileId(file._id);
    downloadFile(file._id, {
      onSettled: () => {
        setDownloadingFileId(null);
      },
    });
  };

  const handleDeleteClick = (file: ICommentFile) => {
    setSelectedFileId(file._id);
    setSelectedFileName(file.originalName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedFileId) {
      deleteFile(selectedFileId, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedFileId(null);
          setSelectedFileName('');
          if (onDeleteSuccess) {
            onDeleteSuccess();
          }
        },
      });
    }
  };

  const canDeleteFile = (file: ICommentFile): boolean => {
    if (!currentUserId) return false;
    return file.uploadedBy._id === currentUserId;
  };

  if (files.length === 0) return null;

  return (
    <>
      <div className="comment-files">
        <div className="files-header">
          <svg className="files-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
            />
          </svg>
          <span className="files-count">
            Attachments ({files.length})
          </span>
        </div>
        
        <div className="files-list">
          {files.map((file) => {
            const isFileDownloading = downloadingFileId === file._id;
            const canDelete = canDeleteFile(file);
            
            return (
              <div key={file._id} className="file-item">
                <div className="file-info">
                  <span className="file-icon">{getFileIcon(file.fileType as FileType)}</span>
                  <div className="file-details">
                    <p className="file-name">{file.originalName}</p>
                    <div className="file-meta">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="meta-separator">•</span>
                      <span className="file-type">{file.fileType}</span>
                      <span className="meta-separator">•</span>
                      <span className="uploaded-by">By {file.uploadedBy.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="file-actions">
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={isFileDownloading}
                    className="action-btn download-btn"
                    title="Download"
                  >
                    {isFileDownloading ? (
                      <div className="spinner"></div>
                    ) : (
                      <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </button>
                  
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteClick(file)}
                      disabled={isDeleting}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      {isDeleting && selectedFileId === file._id ? (
                        <div className="spinner spinner-red"></div>
                      ) : (
                        <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedFileId(null);
          setSelectedFileName('');
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete File"
        message={`Are you sure you want to delete "${selectedFileName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default CommentFiles;