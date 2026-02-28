/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { Login } from "./components/Login";
import { CSVUpload } from "./components/CSVUpload";
import { AIChat } from "./components/AIChat";
import { Reports } from "./components/Reports";
import { CustomerList } from "./components/CustomerList";
import { Layout } from "./components/Layout";
import { DashboardStats } from "./types";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "upload" | "chat" | "reports" | "customers">("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }

    const handleSwitchView = (e: any) => {
      setCurrentView(e.detail);
    };

    window.addEventListener("switch-view", handleSwitchView);
    return () => window.removeEventListener("switch-view", handleSwitchView);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      onLogout={() => setIsAuthenticated(false)}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {currentView === "dashboard" && <Dashboard stats={stats} onRefresh={fetchStats} onViewChange={setCurrentView} />}
          {currentView === "upload" && <CSVUpload onUploadSuccess={fetchStats} />}
          {currentView === "chat" && <AIChat stats={stats} />}
          {currentView === "reports" && <Reports />}
          {currentView === "customers" && <CustomerList />}
        </>
      )}
    </Layout>
  );
}

