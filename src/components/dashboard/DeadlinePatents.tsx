
import React from 'react';
import { Patent } from '@/lib/types';
import PatentCard from '@/components/PatentCard';
import { addDays } from 'date-fns';

interface DeadlinePatentsProps {
  patents: Patent[];
}

const DeadlinePatents: React.FC<DeadlinePatentsProps> = ({ patents }) => {
  const getDeadlineApproachingPatents = (): Patent[] => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return patents.filter(patent => {
      const deadlines = [
        patent.ps_drafter_deadline,
        patent.ps_filer_deadline,
        patent.cs_drafter_deadline,
        patent.cs_filer_deadline,
        patent.fer_drafter_deadline,
        patent.fer_filer_deadline
      ].filter(Boolean) as string[];
      
      return deadlines.some(deadline => {
        const deadlineDate = new Date(deadline);
        return deadlineDate >= today && deadlineDate <= nextWeek;
      });
    });
  };
  
  const deadlineApproachingPatents = getDeadlineApproachingPatents();
  
  if (deadlineApproachingPatents.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Approaching Deadlines</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deadlineApproachingPatents.slice(0, 3).map((patent) => (
          <PatentCard key={patent.id} patent={patent} showDeadline />
        ))}
      </div>
    </div>
  );
};

export default DeadlinePatents;
