// components/fileComponent/FileList.tsx
import React, { useState } from "react";
import { useDeleteFile, useDownloadFile } from "../../hooks/useFileQueries";
import {
  type IFile,
  formatFileSize,
  getFileIcon,
} from "../../types/interface/fileInterface";
import { format } from "date-fns";

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
  const { mutate: downloadFile } = useDownloadFile(); // Removed unused isDownloading
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null,
  );

  const handleDownload = (file: IFile) => {
    setDownloadingFileId(file._id);
    downloadFile(file._id, {
      onSettled: () => {
        setDownloadingFileId(null);
      },
    });
  };

  const handleDelete = (fileId: string) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      deleteFile(fileId, {
        onSuccess: () => {
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

    // User can delete if they uploaded the file
    const isUploader = file.uploadedBy._id === currentUserId;

    // In a real app, you might want to add additional permissions
    // e.g., task owner can delete any file in their task
    return isUploader;
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <svg
          className="w-12 h-12 mx-auto text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-500">No files yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Upload files to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => {
        const canDelete = canDeleteFile(file);
        const isDownloading = downloadingFileId === file._id;

        return (
          <div
            key={file._id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="text-2xl">{getFileIcon(file.fileType)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {file.originalName}
                    </h4>
                    {file.isDeleted && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                        Deleted
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span className="capitalize">{file.fileType}</span>
                    <span>•</span>
                    <span>Uploaded {formatDate(file.createdAt)}</span>

                    {showTask && file.task && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                          Task File
                        </span>
                      </>
                    )}

                    {showComment && file.comment && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          Comment File
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                      {file.uploadedBy.name.charAt(0).toUpperCase()}
                    </div>
                    <span>By {file.uploadedBy.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={() => handleDownload(file)}
                  disabled={isDownloading || isDeleting}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Download"
                >
                  {isDownloading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : (
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                </button>

                {canDelete && !file.isDeleted && (
                  <button
                    onClick={() => handleDelete(file._id)}
                    disabled={isDeleting || isDownloading}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
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
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Preview for images */}
            {file.fileType === "image" && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={file.fileUrl}
                    alt={file.originalName}
                    className="w-full h-auto max-h-48 object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FileList;
