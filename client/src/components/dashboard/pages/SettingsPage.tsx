import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Moon, Sun, User, BookOpen, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/providers/ThemeProvider";
import { SetupProfile } from "../SetupProfile";

export function SettingsPage({ user }: { user: any }) {
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      // Invalidate user data and redirect
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (showProfileEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
            <p className="text-gray-600 dark:text-gray-300">Update your degree program and subjects</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowProfileEdit(false)}
            data-testid="button-back-to-settings"
          >
            Back to Settings
          </Button>
        </div>
        <SetupProfile user={user} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account preferences and profile</p>
        </div>
      </div>

      {/* User Profile Section */}
      <Card data-testid="card-profile-info">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription>
            Your account details and academic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</Label>
              <p className="text-gray-900 dark:text-white" data-testid="text-full-name">{user?.fullName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</Label>
              <p className="text-gray-900 dark:text-white" data-testid="text-username">{user?.username}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</Label>
              <p className="text-gray-900 dark:text-white" data-testid="text-email">{user?.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</Label>
              <Badge variant={user?.role === "admin" ? "destructive" : "secondary"} data-testid="badge-role">
                {user?.role === "admin" ? "Administrator" : "Student"}
              </Badge>
            </div>
          </div>
          
          {user?.role !== "admin" && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Degree Program</Label>
                  <p className="text-gray-900 dark:text-white" data-testid="text-degree-program">
                    {user?.degreeProgram || "Not set"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Enrolled Subjects</Label>
                  <div className="flex flex-wrap gap-1 mt-1" data-testid="container-subjects">
                    {user?.subjects?.length ? (
                      user.subjects.map((subject: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">No subjects selected</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => setShowProfileEdit(true)}
                  className="flex items-center space-x-2"
                  data-testid="button-change-subjects"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Change Subjects & Degree</span>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card data-testid="card-theme-settings">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Dark Mode</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch between light and dark themes
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch 
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                data-testid="switch-theme"
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card data-testid="card-account-actions">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Account Actions</CardTitle>
          <CardDescription>
            Manage your account and session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}