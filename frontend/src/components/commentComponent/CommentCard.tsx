
import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { type IComment } from '../../types/interface/commentInterface';
import CommentModal from './CommentModal';
import CommentFiles from './CommentFiles';
import { useDeleteComment } from '../../hooks/useCommentQueries';
import { fileKeys } from '../../hooks/useFileQueries';
import ConfirmationDialog from '../ConfirmationDialog'; 
import './css/CommentCard.css';

interface CommentCardProps {
  comment: IComment;
  currentUserId?: string;
  taskId?: string;
  onUpdate?: () => void;
  onDelete?: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ 
  comment, 
  currentUserId,
  taskId: propTaskId,
  onUpdate,
  onDelete
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const taskId = propTaskId || comment.taskId;
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment(taskId);

  const { isCommentOwner, isEditable } = useMemo(() => {
    if (!currentUserId || !comment.createdBy?._id) {
      return { isCommentOwner: false, isEditable: false };
    }

    const normalizedCurrentUserId = String(currentUserId).trim();
    const normalizedCommentOwnerId = String(comment.createdBy._id).trim();
    
    const owner = normalizedCurrentUserId === normalizedCommentOwnerId;
    
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
    deleteComment(comment._id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: fileKeys.taskAll(taskId) });
        
        if (onUpdate) {
          setTimeout(() => {
            onUpdate();
          }, 100);
        }
        
        if (onDelete) {
          onDelete();
        }
      },
      onError: (error) => {
        console.error('Delete comment error:', error);
      }
    });
  };

  const handleEditSuccess = () => {
    console.log('Comment edit successful');
    setIsEditModalOpen(false);
    if (onUpdate) {
      setTimeout(() => {
        onUpdate();
      }, 100);
    }
  };

  const handleFileDeleteSuccess = () => {
    if (onUpdate) {
      onUpdate();
    }
    queryClient.invalidateQueries({ queryKey: fileKeys.taskAll(taskId) });
  };

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
      <div className="comment-card">
        {/* Comment Header */}
        <div className="comment-header">
          <div className="user-info">
            <div className="user-avatar">
              {comment.createdBy?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <h4 className="user-name">
                {comment.createdBy?.name || 'Unknown User'}
              </h4>
              <p className="user-email">
                {comment.createdBy?.email || 'No email'}
              </p>
            </div>
          </div>
          <div className="comment-meta">
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
            {isEdited && (
              <span className="comment-edited">(edited)</span>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="comment-content">
          <p className="comment-text">{comment.content}</p>
        </div>

        {/* Comment Files */}
        {comment.files && comment.files.length > 0 && (
          <CommentFiles 
            files={comment.files}
            currentUserId={currentUserId}
            onDeleteSuccess={handleFileDeleteSuccess}
          />
        )}

        {/* Comment Actions */}
        {isCommentOwner && (
          <div className="comment-actions">
            {isEditable && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="action-btn edit-btn"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="action-btn delete-btn"
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default CommentCard;