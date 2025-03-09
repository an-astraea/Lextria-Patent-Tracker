
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PatentStageChartProps {
  patents: Patent[];
}

const PatentStageChart: React.FC<PatentStageChartProps> = ({ patents }) => {
  const getPatentStageData = () => {
    // Count patents by stage
    const psDraftingOnly = patents.filter(p => 
      p.ps_drafting_status === 1 && 
      p.ps_filing_status === 0
    ).length;
    
    const psFilingOnly = patents.filter(p => 
      p.ps_drafting_status === 1 && 
      p.ps_filing_status === 1 && 
      p.cs_drafting_status === 0
    ).length;
    
    const csDraftingOnly = patents.filter(p => 
      p.ps_completion_status === 1 && 
      p.cs_drafting_status === 1 && 
      p.cs_filing_status === 0
    ).length;
    
    const csFilingOnly = patents.filter(p => 
      p.cs_drafting_status === 1 && 
      p.cs_filing_status === 1 && 
      (p.fer_status === 0 || p.fer_drafter_status === 0)
    ).length;
    
    const ferDrafting = patents.filter(p => 
      p.fer_status === 1 && 
      p.fer_drafter_status === 1 && 
      p.fer_filing_status === 0
    ).length;
    
    const ferFiling = patents.filter(p => 
      p.fer_status === 1 && 
      p.fer_filing_status === 1
    ).length;
    
    const notStarted = patents.filter(p => 
      p.ps_drafting_status === 0
    ).length;
    
    const completed = patents.filter(p => 
      p.ps_completion_status === 1 && 
      p.cs_completion_status === 1 && 
      (p.fer_status === 0 || p.fer_completion_status === 1)
    ).length;
    
    const withdrawn = patents.filter(p => 
      p.withdrawn === true
    ).length;
    
    // Create data for chart
    return [
      { name: 'Not Started', value: notStarted, color: '#94a3b8' },
      { name: 'PS Drafting', value: psDraftingOnly, color: '#60a5fa' },
      { name: 'PS Filing', value: psFilingOnly, color: '#3b82f6' },
      { name: 'CS Drafting', value: csDraftingOnly, color: '#7c3aed' },
      { name: 'CS Filing', value: csFilingOnly, color: '#6d28d9' },
      { name: 'FER Drafting', value: ferDrafting, color: '#f97316' },
      { name: 'FER Filing', value: ferFiling, color: '#ea580c' },
      { name: 'Completed', value: completed, color: '#16a34a' },
      { name: 'Withdrawn', value: withdrawn, color: '#dc2626' }
    ].filter(item => item.value > 0); // Only show stages that have patents
  };

  const data = getPatentStageData();
  
  if (data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No patent data available</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patent Stage Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} Patents`, 'Count']}
                labelFormatter={(label) => `Stage: ${label}`}
              />
              <Bar dataKey="value" name="Patents" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatentStageChart;
