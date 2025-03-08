import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useQuery } from '@tanstack/react-query';
import { fetchPatents } from '@/lib/api';
import { Patent } from '@/lib/types';
import { useEffect } from 'react';

interface DashboardCardProps {
  title: string;
  value: number;
  description: string;
  variant?: "default" | "destructive";
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
  variant
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

interface ClientDashboardProps { }

const ClientDashboard: React.FC<ClientDashboardProps> = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const { data: patents, isLoading, isError } = useQuery({
    queryKey: ['patents'],
    queryFn: fetchPatents,
  });

  useEffect(() => {
    if (isError) {
      console.error("Failed to fetch patents");
    }
  }, [isError]);

  const assignedPatents = React.useMemo(() => {
    if (!patents || !user) return [];

    return patents.filter(patent =>
      patent.ps_drafter_assgn === user?.full_name ||
      patent.ps_filer_assgn === user?.full_name ||
      patent.cs_drafter_assgn === user?.full_name ||
      patent.cs_filer_assgn === user?.full_name ||
      patent.fer_drafter_assgn === user?.full_name ||
      patent.fer_filer_assgn === user?.full_name
    );
  }, [patents, user]);

  const pendingPatents = React.useMemo(() => {
    return assignedPatents.filter(patent =>
      patent.ps_drafting_status === 1 ||
      patent.ps_review_draft_status === 1 ||
      patent.ps_filing_status === 0 ||
      patent.cs_drafting_status === 1 ||
      patent.cs_review_draft_status === 1 ||
      patent.cs_filing_status === 0 ||
      patent.fer_drafter_status === 1 ||
      patent.fer_review_draft_status === 1 ||
      patent.fer_filing_status === 0
    );
  }, [assignedPatents]);

  const completedPatents = React.useMemo(() => {
    return assignedPatents.filter(patent =>
      patent.ps_completion_status === 1 &&
      patent.cs_completion_status === 1 &&
      patent.fer_completion_status === 1
    );
  }, [assignedPatents]);

  const draftingPending = React.useMemo(() => {
    return assignedPatents.filter(patent =>
      (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) ||
      (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) ||
      (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0)
    );
  }, [assignedPatents]);

  const filingPending = React.useMemo(() => {
    return assignedPatents.filter(patent =>
      (patent.ps_review_draft_status === 1 && patent.ps_filing_status === 0) ||
      (patent.cs_review_draft_status === 1 && patent.cs_filing_status === 0) ||
      (patent.fer_review_draft_status === 1 && patent.fer_filing_status === 0)
    );
  }, [assignedPatents]);

