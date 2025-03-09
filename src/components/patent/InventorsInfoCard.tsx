
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Inventor } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventorsInfoCardProps {
  inventors: Inventor[];
}

const InventorsInfoCard: React.FC<InventorsInfoCardProps> = ({ inventors }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventors</CardTitle>
        <CardDescription>List of inventors associated with this patent</CardDescription>
      </CardHeader>
      <CardContent>
        {inventors && inventors.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventors.map(inventor => (
                <TableRow key={inventor.id}>
                  <TableCell>{inventor.inventor_name}</TableCell>
                  <TableCell>{inventor.inventor_addr}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-gray-500">No inventors found for this patent.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventorsInfoCard;
