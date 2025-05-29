
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  Clock, 
  Pause, 
  Play, 
  CheckCircle, 
  MessageSquare,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  fetchPatentsByFollowUpStatus, 
  markFollowUpMade, 
  putPatentOnHold, 
  resumePatentFromHold,
  resolveReminder,
  checkStagnantPatents
} from '@/lib/api/reminder-api';

interface StagnantPatentsReminderProps {
  userRole?: string;
}

const StagnantPatentsReminder: React.FC<StagnantPatentsReminderProps> = ({ userRole = '' }) => {
  const [patents, setPatents] = useState<{
    active: any[];
    on_hold: any[];
    unresponsive: any[];
  }>({ active: [], on_hold: [], unresponsive: [] });
  const [loading, setLoading] = useState(true);
  const [selectedPatent, setSelectedPatent] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'follow_up' | 'hold' | 'resume' | null>(null);
  const [notes, setNotes] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);

  const loadPatents = async () => {
    setLoading(true);
    try {
      const data = await fetchPatentsByFollowUpStatus();
      setPatents(data);
    } catch (error) {
      console.error('Error loading stagnant patents:', error);
      toast.error('Failed to load reminder data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatents();
    // Also trigger stagnant patents check when component loads
    checkStagnantPatents();
  }, []);

  const handleAction = async () => {
    if (!selectedPatent || !actionType) return;

    try {
      let result;
      switch (actionType) {
        case 'follow_up':
          result = await markFollowUpMade(selectedPatent.id, notes);
          break;
        case 'hold':
          result = await putPatentOnHold(selectedPatent.id, notes);
          break;
        case 'resume':
          result = await resumePatentFromHold(selectedPatent.id, notes);
          break;
        default:
          return;
      }

      if (result.success) {
        toast.success(result.message);
        await loadPatents();
        setShowActionDialog(false);
        setSelectedPatent(null);
        setActionType(null);
        setNotes('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    }
  };

  const openActionDialog = (patent: any, action: 'follow_up' | 'hold' | 'resume') => {
    setSelectedPatent(patent);
    setActionType(action);
    setShowActionDialog(true);
  };

  const getStageDisplayName = (stage: string) => {
    const stageMap: Record<string, string> = {
      'idf_sent': 'IDF Sent',
      'idf_received': 'IDF Received',
      'cs_data_sent': 'CS Data Sent',
      'cs_data_received': 'CS Data Received',
      'ps_drafted': 'PS Drafted',
      'ps_filed': 'PS Filed',
      'cs_drafted': 'CS Drafted',
      'cs_filed': 'CS Filed',
      'completed': 'Completed',
      'initial': 'Initial'
    };
    return stageMap[stage] || stage;
  };

  const getDaysStagnant = (stageUpdatedAt: string) => {
    const stageDate = new Date(stageUpdatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - stageDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const PatentCard = ({ patent, status }: { patent: any; status: string }) => {
    const daysStagnant = patent.stage_updated_at ? getDaysStagnant(patent.stage_updated_at) : 0;
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-sm font-medium">{patent.patent_title}</CardTitle>
              <CardDescription className="text-xs">ID: {patent.tracking_id}</CardDescription>
            </div>
            <Badge variant={status === 'unresponsive' ? 'destructive' : status === 'on_hold' ? 'secondary' : 'default'}>
              {status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{patent.client_id}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{daysStagnant} days in {getStageDisplayName(patent.current_stage || '')}</span>
            </div>
          </div>
          
          <div className="flex gap-1 flex-wrap">
            {status !== 'unresponsive' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openActionDialog(patent, 'follow_up')}
                className="text-xs h-7"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Follow Up
              </Button>
            )}
            
            {status === 'active' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openActionDialog(patent, 'hold')}
                className="text-xs h-7"
              >
                <Pause className="h-3 w-3 mr-1" />
                Hold
              </Button>
            )}
            
            {status === 'on_hold' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openActionDialog(patent, 'resume')}
                className="text-xs h-7"
              >
                <Play className="h-3 w-3 mr-1" />
                Resume
              </Button>
            )}
          </div>
          
          {patent.follow_up_count && patent.follow_up_count > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Follow-ups: {patent.follow_up_count}
              {patent.last_follow_up_date && (
                <span className="ml-2">Last: {new Date(patent.last_follow_up_date).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Patent Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalStagnant = patents.active.length + patents.on_hold.length + patents.unresponsive.length;

  if (totalStagnant === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Patent Reminders
          </CardTitle>
          <CardDescription>All patents are progressing well!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Patent Reminders ({totalStagnant})
          </CardTitle>
          <CardDescription>Patents requiring follow-up attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active" className="text-xs">
                Active ({patents.active.length})
              </TabsTrigger>
              <TabsTrigger value="on_hold" className="text-xs">
                On Hold ({patents.on_hold.length})
              </TabsTrigger>
              <TabsTrigger value="unresponsive" className="text-xs">
                Unresponsive ({patents.unresponsive.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-4">
              {patents.active.length > 0 ? (
                patents.active.map(patent => (
                  <PatentCard key={patent.id} patent={patent} status="active" />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No active reminders</p>
              )}
            </TabsContent>
            
            <TabsContent value="on_hold" className="mt-4">
              {patents.on_hold.length > 0 ? (
                patents.on_hold.map(patent => (
                  <PatentCard key={patent.id} patent={patent} status="on_hold" />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No patents on hold</p>
              )}
            </TabsContent>
            
            <TabsContent value="unresponsive" className="mt-4">
              {patents.unresponsive.length > 0 ? (
                patents.unresponsive.map(patent => (
                  <PatentCard key={patent.id} patent={patent} status="unresponsive" />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No unresponsive patents</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'follow_up' && 'Mark Follow-up Made'}
              {actionType === 'hold' && 'Put Patent on Hold'}
              {actionType === 'resume' && 'Resume Patent'}
            </DialogTitle>
            <DialogDescription>
              {selectedPatent?.patent_title} (ID: {selectedPatent?.tracking_id})
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder={
                actionType === 'follow_up' 
                  ? 'Add details about the follow-up...'
                  : actionType === 'hold'
                  ? 'Reason for putting on hold...'
                  : 'Reason for resuming...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAction}>
              {actionType === 'follow_up' && 'Mark Follow-up'}
              {actionType === 'hold' && 'Put on Hold'}
              {actionType === 'resume' && 'Resume'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StagnantPatentsReminder;
