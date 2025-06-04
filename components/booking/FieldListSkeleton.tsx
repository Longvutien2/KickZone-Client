'use client';
import React from 'react';

const FieldListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Skeleton cho 3 field cards */}
      {[1, 2, 3].map((index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
          {/* Header skeleton */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Field name skeleton */}
                <div className="h-6 bg-gray-300 rounded w-24"></div>
                {/* Status badge skeleton */}
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
              </div>
              {/* Expand button skeleton */}
              <div className="h-8 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
          
          {/* Time slots skeleton */}
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => (
                <div key={slot} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      ))}
      
      {/* Loading text */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#FE6900] rounded-full animate-spin"></div>
          <span className="text-sm">Đang tải danh sách sân...</span>
        </div>
      </div>
    </div>
  );
};

export default FieldListSkeleton;
