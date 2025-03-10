
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/date-picker';
import { Plus, Trash2, Save, Pencil, X, Check } from 'lucide-react';
import { FEREntry } from '@/lib/types';
import { createFEREntry, deleteFEREntry, updateFEREntry, fetchEmployees } from '@/lib/api';
import { toast } from 'sonner';
import FEREmptyState from './FEREmptyState';
import FERDeleteDialog from './FERDeleteDialog';
import FEREditDialog from './FEREditDialog';

interface FERFormData {
  fer_drafter_assgn: string;
  fer_drafter_deadline: string;
  fer_filer_assgn: string;
  fer_filer_deadline: string;
}

interface FEREntryFormProps {
  patentId?: string;
  ferEntries: FEREntry[];
  nextFerNumber: number;
  refreshPatentData: () => void;
}

const FEREntryForm: React.FC<FEREntryFormProps> = ({
  patentId,
  ferEntries,
  nextFerNumber,
  refreshPatentData
}) => {
  const [employees, setEmployees] = useState<{ id: string; full_name: string; role: string }[]>([]);
  const [formData, setFormData] = useState<FERFormData>({
    fer_drafter_assgn: '',
    fer_drafter_deadline: '',
    fer_filer_assgn: '',
    fer_filer_deadline: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ferToDelete, setFerToDelete] = useState<FEREntry | null>(null);
  const [ferToEdit, setFerToEdit] = useState<FEREntry | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeesData = await fetchEmployees();
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error loading employees:', error);
      }
    };
    
    loadEmployees();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [name]: date ? date.toISOString().split('T')[0] : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patentId) {
      toast.error('Cannot add FER entry: Patent ID is missing');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const newFER = await createFEREntry(patentId, nextFerNumber);
      
      if (newFER && newFER.id) {
        // Update the newly created FER with the form data
        const updates = {
          ...formData
        };
        
        await updateFEREntry(newFER.id, updates);
        
        // Reset form and refresh
        setFormData({
          fer_drafter_assgn: '',
          fer_drafter_deadline: '',
          fer_filer_assgn: '',
          fer_filer_deadline: ''
        });
        setShowForm(false);
        refreshPatentData();
        toast.success('FER entry created successfully');
      } else {
        toast.error('Failed to create FER entry');
      }
    } catch (error) {
      console.error('Error adding FER entry:', error);
      toast.error('Error adding FER entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (fer: FEREntry) => {
    setFerToDelete(fer);
  };

  const handleEdit = (fer: FEREntry) => {
    setFerToEdit(fer);
  };

  const confirmDelete = async () => {
    if (!ferToDelete || !ferToDelete.id) return;
    
    try {
      const success = await deleteFEREntry(ferToDelete.id);
      
      if (success) {
        refreshPatentData();
        toast.success('FER entry deleted');
      } else {
        toast.error('Failed to delete FER entry');
      }
    } catch (error) {
      console.error('Error deleting FER entry:', error);
      toast.error('Error deleting FER entry');
    } finally {
      setFerToDelete(null);
    }
  };

  const cancelDelete = () => {
    setFerToDelete(null);
  };

  // If no patent ID is provided, don't allow FER management
  if (!patentId) {
    return (
      <div className="text-gray-500 italic text-sm mt-2">
        Save the patent first to manage FER entries
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* FER entries list */}
      {ferEntries.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 mt-2">
          {ferEntries.map((fer) => (
            <Card key={fer.id} className="border border-gray-200">
              <CardContent className="pt-4 pb-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">FER #{fer.fer_number}</h3>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(fer)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(fer)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Drafter:</span> {fer.fer_drafter_assgn || 'None assigned'}
                  </div>
                  <div>
                    <span className="font-medium">Deadline:</span> {fer.fer_drafter_deadline || 'Not set'}
                  </div>
                  <div>
                    <span className="font-medium">Filer:</span> {fer.fer_filer_assgn || 'None assigned'}
                  </div>
                  <div>
                    <span className="font-medium">Deadline:</span> {fer.fer_filer_deadline || 'Not set'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="font-medium">Drafting:</span>{' '}
                    {fer.fer_drafter_status === 1 ? (
                      <span className="text-green-500">Completed</span>
                    ) : (
                      <span className="text-gray-500">Pending</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Filing:</span>{' '}
                    {fer.fer_filing_status === 1 ? (
                      <span className="text-green-500">Completed</span>
                    ) : (
                      <span className="text-gray-500">Pending</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <FEREmptyState />
      )}

      {/* Add FER button or form */}
      {!showForm ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowForm(true)}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add FER Entry
        </Button>
      ) : (
        <Card className="border border-gray-200 mt-4">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">New FER #{nextFerNumber}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fer_drafter_assgn">Drafter</Label>
                  <Select
                    value={formData.fer_drafter_assgn || "none"}
                    onValueChange={(value) => handleInputChange('fer_drafter_assgn', value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select drafter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {employees
                        .filter(emp => emp.role === 'drafter' || emp.role === 'admin')
                        .map(emp => (
                          <SelectItem key={emp.id} value={emp.full_name}>
                            {emp.full_name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fer_drafter_deadline">Drafter Deadline</Label>
                  <DatePicker
                    id="fer_drafter_deadline"
                    date={formData.fer_drafter_deadline ? new Date(formData.fer_drafter_deadline) : undefined}
                    onSelect={(date) => handleDateChange('fer_drafter_deadline', date)}
                  />
                </div>
                <div>
                  <Label htmlFor="fer_filer_assgn">Filer</Label>
                  <Select
                    value={formData.fer_filer_assgn || "none"}
                    onValueChange={(value) => handleInputChange('fer_filer_assgn', value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select filer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {employees
                        .filter(emp => emp.role === 'filer' || emp.role === 'admin')
                        .map(emp => (
                          <SelectItem key={emp.id} value={emp.full_name}>
                            {emp.full_name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fer_filer_deadline">Filer Deadline</Label>
                  <DatePicker
                    id="fer_filer_deadline"
                    date={formData.fer_filer_deadline ? new Date(formData.fer_filer_deadline) : undefined}
                    onSelect={(date) => handleDateChange('fer_filer_deadline', date)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="mt-2">
                {isLoading ? (
                  <span>Adding...</span>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save FER Entry
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <FERDeleteDialog
        open={!!ferToDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        ferNumber={ferToDelete?.fer_number || 0}
      />

      {/* Edit dialog */}
      {ferToEdit && (
        <FEREditDialog
          open={!!ferToEdit}
          onClose={() => setFerToEdit(null)}
          fer={ferToEdit}
          employees={employees}
          onSave={() => {
            setFerToEdit(null);
            refreshPatentData();
          }}
        />
      )}
    </div>
  );
};

export default FEREntryForm;
