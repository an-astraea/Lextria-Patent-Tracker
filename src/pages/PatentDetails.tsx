
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchPatentById, updatePatentNotes, fetchPatentTimeline } from '@/lib/api';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import FormRequirementsList from '@/components/patent/FormRequirementsList';

const PatentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patent, setPatent] = useState<Patent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState('');
  const [isNotesSaving, setIsNotesSaving] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');

    const fetchPatent = async () => {
      if (id) {
        try {
          const patentData = await fetchPatentById(id);
          if (patentData) {
            setPatent(patentData);
            setNotes(patentData.notes || '');
          } else {
            toast.error('Patent not found');
            navigate('/patents');
          }
        } catch (error) {
          console.error('Error fetching patent:', error);
          toast.error('Failed to load patent details');
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchTimelineData = async () => {
      if (id) {
        try {
          const timelineData = await fetchPatentTimeline(id);
          setTimeline(timelineData);
        } catch (error) {
          console.error('Error fetching patent timeline:', error);
          toast.error('Failed to load patent timeline');
        }
      }
    };

    fetchPatent();
    fetchTimelineData();
  }, [id, navigate]);

  const handleFormUpdate = async (formName: string, value: boolean) => {
    if (!patent || !id) return;
    
    setIsSaving(true);
    try {
      // Create an object with just the updated form field
      const formData: Record<string, boolean> = {
        [formName]: value
      };
      
      const success = await updatePatentForms(id, formData);
      if (success) {
        // Update local state to reflect the change
        setPatent(prev => {
          if (!prev) return null;
          return {
            ...prev,
            [formName]: value
          };
        });
        toast.success(`${formName.toUpperCase()} updated successfully`);
      }
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Failed to update form');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = async () => {
    if (!id) {
      toast.error('Patent ID is missing');
      return;
    }

    setIsNotesSaving(true);

    try {
      const success = await updatePatentNotes(id, notes);

      if (success) {
        toast.success('Notes updated successfully');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    } finally {
      setIsNotesSaving(false);
    }
  };

  // Check if user is allowed to edit forms (admin or filer)
  const canEditForms = userRole === 'admin' || userRole === 'filer';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Loading patent details...
      </div>
    );
  }

  if (!patent) {
    return <div className="text-red-500">Patent not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Patent Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patent Information</CardTitle>
          <CardDescription>Details about the patent application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Tracking ID</div>
              <div className="font-semibold">{patent.tracking_id}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Patent Applicant</div>
              <div className="font-semibold">{patent.patent_applicant}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Client ID</div>
              <div className="font-semibold">{patent.client_id}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Application No</div>
              <div className="font-semibold">{patent.application_no || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Date of Filing</div>
              <div className="font-semibold">{patent.date_of_filing || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Patent Title</div>
              <div className="font-semibold">{patent.patent_title}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Applicant Address</div>
              <div className="font-semibold">{patent.applicant_addr}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Inventor Phone No</div>
              <div className="font-semibold">{patent.inventor_ph_no}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Inventor Email</div>
              <div className="font-semibold">{patent.inventor_email}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventors</CardTitle>
          <CardDescription>List of inventors associated with this patent</CardDescription>
        </CardHeader>
        <CardContent>
          {patent.inventors && patent.inventors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patent.inventors.map(inventor => (
                  <TableRow key={inventor.id}>
                    <TableCell>{inventor.inventor_name}</TableCell>
                    <TableCell>{inventor.inventor_addr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-gray-500">No inventors found for this patent.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patent Status</CardTitle>
          <CardDescription>Current status of each stage in the patent process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">PS Drafting Status</div>
              <Badge variant={patent.ps_drafting_status === 1 ? "success" : "secondary"}>
                {patent.ps_drafting_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">PS Filing Status</div>
              <Badge variant={patent.ps_filing_status === 1 ? "success" : "secondary"}>
                {patent.ps_filing_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">PS Completion Status</div>
              <Badge variant={patent.ps_completion_status === 1 ? "success" : "secondary"}>
                {patent.ps_completion_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">CS Drafting Status</div>
              <Badge variant={patent.cs_drafting_status === 1 ? "success" : "secondary"}>
                {patent.cs_drafting_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">CS Filing Status</div>
              <Badge variant={patent.cs_filing_status === 1 ? "success" : "secondary"}>
                {patent.cs_filing_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">CS Completion Status</div>
              <Badge variant={patent.cs_completion_status === 1 ? "success" : "secondary"}>
                {patent.cs_completion_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">FER Status</div>
              <Badge variant={patent.fer_status === 1 ? "success" : "secondary"}>
                {patent.fer_status === 1 ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">FER Drafting Status</div>
              <Badge variant={patent.fer_drafter_status === 1 ? "success" : "secondary"}>
                {patent.fer_drafter_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">FER Filing Status</div>
              <Badge variant={patent.fer_filing_status === 1 ? "success" : "secondary"}>
                {patent.fer_filing_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">FER Completion Status</div>
              <Badge variant={patent.fer_completion_status === 1 ? "success" : "secondary"}>
                {patent.fer_completion_status === 1 ? "Completed" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Requirements Card */}
      <FormRequirementsList 
        patent={patent} 
        userRole={userRole} 
        onUpdate={canEditForms ? handleFormUpdate : undefined} 
      />

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Add or update notes for this patent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Textarea
                id="notes"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Type your notes here."
              />
            </div>
            <Button onClick={handleSaveNotes} disabled={isNotesSaving}>
              {isNotesSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Notes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>History of events for this patent</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <Table>
              <TableCaption>A list of events for the patent.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeline.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{format(new Date(event.created_at), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{event.event_type}</TableCell>
                    <TableCell>{event.event_description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

// Missing import for updatePatentForms
import { updatePatentForms } from '@/lib/api';

export default PatentDetails;
