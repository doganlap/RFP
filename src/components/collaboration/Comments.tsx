// src/components/collaboration/Comments.tsx
import React, { useState, useEffect } from 'react';

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  replies?: Comment[];
}

interface CommentsProps {
  resourceId: string;
  resourceType: 'rfp' | 'task' | 'document';
  onCommentAdded?: (comment: Comment) => void;
}

const Comments: React.FC<CommentsProps> = ({ resourceId, resourceType, onCommentAdded }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load comments from API
    // const fetchComments = async () => {
    //   const response = await fetch(`/api/comments?resourceId=${resourceId}&resourceType=${resourceType}`);
    //   const data = await response.json();
    //   setComments(data);
    // };
    // fetchComments();
  }, [resourceId, resourceType]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      // In production, post to API
      // const response = await fetch('/api/comments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     resourceId,
      //     resourceType,
      //     content: newComment,
      //   }),
      // });
      // const data = await response.json();

      const comment: Comment = {
        id: `comment-${Date.now()}`,
        author: 'Current User',
        content: newComment,
        timestamp: new Date(),
      };

      setComments([...comments, comment]);
      setNewComment('');
      onCommentAdded?.(comment);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>

      {/* Comments List */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first to comment.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-sm">{comment.author}</p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.timestamp).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <div className="border-t pt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          onClick={handleAddComment}
          disabled={loading || !newComment.trim()}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </div>
    </div>
  );
};

export default Comments;
