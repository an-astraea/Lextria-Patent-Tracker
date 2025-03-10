
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { FEREntry } from '@/lib/types';
import { createFEREntry } from '@/lib/api';
import { toast } from 'sonner';

interface FEREntryFormProps {
  patentId?: string;
  ferEntries: FEREntry[];
  nextFerNumber: number;
  refreshPatentData: () => Promise<void>;
}

const FEREntryForm: React.FC<FEREntryFormProps> = ({
  patentId,
  ferEntries,
  nextFerNumber,
  refreshPatentData
}) => {
  const [adding, setAdding] = useState(false);

  const addFER = async () => {
    if (!patentId) return;
    
    try {
      setAdding(true);
      // Only pass the patentId and nextFerNumber to createFEREntry
      const result = await createFEREntry(patentId, nextFerNumber);
      
      if (result) {
        toast.success('FER entry added successfully');
        await refreshPatentData();
      } else {
        toast.error('Failed to add FER entry');
      }
    } catch (error) {
      console.error('Error adding FER entry:', error);
      toast.error('Error adding FER entry');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Button type="button" variant="outline" size="sm" onClick={addFER} disabled={adding}>
          {adding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add FER Entry
            </>
          )}
        </Button>
      </div>

      {ferEntries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FER Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Drafter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filer
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ferEntries.map((fer) => (
                <tr key={fer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {fer.fer_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {fer.fer_drafter_assgn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {fer.fer_filer_assgn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No FER entries yet.</p>
      )}
    </div>
  );
};

export default FEREntryForm;
