
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  fetchPatentById,
  createPatent,
  updatePatent,
} from '@/lib/api';
import { Patent, PatentFormData } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import PatentForm from '@/components/patent/PatientForm';
import LoadingState from '@/components/common/LoadingState';

const AddEditPatent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
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
      if (response) {
        setPatent(response);
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

  const handleSavePatent = async (formData: PatentFormData) => {
    setIsSaving(true);
    try {
      if (id) {
        // Update existing patent
        const response = await updatePatent(id, formData);
        if (response.success) {
          toast.success('Patent updated successfully');
          navigate('/patents');
        } else {
          toast.error(response.message || 'Failed to update patent');
        }
      } else {
        // Create new patent
        const response = await createPatent(formData);
        if (response.success) {
          toast.success('Patent created successfully');
          navigate('/patents');
        } else {
          toast.error(response.message || 'Failed to create patent');
        }
      }
    } catch (error) {
      console.error('Error saving patent:', error);
      toast.error('An error occurred while saving the patent');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <LoadingState text="Loading Patent Data..." className="min-h-[50vh]" />
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
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="pr-4 pb-8">
          {id && !patent ? (
            <Card>
              <CardHeader>
                <CardTitle>Patent Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p>The patent you're looking for could not be found.</p>
              </CardContent>
            </Card>
          ) : (
            <PatentForm
              initialData={patent as PatentFormData}
              onSubmit={handleSavePatent}
              isEditMode={!!id}
              isLoading={isSaving}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AddEditPatent;
