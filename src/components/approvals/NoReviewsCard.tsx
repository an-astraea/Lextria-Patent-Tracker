
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const NoReviewsCard = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <p className="text-xl font-medium">No pending reviews at this time</p>
        <p className="text-gray-500">Check back later for new submissions</p>
      </CardContent>
    </Card>
  );
};

export default NoReviewsCard;
