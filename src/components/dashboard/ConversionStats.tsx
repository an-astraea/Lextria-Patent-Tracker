
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { FileText, FileMinus } from 'lucide-react';

interface ConversionStatsProps {
  patents: Patent[];
}

const ConversionStats: React.FC<ConversionStatsProps> = ({ patents }) => {
  const getPStoCSStats = () => {
    if (!patents.length) return { total: 0, percentage: 0 };
    
    const psCompleted = patents.filter(p => p.ps_completion_status === 1).length;
    const csCompleted = patents.filter(p => 
      p.ps_completion_status === 1 && p.cs_completion_status === 1
    ).length;
    
    const conversionPercentage = psCompleted > 0 
      ? Math.round((csCompleted / psCompleted) * 100) 
      : 0;
    
    return {
      total: csCompleted,
      percentage: conversionPercentage
    };
  };
  
  const getWithdrawnPatentsCount = () => {
    return patents.filter(p => p.withdrawn === true).length;
  };
  
  const psToCSStats = getPStoCSStats();
  const withdrawnCount = getWithdrawnPatentsCount();
  const totalPatents = patents.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">PS to CS Conversion</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{psToCSStats.percentage}%</div>
          <p className="text-xs text-muted-foreground">
            {psToCSStats.total} patents progressed from PS to CS
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Withdrawn Patents</CardTitle>
          <FileMinus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{withdrawnCount}</div>
          <p className="text-xs text-muted-foreground">
            {withdrawnCount > 0 ? ((withdrawnCount / totalPatents) * 100).toFixed(0) + '%' : '0%'} of patents withdrawn
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionStats;
