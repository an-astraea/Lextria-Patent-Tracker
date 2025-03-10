
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { useFilingsData } from '@/hooks/useFilingsData';
import PendingFilingsList from '@/components/filings/PendingFilingsList';
import FERFilingsList from '@/components/filings/FERFilingsList';
import CompletedFilingsList from '@/components/filings/CompletedFilingsList';
import EmptyStateCard from '@/components/filings/EmptyStateCard';
import FilingCompletionDialog from '@/components/filings/FilingCompletionDialog';
import FERCompletionDialog from '@/components/filings/FERCompletionDialog';
import LoadingSpinner from '@/components/filings/LoadingSpinner';

const Filings = () => {
  const {
    loading,
    user,
    patents,
    completedPatents,
    ferEntries,
    selectedPatent,
    selectedFER,
    isDialogOpen,
    isFERDialogOpen,
    isSubmitting,
    formData,
    handlePatentClick,
    handleFERClick,
    handleFormChange,
    handleSubmit,
    handleFERSubmit,
    setIsDialogOpen,
    setIsFERDialogOpen
  } = useFilingsData();

  if (loading) {
    return <LoadingSpinner message="Loading filing assignments..." />;
  }

  if (!user) {
    return <div>Authentication required</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">My Filing Assignments</h1>
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending Filings ({patents.length})</TabsTrigger>
          <TabsTrigger value="fer">FER Filings ({ferEntries.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Filings ({completedPatents.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {patents.length > 0 ? (
            <PendingFilingsList 
              patents={patents} 
              username={user.full_name} 
              onPatentClick={handlePatentClick} 
            />
          ) : (
            <EmptyStateCard 
              title="No pending filing assignments" 
              description="You're all caught up!" 
            />
          )}
        </TabsContent>
        
        <TabsContent value="fer">
          {ferEntries.length > 0 ? (
            <FERFilingsList 
              ferEntries={ferEntries} 
              onFERClick={handleFERClick} 
            />
          ) : (
            <EmptyStateCard 
              title="No pending FER filing assignments" 
              description="You're all caught up!" 
            />
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedPatents.length > 0 ? (
            <CompletedFilingsList 
              patents={completedPatents} 
              username={user.full_name} 
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-xl font-medium">No completed filing assignments yet</p>
                <p className="text-gray-500">Your completed filings will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <FilingCompletionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patent={selectedPatent}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        username={user.full_name}
      />
      
      <FERCompletionDialog
        open={isFERDialogOpen}
        onOpenChange={setIsFERDialogOpen}
        fer={selectedFER}
        onSubmit={handleFERSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Filings;
