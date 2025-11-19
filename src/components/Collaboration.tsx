// src/components/Collaboration.tsx
import React, { useState } from 'react';
import Comments from './collaboration/Comments';
import Mentions from './collaboration/Mentions';
import Discussions from './collaboration/Discussions';

interface CollaborationProps {
  rfpId: string;
  resourceType?: 'rfp' | 'task' | 'document';
}

const Collaboration: React.FC<CollaborationProps> = ({
  rfpId,
  resourceType = 'rfp',
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'mentions' | 'discussions'>('comments');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-6">Collaboration</h2>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'comments'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Comments
        </button>
        <button
          onClick={() => setActiveTab('mentions')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'mentions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Mentions
        </button>
        <button
          onClick={() => setActiveTab('discussions')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'discussions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Discussions
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'comments' && (
          <Comments resourceId={rfpId} resourceType={resourceType} />
        )}
        {activeTab === 'mentions' && <Mentions />}
        {activeTab === 'discussions' && <Discussions rfpId={rfpId} />}
      </div>
    </div>
  );
};

export default Collaboration;
