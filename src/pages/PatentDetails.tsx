import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { fetchPatentById } from '@/lib/api';
import { Patent } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const PatentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patent, setPatent] = useState<Patent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState(false);
  const { user, role } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    const getPatent = async () => {
      if (id) {
        try {
          setLoading(true);
          const patentData = await fetchPatentById(id);
          if (patentData) {
            setPatent(patentData);
            setNotes(patentData.notes || '');
          } else {
            toast.error('Patent not found');
            navigate('/patents');
          }
        } catch (error) {
          console.error('Error loading patent data:', error);
          toast.error('Failed to load patent data');
        } finally {
          setLoading(false);
        }
      }
    };

    getPatent();
  }, [id, navigate]);

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleEditNotes = () => {
    setEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    if (!patent) return;

    try {
      setLoading(true);
      // const success = await updatePatent(id, { ...patent, notes: notes });
      const success = await fetch(`/api/patents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...patent, notes: notes }),
      });
      if (success) {
        toast.success('Notes updated successfully');
        setEditingNotes(false);
        setPatent({ ...patent, notes: notes });
      } else {
        toast.error('Failed to update notes');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditNotes = () => {
    setNotes(patent?.notes || '');
    setEditingNotes(false);
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
    return <div className="text-center">Patent not found</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            ←
          </Button>
          <h1 className="text-2xl font-bold">{patent.patent_title}</h1>
        </div>
        {role === 'admin' && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/patents/edit/${id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Patent Information</CardTitle>
          <CardDescription>Details about the patent application</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Tracking ID</div>
              <div className="mt-1 flex items-center gap-2">
                <Input className="max-w-xs" readOnly value={patent.tracking_id} />
                <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(patent.tracking_id, 'Tracking ID')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Patent Applicant</div>
              <div className="mt-1 flex items-center gap-2">
                <Input className="max-w-xs" readOnly value={patent.patent_applicant} />
                <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(patent.patent_applicant, 'Patent Applicant')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Client ID</div>
              <div className="mt-1 flex items-center gap-2">
                <Input className="max-w-xs" readOnly value={patent.client_id} />
                <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(patent.client_id, 'Client ID')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Application No.</div>
              <div className="mt-1 flex items-center gap-2">
                <Input className="max-w-xs" readOnly value={patent.application_no || 'N/A'} />
                <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(patent.application_no || 'N/A', 'Application No.')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Date of Filing</div>
              <div className="mt-1 flex items-center gap-2">
                <Input className="max-w-xs" readOnly value={patent.date_of_filing ? new Date(patent.date_of_filing).toLocaleDateString() : 'N/A'} />
                <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(patent.date_of_filing ? new Date(patent.date_of_filing).toLocaleDateString() : 'N/A', 'Date of Filing')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Inventor Phone</div>
              <div className="mt-1 flex items-center gap-2">
                <Input className="max-w-xs" readOnly value={patent.inventor_ph_no} />
                <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(patent.inventor_ph_no, 'Inventor Phone')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Inventor Email</div>
              <div className="mt-1 flex items-center gap-2">
                <Input className="max-w-xs" readOnly value={patent.inventor_email} />
                <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(patent.inventor_email, 'Inventor Email')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium">Applicant Address</div>
            <div className="mt-1 flex items-center gap-2">
              <Textarea className="max-w-3xl" readOnly value={patent.applicant_addr} />
              <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(patent.applicant_addr, 'Applicant Address')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
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
                {patent.inventors.map((inventor) => (
                  <TableRow key={inventor.id}>
                    <TableCell>{inventor.inventor_name}</TableCell>
                    <TableCell>{inventor.inventor_addr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground">No inventors associated with this patent.</div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Provisional Specification</CardTitle>
          <CardDescription>Details about the provisional specification process</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">PS Drafter Assigned</div>
              <div className="mt-1">
                <Input readOnly value={patent.ps_drafter_assgn || 'N/A'} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">PS Drafter Deadline</div>
              <div className="mt-1">
                <Input readOnly value={patent.ps_drafter_deadline ? new Date(patent.ps_drafter_deadline).toLocaleDateString() : 'N/A'} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">PS Filer Assigned</div>
              <div className="mt-1">
                <Input readOnly value={patent.ps_filer_assgn || 'N/A'} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">PS Filer Deadline</div>
              <div className="mt-1">
                <Input readOnly value={patent.ps_filer_deadline ? new Date(patent.ps_filer_deadline).toLocaleDateString() : 'N/A'} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium">PS Drafting Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.ps_drafting_status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">PS Review Draft Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.ps_review_draft_status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">PS Filing Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.ps_filing_status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">PS Review File Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.ps_review_file_status}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Complete Specification</CardTitle>
          <CardDescription>Details about the complete specification process</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">CS Drafter Assigned</div>
              <div className="mt-1">
                <Input readOnly value={patent.cs_drafter_assgn || 'N/A'} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">CS Drafter Deadline</div>
              <div className="mt-1">
                <Input readOnly value={patent.cs_drafter_deadline ? new Date(patent.cs_drafter_deadline).toLocaleDateString() : 'N/A'} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">CS Filer Assigned</div>
              <div className="mt-1">
                <Input readOnly value={patent.cs_filer_assgn || 'N/A'} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">CS Filer Deadline</div>
              <div className="mt-1">
                <Input readOnly value={patent.cs_filer_deadline ? new Date(patent.cs_filer_deadline).toLocaleDateString() : 'N/A'} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium">CS Drafting Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.cs_drafting_status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">CS Review Draft Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.cs_review_draft_status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">CS Filing Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.cs_filing_status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">CS Review File Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.cs_review_file_status}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>First Examination Report (FER)</CardTitle>
          <CardDescription>Details about the FER process</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">FER Drafter Assigned</div>
              <div className="mt-1">
                <Input readOnly value={patent.fer_drafter_assgn || 'N/A'} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">FER Drafter Deadline</div>
              <div className="mt-1">
                <Input readOnly value={patent.fer_drafter_deadline ? new Date(patent.fer_drafter_deadline).toLocaleDateString() : 'N/A'} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">FER Filer Assigned</div>
              <div className="mt-1">
                <Input readOnly value={patent.fer_filer_assgn || 'N/A'} />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">FER Filer Deadline</div>
              <div className="mt-1">
                <Input readOnly value={patent.fer_filer_deadline ? new Date(patent.fer_filer_deadline).toLocaleDateString() : 'N/A'} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium">FER Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.fer_status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">FER Drafter Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.fer_drafter_status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">FER Review Draft Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.fer_review_draft_status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">FER Filing Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.fer_filing_status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">FER Review File Status</div>
              <div className="mt-1">
                <Badge variant="secondary">{patent.fer_review_file_status}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form status section */}
      {(role === 'admin' || role === 'filer') && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Form Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Form 01 */}
            <div className="flex flex-col items-center p-3 bg-white rounded-lg border text-center">
              <span className="text-sm font-medium">Form 01</span>
              <span className={`mt-2 h-3 w-3 rounded-full ${patent.form_01 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
            
            {/* Form 02 - Provisional */}
            <div className="flex flex-col items-center p-3 bg-white rounded-lg border text-center">
              <span className="text-sm font-medium">Form 02 - PS</span>
              <span className={`mt-2 h-3 w-3 rounded-full ${patent.form_02_ps ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
            
            {/* Form 02 - Complete */}
            <div className="flex flex-col items-center p-3 bg-white rounded-lg border text-center">
              <span className="text-sm font-medium">Form 02 - CS</span>
              <span className={`mt-2 h-3 w-3 rounded-full ${patent.form_02_cs ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
            
            {/* Form 03 */}
            <div className="flex flex-col items-center p-3 bg-white rounded-lg border text-center">
              <span className="text-sm font-medium">Form 03</span>
              <span className={`mt-2 h-3 w-3 rounded-full ${patent.form_03 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
            
            {/* Form 13 */}
            <div className="flex flex-col items-center p-3 bg-white rounded-lg border text-center">
              <span className="text-sm font-medium">Form 13</span>
              <span className={`mt-2 h-3 w-3 rounded-full ${patent.form_13 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
            
            {/* Form 18 */}
            <div className="flex flex-col items-center p-3 bg-white rounded-lg border text-center">
              <span className="text-sm font-medium">Form 18</span>
              <span className={`mt-2 h-3 w-3 rounded-full ${patent.form_18 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
            
            {/* Form 18A */}
            <div className="flex flex-col items-center p-3 bg-white rounded-lg border text-center">
              <span className="text-sm font-medium">Form 18A</span>
              <span className={`mt-2 h-3 w-3 rounded-full ${patent.form_18a ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
            
            {/* Form 26 */}
            <div className="flex flex-col items-center p-3 bg-white rounded-lg border text-center">
              <span className="text-sm font-medium">Form 26</span>
              <span className={`mt-2 h-3 w-3 rounded-full ${patent.form_26 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
          </div>
          
          {patent.other_forms && (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Other Forms / Notes:</h4>
              <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{patent.other_forms}</p>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Additional notes and information about the patent</CardDescription>
        </CardHeader>
        <CardContent>
          {editingNotes ? (
            <div className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes here..."
                className="w-full"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={handleCancelEditNotes} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNotes} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p>{patent.notes || 'No notes available.'}</p>
              {(role === 'admin' || role === 'drafter') && (
                <Button variant="outline" size="sm" onClick={handleEditNotes}>
                  Edit Notes
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatentDetails;
