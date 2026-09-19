"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { Search, LifeBuoy, Eye, Trash2, Mail, X, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getSupportMessages, deleteSupportMessage } from "../../actions";
import { AdminTableSkeleton } from "@/components/shared/AdminSkeletons";

export default function SupportAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const result = await getSupportMessages();
    
    if (!result.success) {
      toast.error(result.error);
    } else {
      setMessages(result.data || []);
    }
    setLoading(false);
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this message?")) return;
    
    const result = await deleteSupportMessage(id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Message deleted successfully");
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const filtered = messages.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) || 
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Support Messages</h1>
          <p className="text-gray-500 mt-1">Manage user support inquiries and feedback.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by name, email, or subject..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-lg w-full"
          />
        </div>
      </div>

      {loading ? (
        <AdminTableSkeleton columns={4} rows={5} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed py-24 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <LifeBuoy className="w-10 h-10 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Support Messages Found</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {search ? "No messages match your search criteria." : "It looks like your support inbox is completely empty. When users reach out for help, their messages will appear here."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(message => (
                  <tr key={message.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{message.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {message.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{message.title || "No Subject"}</div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">{message.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 flex items-center gap-1.5 whitespace-nowrap">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {new Date(message.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedMessage(message)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Read
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message Review Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-indigo-500" />
                Support Ticket
              </h3>
              <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">From</p>
                  <p className="font-bold text-gray-900 text-base">{selectedMessage.name}</p>
                  <a href={`mailto:${selectedMessage.email}`} className="text-indigo-600 hover:underline text-sm font-medium flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5" /> {selectedMessage.email}
                  </a>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Received</p>
                  <p className="text-sm font-medium text-gray-700">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-4">{selectedMessage.title}</h4>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px] bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <button 
                onClick={() => deleteMessage(selectedMessage.id)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete Message
              </button>
              <a 
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.title}`}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
