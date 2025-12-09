import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Moon, Sun, BookOpen, Settings, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/providers/ThemeProvider";
import { SetupProfile } from "../SetupProfile";
import { ChangePasswordDialog } from "../settings/ChangePasswordDialog";

// { onPageChange }: { user: any, onPageChange: (page: string) => void }
export function SettingsPage({ user, onPageChange }: { user: any, onPageChange: (page: string) => void }) {
  const [showChangePassword, setShowChangePassword] = useState(false);
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



  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4 border-b border-border/40 pb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and profile details</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* User Profile Section */}
        <Card data-testid="card-profile-info" className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
            <CardTitle className="flex items-center space-x-3 text-lg">
              <User className="h-5 w-5 text-primary" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>
              Personal and academic details associated with your account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <p className="text-foreground font-medium text-lg leading-none" data-testid="text-full-name">{user?.fullName}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</Label>
                <p className="text-foreground font-medium text-lg leading-none" data-testid="text-username">{user?.username}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <p className="text-foreground font-medium text-lg leading-none" data-testid="text-email">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Role</Label>
                <div className="flex">
                  <Badge variant={user?.role === "admin" ? "default" : "secondary"} className="mt-1 px-3 py-1" data-testid="badge-role">
                    {user?.role === "admin" ? "Administrator" : "Student"}
                  </Badge>
                </div>
              </div>
            </div>

            {user?.role !== "admin" && (
              <>
                <Separator className="bg-border/60" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Degree Program</Label>
                    <p className="text-foreground font-medium text-lg" data-testid="text-degree-program">
                      {user?.degreeProgram || "Not set"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Enrolled Subjects</Label>
                    <div className="flex flex-wrap gap-2 mt-1" data-testid="container-subjects">
                      {user?.subjects?.length ? (
                        user.subjects.map((subject: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs bg-background hover:bg-muted transition-colors py-1 px-2 border-primary/20 text-foreground">
                            {subject}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm italic">No subjects selected</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => onPageChange('update-profile-flow')}
                    className="flex items-center space-x-2"
                    data-testid="button-change-subjects"
                    variant="default"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>Change Subjects & Degree</span>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card data-testid="card-theme-settings" className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-lg">
              <Palette className="h-5 w-5 text-primary" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize your visual experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/40">
              <div className="space-y-1">
                <Label className="text-base font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <div className="flex items-center space-x-3 bg-background p-1.5 rounded-full border border-border">
                <Sun className={`h-4 w-4 ${theme === 'light' ? 'text-orange-500' : 'text-muted-foreground'}`} />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  data-testid="switch-theme"
                />
                <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Settings Card */}
        <Card className="border-blue-100 dark:border-blue-900 shadow-sm animate-in fade-in duration-500 delay-200">
          <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Academic Profile</CardTitle>
                <CardDescription>Manage your degree program and academic details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Current Degree Program</p>
                <p className="text-sm text-muted-foreground">
                  {user.degreeProgram || "Not Set"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => onPageChange('update-profile-flow')}
                className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Update Degree & Semester
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card data-testid="card-account-actions" className="border-red-200/50 dark:border-red-900/20 shadow-sm bg-red-50/30 dark:bg-red-950/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-red-600 dark:text-red-400 text-lg">Danger Zone</CardTitle>
            <CardDescription>
              Security and account actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your password securely</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowChangePassword(true)}
                className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
              >
                Change Password
              </Button>
            </div>

            <Separator className="bg-red-200/50 dark:bg-red-900/20" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Sign out of your account</p>
                <p className="text-xs text-muted-foreground">You will be returned to the login screen</p>
              </div>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
        userEmail={user.email}
      />
    </div>
  );
}