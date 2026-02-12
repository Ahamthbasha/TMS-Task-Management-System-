
import React, { useState } from 'react';
import { useCreateCommentWithFiles, useCreateComment, useUpdateComment } from '../../hooks/useCommentQueries';
import type { ICreateCommentDTO, IUpdateCommentDTO } from '../../types/interface/commentInterface';
import FileUpload from '../fileComponent/FileUpload';
import './css/CommentModal.css';

interface CommentModalProps {
  commentId?: string;
  taskId?: string;
  initialContent?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  commentId,
  taskId,
  initialContent = '',
  onClose,
  onSuccess,
}) => {
  const isEditMode = !!commentId;
  const { mutate: createComment, isPending: isCreating } = useCreateComment();
  const { mutate: createCommentWithFiles, isPending: isCreatingWithFiles } = useCreateCommentWithFiles();
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment();
  
  const [content, setContent] = useState(initialContent);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const validateContent = (text: string): boolean => {
    setError('');
    
    if (!text || text.trim().length === 0) {
      setError('Comment is required');
      return false;
    }
    
    if (text.length > 2000) {
      setError('Comment must not exceed 2000 characters');
      return false;
    }
    
    return true;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (error && newContent.trim().length > 0) {
      setError('');
    }
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateContent(content)) {
      return;
    }

    if (!taskId) {
      setError('Task ID is required');
      return;
    }

    const trimmedData: ICreateCommentDTO = {
      content: content.trim(),
      taskId: taskId,
    };

    if (selectedFiles.length > 0) {
      createCommentWithFiles({ data: trimmedData, files: selectedFiles }, {
        onSuccess: (response) => {
          console.log('Create with files success response:', response);
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          console.error('Create with files error:', error);
          setError(error?.response?.data?.message || 'Failed to create comment with files');
        },
      });
    } else {
      createComment(trimmedData, {
        onSuccess: (response) => {
          console.log('Create success response:', response);
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          console.error('Create error:', error);
          setError(error?.response?.data?.message || 'Failed to create comment');
        },
      });
    }
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateContent(content)) {
      return;
    }

    if (!commentId) {
      setError('Comment ID is required');
      return;
    }

    const trimmedData: IUpdateCommentDTO = {
      content: content.trim()
    };

    updateComment(
      { 
        commentId, 
        data: trimmedData 
      },
      {
        onSuccess: (response) => {
          console.log('Update success response:', response);
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          console.error('Update error:', error);
          setError(error?.response?.data?.message || 'Failed to update comment');
        },
      }
    );
  };

  const handleSubmit = isEditMode ? handleUpdateSubmit : handleCreateSubmit;
  const isSubmitting = isCreating || isCreatingWithFiles || isUpdating;

  return (
    <div className="comment-modal-overlay">
      <div className="comment-modal-container">
        {/* Header */}
        <div className="comment-modal-header">
          <h2 className="comment-modal-title">
            {isEditMode ? 'Edit Comment' : 'Add Comment'}
          </h2>
          <button onClick={onClose} className="comment-modal-close">
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="comment-modal-form">
          <div className="form-group">
            <label className="form-label">
              Comment <span className="required-star">*</span>
            </label>
            <textarea
              value={content}
              onChange={handleContentChange}
              rows={4}
              className="form-textarea"
              placeholder="Write your comment here..."
              autoFocus
            />
            {error && (
              <p className="form-error">{error}</p>
            )}
            <div className="char-counter">
              <span>Maximum 2000 characters</span>
              <span className={content.length > 2000 ? 'char-limit-exceeded' : ''}>
                {content.length}/2000
              </span>
            </div>
          </div>

          {/* File Upload Section (only for new comments) */}
          {!isEditMode && (
            <div className="form-group">
              <div className="file-upload-header">
                <label className="form-label">
                  Attach Files (Optional)
                </label>
                <span className="file-upload-limit">
                  Max 10MB per file
                </span>
              </div>
              <FileUpload
                taskId={taskId}
                multiple={true}
                maxSize={10 * 1024 * 1024}
                onFileSelect={handleFileSelect}
                onUploadSuccess={() => {}}
                allowDirectUpload={false}
              />
              
              {/* Selected files preview */}
              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  <p className="selected-files-title">
                    Selected files ({selectedFiles.length}):
                  </p>
                  <div className="selected-files-list">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="selected-file-item">
                        <span className="file-name">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="file-remove-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || content.trim().length === 0}
              className="btn btn-submit"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner-small"></div>
                  Saving...
                </>
              ) : isEditMode ? (
                'Update Comment'
              ) : (
                `Add Comment${selectedFiles.length > 0 ? ' with Files' : ''}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;