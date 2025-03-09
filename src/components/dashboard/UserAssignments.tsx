
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import PatentCard from '@/components/PatentCard';
import { Patent } from '@/lib/types';

interface UserAssignmentsProps {
  userAssignedPatents: Patent[];
  userRole: string;
}

const UserAssignments: React.FC<UserAssignmentsProps> = ({ userAssignedPatents, userRole }) => {
  const navigate = useNavigate();
  
  if (userAssignedPatents.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Assignments</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(userRole === 'drafter' ? '/drafts' : '/filings')}
        >
          View All <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userAssignedPatents.slice(0, 3).map((patent) => (
          <PatentCard key={patent.id} patent={patent} showDeadline />
        ))}
      </div>
    </div>
  );
};

export default UserAssignments;