  const calculateProgress = (patent: Patent): number => {
    let progress = 0;
    let totalStages = 0;

    // Provisional Specification Stage
    if (patent.ps_drafter_assgn) {
      totalStages++;
      if (patent.ps_drafting_status === 1) {
        progress++;
      }
    }
    if (patent.ps_filer_assgn) {
      totalStages++;
      if (patent.ps_filing_status === 1) {
        progress++;
      }
    }

    // Complete Specification Stage
    if (patent.cs_drafter_assgn) {
      totalStages++;
      if (patent.cs_drafting_status === 1) {
        progress++;
      }
    }
    if (patent.cs_filer_assgn) {
      totalStages++;
      if (patent.cs_filing_status === 1) {
        progress++;
      }
    }

    // FER Stage
    if (patent.fer_drafter_assgn) {
      totalStages++;
      if (patent.fer_drafter_status === 1) {
        progress++;
      }
    }
    if (patent.fer_filer_assgn) {
      totalStages++;
      if (patent.fer_filing_status === 1) {
        progress++;
      }
    }

    // Check for form completion
    const hasForm01 = patent.form_01;
    const hasForm02Ps = patent.form_02_ps;
    const hasForm02Cs = patent.form_02_cs;
    const hasForm03 = patent.form_03;
    const hasForm04 = patent.form_04;
    const hasForm05 = patent.form_05;
    const hasForm06 = patent.form_06;
    const hasForm07 = patent.form_07;
    const hasForm07a = patent.form_07a;
    const hasForm08 = patent.form_08;
    const hasForm08a = patent.form_08a;
    const hasForm09 = patent.form_09;
    const hasForm09a = patent.form_09a; // Using the correct property names
    const hasForm10 = patent.form_10;
    const hasForm11 = patent.form_11;
    const hasForm12 = patent.form_12;
    const hasForm13 = patent.form_13;
    const hasForm14 = patent.form_14;
    const hasForm15 = patent.form_15;
    const hasForm16 = patent.form_16;
    const hasForm17 = patent.form_17;
    const hasForm18 = patent.form_18;
    const hasForm18a = patent.form_18a;
    const hasForm19 = patent.form_19;
    const hasForm20 = patent.form_20;
    const hasForm21 = patent.form_21;
    const hasForm22 = patent.form_22;
    const hasForm23 = patent.form_23;
    const hasForm24 = patent.form_24;
    const hasForm25 = patent.form_25;
    const hasForm26 = patent.form_26;
    const hasForm27 = patent.form_27;
    const hasForm28 = patent.form_28;
    const hasForm29 = patent.form_29;
    const hasForm30 = patent.form_30;
    const hasForm31 = patent.form_31;

    let formsCompleted = 0;
    if (hasForm01) formsCompleted++;
    if (hasForm02Ps) formsCompleted++;
    if (hasForm02Cs) formsCompleted++;
    if (hasForm03) formsCompleted++;
    if (hasForm04) formsCompleted++;
    if (hasForm05) formsCompleted++;
    if (hasForm06) formsCompleted++;
    if (hasForm07) formsCompleted++;
    if (hasForm07a) formsCompleted++;
    if (hasForm08) formsCompleted++;
    if (hasForm08a) formsCompleted++;
    if (hasForm09) formsCompleted++;
    if (hasForm09a) formsCompleted++;
    if (hasForm10) formsCompleted++;
    if (hasForm11) formsCompleted++;
    if (hasForm12) formsCompleted++;
    if (hasForm13) formsCompleted++;
    if (hasForm14) formsCompleted++;
    if (hasForm15) formsCompleted++;
    if (hasForm16) formsCompleted++;
    if (hasForm17) formsCompleted++;
    if (hasForm18) formsCompleted++;
    if (hasForm18a) formsCompleted++;
    if (hasForm19) formsCompleted++;
    if (hasForm20) formsCompleted++;
    if (hasForm21) formsCompleted++;
    if (hasForm22) formsCompleted++;
    if (hasForm23) formsCompleted++;
    if (hasForm24) formsCompleted++;
    if (hasForm25) formsCompleted++;
    if (hasForm26) formsCompleted++;
    if (hasForm27) formsCompleted++;
    if (hasForm28) formsCompleted++;
    if (hasForm29) formsCompleted++;
    if (hasForm30) formsCompleted++;
    if (hasForm31) formsCompleted++;

    const totalForms = 31; // Total number of forms
    const formCompletionPercentage = (formsCompleted / totalForms) * 100;

    // Add form completion to the overall progress
    progress += formCompletionPercentage / 100 * 2; // Weighing forms as 20% of the total progress
    totalStages += 2; // Adding 2 to total stages to account for form completion

    const overallProgress = (progress / totalStages) * 100;
    return Math.min(overallProgress, 100); // Ensure progress doesn't exceed 100%
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Client Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Assigned Patents"
          value={assignedPatents.length}
          description="Total patents assigned to you"
        />
        <DashboardCard
          title="Pending Filings"
          value={pendingPatents.length}
          description="Patents awaiting your action"
        />
        <DashboardCard
          title="Completed Filings"
          value={completedPatents.length}
          description="Patents successfully completed"
        />
        <DashboardCard
          title="Drafting Pending"
          value={draftingPending.length}
          description="Patents pending drafting"
        />
        <DashboardCard
          title="Filing Pending"
          value={filingPending.length}
          description="Patents pending filing"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Patent Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedPatents.map((patent) => (
            <div key={patent.id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold">{patent.patent_title}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Progress value={calculateProgress(patent)} className="h-4 mt-2" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {`Progress: ${calculateProgress(patent).toFixed(2)}%`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-gray-500 mt-1">Tracking ID: {patent.tracking_id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
