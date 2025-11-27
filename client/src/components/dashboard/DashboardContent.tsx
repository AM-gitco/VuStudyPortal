import { DashboardHome } from "./pages/DashboardHome";
import { MySubjects } from "./pages/MySubjects";
import { UploadArea } from "./pages/UploadArea";
import { Solutions } from "./pages/Solutions";
import { Discussions } from "./pages/Discussions";
import { Announcements } from "./pages/Announcements";
import { AIChat } from "./pages/AIChat";
import { Badges } from "./pages/Badges";
import { About } from "./pages/About";
import { SettingsPage } from "./pages/SettingsPage";
import { OurTeam } from "./pages/OurTeam";
import { SubjectResources } from "./pages/SubjectResources";
import { AdminPanel } from "./pages/AdminPanel";

interface DashboardContentProps {
  user: any;
  activePage: string;
  onPageChange: (page: string) => void;
}

export function DashboardContent({ user, activePage, onPageChange }: DashboardContentProps) {
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardHome user={user} onPageChange={onPageChange} />;
      case "subjects":
        return <MySubjects user={user} />;
      case "upload":
        return <UploadArea user={user} />;
      case "discussions":
        return <Discussions user={user} />;
      case "announcements":
        return <Announcements user={user} />;
      case "solutions":
        return <Solutions user={user} />;
      case "ai-chat":
        return <AIChat user={user} />;
      case "badges":
        return <Badges user={user} />;
      case "about":
        return <About user={user} />;
      case "settings":
        return <SettingsPage user={user} />;
      case "team":
        return <OurTeam user={user} />;
      case "resources":
        return <SubjectResources user={user} />;
      case "admin":
        return user?.role === 'admin' ? <AdminPanel user={user} /> : <DashboardHome user={user} onPageChange={onPageChange} />;
      default:
        return <DashboardHome user={user} onPageChange={onPageChange} />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {renderPage()}
    </div>
  );
}
