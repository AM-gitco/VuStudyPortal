import { useQuery } from "@tanstack/react-query";
import { BookOpen, Upload, Users, TrendingUp, Bell, MessageSquare, Lightbulb, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardHomeProps {
  user: any;
  onPageChange?: (page: string) => void;
}

export function DashboardHome({ user, onPageChange }: DashboardHomeProps) {
  const { data: uploads = [] } = useQuery({
    queryKey: ["/api/uploads/my"],
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ["/api/discussions/my"],
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["/api/badges/my"],
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/announcements"],
  });

  const stats = [
    {
      title: "My Subjects",
      value: user?.subjects?.length || 0,
      icon: BookOpen,
      description: "Enrolled subjects",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Uploads",
      value: Array.isArray(uploads) ? uploads.length : 0,
      icon: Upload,
      description: "Files uploaded",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Discussions",
      value: Array.isArray(discussions) ? discussions.length : 0,
      icon: MessageSquare,
      description: "Posts created",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Badges",
      value: Array.isArray(badges) ? badges.length : 0,
      icon: Award,
      description: "Earned badges",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  const quickActions = [
    {
      id: "upload",
      icon: Upload,
      title: "Upload File",
      description: "Share resources",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "discussions",
      icon: MessageSquare,
      title: "Join Discussion",
      description: "Ask questions",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "resources",
      icon: BookOpen,
      title: "Study Materials",
      description: "Browse resources",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      id: "solutions",
      icon: Lightbulb,
      title: "Solutions",
      description: "Find answers",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  const recentAnnouncements = Array.isArray(announcements)
    ? announcements.slice(0, 3)
    : [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.fullName}!
            </h1>
            <div className="flex items-center gap-3 text-blue-100">
              <p className="text-sm">ID: {user?.id}</p>
              <Badge variant="secondary" className="bg-white/20 text-white border-none">
                {user?.degreeProgram || 'Setup Required'}
              </Badge>
              {user?.role === 'admin' && (
                <Badge className="bg-red-500 text-white border-none">Admin</Badge>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl font-bold">
                {user?.fullName?.charAt(0) || 'V'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    data-testid={`quick-action-${action.id}`}
                    onClick={() => onPageChange?.(action.id)}
                    className={`p-4 text-left rounded-xl border border-border hover:shadow-md transition-all ${action.bgColor}`}
                  >
                    <Icon className={`h-6 w-6 ${action.color} mb-2`} />
                    <p className="font-medium text-foreground">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={18} className="text-orange-500" />
              Recent Announcements
            </CardTitle>
            <CardDescription>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAnnouncements.length > 0 ? (
              <div className="space-y-4">
                {recentAnnouncements.map((announcement: any) => (
                  <div key={announcement.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {announcement.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {announcement.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No announcements yet</p>
              </div>
            )}
            <button
              onClick={() => onPageChange?.('announcements')}
              className="w-full mt-4 text-center text-sm text-primary hover:text-primary/80 font-medium"
            >
              View All Announcements
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Your Subjects */}
      {user?.subjects?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              Your Subjects
            </CardTitle>
            <CardDescription>
              Currently enrolled subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.subjects.map((subject: string) => (
                <Badge key={subject} variant="secondary" className="px-3 py-1">
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
