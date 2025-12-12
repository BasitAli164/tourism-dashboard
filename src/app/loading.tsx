"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const LoadingSkeleton = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Title */}
      <div className="h-10 w-1/3 md:w-1/4 lg:w-1/6 rounded-lg bg-gray-300 animate-pulse"></div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardContent className="p-4 flex flex-col space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Placeholder */}
      <div className="w-full overflow-hidden rounded-lg shadow-md">
        <div className="h-12 bg-gray-300 animate-pulse rounded-t-lg"></div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
