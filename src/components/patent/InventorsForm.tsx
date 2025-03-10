
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface InventorFormProps {
  inventors: { inventor_name: string; inventor_addr: string }[];
  onInventorChange: (index: number, field: string, value: string) => void;
  onAddInventor: () => void;
  onRemoveInventor: (index: number) => void;
  formErrors: Record<string, string>;
}

const InventorsForm: React.FC<InventorFormProps> = ({
  inventors,
  onInventorChange,
  onAddInventor,
  onRemoveInventor,
  formErrors
}) => {
  return (
    <div>
      {inventors.map((inventor, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor={`inventor_name_${index}`}>Inventor Name</Label>
            <Input
              type="text"
              id={`inventor_name_${index}`}
              name={`inventor_name_${index}`}
              value={inventor.inventor_name}
              onChange={(e) => onInventorChange(index, 'inventor_name', e.target.value)}
              placeholder="Enter inventor name"
            />
          </div>
          <div>
            <Label htmlFor={`inventor_addr_${index}`}>Inventor Address</Label>
            <Input
              type="text"
              id={`inventor_addr_${index}`}
              name={`inventor_addr_${index}`}
              value={inventor.inventor_addr}
              onChange={(e) => onInventorChange(index, 'inventor_addr', e.target.value)}
              placeholder="Enter inventor address"
            />
          </div>
          {inventors.length > 1 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveInventor(index)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAddInventor}>
        <Plus className="h-4 w-4 mr-2" />
        Add Inventor
      </Button>
      {formErrors.inventors && <p className="text-red-500 text-sm mt-1">{formErrors.inventors}</p>}
    </div>
  );
};

export default InventorsForm;
