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
import { apiRequest, queryClient, clearToken } from "@/lib/queryClient";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  user: any;
  activePage: string;
  onPageChange: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  adminOnly?: boolean;
}

export function Sidebar({ user, activePage, onPageChange, isCollapsed, onToggleCollapse, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      // Clear JWT token
      clearToken();
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
    const showLabel = !isCollapsed || window.innerWidth < 768;

    const button = (
      <button
        key={item.id}
        data-testid={`nav-${item.id}`}
        onClick={() => onPageChange(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${isActive
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1'
          }`}
      >
        <Icon size={20} className={`flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
        {(!isCollapsed || window.innerWidth < 768) && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium border border-primary/20">
                {item.badge}
              </span>
            )}
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
          </>
        )}
      </button>
    );

    if (isCollapsed && window.innerWidth >= 768) {
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
    <div className={`fixed inset-y-0 left-0 bg-background border-r border-border transition-transform duration-300 ease-in-out z-50 flex flex-col shadow-xl 
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 ${isCollapsed ? 'md:w-[72px]' : 'md:w-64'} w-64`}
    >
      {/* Header with Logo */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/80">
              <span className="font-bold text-lg">VU</span>
            </div>
            {(!isCollapsed || window.innerWidth < 768) && (
              <div>
                <h1 className="font-bold text-foreground text-lg tracking-tight">VU Portal</h1>
                <p className="text-xs text-muted-foreground">Student Support</p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          {isMobileOpen && onMobileClose && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileClose}>
              <ChevronLeft size={20} />
            </Button>
          )}
        </div>
      </div>

      {/* Toggle Button - Desktop Only */}
      <button
        onClick={onToggleCollapse}
        data-testid="sidebar-toggle"
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-background border border-border rounded-full items-center justify-center shadow-md hover:shadow-lg transition-all z-50 hover:bg-accent hover:text-accent-foreground"
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="text-muted-foreground" />
        ) : (
          <ChevronLeft size={14} className="text-muted-foreground" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <div className="space-y-1">
          {navItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-border/50 space-y-1 bg-background">
        {bottomNavItems.map(renderNavItem)}
      </div>
    </div>
  );
}
