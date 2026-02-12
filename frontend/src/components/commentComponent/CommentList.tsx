
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCommentsByTaskId } from '../../hooks/useCommentQueries';
import { fileKeys } from '../../hooks/useFileQueries';
import CommentCard from './CommentCard';
import CommentModal from './CommentModal';
import type { IComment } from '../../types/interface/commentInterface';
import './css/CommentList.css';

interface CommentListProps {
  taskId: string;
  currentUserId?: string;
}

const CommentList: React.FC<CommentListProps> = ({ taskId, currentUserId }) => {
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const limit = 10;
  
  const queryClient = useQueryClient();
  
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef<number>(0);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const resolvedCurrentUserId = useMemo(() => {
    if (currentUserId) return currentUserId;
    
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return undefined;
      const user = JSON.parse(userStr);
      return user._id || user.userId || user.id;
    } catch (error) {
      console.error("Failed to get user from localStorage:", error);
      return undefined;
    }
  }, [currentUserId]);

  const { data, isLoading, error, refetch } = useGetCommentsByTaskId(taskId, {
    page,
    limit
  });

  useEffect(() => {
    if (data?.data?.comments) {
      const currentCount = data.data.total;
      
      if (currentCount > previousCountRef.current && previousCountRef.current !== 0) {
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      }
      
      previousCountRef.current = currentCount;
    }
  }, [data?.data?.total, data?.data?.comments]);

  useEffect(() => {
    if (data?.data?.comments && data.data.comments.length > 0 && page === 1) {
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 200);
    }
  }, [data?.data?.comments, page, taskId]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    commentsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCommentCreated = () => {
    setIsCreateModalOpen(false);
    setTimeout(() => {
      refetch();
      queryClient.invalidateQueries({ queryKey: fileKeys.taskAll(taskId) });
    }, 100);
  };

  const handleCommentUpdated = () => {
    setTimeout(() => {
      refetch();
      queryClient.invalidateQueries({ queryKey: fileKeys.taskAll(taskId) });
    }, 100);
  };

  const handleCommentDeleted = () => {
    setTimeout(() => {
      refetch();
      queryClient.invalidateQueries({ queryKey: fileKeys.taskAll(taskId) });
    }, 100);
  };

  if (error) {
    return (
      <div className="comment-error">
        <p className="error-text">Failed to load comments. Please try again.</p>
        <button onClick={() => refetch()} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="comment-list" ref={commentsContainerRef}>
      {/* Header */}
      <div className="comment-list-header">
        <h3 className="comment-list-title">
          Comments {data?.data?.total ? `(${data.data.total})` : ''}
        </h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="add-comment-btn"
        >
          <svg className="add-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Comment
        </button>
      </div>

      {/* Create Comment Modal */}
      {isCreateModalOpen && (
        <CommentModal
          taskId={taskId}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCommentCreated}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="comment-loading">
          <div className="spinner"></div>
          <p className="loading-text">Loading comments...</p>
        </div>
      )}

      {/* Comments List */}
      {!isLoading && data?.data?.comments && (
        <>
          {/* No Comments */}
          {data.data.comments.length === 0 && (
            <div className="no-comments">
              <svg className="no-comments-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="no-comments-title">No comments yet</p>
              <p className="no-comments-subtitle">
                Be the first to add a comment
              </p>
            </div>
          )}

          {/* Comments Container with max height and scroll */}
          {data.data.comments.length > 0 && (
            <div className="comments-container">
              {data.data.comments.map((comment: IComment) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  currentUserId={resolvedCurrentUserId}
                  taskId={taskId}
                  onUpdate={handleCommentUpdated}
                  onDelete={handleCommentDeleted}
                />
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}

          {/* Pagination */}
          {data.data.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="pagination-btn pagination-prev"
              >
                Previous
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: data.data.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    const current = page;
                    return (
                      p === 1 ||
                      p === data.data.totalPages ||
                      (p >= current - 1 && p <= current + 1)
                    );
                  })
                  .map((p, index, array) => {
                    if (index > 0 && p - array[index - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${p}`}>
                          <span className="pagination-ellipsis">...</span>
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`pagination-number ${p === page ? 'active' : ''}`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`pagination-number ${p === page ? 'active' : ''}`}
                      >
                        {p}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === data.data.totalPages}
                className="pagination-btn pagination-next"
              >
                Next
              </button>
            </div>
          )}

          {/* Results Summary */}
          {data.data.total > 0 && (
            <div className="results-summary">
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, data.data.total)} of {data.data.total} comments
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentList;