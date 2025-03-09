import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchPatentById, fetchPatentTimeline, createFEREntry } from '@/lib/api';
import { 
  Patent, 
  FEREntry, 
  handlePatentResponse, 
  handleTimelineResponse,
  handleFERResponse,
  safelyUpdatePatentWithFER
} from '@/lib/types';
import PaymentStatusSection from '@/components/PaymentStatusSection';
import Timeline from '@/components/Timeline';
import { Loader2 } from 'lucide-react';

const PatentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patent, setPatent] = useState<Patent | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingFER, setIsAddingFER] = useState(false);
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const fetchPatentData = async () => {
      try {
        setLoading(true);
        const response = await fetchPatentById(id);
        const patentData = handlePatentResponse(response);
      
        if (!patentData) {
          toast.error('Patent not found');
          navigate('/patents');
          return;
        }
      
        setPatent(patentData);
      
        // Fetch timeline data
        const timelineResponse = await fetchPatentTimeline(id);
        const timelineEvents = handleTimelineResponse(timelineResponse);
        setTimeline(timelineEvents);
      
      } catch (error) {
        console.error('Error fetching patent data:', error);
        toast.error('Failed to load patent details');
        navigate('/patents');
      } finally {
        setLoading(false);
      }
    };

    fetchPatentData();
  }, [id, navigate]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };
  
  const refreshPatentData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetchPatentById(id);
      const patentData = handlePatentResponse(response);
      
      if (patentData) {
        setPatent(patentData);
      } else {
        toast.error('Failed to refresh patent data');
      }
    } catch (error) {
      console.error('Error refreshing patent data:', error);
      toast.error('Failed to refresh patent data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFER = async () => {
    if (!patent || !patent.id) return;
  
    try {
      setIsAddingFER(true);
      const nextFERNumber = patent.fer_entries && patent.fer_entries.length > 0 
        ? Math.max(...patent.fer_entries.map(fer => fer.fer_number)) + 1 
        : 1;
    
      const ferResponse = await createFEREntry(patent.id, nextFERNumber);
      const newFER = handleFERResponse(ferResponse);
    
      if (newFER) {
        // Update patent with new FER entry
        setPatent(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            fer_entries: [...(prev.fer_entries || []), newFER]
          };
        });
      
        toast.success('New FER created successfully');
        refreshPatentData();
      }
    } catch (error) {
      console.error('Error adding FER:', error);
      toast.error('Failed to add FER');
    } finally {
      setIsAddingFER(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!patent) {
    return <div>Patent not found</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Back to Patents
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patent Details Card */}
        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-lg font-semibold text-gray-800">{patent.patent_title}</CardTitle>
            <CardDescription className="text-sm text-gray-500">Tracking ID: {patent.tracking_id}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-semibold text-gray-700">Applicant Information</h3>
                <p className="text-gray-600">Applicant: {patent.patent_applicant}</p>
                <p className="text-gray-600">Address: {patent.applicant_addr}</p>
                <p className="text-gray-600">Client ID: {patent.client_id}</p>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-700">Inventor Information</h3>
                <p className="text-gray-600">Phone: {patent.inventor_ph_no}</p>
                <p className="text-gray-600">Email: {patent.inventor_email}</p>
                {patent.inventors && patent.inventors.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold text-gray-700">Inventors:</h4>
                    <ul className="list-disc pl-5">
                      {patent.inventors.map((inventor) => (
                        <li key={inventor.id} className="text-gray-600">
                          {inventor.inventor_name} - {inventor.inventor_addr}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-700">Application Details</h3>
                <p className="text-gray-600">Application No: {patent.application_no || 'N/A'}</p>
                <p className="text-gray-600">Date of Filing: {formatDate(patent.date_of_filing)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-lg font-semibold text-gray-800">Timeline</CardTitle>
            <CardDescription className="text-sm text-gray-500">Key events and milestones</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Timeline timelineEvents={timeline} />
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FER Entries Table */}
        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">FER Entries</CardTitle>
              <CardDescription className="text-sm text-gray-500">First Examination Reports</CardDescription>
            </div>
            <Button size="sm" onClick={handleAddFER} disabled={isAddingFER}>
              {isAddingFER && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add FER Entry
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {patent.fer_entries && patent.fer_entries.length > 0 ? (
              <ScrollArea className="rounded-md border w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">FER #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Drafter</TableHead>
                      <TableHead>Filer</TableHead>
                      <TableHead>Draft Status</TableHead>
                      <TableHead>File Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patent.fer_entries.map((fer) => (
                      <TableRow key={fer.id}>
                        <TableCell>
                          <Badge variant="outline">{fer.fer_number}</Badge>
                        </TableCell>
                        <TableCell>{fer.fer_date ? format(new Date(fer.fer_date), 'MMM dd, yyyy') : 'Not set'}</TableCell>
                        <TableCell>{fer.fer_drafter_assgn || 'Not assigned'}</TableCell>
                        <TableCell>{fer.fer_filer_assgn || 'Not assigned'}</TableCell>
                        <TableCell>
                          {fer.fer_drafter_status ? (
                            <Badge className="bg-green-500">Completed</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {fer.fer_filing_status ? (
                            <Badge className="bg-green-500">Completed</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center text-gray-500 py-4">No FER entries found.</div>
            )}
          </CardContent>
        </Card>
        
        {/* Payment Status Section */}
        <PaymentStatusSection 
          patent={patent} 
          refreshPatentData={refreshPatentData}
          isAdmin={user?.role === 'admin'}
          userRole={user?.role}
        />
      </div>
    </div>
  );
};

export default PatentDetails;
