
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, User } from 'lucide-react';

interface InventorsListProps {
  patent: Patent;
}

const InventorsList: React.FC<InventorsListProps> = ({ patent }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Inventors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patent.inventors && patent.inventors.length > 0 ? (
            patent.inventors.map((inventor, index) => (
              <div key={index} className="border rounded-md p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{inventor.inventor_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{inventor.inventor_addr}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{patent.inventor_email?.split('@')[0] || 'Unknown'}</span>
                </div>
                {patent.inventor_email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{patent.inventor_email}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventorsList;
