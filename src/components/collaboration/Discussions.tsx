// src/components/collaboration/Discussions.tsx
import React, { useState, useEffect } from 'react';

export interface Discussion {
  id: string;
  title: string;
  createdBy: string;
  createdAt: Date;
  isResolved: boolean;
  messageCount: number;
  lastMessageAt: Date;
}

interface DiscussionsProps {
  rfpId: string;
  onDiscussionCreated?: (discussion: Discussion) => void;
}

const Discussions: React.FC<DiscussionsProps> = ({ rfpId, onDiscussionCreated }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Load discussions from API
    // const fetchDiscussions = async () => {
    //   const response = await fetch(`/api/discussions?rfpId=${rfpId}`);
    //   const data = await response.json();
    //   setDiscussions(data);
    // };
    // fetchDiscussions();
  }, [rfpId]);

  const handleCreateDiscussion = async () => {
    if (!newTitle.trim()) return;

    setLoading(true);
    try {
      // In production, post to API
      // const response = await fetch('/api/discussions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     rfpId,
      //     title: newTitle,
      //   }),
      // });
      // const data = await response.json();

      const discussion: Discussion = {
        id: `discussion-${Date.now()}`,
        title: newTitle,
        createdBy: 'Current User',
        createdAt: new Date(),
        isResolved: false,
        messageCount: 0,
        lastMessageAt: new Date(),
      };

      setDiscussions([discussion, ...discussions]);
      setNewTitle('');
      setShowForm(false);
      onDiscussionCreated?.(discussion);
    } catch (error) {
      console.error('Failed to create discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolved = async (discussionId: string) => {
    try {
      // In production, call API
      // await fetch(`/api/discussions/${discussionId}/toggle-resolve`, { method: 'PUT' });

      setDiscussions(
        discussions.map((d) =>
          d.id === discussionId ? { ...d, isResolved: !d.isResolved } : d
        )
      );
    } catch (error) {
      console.error('Failed to update discussion:', error);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Discussions ({discussions.length})</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Discussion'}
        </button>
      </div>

      {/* Create Discussion Form */}
      {showForm && (
        <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Discussion title..."
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateDiscussion}
              disabled={loading || !newTitle.trim()}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Discussions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {discussions.length === 0 ? (
          <p className="text-gray-500">Start a discussion to collaborate with your team.</p>
        ) : (
          discussions.map((discussion) => (
            <div
              key={discussion.id}
              className={`p-3 rounded border ${
                discussion.isResolved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-sm">{discussion.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Started by {discussion.createdBy} · {discussion.messageCount} messages
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    discussion.isResolved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {discussion.isResolved ? 'Resolved' : 'Open'}
                </span>
              </div>
              <button
                onClick={() => handleToggleResolved(discussion.id)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {discussion.isResolved ? 'Reopen' : 'Mark as resolved'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Discussions;
