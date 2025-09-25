import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { SetupProfile } from "@/components/dashboard/SetupProfile";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");

  // Redirect to auth if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  // Show loading state
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

  // Check if user needs to set up their profile (degree and subjects)
  // Admin users bypass setup profile requirement
  const needsSetup = user?.role !== "admin" && (!user?.degreeProgram || !user?.subjects?.length);

  if (needsSetup) {
    return <SetupProfile user={user} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar 
        user={user}
        activePage={activePage}
        onPageChange={setActivePage}
      />
      <main className="flex-1 ml-64">
        <DashboardContent 
          user={user}
          activePage={activePage}
        />
      </main>
    </div>
  );
}