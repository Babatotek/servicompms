import React from 'react';
import { Skeleton } from './ui/Skeleton';
import { Card } from './ui/Card';

export const DashboardSkeleton = () => (
  <div className="space-y-5">
    {/* Welcome Bar Skeleton */}
    <div className="flex justify-between items-center gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-1 h-4 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="bg-white p-2 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="space-y-1 text-right">
          <Skeleton className="h-2 w-12 ml-auto" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
    </div>

    {/* Stat Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="h-[150px] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-12 h-5 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-8 w-32" />
          </div>
        </Card>
      ))}
    </div>

    {/* Chart Section Skeleton */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <Card className="xl:col-span-2 h-[400px] p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <Skeleton className="w-full h-full max-h-[250px] rounded-2xl" />
      </Card>
      <Card className="xl:col-span-1 h-[400px] p-8 space-y-8">
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
    <Card className="overflow-hidden">
      <div className="p-0">
        <div className="border-b border-slate-50 p-4">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="grid grid-cols-4 gap-4 items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-12 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

export const FormSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div className="text-center space-y-4">
      <Skeleton className="h-10 w-64 mx-auto" />
      <Skeleton className="h-4 w-96 mx-auto" />
    </div>
    <Card className="p-8 space-y-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-4 p-6 border border-slate-50 rounded-2xl">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </Card>
  </div>
);

export const AppSkeleton = () => {
  const path = window.location.pathname;
  
  // Decide which skeleton to show based on the current path
  let content = <DashboardSkeleton />;
  
  if (path === '/leaderboard' || path === '/team' || path === '/analytics' || path === '/reports') {
    content = <TableSkeleton />;
  } else if (path === '/my-appraisal' || path === '/my-contract' || path === '/profile') {
    content = <FormSkeleton />;
  }
  
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Mock */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 hidden lg:block p-6 space-y-8">
        <Skeleton className="h-10 w-32 mb-12" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Nav Mock */}
        <div className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-8">
          {content}
        </div>
      </div>
    </div>
  );
};
