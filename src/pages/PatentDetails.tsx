import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchPatentById, updatePatentForms, fetchPatentTimeline, updatePatentNotes } from '@/lib/api';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { format } from 'date-fns';

const PatentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patent, setPatent] = useState<Patent | null>(null);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    form_26: false,
    form_18: false,
    form_18a: false,
    form_09: false,
    form_09a: false,
    form_13: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState('');
  const [isNotesSaving, setIsNotesSaving] = useState(false);

  useEffect(() => {
    const fetchPatent = async () => {
      if (id) {
        try {
          const patentData = await fetchPatentById(id);
          if (patentData) {
            setPatent(patentData);
            setFormValues({
              form_26: patentData.form_26 || false,
              form_18: patentData.form_18 || false,
              form_18a: patentData.form_18a || false,
              form_09: patentData.form_09 || false,
              form_09a: patentData.form_09a || false,
              form_13: patentData.form_13 || false,
            });
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveForms = async () => {
    if (!id) {
      toast.error('Patent ID is missing');
      return;
    }

    setIsSaving(true);

    try {
      const success = await updatePatentForms(id, {
        form_26: formValues.form_26,
        form_18: formValues.form_18,
        form_18a: formValues.form_18a,
        form_09: formValues.form_09,
        form_09a: formValues.form_09a,
        form_13: formValues.form_13,
      });

      if (success) {
        toast.success('Forms updated successfully');
      }
    } catch (error) {
      console.error('Error updating forms:', error);
      toast.error('Failed to update forms');
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
              <Label>Tracking ID</Label>
              <div className="font-semibold">{patent.tracking_id}</div>
            </div>
            <div>
              <Label>Patent Applicant</Label>
              <div className="font-semibold">{patent.patent_applicant}</div>
            </div>
            <div>
              <Label>Client ID</Label>
              <div className="font-semibold">{patent.client_id}</div>
            </div>
            <div>
              <Label>Application No</Label>
              <div className="font-semibold">{patent.application_no || 'N/A'}</div>
            </div>
            <div>
              <Label>Date of Filing</Label>
              <div className="font-semibold">{patent.date_of_filing}</div>
            </div>
            <div>
              <Label>Patent Title</Label>
              <div className="font-semibold">{patent.patent_title}</div>
            </div>
            <div>
              <Label>Applicant Address</Label>
              <div className="font-semibold">{patent.applicant_addr}</div>
            </div>
            <div>
              <Label>Inventor Phone No</Label>
              <div className="font-semibold">{patent.inventor_ph_no}</div>
            </div>
            <div>
              <Label>Inventor Email</Label>
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
              <Label>PS Drafting Status</Label>
              <Badge variant="secondary">{patent.ps_drafting_status}</Badge>
            </div>
            <div>
              <Label>PS Filing Status</Label>
              <Badge variant="secondary">{patent.ps_filing_status}</Badge>
            </div>
            <div>
              <Label>PS Completion Status</Label>
              <Badge variant="secondary">{patent.ps_completion_status}</Badge>
            </div>
            <div>
              <Label>CS Drafting Status</Label>
              <Badge variant="secondary">{patent.cs_drafting_status}</Badge>
            </div>
            <div>
              <Label>CS Filing Status</Label>
              <Badge variant="secondary">{patent.cs_filing_status}</Badge>
            </div>
            <div>
              <Label>CS Completion Status</Label>
              <Badge variant="secondary">{patent.cs_completion_status}</Badge>
            </div>
            <div>
              <Label>FER Status</Label>
              <Badge variant="secondary">{patent.fer_status}</Badge>
            </div>
            <div>
              <Label>FER Drafting Status</Label>
              <Badge variant="secondary">{patent.fer_drafter_status}</Badge>
            </div>
            <div>
              <Label>FER Filing Status</Label>
              <Badge variant="secondary">{patent.fer_filing_status}</Badge>
            </div>
            <div>
              <Label>FER Completion Status</Label>
              <Badge variant="secondary">{patent.fer_completion_status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Forms</CardTitle>
          <CardDescription>Update the status of required forms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="form_26">Form 26</Label>
              <Checkbox
                id="form_26"
                name="form_26"
                checked={formValues.form_26}
                onCheckedChange={checked => setFormValues(prev => ({ ...prev, form_26: !!checked }))}
              />
            </div>
            <div>
              <Label htmlFor="form_18">Form 18</Label>
              <Checkbox
                id="form_18"
                name="form_18"
                checked={formValues.form_18}
                onCheckedChange={checked => setFormValues(prev => ({ ...prev, form_18: !!checked }))}
              />
            </div>
            <div>
              <Label htmlFor="form_18a">Form 18A</Label>
              <Checkbox
                id="form_18a"
                name="form_18a"
                checked={formValues.form_18a}
                onCheckedChange={checked => setFormValues(prev => ({ ...prev, form_18a: !!checked }))}
              />
            </div>
            <div>
              <Label htmlFor="form_09">Form 09</Label>
              <Checkbox
                id="form_09"
                name="form_09"
                checked={formValues.form_09}
                onCheckedChange={checked => setFormValues(prev => ({ ...prev, form_09: !!checked }))}
              />
            </div>
            <div>
              <Label htmlFor="form_09a">Form 09A</Label>
              <Checkbox
                id="form_09a"
                name="form_09a"
                checked={formValues.form_09a}
                onCheckedChange={checked => setFormValues(prev => ({ ...prev, form_09a: !!checked }))}
              />
            </div>
            <div>
              <Label htmlFor="form_13">Form 13</Label>
              <Checkbox
                id="form_13"
                name="form_13"
                checked={formValues.form_13}
                onCheckedChange={checked => setFormValues(prev => ({ ...prev, form_13: !!checked }))}
              />
            </div>
          </div>
          <Button onClick={handleSaveForms} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Forms'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Add or update notes for this patent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
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

export default PatentDetails;
