import { DashboardHome } from "./pages/DashboardHome";
import { MySubjects } from "./pages/MySubjects";
import { UploadArea } from "./pages/UploadArea";
import { PublicDiscussions } from "./pages/PublicDiscussions";
import { ImportantAnnouncements } from "./pages/ImportantAnnouncements";
import { SolutionsPage } from "./pages/SolutionsPage";
import { AiChat } from "./pages/AiChat";
import { ExamChat } from "./pages/ExamChat";
import { BadgesPage } from "./pages/BadgesPage";
import { SubjectResources } from "./pages/SubjectResources";
import { AboutUs } from "./pages/AboutUs";
import { OurTeam } from "./pages/OurTeam";
import { SettingsPage } from "./pages/SettingsPage";

interface DashboardContentProps {
  user: any;
  activePage: string;
}

export function DashboardContent({ user, activePage }: DashboardContentProps) {
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardHome user={user} />;
      case "subjects":
        return <MySubjects user={user} />;
      case "upload":
        return <UploadArea user={user} />;
      case "discussions":
        return <PublicDiscussions user={user} />;
      case "announcements":
        return <ImportantAnnouncements user={user} />;
      case "solutions":
        return <SolutionsPage user={user} />;
      case "ai-chat":
        return <AiChat user={user} />;
      case "exam-chat":
        return <ExamChat user={user} />;
      case "badges":
        return <BadgesPage user={user} />;
      case "resources":
        return <SubjectResources user={user} />;
      case "about":
        return <AboutUs />;
      case "team":
        return <OurTeam />;
      case "settings":
        return <SettingsPage user={user} />;
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        {renderPage()}
      </div>
    </div>
  );
}