import { 
  LayoutDashboard, 
  BookOpen, 
  Upload, 
  MessageSquare, 
  Megaphone, 
  Lightbulb, 
  Bot, 
  Award, 
  Library, 
  Users, 
  Info,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  user: any;
  activePage: string;
  onPageChange: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  adminOnly?: boolean;
}

export function Sidebar({ user, activePage, onPageChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      window.location.href = "/auth";
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "subjects", label: "My Subjects", icon: BookOpen },
    { id: "upload", label: "Upload Area", icon: Upload },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "solutions", label: "Solutions", icon: Lightbulb },
    { id: "ai-chat", label: "Ask AI", icon: Bot },
    { id: "badges", label: "Badges", icon: Award },
    { id: "resources", label: "Resources", icon: Library },
    { id: "about", label: "About Us", icon: Info },
    { id: "team", label: "Our Team", icon: Users },
    { id: "admin", label: "Admin Panel", icon: Shield, adminOnly: true },
  ];

  const bottomNavItems: NavItem[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderNavItem = (item: NavItem) => {
    if (item.adminOnly && user?.role !== 'admin') {
      return null;
    }

    const Icon = item.icon;
    const isActive = activePage === item.id;

    const button = (
      <button
        key={item.id}
        data-testid={`nav-${item.id}`}
        onClick={() => onPageChange(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
        }`}
      >
        <Icon size={20} className={`flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
        {!isCollapsed && (
          <>
            <span className="flex-1 font-medium">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full font-medium">
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.id} delayDuration={0}>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-64'} z-40 flex flex-col`}>
      {/* Header with Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">VU</span>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white text-lg">VU Portal</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Student Support</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        data-testid="sidebar-toggle"
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all z-50"
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLeft size={14} className="text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {navItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
        {bottomNavItems.map(renderNavItem)}
        
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-logout"
                className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Logout
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            data-testid="button-logout"
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={20} />
            <span className="font-medium">{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
