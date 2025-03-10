
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface EmptyStateCardProps {
  title: string;
  description: string;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ title, description }) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <p className="text-xl font-medium">{title}</p>
        <p className="text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;
