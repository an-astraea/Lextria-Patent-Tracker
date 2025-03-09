import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchDrafterAssignments,
  fetchFilerAssignments,
  fetchFilerFERAssignments,
  completeDrafterTask,
  completeFilerTask,
  completeFERFilerTask
} from '@/lib/api';
import { Patent, FEREntry } from '@/lib/types';
import { Loader2, CheckCircle, FileText, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  deadline: string | null;
  status: string;
  type: 'drafting' | 'filing' | 'fer_filing';
  patent: Patent;
  ferEntry?: FEREntry;
}

const Filings = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isCompletingTask, setIsCompletingTask] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
    setUserName(user.full_name || '');

    const loadTasks = async () => {
      setLoading(true);
      try {
        let fetchedTasks: Task[] = [];

        if (userRole === 'drafter') {
          const draftingTasks = await fetchDrafterAssignments(userName);
          fetchedTasks = draftingTasks.map(patent => ({
            id: patent.id,
            title: patent.patent_title,
            assignedTo: patent.ps_drafter_assgn || patent.cs_drafter_assgn || 'N/A',
            deadline: patent.ps_drafter_deadline || patent.cs_drafter_deadline || null,
            status: patent.ps_drafting_status === 1 || patent.cs_drafting_status === 1 ? 'Completed' : 'Pending',
            type: 'drafting',
            patent: patent
          }));
        } else if (userRole === 'filer') {
          const filingTasks = await fetchFilerAssignments(userName);
          fetchedTasks = filingTasks.map(patent => ({
            id: patent.id,
            title: patent.patent_title,
            assignedTo: patent.ps_filer_assgn || patent.cs_filer_assgn || 'N/A',
            deadline: patent.ps_filer_deadline || patent.cs_filer_deadline || null,
            status: patent.ps_filing_status === 1 || patent.cs_filing_status === 1 ? 'Completed' : 'Pending',
            type: 'filing',
            patent: patent
          }));

          // Fetch FER filing tasks
          const ferFilingTasks = await fetchFilerFERAssignments(userName);
          const ferTasks = ferFilingTasks.map(({ patent, ferEntry }) => ({
            id: ferEntry.id,
            title: `FER for ${patent.patent_title}`,
            assignedTo: ferEntry.fer_filer_assgn || 'N/A',
            deadline: ferEntry.fer_filer_deadline || null,
            status: ferEntry.fer_filing_status === 1 ? 'Completed' : 'Pending',
            type: 'fer_filing',
            patent: patent,
            ferEntry: ferEntry
          }));
          fetchedTasks.push(...ferTasks);
        }

        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [userRole, userName]);

  const handleCompleteTask = async (task: Task) => {
    setIsCompletingTask(true);
    try {
      if (userRole === 'drafter' && task.type === 'drafting') {
        const draftType = task.patent.ps_drafter_assgn === userName ? 'ps' : 'cs';
        const success = await completeDrafterTask(task.patent, draftType, userName);
        if (success) {
          toast.success('Drafting task completed successfully');
          setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
        } else {
          toast.error('Failed to complete drafting task');
        }
      } else if (userRole === 'filer' && task.type === 'filing') {
        const filingType = task.patent.ps_filer_assgn === userName ? 'ps' : 'cs';
        const success = await completeFilerTask(task.patent, filingType, userName);
        if (success) {
          toast.success('Filing task completed successfully');
          setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
        } else {
          toast.error('Failed to complete filing task');
        }
      } else if (userRole === 'filer' && task.type === 'fer_filing' && task.ferEntry) {
        const success = await completeFERFilerTask(task.ferEntry, userName);
        if (success) {
          toast.success('FER Filing task completed successfully');
          setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
        } else {
          toast.error('Failed to complete FER filing task');
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    } finally {
      setIsCompletingTask(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No deadline';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>A list of your assigned drafting and filing tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <ScrollArea className="h-[500px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        {task.type === 'fer_filing' ? (
                          <>
                            <FileText className="mr-2 inline-block h-4 w-4 align-middle" />
                            {task.assignedTo}
                          </>
                        ) : task.type === 'drafting' ? (
                          <>
                            <User className="mr-2 inline-block h-4 w-4 align-middle" />
                            {task.assignedTo}
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-2 inline-block h-4 w-4 align-middle" />
                            {task.assignedTo}
                          </>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(task.deadline)}</TableCell>
                      <TableCell>
                        {task.status === 'Completed' ? (
                          <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Completed
                          </div>
                        ) : (
                          <div className="text-gray-500">Pending</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {task.status === 'Pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteTask(task)}
                            disabled={isCompletingTask}
                          >
                            {isCompletingTask ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Completing...
                              </>
                            ) : (
                              'Complete Task'
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg text-gray-500">No tasks assigned to you.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Filings;
