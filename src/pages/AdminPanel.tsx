import { useState } from "react";
import AdminSidebar, { type AdminView } from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminLogs from "@/components/admin/AdminLogs";

export default function AdminPanel() {
  const [view, setView] = useState<AdminView>('dashboard');

  return (
    <div className="md:flex min-h-screen bg-background bg-grid">
      <AdminSidebar active={view} onChange={setView} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {view === 'dashboard' && <AdminDashboard />}
          {view === 'users' && <AdminUsers />}
          {view === 'logs' && <AdminLogs />}
        </div>
      </main>
    </div>
  );
}
