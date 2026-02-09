// components/commentComponent/CommentList.tsx - UPDATED with auto-scroll
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGetCommentsByTaskId } from '../../hooks/useCommentQueries';
import CommentCard from './CommentCard';
import CommentModal from './CommentModal';
import type { IComment } from '../../types/interface/commentInterface';

interface CommentListProps {
  taskId: string;
  currentUserId?: string;
}

const CommentList: React.FC<CommentListProps> = ({ taskId, currentUserId }) => {
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const limit = 10;
  
  // Ref for auto-scrolling to bottom
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef<number>(0);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Get current user ID from localStorage as fallback
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

  // Auto-scroll to bottom when new comment is added
  useEffect(() => {
    if (data?.data?.comments) {
      const currentCount = data.data.total;
      
      // If total comment count increased (new comment added), scroll to bottom
      if (currentCount > previousCountRef.current && previousCountRef.current !== 0) {
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      }
      
      previousCountRef.current = currentCount;
    }
  }, [data?.data?.total, data?.data?.comments]);

  // Initial scroll to bottom on first load
  useEffect(() => {
    if (data?.data?.comments && data.data.comments.length > 0 && page === 1) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 200);
    }
  }, [data?.data?.comments, page, taskId]); // Fixed: Added missing dependencies

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top of comments section when changing pages
    commentsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCommentCreated = () => {
    setIsCreateModalOpen(false);
    // Refetch and scroll to bottom after creation
    setTimeout(() => {
      refetch();
    }, 100);
  };

  const handleCommentUpdated = () => {
    // Refetch after a short delay to ensure cache is updated
    setTimeout(() => {
      refetch();
    }, 100);
  };

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>Failed to load comments. Please try again.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4" ref={commentsContainerRef}>
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-3 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments {data?.data?.total ? `(${data.data.total})` : ''}
        </h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
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
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading comments...</p>
        </div>
      )}

      {/* Comments List */}
      {!isLoading && data?.data?.comments && (
        <>
          {/* No Comments */}
          {data.data.comments.length === 0 && (
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-gray-500">No comments yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Be the first to add a comment
              </p>
            </div>
          )}

          {/* Comments Container with max height and scroll */}
          {data.data.comments.length > 0 && (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {data.data.comments.map((comment: IComment) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  currentUserId={resolvedCurrentUserId}
                  taskId={taskId}
                  onUpdate={handleCommentUpdated}
                />
              ))}
              {/* Invisible element at the end for scrolling */}
              <div ref={commentsEndRef} />
            </div>
          )}

          {/* Pagination */}
          {data.data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
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
                          <span className="px-1 text-gray-400">...</span>
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-1 text-sm rounded ${
                              p === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
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
                        className={`px-3 py-1 text-sm rounded ${
                          p === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === data.data.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Results Summary */}
          {data.data.total > 0 && (
            <div className="text-sm text-gray-500 text-center pt-2">
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