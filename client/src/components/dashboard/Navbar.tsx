import { User, Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, clearToken } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  user: any;
  onPageChange: (page: string) => void;
  onMobileMenuClick: () => void;
}

import { ThemeSelector } from "@/components/dashboard/ThemeSelector";

export function Navbar({ user, onPageChange, onMobileMenuClick }: NavbarProps) {
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

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'VU';
  };

  return (
    <header className="h-16 bg-background border-b border-border/50 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-all duration-300">
      {/* Left Section - App Name / Breadcrumb */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground"
          onClick={onMobileMenuClick}
        >
          <Menu size={20} />
        </Button>
        <h2 className="text-base md:text-lg font-semibold text-foreground tracking-tight truncate max-w-[200px] md:max-w-none">
          Virtual University Student Portal
        </h2>
      </div>

      {/* Right Section - User Info */}
      <div className="flex items-center gap-3">
        {/* Theme Selector */}
        <ThemeSelector />



        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </Button>

        <div className="h-6 w-px bg-border/50 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-3 py-6 hover:bg-muted rounded-xl transition-all border border-transparent hover:border-border/40" data-testid="user-profile-dropdown">
              <div className="relative">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm text-primary-foreground font-bold text-sm ring-2 ring-background">
                  {getInitials(user?.fullName)}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <Badge variant={user?.role === 'admin' ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4 border-2 border-background shadow-sm">
                    {user?.role === 'admin' ? 'ADM' : 'STU'}
                  </Badge>
                </div>
              </div>

              <div className="text-left hidden md:block space-y-1">
                <p className="text-sm font-semibold text-foreground leading-none" data-testid="text-username">
                  {user?.fullName}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-medium h-5 px-1.5 bg-background/50">
                    {user?.role === 'admin' ? 'Administrator' : 'Student'}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium">#{user?.id}</span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 bg-popover border-border shadow-xl rounded-xl">
            <div className="px-3 py-3 bg-muted/30 rounded-lg mb-2 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  {getInitials(user?.fullName)}
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-sm">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Badge variant={user?.role === 'admin' ? "default" : "secondary"} className="w-full justify-center py-1">
                  {user?.role === 'admin' ? 'Administrator Account' : 'Student Account'}
                </Badge>
              </div>
            </div>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem onClick={() => onPageChange('settings')} className="cursor-pointer py-2.5 px-3 rounded-lg focus:bg-accent focus:text-accent-foreground">
              <User size={16} className="mr-3 text-muted-foreground" />
              <span className="font-medium">My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPageChange('settings')} className="cursor-pointer py-2.5 px-3 rounded-lg focus:bg-accent focus:text-accent-foreground">
              <div className="w-4 h-4 mr-3 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              </div>
              <span className="font-medium">Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              className="cursor-pointer py-2.5 px-3 rounded-lg text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 mt-1 space-x-2"
              disabled={logoutMutation.isPending}
            >
              <div className="mr-3">
                <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 7.5L10.5 10.75M13.5 7.5L10.5 4.5M13.5 7.5L4 7.5M8 13.5H1.5L1.5 1.5L8 1.5" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" /></svg>
              </div>
              <span className="font-medium">{logoutMutation.isPending ? 'Logging out...' : 'Sign Out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
