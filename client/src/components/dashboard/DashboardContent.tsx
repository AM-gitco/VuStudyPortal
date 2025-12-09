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
import { Resources } from "./pages/Resources";
import { AdminPanel } from "./pages/AdminPanel";

interface DashboardContentProps {
  user: any;
  activePage: string;
  onPageChange: (page: string) => void;
}

import { motion, AnimatePresence } from "framer-motion";

import { CourseSelection } from "./pages/CourseSelection";
import { SetupProfile } from "./SetupProfile";
import { ManageSubjectsFlow } from "./ManageSubjectsFlow";

import { UpdateProfileFlow } from "./UpdateProfileFlow";

export function DashboardContent({ user, activePage, onPageChange }: DashboardContentProps) {
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardHome user={user} onPageChange={onPageChange} />;
      case "subjects":
        return <MySubjects user={user} onPageChange={onPageChange} />;
      case "course-selection":
        return <CourseSelection user={user} onPageChange={onPageChange} />;
      case "setup-profile":
        return <SetupProfile user={user} />;
      case "manage-subjects-flow":
        return <ManageSubjectsFlow user={user} onPageChange={onPageChange} />;
      case "update-profile-flow":
        return <UpdateProfileFlow user={user} onPageChange={onPageChange} />;
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
        return <SettingsPage user={user} onPageChange={onPageChange} />;
      case "team":
        return <OurTeam user={user} />;
      case "resources":
        return <Resources user={user} onPageChange={onPageChange} />;
      case "admin":
        return user?.role === 'admin' ? <AdminPanel user={user} /> : <DashboardHome user={user} onPageChange={onPageChange} />;
      default:
        return <DashboardHome user={user} onPageChange={onPageChange} />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
