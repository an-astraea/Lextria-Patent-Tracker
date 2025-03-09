
import React from 'react';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, PieChart, Users, Clock } from 'lucide-react';

interface StatsCardsProps {
  patents: Patent[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ patents }) => {
  
  const getCompletionStats = () => {
    if (patents.length === 0) return { total: 0, completed: 0, percentage: 0 };
    
    const completedPatents = patents.filter(patent => {
      const psDone = patent.ps_completion_status === 1;
      const csDone = patent.cs_completion_status === 1;
      const ferDone = patent.fer_status === 0 || patent.fer_completion_status === 1;
      
      return psDone && csDone && ferDone;
    });
    
    const percentage = Math.round((completedPatents.length / patents.length) * 100);
    
    return {
      total: patents.length,
      completed: completedPatents.length,
      percentage
    };
  };

  const getStageStats = () => {
    if (patents.length === 0) {
      return {
        psOnly: 0,
        psAndCs: 0,
        all: 0,
        fer: 0
      };
    }
    
    const psOnly = patents.filter(p => 
      p.ps_completion_status === 1 && 
      p.cs_completion_status === 0
    ).length;
    
    const psAndCs = patents.filter(p => 
      p.ps_completion_status === 1 && 
      p.cs_completion_status === 1 && 
      (p.fer_status === 0 || p.fer_completion_status === 0)
    ).length;
    
    const all = patents.filter(p => 
      p.ps_completion_status === 1 && 
      p.cs_completion_status === 1 && 
      (p.fer_status === 0 || p.fer_completion_status === 1)
    ).length;
    
    const fer = patents.filter(p => p.fer_status === 1).length;
    
    return { psOnly, psAndCs, all, fer };
  };

  const getFormCompletionPercentage = (patent: Patent) => {
    const formFields = [
      patent.form_1, patent.form_2_ps, patent.form_2_cs, patent.form_3, 
      patent.form_4, patent.form_5, patent.form_6, patent.form_7, 
      patent.form_7a, patent.form_8, patent.form_8a, patent.form_9, 
      patent.form_9a, patent.form_10, patent.form_11, patent.form_12, 
      patent.form_13, patent.form_14, patent.form_15, patent.form_16, 
      patent.form_17, patent.form_18, patent.form_18a, patent.form_19, 
      patent.form_20, patent.form_21, patent.form_22, patent.form_23, 
      patent.form_24, patent.form_25, patent.form_26, patent.form_27, 
      patent.form_28, patent.form_29, patent.form_30, patent.form_31
    ];
    
    const totalForms = formFields.length;
    const completedForms = formFields.filter(form => form === true).length;
    
    return totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;
  };

  const stats = getCompletionStats();
  const stageStats = getStageStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.percentage}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.completed} of {stats.total} patents completed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stage Progress</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stageStats.psOnly + stageStats.psAndCs + stageStats.all}</div>
          <p className="text-xs text-muted-foreground mt-1">
            PS: {stageStats.psOnly}, CS: {stageStats.psAndCs}, Complete: {stageStats.all}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">FER Status</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stageStats.fer}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Active FER cases
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Form Completion</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {patents.length > 0 
              ? Math.round(patents.reduce((sum, patent) => sum + getFormCompletionPercentage(patent), 0) / patents.length)
              : 0}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Average form completion rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
