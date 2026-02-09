// components/commentComponent/CommentModal.tsx - SIMPLIFIED FIX
import React, { useState } from 'react';
import { useCreateComment, useUpdateComment } from '../../hooks/useCommentQueries';
import type { ICreateCommentDTO, IUpdateCommentDTO } from '../../types/interface/commentInterface';

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
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment();
  
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');

  // Validation function
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
    // Clear error when user starts typing
    if (error && newContent.trim().length > 0) {
      setError('');
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Comment' : 'Add Comment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={handleContentChange}
              rows={6}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Write your comment here..."
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            <div className="text-xs text-gray-500 mt-2 flex justify-between">
              <span>Maximum 2000 characters</span>
              <span>{content.length}/2000</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating || content.trim().length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating
                ? 'Saving...'
                : isEditMode
                ? 'Update Comment'
                : 'Add Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;