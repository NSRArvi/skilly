import React from "react";

export function AdminTableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="space-y-2">
                      <div className={`h-4 bg-gray-100 rounded animate-pulse ${colIndex === 0 ? 'w-32' : 'w-20'}`}></div>
                      {colIndex === 0 && <div className="h-3 bg-gray-100 rounded animate-pulse w-24"></div>}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2 mt-1"></div>
          
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-full"></div>
            <div className="h-3 bg-gray-100 rounded animate-pulse w-5/6"></div>
            <div className="h-3 bg-gray-100 rounded animate-pulse w-4/6"></div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-gray-50 mt-4">
            <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
