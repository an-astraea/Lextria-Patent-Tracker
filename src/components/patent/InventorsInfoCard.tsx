
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { InventorInfo } from '@/lib/types';

interface InventorsInfoCardProps {
  inventors: InventorInfo[];
}

const InventorsInfoCard: React.FC<InventorsInfoCardProps> = ({ inventors }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          Inventors Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inventors.length > 0 ? (
          <div className="space-y-4">
            {inventors.map((inventor, index) => (
              <div key={index} className="space-y-1">
                <h4 className="font-medium">{inventor.inventor_name}</h4>
                <p className="text-sm text-muted-foreground">{inventor.inventor_addr}</p>
                {index < inventors.length - 1 && <hr className="my-3" />}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No inventors information available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default InventorsInfoCard;
