
import React from 'react';

const EmptyApprovals: React.FC = () => {
  return (
    <div className="text-center p-8 border rounded-lg">
      <p className="text-gray-500">No pending approvals found</p>
    </div>
  );
};

export default EmptyApprovals;
