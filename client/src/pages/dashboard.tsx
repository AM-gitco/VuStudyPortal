import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { SetupProfile } from "@/components/dashboard/SetupProfile";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!isLoading && !isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  const needsSetup = user?.role !== "admin" && (!user?.degreeProgram || !user?.subjects?.length);

  if (needsSetup) {
    return <SetupProfile user={user} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        user={user}
        activePage={activePage}
        onPageChange={setActivePage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-[72px]' : 'ml-64'}`}>
        <Navbar user={user} onPageChange={setActivePage} />
        <main className="p-6">
          <DashboardContent 
            user={user}
            activePage={activePage}
            onPageChange={setActivePage}
          />
        </main>
      </div>
      <ThemeToggle />
    </div>
  );
}
