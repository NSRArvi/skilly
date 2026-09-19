"use client";

import { LifeBuoy } from "lucide-react";

export default function SupportAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Support Messages</h1>
        <p className="text-gray-500 mt-1">Manage user support inquiries and feedback.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 border-dashed py-24 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <LifeBuoy className="w-10 h-10 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Support Messages Yet!</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          It looks like your support inbox is completely empty. When users reach out for help or send feedback, their messages will appear here.
        </p>
      </div>
    </div>
  );
}
