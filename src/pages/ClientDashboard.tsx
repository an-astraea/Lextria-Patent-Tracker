import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPatents } from '@/lib/api/patent-api';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

const ClientDashboard: React.FC = () => {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<Patent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadPatents = async () => {
      setLoading(true);
      const data = await fetchPatents();
      setPatents(data);
      setFilteredPatents(data);
      setLoading(false);
    };

    loadPatents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatents(patents);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = patents.filter(
        (patent) =>
          patent.tracking_id.toLowerCase().includes(query) ||
          patent.patent_title.toLowerCase().includes(query) ||
          patent.patent_applicant.toLowerCase().includes(query) ||
          patent.client_id.toLowerCase().includes(query)
      );
      setFilteredPatents(filtered);
    }
  }, [searchQuery, patents]);

  const getStatusBadge = (patent: Patent) => {
    if (patent.ps_completion_status === 1) {
      return <Badge variant="success">PS Completed</Badge>;
    }
    if (patent.ps_filing_status === 1) {
      return <Badge variant="outline">PS Filing Under Review</Badge>;
    }
    if (patent.ps_drafting_status === 1) {
      return <Badge variant="outline">PS Drafting Under Review</Badge>;
    }
    if (patent.ps_drafting_status === 0) {
      return <Badge variant="warning">PS Drafting In Progress</Badge>;
    }

    if (patent.cs_completion_status === 1) {
      return <Badge variant="success">CS Completed</Badge>;
    }
    if (patent.cs_filing_status === 1) {
      return <Badge variant="outline">CS Filing Under Review</Badge>;
    }
    if (patent.cs_drafting_status === 1) {
      return <Badge variant="outline">CS Drafting Under Review</Badge>;
    }
    if (patent.cs_drafting_status === 0) {
      return <Badge variant="warning">CS Drafting In Progress</Badge>;
    }

    if (patent.fer_status === 1) {
      if (patent.fer_completion_status === 1) {
        return <Badge variant="success">FER Completed</Badge>;
      }
      if (patent.fer_filing_status === 1) {
        return <Badge variant="outline">FER Filing Under Review</Badge>;
      }
      if (patent.fer_drafter_status === 1) {
        return <Badge variant="outline">FER Drafting Under Review</Badge>;
      }
      if (patent.fer_drafter_status === 0) {
        return <Badge variant="warning">FER Drafting In Progress</Badge>;
      }
    }

    return <Badge variant="outline">Not Started</Badge>;
  };

  const getDeadlineBadge = (patent: Patent) => {
    const today = new Date();
    
    const deadlines = [
      { date: patent.ps_drafter_deadline, label: 'PS Draft' },
      { date: patent.ps_filer_deadline, label: 'PS File' },
      { date: patent.cs_drafter_deadline, label: 'CS Draft' },
      { date: patent.cs_filer_deadline, label: 'CS File' },
      { date: patent.fer_drafter_deadline, label: 'FER Draft' },
      { date: patent.fer_filer_deadline, label: 'FER File' }
    ].filter(d => d.date);
    
    if (deadlines.length === 0) return null;
    
    deadlines.sort((a, b) => {
      const dateA = new Date(a.date || '');
      const dateB = new Date(b.date || '');
      return dateA.getTime() - dateB.getTime();
    });
    
    const nextDeadline = deadlines[0];
    const deadlineDate = new Date(nextDeadline.date || '');
    const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {nextDeadline.label} Overdue
        </Badge>
      );
    } else if (daysRemaining <= 7) {
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {nextDeadline.label}: {daysRemaining} days left
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {nextDeadline.label}: {daysRemaining} days left
        </Badge>
      );
    }
  };

  const renderPatentCard = (patent: Patent) => {
    return (
      <Card key={patent.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{patent.patent_title}</CardTitle>
              <CardDescription>
                Tracking ID: {patent.tracking_id} | Client ID: {patent.client_id}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {getStatusBadge(patent)}
              {getDeadlineBadge(patent)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Applicant</p>
              <p className="font-medium">{patent.patent_applicant}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Filing Date</p>
              <p className="font-medium">
                {patent.date_of_filing ? format(new Date(patent.date_of_filing), 'PPP') : 'Not filed yet'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Application No.</p>
              <p className="font-medium">{patent.application_no || 'Not assigned yet'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Inventors</p>
              <p className="font-medium">
                {patent.inventors && patent.inventors.length > 0
                  ? patent.inventors.map(inv => inv.inventor_name).join(', ')
                  : 'No inventors listed'}
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Forms Status</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={patent.form_01 ? "success" : "outline"}>
                Form 1 {patent.form_01 ? "✓" : "✗"}
              </Badge>
              <Badge variant={patent.form_02_ps ? "success" : "outline"}>
                Form 2 (PS) {patent.form_02_ps ? "✓" : "✗"}
              </Badge>
              <Badge variant={patent.form_02_cs ? "success" : "outline"}>
                Form 2 (CS) {patent.form_02_cs ? "✓" : "✗"}
              </Badge>
              <Badge variant={patent.form_03 ? "success" : "outline"}>
                Form 3 {patent.form_03 ? "✓" : "✗"}
              </Badge>
              <Badge variant={patent.form_05 ? "success" : "outline"}>
                Form 5 {patent.form_05 ? "✓" : "✗"}
              </Badge>
              <div className="flex items-center gap-2">
                <Badge variant={patent.form_09 ? "success" : "outline"}>
                  Form 9 {patent.form_09 ? "✓" : "✗"}
                </Badge>
                <Badge variant={patent.form_09a ? "success" : "outline"}>
                  Form 9A {patent.form_09a ? "✓" : "✗"}
                </Badge>
              </div>
              <Badge variant={patent.form_18 ? "success" : "outline"}>
                Form 18 {patent.form_18 ? "✓" : "✗"}
              </Badge>
              <Badge variant={patent.form_26 ? "success" : "outline"}>
                Form 26 {patent.form_26 ? "✓" : "✗"}
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate(`/patents/${patent.id}`)}
            >
              <FileText className="h-4 w-4" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSkeletonCard = () => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-5 w-16" />
            ))}
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Skeleton className="h-9 w-32" />
        </div>
      </CardContent>
    </Card>
  );

  const pendingPatents = filteredPatents.filter(
    p => p.ps_completion_status !== 1 || p.cs_completion_status !== 1 || (p.fer_status === 1 && p.fer_completion_status !== 1)
  );
  
  const completedPatents = filteredPatents.filter(
    p => p.ps_completion_status === 1 && p.cs_completion_status === 1 && (p.fer_status !== 1 || p.fer_completion_status === 1)
  );

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patent Dashboard</h1>
        {user?.role === 'admin' && (
          <Button onClick={() => navigate('/patents/new')}>Add New Patent</Button>
        )}
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title, tracking ID, applicant or client ID..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingPatents.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedPatents.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {loading ? (
            Array(3).fill(0).map((_, i) => <div key={i}>{renderSkeletonCard()}</div>)
          ) : pendingPatents.length > 0 ? (
            pendingPatents.map(patent => renderPatentCard(patent))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-2">No pending patents found</p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {loading ? (
            Array(3).fill(0).map((_, i) => <div key={i}>{renderSkeletonCard()}</div>)
          ) : completedPatents.length > 0 ? (
            completedPatents.map(patent => renderPatentCard(patent))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-2">No completed patents found</p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDashboard;
