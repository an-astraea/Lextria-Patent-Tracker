import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Patent } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchFilerAssignments, fetchFilerCompletedAssignments, completeFilerTask } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import StatusBadge from '@/components/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Filings = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [inProgressFilings, setInProgressFilings] = useState<Patent[]>([]);
  const [completedFilings, setCompletedFilings] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    emp_id: string;
    full_name: string;
    email: string;
    role: string;
  } | null>(null);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formStates, setFormStates] = useState<{
    [patentId: string]: {
      form_26: boolean;
      form_18: boolean;
      form_18a: boolean;
      form_9: boolean;
      form_9a: boolean;
      form_13: boolean;
    };
  }>({});
  const [isTaskCompleteDialogOpen, setIsTaskCompleteDialogOpen] = useState(false);
  const [patentToComplete, setPatentToComplete] = useState<Patent | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [patentToDelete, setPatentToDelete] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (user && user.email) {
        try {
          setLoading(true);
          const inProgress = await fetchFilerAssignments(user.email);
          const completed = await fetchFilerCompletedAssignments(user.email);
          setInProgressFilings(inProgress);
          setCompletedFilings(completed);

          // Initialize form states
          const initialFormStates = {};
          [...inProgress, ...completed].forEach(patent => {
            initialFormStates[patent.id] = {
              form_26: patent.form_26 || false,
              form_18: patent.form_18 || false,
              form_18a: patent.form_18a || false,
              form_9: patent.form_9 || false,
              form_9a: patent.form_9a || false,
              form_13: patent.form_13 || false,
            };
          });
          setFormStates(initialFormStates);
        } catch (error) {
          console.error('Error fetching assignments:', error);
          toast.error('Failed to load filings');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAssignments();
  }, [user]);

  const handleFormChange = (patentId: string, formName: string, checked: boolean) => {
    setFormStates(prevFormStates => ({
      ...prevFormStates,
      [patentId]: {
        ...prevFormStates[patentId],
        [formName]: checked,
      },
    }));
  };

  const handleOpenDialog = (patent: Patent) => {
    setSelectedPatent(patent);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPatent(null);
  };

  const handleOpenTaskCompleteDialog = (patent: Patent) => {
    setPatentToComplete(patent);
    setIsTaskCompleteDialogOpen(true);
  };

  const handleCloseTaskCompleteDialog = () => {
    setIsTaskCompleteDialogOpen(false);
    setPatentToComplete(null);
  };

  const handleSubmitForms = async () => {
    if (!selectedPatent) return;

    const formData = formStates[selectedPatent.id];
    if (!formData) return;

    try {
      const success = await completeFilerTask(selectedPatent, user?.email || '', formData);
      if (success) {
        toast.success('Forms submitted and task completed successfully');
        // Refresh assignments
        const inProgress = await fetchFilerAssignments(user?.email || '');
        const completed = await fetchFilerCompletedAssignments(user?.email || '');
        setInProgressFilings(inProgress);
        setCompletedFilings(completed);
      } else {
        toast.error('Failed to submit forms and complete task');
      }
    } catch (error) {
      console.error('Error submitting forms:', error);
      toast.error('Failed to submit forms');
    } finally {
      handleCloseDialog();
      handleCloseTaskCompleteDialog();
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredInProgressFilings = inProgressFilings.filter(patent =>
    patent.patent_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompletedFilings = completedFilings.filter(patent =>
    patent.patent_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Filings</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search filings..."
          className="pl-9"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <Tabs defaultValue="in-progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="in-progress" className="space-y-4">
          {filteredInProgressFilings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInProgressFilings.map(patent => (
                <Card key={patent.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{patent.patent_title}</h3>
                      <p className="text-sm text-muted-foreground">Tracking ID: {patent.tracking_id}</p>
                      <StatusBadge
                        status={
                          patent.ps_filing_status === 0 ||
                            patent.cs_filing_status === 0 ||
                            patent.fer_filing_status === 0
                            ? 'In Progress'
                            : 'Completed'
                        }
                      />
                      <Button variant="secondary" size="sm" onClick={() => handleOpenDialog(patent)}>
                        View Forms
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenTaskCompleteDialog(patent)}>
                        Complete Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">No in progress filings found.</div>
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {filteredCompletedFilings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompletedFilings.map(patent => (
                <Card key={patent.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{patent.patent_title}</h3>
                      <p className="text-sm text-muted-foreground">Tracking ID: {patent.tracking_id}</p>
                      <StatusBadge status="Completed" />
                      <Button variant="secondary" size="sm" onClick={() => handleOpenDialog(patent)}>
                        View Forms
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">No completed filings found.</div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filing Forms</DialogTitle>
            <DialogDescription>
              Select the forms that have been completed for this filing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedPatent && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="form_26"
                      checked={formStates[selectedPatent.id]?.form_26 || false}
                      onCheckedChange={(checked) => handleFormChange(selectedPatent.id, 'form_26', checked)}
                    />
                    <Label htmlFor="form_26">Form 26</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="form_18"
                      checked={formStates[selectedPatent.id]?.form_18 || false}
                      onCheckedChange={(checked) => handleFormChange(selectedPatent.id, 'form_18', checked)}
                    />
                    <Label htmlFor="form_18">Form 18</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="form_18a"
                      checked={formStates[selectedPatent.id]?.form_18a || false}
                      onCheckedChange={(checked) => handleFormChange(selectedPatent.id, 'form_18a', checked)}
                    />
                    <Label htmlFor="form_18a">Form 18A</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="form_9"
                      checked={formStates[selectedPatent.id]?.form_9 || false}
                      onCheckedChange={(checked) => handleFormChange(selectedPatent.id, 'form_9', checked)}
                    />
                    <Label htmlFor="form_9">Form 9</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="form_9a"
                      checked={formStates[selectedPatent.id]?.form_9a || false}
                      onCheckedChange={(checked) => handleFormChange(selectedPatent.id, 'form_9a', checked)}
                    />
                    <Label htmlFor="form_9a">Form 9A</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="form_13"
                      checked={formStates[selectedPatent.id]?.form_13 || false}
                      onCheckedChange={(checked) => handleFormChange(selectedPatent.id, 'form_13', checked)}
                    />
                    <Label htmlFor="form_13">Form 13</Label>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={handleCloseDialog}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmitForms}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTaskCompleteDialogOpen} onOpenChange={setIsTaskCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to complete this task?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={handleCloseTaskCompleteDialog}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmitForms}>
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Filings;
