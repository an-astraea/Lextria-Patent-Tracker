
import React, { useState, useEffect } from 'react';
import { fetchPatents } from '@/lib/api';
import { Patent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import PatentCard from '@/components/PatentCard';

const ClientDashboard = () => {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadPatents = async () => {
      try {
        setLoading(true);
        const response = await fetchPatents();
        
        if (response.error) {
          toast.error('Failed to load patents');
          setPatents([]);
        } else {
          setPatents(response.patents);
        }
      } catch (error) {
        console.error('Error loading patents:', error);
        toast.error('An error occurred while loading patents');
        setPatents([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatents();
  }, []);

  // Filter patents based on search term and status filter
  const filteredPatents = patents.filter(patent => {
    const matchesSearch = 
      patent.tracking_id?.toLowerCase().includes(search.toLowerCase()) ||
      patent.patent_title?.toLowerCase().includes(search.toLowerCase()) ||
      patent.patent_applicant?.toLowerCase().includes(search.toLowerCase()) ||
      patent.client_id?.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'completed') return matchesSearch && patent.cs_completion_status === 1;
    if (statusFilter === 'pending') return matchesSearch && patent.cs_completion_status !== 1;
    if (statusFilter === 'ps_completed') return matchesSearch && patent.ps_completion_status === 1;
    if (statusFilter === 'cs_completed') return matchesSearch && patent.cs_completion_status === 1;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Client Dashboard" 
        description="Overview of all client patents and their statuses"
        icon="Building"
      />

      <Card>
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
          <CardDescription>Find patents by tracking ID, title, applicant or client ID</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="Search patents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patents</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ps_completed">PS Completed</SelectItem>
                  <SelectItem value="cs_completed">CS Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingState message="Loading client patents..." />
      ) : filteredPatents.length === 0 ? (
        <EmptyState 
          title="No patents found" 
          description={search ? "Try adjusting your search query" : "No patents have been added yet"} 
          icon="FileText"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPatents.map(patent => (
            <PatentCard 
              key={patent.id} 
              patent={patent}
              showClientInfo
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
