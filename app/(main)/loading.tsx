import React from "react";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="mb-8 flex flex-col space-y-4">
        <div className="h-10 w-1/3 rounded-lg bg-muted"></div>
        <div className="h-5 w-1/2 rounded bg-muted"></div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-4 rounded-xl border p-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-3 w-1/2 rounded bg-muted"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted"></div>
              <div className="h-4 w-5/6 rounded bg-muted"></div>
            </div>
            <div className="mt-auto pt-4">
              <div className="h-9 w-full rounded-md bg-muted"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
