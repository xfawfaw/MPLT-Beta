import React from 'react';

export const ViewSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-32 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] p-6 space-y-4">
        <div className="h-5 bg-[#F1F5F9] rounded w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="h-14 bg-[#F9FAFB] rounded-[6px]" />
          <div className="h-14 bg-[#F9FAFB] rounded-[6px]" />
          <div className="h-14 bg-[#F9FAFB] rounded-[6px]" />
          <div className="h-14 bg-[#F9FAFB] rounded-[6px]" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-80 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] p-6" />
        <div className="lg:col-span-4 h-80 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] p-6" />
      </div>

      {/* Bottom Ledger Skeleton */}
      <div className="h-64 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] p-6" />
    </div>
  );
};
