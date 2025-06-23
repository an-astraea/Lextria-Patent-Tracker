
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { FileText } from 'lucide-react';
import { getSectionStats } from '@/lib/utils/status-utils';

interface PatentStatusStatsProps {
  patents: Patent[];
}

const PatentStatusStats: React.FC<PatentStatusStatsProps> = ({ patents }) => {
  const sectionStats = getSectionStats(patents);
  
  if (!patents.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Provisional Specification</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 py-2">
            <div className="text-center">
              <div className="text-lg font-bold">{sectionStats.ps.drafting}</div>
              <p className="text-xs text-muted-foreground">Drafting</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{sectionStats.ps.draftingApproval}</div>
              <p className="text-xs text-muted-foreground">Draft Review</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{sectionStats.ps.filing}</div>
              <p className="text-xs text-muted-foreground">Filing</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{sectionStats.ps.filingApproval}</div>
              <p className="text-xs text-muted-foreground">Filing Review</p>
            </div>
          </div>
          <div className="text-center pt-2 border-t">
            <div className="text-xl font-bold text-blue-600">{sectionStats.ps.completed}</div>
            <p className="text-xs text-muted-foreground">PS Completed</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Complete Specification</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 py-2">
            <div className="text-center">
              <div className="text-lg font-bold">{sectionStats.cs.dataSent}</div>
              <p className="text-xs text-muted-foreground">Data Sent</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{sectionStats.cs.dataReceived}</div>
              <p className="text-xs text-muted-foreground">Data Received</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{sectionStats.cs.drafting}</div>
              <p className="text-xs text-muted-foreground">Drafting</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{sectionStats.cs.draftingApproval}</div>
              <p className="text-xs text-muted-foreground">Draft Review</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{sectionStats.cs.filing}</div>
              <p className="text-xs text-muted-foreground">Filing</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{sectionStats.cs.filingApproval}</div>
              <p className="text-xs text-muted-foreground">Filing Review</p>
            </div>
          </div>
          <div className="text-center pt-2 border-t">
            <div className="text-xl font-bold text-indigo-600">{sectionStats.cs.completed}</div>
            <p className="text-xs text-muted-foreground">CS Completed</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sectionStats.overall.completed}</div>
              <p className="text-xs text-muted-foreground">Fully Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sectionStats.overall.active}</div>
              <p className="text-xs text-muted-foreground">Active Patents</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{sectionStats.overall.withdrawn}</div>
              <p className="text-xs text-muted-foreground">Withdrawn</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatentStatusStats;
