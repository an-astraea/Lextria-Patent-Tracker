
import React from 'react';
import MainLayout from './MainLayout';

const LoadingLayout: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoadingLayout;
