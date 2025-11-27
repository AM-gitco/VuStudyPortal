import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Upload, 
  MessageSquare, 
  Megaphone, 
  CheckCircle, 
  Trash2,
  Shield,
  FileCheck,
  Plus
} from "lucide-react";

interface AdminPanelProps {
  user: any;
}

export function AdminPanel({ user }: AdminPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: uploads = [], isLoading: loadingUploads } = useQuery({
    queryKey: ["/api/uploads"],
  });

  const { data: discussions = [], isLoading: loadingDiscussions } = useQuery({
    queryKey: ["/api/discussions"],
  });

  const { data: announcements = [], isLoading: loadingAnnouncements } = useQuery({
    queryKey: ["/api/announcements/all"],
  });

  const { data: solutions = [], isLoading: loadingSolutions } = useQuery({
    queryKey: ["/api/solutions"],
  });

  const approveUploadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/uploads/${id}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({ title: "Upload approved successfully" });
    },
  });

  const deleteUploadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/uploads/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({ title: "Upload deleted successfully" });
    },
  });

  const deleteDiscussionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/discussions/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      toast({ title: "Discussion deleted successfully" });
    },
  });

  const approveAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/announcements/${id}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Announcement approved successfully" });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/announcements/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Announcement deleted successfully" });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const response = await apiRequest("POST", "/api/announcements", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Announcement created successfully" });
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setShowAnnouncementForm(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create announcement", description: error.message, variant: "destructive" });
    },
  });

  const deleteSolutionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/solutions/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/solutions"] });
      toast({ title: "Solution deleted successfully" });
    },
  });

  const handleCreateAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    createAnnouncementMutation.mutate({ title: announcementTitle, content: announcementContent });
  };

  const stats = [
    { label: "Total Users", value: Array.isArray(users) ? users.length : 0, icon: Users, color: "bg-blue-500" },
    { label: "Total Uploads", value: Array.isArray(uploads) ? uploads.length : 0, icon: Upload, color: "bg-green-500" },
    { label: "Discussions", value: Array.isArray(discussions) ? discussions.length : 0, icon: MessageSquare, color: "bg-purple-500" },
    { label: "Solutions", value: Array.isArray(solutions) ? solutions.length : 0, icon: FileCheck, color: "bg-cyan-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
          <Shield className="text-red-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-admin-title">Admin Panel</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage users and content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} data-testid={`card-stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="uploads" data-testid="tab-uploads">Uploads</TabsTrigger>
          <TabsTrigger value="discussions" data-testid="tab-discussions">Discussions</TabsTrigger>
          <TabsTrigger value="solutions" data-testid="tab-solutions">Solutions</TabsTrigger>
          <TabsTrigger value="announcements" data-testid="tab-announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-8">Loading users...</div>
              ) : Array.isArray(users) && users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid={`row-user-${u.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {u.fullName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{u.fullName}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'}>
                          {u.role}
                        </Badge>
                        <Badge variant={u.isVerified ? 'default' : 'outline'}>
                          {u.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                        <span className="text-xs text-gray-400">ID: {u.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No users found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Management</CardTitle>
              <CardDescription>Approve or reject uploaded content</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUploads ? (
                <div className="text-center py-8">Loading uploads...</div>
              ) : Array.isArray(uploads) && uploads.length > 0 ? (
                <div className="space-y-3">
                  {uploads.map((upload: any) => (
                    <div key={upload.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid={`row-upload-${upload.id}`}>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{upload.title}</p>
                        <p className="text-sm text-gray-500">{upload.subject} - {upload.uploadType}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={upload.isApproved ? 'default' : 'outline'}>
                          {upload.isApproved ? 'Approved' : 'Pending'}
                        </Badge>
                        {!upload.isApproved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveUploadMutation.mutate(upload.id)}
                            disabled={approveUploadMutation.isPending}
                            data-testid={`button-approve-upload-${upload.id}`}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteUploadMutation.mutate(upload.id)}
                          disabled={deleteUploadMutation.isPending}
                          data-testid={`button-delete-upload-${upload.id}`}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No uploads found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Discussion Moderation</CardTitle>
              <CardDescription>Monitor and moderate discussions</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDiscussions ? (
                <div className="text-center py-8">Loading discussions...</div>
              ) : Array.isArray(discussions) && discussions.length > 0 ? (
                <div className="space-y-3">
                  {discussions.map((discussion: any) => (
                    <div key={discussion.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid={`row-discussion-${discussion.id}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{discussion.content}</p>
                        <p className="text-sm text-gray-500">{discussion.subject || 'General'} - {discussion.likes || 0} likes</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDiscussionMutation.mutate(discussion.id)}
                        disabled={deleteDiscussionMutation.isPending}
                        data-testid={`button-delete-discussion-${discussion.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No discussions found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solutions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Solution Management</CardTitle>
              <CardDescription>Review and manage submitted solutions</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSolutions ? (
                <div className="text-center py-8">Loading solutions...</div>
              ) : Array.isArray(solutions) && solutions.length > 0 ? (
                <div className="space-y-3">
                  {solutions.map((solution: any) => (
                    <div key={solution.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid={`row-solution-${solution.id}`}>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{solution.title}</p>
                        <p className="text-sm text-gray-500">{solution.subject} - {solution.solutionType} - {solution.helpfulVotes || 0} votes</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={solution.isApproved ? 'default' : 'outline'}>
                          {solution.isApproved ? 'Approved' : 'Pending'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSolutionMutation.mutate(solution.id)}
                          disabled={deleteSolutionMutation.isPending}
                          data-testid={`button-delete-solution-${solution.id}`}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No solutions found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Announcement Management</CardTitle>
                <CardDescription>Create and manage system announcements</CardDescription>
              </div>
              <Button onClick={() => setShowAnnouncementForm(!showAnnouncementForm)} data-testid="button-new-announcement">
                <Plus size={16} className="mr-1" />
                New Announcement
              </Button>
            </CardHeader>
            <CardContent>
              {showAnnouncementForm && (
                <div className="mb-6 p-4 border rounded-lg dark:border-gray-700">
                  <h3 className="font-semibold mb-4">Create New Announcement</h3>
                  <div className="space-y-4">
                    <Input
                      placeholder="Announcement title"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      data-testid="input-announcement-title"
                    />
                    <Textarea
                      placeholder="Announcement content..."
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      className="min-h-[100px]"
                      data-testid="textarea-announcement-content"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateAnnouncement}
                        disabled={createAnnouncementMutation.isPending}
                        data-testid="button-create-announcement"
                      >
                        {createAnnouncementMutation.isPending ? "Creating..." : "Create Announcement"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAnnouncementForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {loadingAnnouncements ? (
                <div className="text-center py-8">Loading announcements...</div>
              ) : Array.isArray(announcements) && announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((announcement: any) => (
                    <div key={announcement.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid={`row-announcement-${announcement.id}`}>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{announcement.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-md">{announcement.content}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={announcement.isPinned ? 'default' : 'outline'}>
                          {announcement.isPinned ? 'Pinned' : 'Normal'}
                        </Badge>
                        <Badge variant={announcement.isApproved ? 'default' : 'outline'}>
                          {announcement.isApproved ? 'Published' : 'Draft'}
                        </Badge>
                        {!announcement.isApproved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveAnnouncementMutation.mutate(announcement.id)}
                            disabled={approveAnnouncementMutation.isPending}
                            data-testid={`button-approve-announcement-${announcement.id}`}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Publish
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                          disabled={deleteAnnouncementMutation.isPending}
                          data-testid={`button-delete-announcement-${announcement.id}`}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No announcements found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
