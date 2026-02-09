// components/commentComponent/CommentCard.tsx - UPDATED with better delete handling

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { type IComment } from '../../types/interface/commentInterface';
import CommentModal from './CommentModal';
import { useDeleteComment } from '../../hooks/useCommentQueries';

interface CommentCardProps {
  comment: IComment;
  currentUserId?: string;
  taskId?: string;
  onUpdate?: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ 
  comment, 
  currentUserId,
  taskId: propTaskId,
  onUpdate 
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Use taskId from prop or from comment
  const taskId = propTaskId || comment.taskId;
  
  // Pass taskId to the delete hook for optimistic updates
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment(taskId);

  // Use useMemo to calculate isEditable to avoid impure function calls during render
  const { isCommentOwner, isEditable } = useMemo(() => {
    if (!currentUserId || !comment.createdBy?._id) {
      return { isCommentOwner: false, isEditable: false };
    }

    // Normalize IDs for comparison (handle both string and ObjectId)
    const normalizedCurrentUserId = String(currentUserId).trim();
    const normalizedCommentOwnerId = String(comment.createdBy._id).trim();
    
    const owner = normalizedCurrentUserId === normalizedCommentOwnerId;
    
    // Calculate the 24-hour window
    try {
      const commentDate = new Date(comment.createdAt);
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const editable = owner && commentDate > twentyFourHoursAgo;
      
      return {
        isCommentOwner: owner,
        isEditable: editable
      };
    } catch (error) {
      console.error('Error calculating editable status:', error);
      return { isCommentOwner: owner, isEditable: false };
    }
  }, [currentUserId, comment.createdBy?._id, comment.createdAt]);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'MMM dd, yyyy h:mm a');
    } catch {
      return '';
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteComment(comment._id, {
        onSuccess: () => {
          // Call onUpdate after successful deletion
          if (onUpdate) {
            setTimeout(() => {
              onUpdate();
            }, 100);
          }
        },
        onError: (error) => {
          console.error('Delete comment error:', error);
        }
      });
    }
  };

  const handleEditSuccess = () => {
    console.log('Comment edit successful');
    setIsEditModalOpen(false);
    // Call onUpdate after successful edit
    if (onUpdate) {
      setTimeout(() => {
        onUpdate();
      }, 100);
    }
  };

  // Check if comment has been edited
  const isEdited = useMemo(() => {
    if (!comment.createdAt || !comment.updatedAt) return false;
    try {
      return new Date(comment.createdAt).getTime() !== new Date(comment.updatedAt).getTime();
    } catch {
      return false;
    }
  }, [comment.createdAt, comment.updatedAt]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {comment.createdBy?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {comment.createdBy?.name || 'Unknown User'}
              </h4>
              <p className="text-xs text-gray-500">
                {comment.createdBy?.email || 'No email'}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(comment.createdAt)}
            {isEdited && (
              <span className="text-gray-400 ml-1">(edited)</span>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        </div>

        {/* Comment Actions - Show only if user is the owner */}
        {isCommentOwner && (
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            {isEditable && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <CommentModal
          commentId={comment._id}
          taskId={comment.taskId}
          initialContent={comment.content}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default CommentCard;