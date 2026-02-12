
import React from 'react';
import FileUpload from './FileUpload';
import './css/FileUploadModal.css';

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
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <FileUpload
            taskId={taskId}
            commentId={commentId}
            onUploadSuccess={handleUploadSuccess}
            multiple={true}
            className="modal-fileupload"
          />
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-close">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;