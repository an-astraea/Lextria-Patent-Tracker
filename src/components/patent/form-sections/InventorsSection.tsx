
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';

interface InventorsSectionProps {
  inventors: { inventor_name: string; inventor_addr: string }[];
  onChange: (inventors: { inventor_name: string; inventor_addr: string }[]) => void;
}

const InventorsSection: React.FC<InventorsSectionProps> = ({ inventors, onChange }) => {
  const handleInventorChange = (index: number, field: string, value: string) => {
    const updatedInventors = [...inventors];
    updatedInventors[index] = { 
      ...updatedInventors[index], 
      [field]: value 
    };
    onChange(updatedInventors);
  };

  const addInventor = () => {
    onChange([...inventors, { inventor_name: '', inventor_addr: '' }]);
  };

  const removeInventor = (index: number) => {
    if (inventors.length > 1) {
      const updatedInventors = [...inventors];
      updatedInventors.splice(index, 1);
      onChange(updatedInventors);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventors</CardTitle>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addInventor}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Add Inventor
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {inventors.map((inventor, index) => (
          <div key={index} className="grid grid-cols-1 gap-4 p-4 border rounded-md relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Inventor Name {index === 0 && '*'}
                </label>
                <Input
                  value={inventor.inventor_name}
                  onChange={(e) => handleInventorChange(index, 'inventor_name', e.target.value)}
                  placeholder="Enter inventor name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Inventor Address
                </label>
                <Input
                  value={inventor.inventor_addr}
                  onChange={(e) => handleInventorChange(index, 'inventor_addr', e.target.value)}
                  placeholder="Enter inventor address"
                />
              </div>
            </div>
            {inventors.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeInventor(index)}
                className="absolute top-2 right-2"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InventorsSection;
