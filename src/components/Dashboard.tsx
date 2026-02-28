import { Users, UserMinus, TrendingUp, Wallet, MapPin, Download, FileSpreadsheet, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DashboardStats, PRICING } from "../types";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

interface DashboardProps {
  stats: DashboardStats | null;
  onRefresh: () => void;
  onViewChange: (view: any) => void;
}

export function Dashboard({ stats, onViewChange }: DashboardProps) {
  if (!stats) return null;

  const bandwidthData = Object.entries(stats.bandwidthStats).map(([bw, data]) => ({
    name: bw,
    users: data.count,
    profit: data.profit,
  }));

  const areaData = Object.entries(stats.areaStats).map(([area, count]) => ({
    name: area,
    value: count,
  }));

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const exportToExcel = () => {
    const data = Object.entries(stats.bandwidthStats).map(([bw, d]) => ({
      Bandwidth: bw,
      Users: d.count,
      "Company Price": (PRICING as any)[bw]?.company || 0,
      "My Price": (PRICING as any)[bw]?.my || 0,
      "Monthly Profit": d.profit,
      "Company Payable": d.companyPayable,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profit Summary");
    XLSX.writeFile(wb, "SuniNet_Profit_Report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Suni Net Profit Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = Object.entries(stats.bandwidthStats).map(([bw, d]) => [
      bw,
      d.count,
      (PRICING as any)[bw]?.company || 0,
      (PRICING as any)[bw]?.my || 0,
      d.profit,
      d.companyPayable,
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [["Bandwidth", "Users", "Co. Price", "My Price", "Profit", "Payable"]],
      body: tableData,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total Active Users: ${stats.totalActive}`, 14, finalY);
    doc.text(`Total Monthly Profit: Rs. ${stats.totalProfit}`, 14, finalY + 7);
    doc.text(`Total Company Payable: Rs. ${stats.totalCompanyPayable}`, 14, finalY + 14);

    doc.save("SuniNet_Monthly_Report.pdf");
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Business Overview</h2>
          <p className="text-slate-400">Real-time profit and user analytics for Suni Net.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/40"
          >
            <FileText className="w-4 h-4" />
            PDF Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Collected" 
          value={`Rs. ${stats.totalCollected.toLocaleString()}`} 
          icon={Wallet} 
          color="bg-indigo-600" 
          subValue="Total from Users"
          onClick={() => onViewChange("reports")}
        />
        <StatCard 
          title="Company Share" 
          value={`Rs. ${stats.totalCompanyPayable.toLocaleString()}`} 
          icon={Users} 
          color="bg-amber-600" 
          subValue="Payable to Company"
          onClick={() => onViewChange("reports")}
        />
        <StatCard 
          title="My Profit" 
          value={`Rs. ${stats.totalProfit.toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-emerald-600" 
          subValue="Your Net Earnings"
          onClick={() => onViewChange("reports")}
        />
        <StatCard 
          title="Active Users" 
          value={stats.totalActive} 
          icon={Users} 
          color="bg-violet-600" 
          subValue={`${stats.totalTerminated} Terminated`}
          onClick={() => onViewChange("customers")}
        />
        <StatCard 
          title="Total Pending Balance" 
          value={`Rs. ${stats.totalPendingBalance?.toLocaleString() || 0}`} 
          icon={Wallet} 
          color="bg-rose-600" 
          subValue="Owed by Customers"
          onClick={() => onViewChange("reports")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Paid Profit (Current Month)</p>
            <h4 className="text-xl font-bold text-emerald-400">Rs. {stats.paidProfit.toLocaleString()}</h4>
            <p className="text-xs text-slate-500 mt-1">{stats.paidCount} Users Paid</p>
          </div>
          <div className="bg-emerald-400/10 p-3 rounded-full text-emerald-400 border border-emerald-400/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Pending Profit (Current Month)</p>
            <h4 className="text-xl font-bold text-amber-400">Rs. {stats.pendingProfit.toLocaleString()}</h4>
            <p className="text-xs text-slate-500 mt-1">{stats.pendingCount} Users Pending</p>
          </div>
          <div className="bg-amber-400/10 p-3 rounded-full text-amber-400 border border-amber-400/20">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bandwidth Usage Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl"
        >
          <h3 className="text-lg font-bold text-white mb-6">Bandwidth Wise Users</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandwidthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Profit Distribution Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl"
        >
          <h3 className="text-lg font-bold text-white mb-6">Profit Contribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bandwidthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="profit"
                >
                  {bandwidthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {bandwidthData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] text-slate-400 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Bandwidth Profit Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Bandwidth</th>
                <th className="px-6 py-4 font-semibold">Users</th>
                <th className="px-6 py-4 font-semibold">Co. Price</th>
                <th className="px-6 py-4 font-semibold">My Price</th>
                <th className="px-6 py-4 font-semibold">Profit/User</th>
                <th className="px-6 py-4 font-semibold">Total Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {Object.entries(stats.bandwidthStats).map(([bw, d]) => {
                const pricing = (PRICING as any)[bw];
                return (
                  <tr key={bw} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{bw}</td>
                    <td className="px-6 py-4 text-slate-300">{d.count}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">Rs. {pricing?.company}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">Rs. {pricing?.my}</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">Rs. {pricing ? pricing.my - pricing.company : 0}</td>
                    <td className="px-6 py-4 text-indigo-400 font-bold">Rs. {d.profit.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subValue, onClick }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-start justify-between ${onClick ? 'cursor-pointer hover:border-indigo-500 transition-all' : ''}`}
    >
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{subValue}</p>
      </div>
      <div className={`${color} p-3 rounded-xl text-white shadow-lg shadow-current/20`}>
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
}
