
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  fetchPatentById,
  updatePatent,
  createInventor,
  updatePatentNotes,
  fetchPatentTimeline,
  updatePatentForms,
} from '@/lib/api';
import { Patent, PatentFormData, InventorInfo } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const AddEditPatent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [patent, setPatent] = useState<Patent | null>(null);

  useEffect(() => {
    if (id) {
      loadPatent(id);
    }
  }, [id]);

  const loadPatent = async (patentId: string) => {
    setIsLoading(true);
    try {
      const response = await fetchPatentById(patentId);
      if (response.success && response.patent) {
        setPatent(response.patent);
      } else {
        toast.error('Failed to load patent details');
      }
    } catch (error) {
      console.error('Error loading patent:', error);
      toast.error('An error occurred while loading patent details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Patent Data...</h2>
          <p>Please wait while we fetch the patent information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{id ? 'Edit Patent' : 'Add New Patent'}</h1>
        <Button variant="outline" onClick={() => navigate('/patents')}>
          Back to Patents
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Patent Details' : 'New Patent Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Patent form will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEditPatent;
