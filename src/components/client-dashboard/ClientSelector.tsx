
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientSelectorProps {
  clients: string[];
  selectedClient: string;
  onClientChange: (clientId: string) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ 
  clients, 
  selectedClient, 
  onClientChange 
}) => {
  return (
    <div className="w-full md:w-1/3">
      <Select value={selectedClient} onValueChange={onClientChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map(client => (
            <SelectItem key={client} value={client}>
              {client}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientSelector;
