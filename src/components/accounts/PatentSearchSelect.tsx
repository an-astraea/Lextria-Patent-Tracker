
import React, { useState } from 'react';
import { Patent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PatentSearchSelectProps {
  patents: Patent[];
  selectedPatentId: string;
  onSelectPatent: (patentId: string) => void;
}

const PatentSearchSelect: React.FC<PatentSearchSelectProps> = ({
  patents = [],
  selectedPatentId,
  onSelectPatent,
}) => {
  const [open, setOpen] = useState(false);

  const selectedPatent = patents.find(p => p.id === selectedPatentId);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Search and Select Patent</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedPatent ? (
              <span className="flex items-center gap-2">
                <span className="font-medium">{selectedPatent.tracking_id}</span>
                <span className="text-gray-500">-</span>
                <span className="truncate">{selectedPatent.patent_title}</span>
              </span>
            ) : (
              "Select patent..."
            )}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search by tracking ID, title, or client..." 
            />
            <CommandList>
              <CommandEmpty>No patent found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {patents.map((patent) => (
                  <CommandItem
                    key={patent.id}
                    value={`${patent.tracking_id} ${patent.patent_title} ${patent.client_id}`}
                    onSelect={() => {
                      onSelectPatent(patent.id);
                      setOpen(false);
                    }}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium text-blue-600">{patent.tracking_id}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{patent.client_id}</span>
                    </div>
                    <div className="text-sm text-gray-700 truncate w-full mt-1">
                      {patent.patent_title}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PatentSearchSelect;
