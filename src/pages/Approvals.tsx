import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Patent } from '@/lib/types';
import { getPatentsPendingApproval } from '@/lib/data';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, FileText } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

const Approvals = () => {
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = React.useState<Patent[]>([]);
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  React.useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    } else {
      const approvals = getPatentsPendingApproval();
      setPendingApprovals(approvals);
    }
  }, [user, navigate]);
  
  const getApprovalType = (patent: Patent) => {
    if (patent.ps_drafting_status === 1 && patent.ps_review_draft_status === 0) {
      return { type: 'PS Draft', drafter: patent.ps_drafter_assgn };
    }
    if (patent.ps_filing_status === 1 && patent.ps_review_file_status === 0) {
      return { type: 'PS Filing', filer: patent.ps_filer_assgn };
    }
    if (patent.cs_drafting_status === 1 && patent.cs_review_draft_status === 0) {
      return { type: 'CS Draft', drafter: patent.cs_drafter_assgn };
    }
    if (patent.cs_filing_status === 1 && patent.cs_review_file_status === 0) {
      return { type: 'CS Filing', filer: patent.cs_filer_assgn };
    }
    if (patent.fer_drafter_status === 1 && patent.fer_review_draft_status === 0) {
      return { type: 'FER Draft', drafter: patent.fer_drafter_assgn };
    }
    if (patent.fer_filing_status === 1 && patent.fer_review_file_status === 0) {
      return { type: 'FER Filing', filer: patent.fer_filer_assgn };
    }
    return { type: 'Unknown', drafter: '', filer: '' };
  };
  
  const approveItem = (id: string) => {
    setPendingApprovals(pendingApprovals.filter(patent => patent.id !== id));
    toast.success('Approval granted successfully');
  };
  
  if (user?.role !== 'admin') {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
      </div>
      
      {pendingApprovals.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">No items pending approval</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingApprovals.map((patent) => {
            const { type, drafter, filer } = getApprovalType(patent);
            return (
              <Card key={patent.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">{patent.patent_title}</CardTitle>
                    <StatusBadge status={type} />
                  </div>
                  <CardDescription>{patent.tracking_id}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Applicant:</span> {patent.patent_applicant}
                    </div>
                    <div>
                      <span className="font-medium">Filing Date:</span> {new Date(patent.date_of_filing).toLocaleDateString()}
                    </div>
                    {drafter && (
                      <div>
                        <span className="font-medium">Drafted By:</span> {drafter}
                      </div>
                    )}
                    {filer && (
                      <div>
                        <span className="font-medium">Filed By:</span> {filer}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 flex-1" 
                    onClick={() => navigate(`/patents/${patent.id}`)}
                  >
                    <FileText className="h-4 w-4" />
                    Details
                  </Button>
                  <Button 
                    className="flex items-center gap-2 flex-1" 
                    onClick={() => approveItem(patent.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Approvals;
