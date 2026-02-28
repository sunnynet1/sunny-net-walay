import { useState, useEffect } from "react";
import { Calendar, Search, Download, FileSpreadsheet, FileText, TrendingUp, Wallet, Users, UserMinus } from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export function Reports() {
  const [date, setDate] = useState("2026-02-28");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [listData, setListData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'financial' | 'pending' | 'paid' | 'unpaid'>('financial');

  const fetchReport = async (filterDate?: string) => {
    setLoading(true);
    try {
      let url = "";
      if (startDate && endDate) {
        url = `/api/reports?startDate=${startDate}&endDate=${endDate}`;
      } else {
        url = filterDate ? `/api/reports?date=${filterDate}` : `/api/reports?date=${date}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListData = async (type: 'pending' | 'paid' | 'unpaid') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${type}-report`);
      const data = await res.json();
      setListData(data);
    } catch (error) {
      console.error(`Failed to fetch ${type} report:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'financial') {
      fetchReport();
    } else {
      fetchListData(activeTab);
    }
  }, [activeTab]);

  const exportToExcel = () => {
    if (!reportData) return;
    const ws = XLSX.utils.json_to_sheet(reportData.details.map((d: any) => ({
      Username: d.username,
      Name: d.full_name,
      Bandwidth: d.bandwidth + " MB",
      "Total Collected": d.total,
      "Pending Balance": d.pending_balance || 0,
      "Company Share": d.company,
      "My Profit": d.profit,
      Area: d.area
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Report");
    XLSX.writeFile(wb, `SuniNet_Report_${date}.xlsx`);
  };

  const exportToPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    doc.text(`Suni Net Daily Report - ${date}`, 14, 20);
    
    const tableData = reportData.details.map((d: any) => [
      d.username,
      d.full_name,
      d.bandwidth + " MB",
      d.total,
      d.pending_balance || 0,
      d.company,
      d.profit
    ]);

    (doc as any).autoTable({
      startY: 30,
      head: [["User", "Name", "BW", "Total", "Pending", "Company", "Profit"]],
      body: tableData,
    });

    doc.save(`SuniNet_Report_${date}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setActiveTab('financial')}
              className={`text-sm font-medium transition-colors ${activeTab === 'financial' ? 'text-indigo-400 border-b-2 border-indigo-400 pb-1' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Financial Reports
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              className={`text-sm font-medium transition-colors ${activeTab === 'pending' ? 'text-indigo-400 border-b-2 border-indigo-400 pb-1' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Remaining Balance
            </button>
            <button 
              onClick={() => setActiveTab('paid')}
              className={`text-sm font-medium transition-colors ${activeTab === 'paid' ? 'text-indigo-400 border-b-2 border-indigo-400 pb-1' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Paid Users
            </button>
            <button 
              onClick={() => setActiveTab('unpaid')}
              className={`text-sm font-medium transition-colors ${activeTab === 'unpaid' ? 'text-indigo-400 border-b-2 border-indigo-400 pb-1' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Unpaid Users
            </button>
          </div>
        </div>
        {activeTab === 'financial' && (
          <div className="flex flex-wrap gap-3">
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button 
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setDate(today);
                  fetchReport(today);
                }}
                className="px-3 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-all"
              >
                Today
              </button>
              <button 
                onClick={() => {
                  const now = new Date();
                  const month = now.getMonth() + 1;
                  const year = now.getFullYear();
                  setLoading(true);
                  fetch(`/api/reports?month=${month}&year=${year}`)
                    .then(res => {
                      if (!res.ok) throw new Error("Failed to fetch");
                      return res.json();
                    })
                    .then(data => {
                      setReportData(data);
                      setLoading(false);
                    })
                    .catch(err => {
                      console.error(err);
                      setLoading(false);
                    });
                }}
                className="px-3 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-all border-l border-slate-800"
              >
                This Month
              </button>
              <button 
                onClick={() => {
                  const now = new Date();
                  now.setMonth(now.getMonth() - 1);
                  const month = now.getMonth() + 1;
                  const year = now.getFullYear();
                  setLoading(true);
                  fetch(`/api/reports?month=${month}&year=${year}`)
                    .then(res => {
                      if (!res.ok) throw new Error("Failed to fetch");
                      return res.json();
                    })
                    .then(data => {
                      setReportData(data);
                      setLoading(false);
                    })
                    .catch(err => {
                      console.error(err);
                      setLoading(false);
                    });
                }}
                className="px-3 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-all border-l border-slate-800"
              >
                Last Month
              </button>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
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
                    <Search className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button 
                onClick={() => fetchReport()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-900/20"
              >
                <Search className="w-4 h-4" />
                Get Report
              </button>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'financial' && reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ReportStatCard 
              title="Total Collected" 
              value={`Rs. ${reportData.totalCollected.toLocaleString()}`} 
              icon={Wallet} 
              color="text-indigo-400" 
              bgColor="bg-indigo-400/10"
            />
            <ReportStatCard 
              title="Company Share" 
              value={`Rs. ${reportData.companyShare.toLocaleString()}`} 
              icon={Users} 
              color="text-amber-400" 
              bgColor="bg-amber-400/10"
            />
            <ReportStatCard 
              title="My Profit" 
              value={`Rs. ${reportData.myProfit.toLocaleString()}`} 
              icon={TrendingUp} 
              color="text-emerald-400" 
              bgColor="bg-emerald-400/10"
            />
            <ReportStatCard 
              title="Total Pending" 
              value={`Rs. ${reportData.totalPending?.toLocaleString() || 0}`} 
              icon={UserMinus} 
              color="text-rose-400" 
              bgColor="bg-rose-400/10"
              onClick={() => setActiveTab('pending')}
            />
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Collection Details ({reportData.userCount} Users)</h3>
              <div className="flex gap-2">
                <button onClick={exportToExcel} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Export Excel">
                  <FileSpreadsheet className="w-5 h-5" />
                </button>
                <button onClick={exportToPDF} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Export PDF">
                  <FileText className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User Info</th>
                    <th className="px-6 py-4 font-semibold">Bandwidth</th>
                    <th className="px-6 py-4 font-semibold">Collected</th>
                    <th className="px-6 py-4 font-semibold">Pending</th>
                    <th className="px-6 py-4 font-semibold">Company</th>
                    <th className="px-6 py-4 font-semibold">Profit</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {reportData.details.map((d: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{d.username}</div>
                        <div className="text-xs text-slate-500">{d.full_name} | {d.area}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{d.bandwidth} MB</td>
                      <td className="px-6 py-4 font-medium text-white">Rs. {d.total}</td>
                      <td className="px-6 py-4">
                        {d.pending_balance > 0 ? (
                          <span className="text-rose-400 font-bold">Rs. {d.pending_balance}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">Rs. {d.company}</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">Rs. {d.profit}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{d.payment_date}</td>
                    </tr>
                  ))}
                  {reportData.details.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        No payments found for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab !== 'financial' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white">
              {activeTab === 'pending' && "Remaining Balance (Owed by Customers)"}
              {activeTab === 'paid' && "Fully Paid Users (Current Month)"}
              {activeTab === 'unpaid' && "Unpaid Users (Current Month)"}
            </h3>
            {activeTab === 'pending' && (
              <div className="bg-rose-400/10 text-rose-400 px-3 py-1 rounded-full text-xs font-bold border border-rose-400/20">
                Total Pending: Rs. {listData.reduce((acc, curr) => acc + (curr.pending_balance || 0), 0).toLocaleString()}
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Username</th>
                  {activeTab !== 'unpaid' && <th className="px-6 py-4 font-semibold">Amount</th>}
                  {activeTab !== 'unpaid' && <th className="px-6 py-4 font-semibold">Date</th>}
                  {activeTab === 'pending' && <th className="px-6 py-4 font-semibold">Remaining Balance</th>}
                  <th className="px-6 py-4 font-semibold text-right">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {listData.map((c: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{c.full_name}</div>
                      <div className="text-[10px] text-slate-500">{c.address || c.area}</div>
                    </td>
                    <td className="px-6 py-4 text-indigo-400 font-mono text-xs">{c.username}</td>
                    {activeTab !== 'unpaid' && (
                      <td className="px-6 py-4 text-emerald-400 font-medium">
                        Rs. {c.last_paid_amount || c.amount_paid || 0}
                      </td>
                    )}
                    {activeTab !== 'unpaid' && (
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {c.last_payment_date || c.payment_date || "N/A"}
                      </td>
                    )}
                    {activeTab === 'pending' && (
                      <td className="px-6 py-4">
                        <span className="bg-rose-400/10 text-rose-400 px-2 py-1 rounded font-bold border border-rose-400/20">
                          Rs. {c.pending_balance}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-slate-500 text-xs text-right font-medium">{c.expiry_date}</td>
                  </tr>
                ))}
                {listData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportStatCard({ title, value, icon: Icon, color, bgColor, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4 ${onClick ? 'cursor-pointer hover:bg-slate-800/80 transition-all hover:border-slate-700 active:scale-95' : ''}`}
    >
      <div className={`${bgColor} ${color} p-3 rounded-xl border border-current/10`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h4 className="text-xl font-bold text-white">{value}</h4>
      </div>
    </div>
  );
}
