// components/fileComponent/FileUploadModal.tsx
import React from 'react';
import FileUpload from './FileUpload';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
  commentId?: string;
  onUploadSuccess?: () => void;
  title?: string;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  taskId,
  commentId,
  onUploadSuccess,
  title = 'Upload Files',
}) => {
  if (!isOpen) return null;

  const handleUploadSuccess = () => {
    if (onUploadSuccess) {
      onUploadSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <FileUpload
            taskId={taskId}
            commentId={commentId}
            onUploadSuccess={handleUploadSuccess}
            multiple={true}
            className="border-0 p-0"
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;