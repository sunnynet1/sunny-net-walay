import { useState, useEffect } from "react";
import { Search, Edit2, CheckCircle, XCircle, Save, X, User, MapPin, CreditCard, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRICING } from "../types";

export function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleMarkPaid = async (customer: any, customAmount?: number) => {
    const bw = customer.bandwidth + " MB";
    const standardPrice = (PRICING as any)[bw]?.my || 0;
    const currentBill = customer.custom_price || standardPrice;
    const totalOwed = currentBill + (customer.pending_balance || 0);
    
    const amount = customAmount !== undefined ? customAmount : totalOwed;
    
    try {
      const res = await fetch(`/api/customers/${customer.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, date: new Date().toISOString().split('T')[0], totalBill: currentBill })
      });
      if (res.ok) fetchCustomers();
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      // If payment amount was entered during edit
      if (editForm.received_amount) {
        await handleMarkPaid({ id: editingId, ...editForm }, parseFloat(editForm.received_amount));
      }

      const res = await fetch(`/api/customers/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingId(null);
        fetchCustomers();
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let valA = a[key] || "";
    let valB = b[key] || "";
    
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredCustomers = sortedCustomers.filter(c => {
    const matchesSearch = 
      c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = filterDate ? c.expiry_date.includes(filterDate) : true;
    
    const matchesRange = (startDate && endDate) 
      ? (c.expiry_date >= startDate && c.expiry_date <= endDate)
      : true;
    
    return matchesSearch && matchesDate && matchesRange;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Management</h2>
          <p className="text-slate-400">Manage payments and edit customer details.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <div className="flex items-center gap-1 px-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold">From:</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-1 px-2 border-l border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold">To:</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-white outline-none"
              />
            </div>
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="p-1 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setStartDate("");
                setEndDate("");
              }}
              className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-44"
              title="Filter by Expiry Date"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="relative flex-1 md:flex-none md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('full_name')}>
                  Full Name {sortConfig?.key === 'full_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('area')}>
                  Address {sortConfig?.key === 'area' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('username')}>
                  Customer ID {sortConfig?.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('expiry_date')}>
                  Expiry Date {sortConfig?.key === 'expiry_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold">Package & Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === c.id ? (
                      <input 
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" 
                        value={editForm.full_name} 
                        onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                      />
                    ) : (
                      <div className="font-bold text-white text-base tracking-tight">{c.full_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === c.id ? (
                      <input 
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none" 
                        value={editForm.address || ""} 
                        placeholder="Full Address"
                        onChange={e => setEditForm({...editForm, address: e.target.value})}
                      />
                    ) : (
                      <div className="text-slate-400 flex items-start gap-1.5 max-w-[300px]">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-400" /> 
                        <span className="leading-snug text-sm" title={c.address || c.area}>{c.address || c.area}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 text-indigo-400 text-[11px] font-bold px-2.5 py-1 rounded border border-slate-700">
                      {c.username}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-indigo-400 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {c.expiry_date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="text-white font-medium text-xs">
                        {c.bandwidth} MB - Rs. {c.custom_price || (PRICING as any)[c.bandwidth + " MB"]?.my}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {c.amount_paid ? (
                          <div className="flex items-center gap-1 text-emerald-400 font-bold text-[9px] uppercase tracking-wider">
                            <CheckCircle className="w-3 h-3" /> Paid
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-400 font-bold text-[9px] uppercase tracking-wider">
                            <XCircle className="w-3 h-3" /> Pending
                          </div>
                        )}
                        {c.pending_balance > 0 && (
                          <div className="flex items-center gap-1 text-rose-400 font-bold text-[9px] uppercase tracking-wider bg-rose-400/10 px-1.5 py-0.5 rounded border border-rose-400/20">
                            Remaining Balance: Rs. {c.pending_balance}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === c.id ? (
                        <div className="flex flex-col gap-2 items-end">
                          <div className="flex gap-2">
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-[10px] text-slate-500 uppercase font-bold">Received Amount</span>
                              <input 
                                type="number"
                                className="w-24 p-2 bg-slate-800 border border-slate-700 rounded text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500" 
                                value={editForm.received_amount || ""} 
                                placeholder="e.g. 2000"
                                onChange={e => setEditForm({...editForm, received_amount: e.target.value})}
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <button onClick={handleSaveEdit} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20">
                                <Save className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {editForm.received_amount && (
                            <div className="text-[10px] text-rose-400 font-bold">
                              Remaining Balance: Rs. {((c.custom_price || (PRICING as any)[c.bandwidth + " MB"]?.my) + (c.pending_balance || 0)) - parseFloat(editForm.received_amount)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {!c.amount_paid && (
                            <button 
                              onClick={() => handleMarkPaid(c)}
                              className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 transition-all uppercase tracking-wider"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay Rs. {(c.custom_price || (PRICING as any)[c.bandwidth + " MB"]?.my || 0) + (c.pending_balance || 0)}
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setEditingId(c.id);
                              setEditForm({
                                full_name: c.full_name,
                                area: c.area,
                                address: c.address,
                                mobile_number: c.mobile_number,
                                custom_price: c.custom_price,
                                expiry_date: c.expiry_date
                              });
                            }}
                            className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
