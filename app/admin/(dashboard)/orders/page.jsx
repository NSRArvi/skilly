"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Eye,
  X,
  CalendarDays,
  DollarSign,
  Clock,
  CheckCircle,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getOrders } from "../../actions";
import { AdminTableSkeleton } from "@/components/shared/AdminSkeletons";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const result = await getOrders();

    if (!result.success) {
      toast.error(result.error);
    } else {
      setOrders(result.data || []);
    }
    setLoading(false);
  };

  const filtered = orders.filter(
    (o) =>
      o.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.client?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.professional?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toLowerCase().includes(search.toLowerCase()),
  );

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );

      case "in_progress":
        return (
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );

      case "declined":
        return (
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
            <Clock className="w-3 h-3" /> Declined
          </span>
        );

      case "pending":
        return (
          <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );

      default:
        return (
          <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full w-max">
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Orders
          </h1>
          <p className="text-gray-500 mt-1">
            Track and manage financial transactions and orders.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search title, client, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-lg w-full"
          />
        </div>
      </div>

      {loading ? (
        <AdminTableSkeleton columns={6} rows={5} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed py-24 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Orders Found
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {search
              ? "No orders match your search criteria."
              : "Your orders table is currently empty. Once users start completing jobs and payments process, the transaction history will appear here."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Order Info</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Professional</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 max-w-[200px] truncate">
                        {order.title}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        ID: {order.id.split("-")[0]}...
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            order.client?.avatar_url ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${order.client?.full_name || "Client"}`
                          }
                          className="w-6 h-6 rounded-full bg-gray-100"
                        />
                        <span className="font-medium text-gray-800">
                          {order.client?.full_name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            order.professional?.avatar_url ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${order.professional?.full_name || "Pro"}`
                          }
                          className="w-6 h-6 rounded-full bg-gray-100"
                        />
                        <span className="font-medium text-gray-800">
                          {order.professional?.full_name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 flex items-center gap-1">
                        {order.currency === "BDT" ? (
                          <span className="font-bold text-gray-400 mr-1 text-sm leading-none">৳</span>
                        ) : (
                          <span className="text-gray-400 text-xs font-semibold mr-1">
                            {order.currency}
                          </span>
                        )}
                        {order.offer_amount?.toLocaleString() || "0"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-700 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Review Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" />
                Order Details
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4">
                    Transaction Info
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono text-sm text-gray-900 font-medium">
                        {selectedOrder.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="mt-1">
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-bold text-xl text-gray-900">
                        {selectedOrder.currency === "BDT"
                          ? "৳"
                          : `${selectedOrder.currency} `}
                        {selectedOrder.offer_amount?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedOrder.created_at).toLocaleString()}
                      </p>
                    </div>
                    {selectedOrder.delivery_date && (
                      <div>
                        <p className="text-sm text-gray-500">
                          Delivery Deadline
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(
                            selectedOrder.delivery_date,
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3">
                      Client (Buyer)
                    </h4>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          selectedOrder.client?.avatar_url ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${selectedOrder.client?.full_name}`
                        }
                        className="w-10 h-10 rounded-full bg-gray-100"
                      />
                      <div>
                        <p className="font-bold text-gray-900">
                          {selectedOrder.client?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          ID: {selectedOrder.client_id.split("-")[0]}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3">
                      Professional (Seller)
                    </h4>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          selectedOrder.professional?.avatar_url ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${selectedOrder.professional?.full_name}`
                        }
                        className="w-10 h-10 rounded-full bg-gray-100"
                      />
                      <div>
                        <p className="font-bold text-gray-900">
                          {selectedOrder.professional?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          ID: {selectedOrder.professional_id.split("-")[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 text-lg mb-2">
                  {selectedOrder.title}
                </h4>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {selectedOrder.description || "No description provided."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
