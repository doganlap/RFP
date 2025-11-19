// src/components/collaboration/Mentions.tsx
import React, { useState, useEffect } from 'react';

export interface Mention {
  id: string;
  mentionedBy: string;
  context: string;
  timestamp: Date;
  isRead: boolean;
}

interface MentionsProps {
  onMentionRead?: (mentionId: string) => void;
}

const Mentions: React.FC<MentionsProps> = ({ onMentionRead }) => {
  const [mentions, setMentions] = useState<Mention[]>([]);

  useEffect(() => {
    // Load mentions from API
    // const fetchMentions = async () => {
    //   setLoading(true);
    //   try {
    //     const response = await fetch('/api/mentions?userId=current');
    //     const data = await response.json();
    //     setMentions(data);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchMentions();
  }, []);

  const handleMarkAsRead = async (mentionId: string) => {
    try {
      // In production, call API
      // await fetch(`/api/mentions/${mentionId}/read`, { method: 'PUT' });

      setMentions(
        mentions.map((m) =>
          m.id === mentionId ? { ...m, isRead: true } : m
        )
      );
      onMentionRead?.(mentionId);
    } catch (error) {
      console.error('Failed to mark mention as read:', error);
    }
  };

  const unreadMentions = mentions.filter((m) => !m.isRead);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">
        Mentions ({unreadMentions.length} unread)
      </h3>

      {mentions.length === 0 ? (
        <p className="text-gray-500">No mentions yet. Use @ to mention team members.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mentions.map((mention) => (
            <div
              key={mention.id}
              className={`p-3 rounded border ${
                mention.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-sm">{mention.mentionedBy}</p>
                <p className="text-xs text-gray-500">
                  {new Date(mention.timestamp).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm text-gray-700 mb-3">{mention.context}</p>
              {!mention.isRead && (
                <button
                  onClick={() => handleMarkAsRead(mention.id)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Mentions;
