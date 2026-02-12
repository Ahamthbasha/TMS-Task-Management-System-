// src/components/fileComponent/FileList.tsx

import React, { useState } from "react";
import { useDeleteFile, useDownloadFile } from "../../hooks/useFileQueries";
import {
  type IFile,
  formatFileSize,
  getFileIcon,
} from "../../types/interface/fileInterface";
import { format } from "date-fns";
import ConfirmationDialog from "../ConfirmationDialog"; 
import "./css/FileList.css";

interface FileListProps {
  files: IFile[];
  showTask?: boolean;
  showComment?: boolean;
  onDeleteSuccess?: () => void;
  currentUserId?: string;
}

const FileList: React.FC<FileListProps> = ({
  files,
  showTask = false,
  showComment = false,
  onDeleteSuccess,
  currentUserId,
}) => {
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();
  const { mutate: downloadFile } = useDownloadFile();
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleDownload = (file: IFile) => {
    setDownloadingFileId(file._id);
    downloadFile(file._id, {
      onSettled: () => {
        setDownloadingFileId(null);
      },
    });
  };

  const handleDeleteClick = (fileId: string) => {
    setSelectedFileId(fileId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedFileId) {
      deleteFile(selectedFileId, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedFileId(null);
          if (onDeleteSuccess) {
            onDeleteSuccess();
          }
        },
      });
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "";
    }
  };

  const canDeleteFile = (file: IFile): boolean => {
    if (!currentUserId) return false;
    return file.uploadedBy._id === currentUserId;
  };

  if (files.length === 0) {
    return (
      <div className="filelist-empty">
        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="empty-title">No files yet</p>
        <p className="empty-subtitle">Upload files to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="filelist-container">
        {files.map((file) => {
          const canDelete = canDeleteFile(file);
          const isDownloading = downloadingFileId === file._id;

          return (
            <div key={file._id} className="filelist-item">
              <div className="filelist-item-header">
                <div className="file-info">
                  <div className="file-icon-large">{getFileIcon(file.fileType)}</div>

                  <div className="file-details">
                    <div className="file-name-wrapper">
                      <h4 className="file-name">
                        {file.originalName}
                      </h4>
                      {file.isDeleted && (
                        <span className="badge badge-deleted">
                          Deleted
                        </span>
                      )}
                    </div>

                    <div className="file-meta">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="meta-separator">•</span>
                      <span className="file-type">{file.fileType}</span>
                      <span className="meta-separator">•</span>
                      <span>Uploaded {formatDate(file.createdAt)}</span>

                      {showTask && file.task && (
                        <>
                          <span className="meta-separator">•</span>
                          <span className="badge badge-task">
                            Task File
                          </span>
                        </>
                      )}

                      {showComment && file.comment && (
                        <>
                          <span className="meta-separator">•</span>
                          <span className="badge badge-comment">
                            Comment File
                          </span>
                        </>
                      )}
                    </div>

                    <div className="uploader-info">
                      <div className="uploader-avatar">
                        {file.uploadedBy.name.charAt(0).toUpperCase()}
                      </div>
                      <span>By {file.uploadedBy.name}</span>
                    </div>
                  </div>
                </div>

                <div className="file-actions">
                  {/* Download button - ALWAYS VISIBLE */}
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={isDownloading}
                    className="action-btn download-btn"
                    title="Download"
                  >
                    {isDownloading ? (
                      <div className="spinner spinner-small"></div>
                    ) : (
                      <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Delete button - Only for owners */}
                  {canDelete && !file.isDeleted && (
                    <button
                      onClick={() => handleDeleteClick(file._id)}
                      disabled={isDeleting}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      {isDeleting && selectedFileId === file._id ? (
                        <div className="spinner spinner-small spinner-red"></div>
                      ) : (
                        <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Preview for images */}
              {file.fileType === "image" && (
                <div className="file-preview">
                  <div className="preview-container">
                    <img
                      src={file.fileUrl}
                      alt={file.originalName}
                      className="preview-image"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedFileId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default FileList;