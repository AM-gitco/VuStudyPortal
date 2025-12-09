import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { SetupProfile } from "@/components/dashboard/SetupProfile";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication is handled in App.tsx
  if (isLoading || !isAuthenticated) {
    return null;
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
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        user={user}
        activePage={activePage}
        onPageChange={(page) => {
          setActivePage(page);
          setIsMobileMenuOpen(false); // Close mobile menu on navigation
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className={`transition-all duration-300 flex flex-col min-h-screen ${isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'
        }`}>
        <Navbar
          user={user}
          onPageChange={setActivePage}
          onMobileMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="p-4 md:p-6 flex-1 max-w-[100vw] overflow-x-hidden">
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
