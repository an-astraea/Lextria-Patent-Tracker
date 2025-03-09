
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Patent } from '@/lib/types';
import { Save } from 'lucide-react';

interface FormSelectionProps {
  patent: Patent;
  onSaveForms: (forms: Record<string, boolean>) => Promise<void>;
  isLoading?: boolean;
}

const FormSelection: React.FC<FormSelectionProps> = ({ patent, onSaveForms, isLoading = false }) => {
  // Create a local state to track form selections
  const [selectedForms, setSelectedForms] = React.useState<Record<string, boolean>>({
    form_01: patent.form_01 || false,
    form_02_ps: patent.form_02_ps || false,
    form_02_cs: patent.form_02_cs || false,
    form_03: patent.form_03 || false,
    form_04: patent.form_04 || false,
    form_05: patent.form_05 || false,
    form_06: patent.form_06 || false,
    form_07: patent.form_07 || false,
    form_07a: patent.form_07a || false,
    form_08: patent.form_08 || false,
    form_08a: patent.form_08a || false,
    form_09: patent.form_09 || false,
    form_09a: patent.form_09a || false,
    form_10: patent.form_10 || false,
    form_11: patent.form_11 || false,
    form_12: patent.form_12 || false,
    form_13: patent.form_13 || false,
    form_14: patent.form_14 || false,
    form_15: patent.form_15 || false,
    form_16: patent.form_16 || false,
    form_17: patent.form_17 || false,
    form_18: patent.form_18 || false,
    form_18a: patent.form_18a || false,
    form_19: patent.form_19 || false,
    form_20: patent.form_20 || false,
    form_21: patent.form_21 || false,
    form_22: patent.form_22 || false,
    form_23: patent.form_23 || false,
    form_24: patent.form_24 || false,
    form_25: patent.form_25 || false,
    form_26: patent.form_26 || false,
    form_27: patent.form_27 || false,
    form_28: patent.form_28 || false,
    form_29: patent.form_29 || false,
    form_30: patent.form_30 || false,
    form_31: patent.form_31 || false,
  });

  // Handle form checkbox change
  const handleFormChange = (formName: string, checked: boolean) => {
    setSelectedForms(prev => ({
      ...prev,
      [formName]: checked
    }));
  };

  // Handle save button click
  const handleSave = () => {
    onSaveForms(selectedForms);
  };

  // Group forms for better organization
  const formGroups = [
    { title: "Common Forms", forms: ["form_01", "form_02_ps", "form_02_cs", "form_03", "form_04", "form_05"] },
    { title: "Request Forms", forms: ["form_06", "form_07", "form_07a", "form_08", "form_08a", "form_09", "form_09a", "form_10"] },
    { title: "Additional Forms", forms: ["form_11", "form_12", "form_13", "form_14", "form_15", "form_16", "form_17", "form_18", "form_18a"] },
    { title: "Special Forms", forms: ["form_19", "form_20", "form_21", "form_22", "form_23", "form_24", "form_25", "form_26", "form_27", "form_28", "form_29", "form_30", "form_31"] },
  ];

  // Format form name for display
  const formatFormName = (formName: string) => {
    return formName.replace("_", " ").replace("form", "Form").replace("ps", "(PS)").replace("cs", "(CS)");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Forms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {formGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-sm font-medium">{group.title}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {group.forms.map((formName) => (
                  <div key={formName} className="flex items-center space-x-2">
                    <Checkbox
                      id={formName}
                      checked={selectedForms[formName] || false}
                      onCheckedChange={(checked) => handleFormChange(formName, checked === true)}
                    />
                    <Label htmlFor={formName} className="text-sm">
                      {formatFormName(formName)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={handleSave} 
          className="mt-6 w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="animate-spin mr-2">⟳</span>
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Selected Forms
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormSelection;
