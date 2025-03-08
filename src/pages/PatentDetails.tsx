
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPatentById, updatePatentNotes } from '@/lib/api';
import { Patent } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PatentTimeline from '@/components/patent/PatentTimeline';

const PatentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patent, setPatent] = useState<Patent | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  useEffect(() => {
    const loadPatent = async () => {
      if (id) {
        const patentData = await fetchPatentById(id);
        setPatent(patentData);
        setNotes(patentData?.notes || '');
      }
    };

    loadPatent();
  }, [id]);

  if (!patent) {
    return <div>Loading...</div>;
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleEditNotes = () => {
    setIsEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    if (patent) {
      const success = await updatePatentNotes(patent.id, notes);
      if (success) {
        toast.success("Notes updated successfully!");
        setIsEditingNotes(false);
      } else {
        toast.error("Failed to update notes.");
      }
    }
  };

  const handleCancelEdit = () => {
    setNotes(patent?.notes || '');
    setIsEditingNotes(false);
  };

  return (
    <div className="container mx-auto mt-8">
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back to List
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{patent.patent_title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <Label className="w-48">Tracking ID:</Label>
              <span>{patent.tracking_id}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Patent Applicant:</Label>
              <span>{patent.patent_applicant}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Client ID:</Label>
              <span>{patent.client_id}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Application No:</Label>
              <span>{patent.application_no || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Date of Filing:</Label>
              <span>{patent.date_of_filing}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Applicant Address:</Label>
              <span>{patent.applicant_addr}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Inventor Phone No:</Label>
              <span>{patent.inventor_ph_no}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Inventor Email:</Label>
              <span>{patent.inventor_email}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center">
              <Label className="w-48">PS Drafting Status:</Label>
              <Badge variant="secondary">{patent.ps_drafting_status}</Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">PS Drafter Assigned:</Label>
              <span>{patent.ps_drafter_assgn || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">PS Drafter Deadline:</Label>
              <span>{patent.ps_drafter_deadline || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">PS Review Draft Status:</Label>
              <Badge variant="secondary">{patent.ps_review_draft_status}</Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">PS Filing Status:</Label>
              <Badge variant="secondary">{patent.ps_filing_status}</Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">PS Filer Assigned:</Label>
              <span>{patent.ps_filer_assgn || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">PS Filer Deadline:</Label>
              <span>{patent.ps_filer_deadline || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">PS Review File Status:</Label>
              <Badge variant="secondary">{patent.ps_review_file_status}</Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">PS Completion Status:</Label>
              <Badge variant="secondary">{patent.ps_completion_status}</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center">
              <Label className="w-48">CS Drafting Status:</Label>
              <Badge variant="secondary">{patent.cs_drafting_status}</Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">CS Drafter Assigned:</Label>
              <span>{patent.cs_drafter_assgn || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">CS Drafter Deadline:</Label>
              <span>{patent.cs_drafter_deadline || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">CS Review Draft Status:</Label>
              <Badge variant="secondary">{patent.cs_review_draft_status}</Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">CS Filing Status:</Label>
              <Badge variant="secondary">{patent.cs_filing_status}</Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">CS Filer Assigned:</Label>
              <span>{patent.cs_filer_assgn || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">CS Filer Deadline:</Label>
              <span>{patent.cs_filer_deadline || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Label className="w-48">CS Review File Status:</Label>
              <Badge variant="secondary">{patent.cs_review_file_status}</Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">CS Completion Status:</Label>
              <Badge variant="secondary">{patent.cs_completion_status}</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center">
              <Label className="w-48">Form 01:</Label>
              <Badge variant={patent.form_01 ? "success" : "outline"}>
                {patent.form_01 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 02 PS:</Label>
              <Badge variant={patent.form_02_ps ? "success" : "outline"}>
                {patent.form_02_ps ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 02 CS:</Label>
              <Badge variant={patent.form_02_cs ? "success" : "outline"}>
                {patent.form_02_cs ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 03:</Label>
              <Badge variant={patent.form_03 ? "success" : "outline"}>
                {patent.form_03 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 04:</Label>
              <Badge variant={patent.form_04 ? "success" : "outline"}>
                {patent.form_04 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 05:</Label>
              <Badge variant={patent.form_05 ? "success" : "outline"}>
                {patent.form_05 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 06:</Label>
              <Badge variant={patent.form_06 ? "success" : "outline"}>
                {patent.form_06 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 07:</Label>
              <Badge variant={patent.form_07 ? "success" : "outline"}>
                {patent.form_07 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 07A:</Label>
              <Badge variant={patent.form_07a ? "success" : "outline"}>
                {patent.form_07a ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 08:</Label>
              <Badge variant={patent.form_08 ? "success" : "outline"}>
                {patent.form_08 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 08A:</Label>
              <Badge variant={patent.form_08a ? "success" : "outline"}>
                {patent.form_08a ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 09:</Label>
              <Badge variant={patent.form_09 ? "success" : "outline"}>
                {patent.form_09 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 09A:</Label>
              <Badge variant={patent.form_09a ? "success" : "outline"}>
                {patent.form_09a ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 10:</Label>
              <Badge variant={patent.form_10 ? "success" : "outline"}>
                {patent.form_10 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 11:</Label>
              <Badge variant={patent.form_11 ? "success" : "outline"}>
                {patent.form_11 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 12:</Label>
              <Badge variant={patent.form_12 ? "success" : "outline"}>
                {patent.form_12 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 13:</Label>
              <Badge variant={patent.form_13 ? "success" : "outline"}>
                {patent.form_13 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 14:</Label>
              <Badge variant={patent.form_14 ? "success" : "outline"}>
                {patent.form_14 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 15:</Label>
              <Badge variant={patent.form_15 ? "success" : "outline"}>
                {patent.form_15 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 16:</Label>
              <Badge variant={patent.form_16 ? "success" : "outline"}>
                {patent.form_16 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 17:</Label>
              <Badge variant={patent.form_17 ? "success" : "outline"}>
                {patent.form_17 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 18:</Label>
              <Badge variant={patent.form_18 ? "success" : "outline"}>
                {patent.form_18 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 18A:</Label>
              <Badge variant={patent.form_18a ? "success" : "outline"}>
                {patent.form_18a ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 19:</Label>
              <Badge variant={patent.form_19 ? "success" : "outline"}>
                {patent.form_19 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 20:</Label>
              <Badge variant={patent.form_20 ? "success" : "outline"}>
                {patent.form_20 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 21:</Label>
              <Badge variant={patent.form_21 ? "success" : "outline"}>
                {patent.form_21 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 22:</Label>
              <Badge variant={patent.form_22 ? "success" : "outline"}>
                {patent.form_22 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 23:</Label>
              <Badge variant={patent.form_23 ? "success" : "outline"}>
                {patent.form_23 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 24:</Label>
              <Badge variant={patent.form_24 ? "success" : "outline"}>
                {patent.form_24 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 25:</Label>
              <Badge variant={patent.form_25 ? "success" : "outline"}>
                {patent.form_25 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 26:</Label>
              <Badge variant={patent.form_26 ? "success" : "outline"}>
                {patent.form_26 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 27:</Label>
              <Badge variant={patent.form_27 ? "success" : "outline"}>
                {patent.form_27 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 28:</Label>
              <Badge variant={patent.form_28 ? "success" : "outline"}>
                {patent.form_28 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 29:</Label>
              <Badge variant={patent.form_29 ? "success" : "outline"}>
                {patent.form_29 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
             <div className="flex items-center">
              <Label className="w-48">Form 30:</Label>
              <Badge variant={patent.form_30 ? "success" : "outline"}>
                {patent.form_30 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
            <div className="flex items-center">
              <Label className="w-48">Form 31:</Label>
              <Badge variant={patent.form_31 ? "success" : "outline"}>
                {patent.form_31 ? "Submitted" : "Not Submitted"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <Label>Inventors:</Label>
            {patent.inventors && patent.inventors.length > 0 ? (
              <ul className="list-disc pl-5">
                {patent.inventors.map((inventor) => (
                  <li key={inventor.id}>
                    {inventor.inventor_name} - {inventor.inventor_addr}
                  </li>
                ))}
              </ul>
            ) : (
              <span>No inventors listed.</span>
            )}
          </div>

          <Separator />

          <div>
            <Label>FER History:</Label>
            {patent.fer_history && patent.fer_history.length > 0 ? (
              <ul className="list-disc pl-5">
                {patent.fer_history.map((fer) => (
                  <li key={fer.id}>
                    Drafter: {fer.fer_drafter_assgn}, Deadline: {fer.fer_drafter_deadline}
                  </li>
                ))}
              </ul>
            ) : (
              <span>No FER history available.</span>
            )}
          </div>

          <Separator />

          <div>
            <Label>Notes:</Label>
            {isEditingNotes ? (
              <div className="grid gap-2">
                <Textarea
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Add notes about the patent"
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNotes}>Save Notes</Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <p>{notes || 'No notes available.'}</p>
                <Button variant="secondary" onClick={handleEditNotes}>
                  Edit Notes
                </Button>
              </div>
            )}
          </div>
          
          <Separator />
          
          {patent.id && <PatentTimeline patentId={patent.id} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatentDetails;
