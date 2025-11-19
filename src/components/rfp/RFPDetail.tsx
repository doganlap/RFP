// src/components/rfp/RFPDetail.tsx
import Comments from '../collaboration/Comments';
import Mentions from '../collaboration/Mentions';
import Discussions from '../collaboration/Discussions';
const RFPDetail = () => {
  // Mock RFP data
  const rfp = {
    id: 'RFP001',
    title: 'Enterprise Asset Management System',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{rfp.title}</h2>
      <p>Details about the RFP will be displayed here.</p>

      <div className="mt-8">
        <Comments resourceId={rfp.id} resourceType="rfp" />
      </div>
      <div className="mt-8">
        <Mentions onMentionRead={() => {}} />
      </div>
      <div className="mt-8">
        <Discussions rfpId={rfp.id} />
      </div>
    </div>
  );
};

export default RFPDetail;
