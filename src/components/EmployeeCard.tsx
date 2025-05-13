
import React from 'react';
import { Employee } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone,
  Shield,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface EmployeeCardProps {
  employee: Employee;
  onDelete: (id: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onDelete }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'drafter':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'filer':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border border-border">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{employee.full_name}</h3>
            <div className="text-sm text-muted-foreground mt-1">ID: {employee.emp_id}</div>
          </div>
          <Badge 
            variant="outline" 
            className={`capitalize ${getRoleBadgeColor(employee.role)}`}
          >
            {employee.role}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{employee.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{employee.ph_no}</span>
          </div>
        </div>
      </div>
      
      <CardFooter className="flex justify-end bg-muted/30 p-4 border-t gap-2">
        {/* Added View button */}
        <Link to={`/employees/view/${employee.id}`}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
            <span className="ml-1">View</span>
          </Button>
        </Link>
        
        <Link to={`/employees/edit/${employee.id}`}>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
            <span className="ml-1">Edit</span>
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(employee.id)}
          className="hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="ml-1">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmployeeCard;
