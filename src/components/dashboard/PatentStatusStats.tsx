
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { FileText } from 'lucide-react';

interface PatentStatusStatsProps {
  patents: Patent[];
}

const PatentStatusStats: React.FC<PatentStatusStatsProps> = ({ patents }) => {
  const getPatentStatusStats = () => {
    if (!patents.length) return null;
    
    return {
      ps: {
        drafted: patents.filter(p => p.ps_drafting_status === 1).length,
        filed: patents.filter(p => p.ps_filing_status === 1).length,
        completed: patents.filter(p => p.ps_completion_status === 1).length,
      },
      cs: {
        drafted: patents.filter(p => p.cs_drafting_status === 1).length,
        filed: patents.filter(p => p.cs_filing_status === 1).length,
        completed: patents.filter(p => p.cs_completion_status === 1).length,
      },
      fer: {
        required: patents.filter(p => p.fer_status === 1).length,
        drafted: patents.filter(p => p.fer_drafter_status === 1).length,
        filed: patents.filter(p => p.fer_filing_status === 1).length,
        completed: patents.filter(p => p.fer_completion_status === 1).length,
      }
    };
  };

  const statusStats = getPatentStatusStats();
  
  if (!statusStats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Provisional Specification</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="text-center">
              <div className="text-xl font-bold">{statusStats.ps.drafted}</div>
              <p className="text-xs text-muted-foreground">Drafted</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{statusStats.ps.filed}</div>
              <p className="text-xs text-muted-foreground">Filed</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{statusStats.ps.completed}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Complete Specification</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="text-center">
              <div className="text-xl font-bold">{statusStats.cs.drafted}</div>
              <p className="text-xs text-muted-foreground">Drafted</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{statusStats.cs.filed}</div>
              <p className="text-xs text-muted-foreground">Filed</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{statusStats.cs.completed}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">First Examination Report</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 py-2">
            <div className="text-center">
              <div className="text-xl font-bold">{statusStats.fer.required}</div>
              <p className="text-xs text-muted-foreground">Required</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{statusStats.fer.drafted}</div>
              <p className="text-xs text-muted-foreground">Drafted</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{statusStats.fer.filed}</div>
              <p className="text-xs text-muted-foreground">Filed</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{statusStats.fer.completed}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatentStatusStats;
