"use client";

import { ShoppingCart } from "lucide-react";

export default function OrdersAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Track and manage financial transactions and orders.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 border-dashed py-24 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet!</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Your orders table is currently empty. Once users start completing jobs and payments process, the transaction history will appear here.
        </p>
      </div>
    </div>
  );
}
