import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Megaphone, Send, Pin, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Announcement } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type AnnouncementData = z.infer<typeof announcementSchema>;

export function Announcements({ user }: { user: any }) {
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const form = useForm<AnnouncementData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const announcementMutation = useMutation({
    mutationFn: async (data: AnnouncementData) => {
      const response = await apiRequest("POST", "/api/announcements", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Announcement Submitted",
        description: user?.role === 'admin' 
          ? "Your announcement has been published."
          : "Your announcement has been submitted for admin approval.",
      });
      form.reset();
      setShowNewAnnouncement(false);
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AnnouncementData) => {
    announcementMutation.mutate(data);
  };

  const pinnedAnnouncements = announcements.filter(a => a.isPinned);
  const regularAnnouncements = announcements.filter(a => !a.isPinned);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-announcements-title">Announcements</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Stay updated with important VU portal announcements
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowNewAnnouncement(!showNewAnnouncement)} data-testid="button-new-announcement">
            <Megaphone className="mr-2" size={16} />
            New Announcement
          </Button>
        )}
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Announcements contain important updates and information for the VU community.
          {user?.role !== 'admin' && " Only admins can create announcements."}
        </AlertDescription>
      </Alert>

      {showNewAnnouncement && user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Megaphone className="mr-2" size={24} />
              Create New Announcement
            </CardTitle>
            <CardDescription>
              Share important information with the VU community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Announcement Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Important Update for CS201 Students"
                          data-testid="input-announcement-title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Announcement Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed information about your announcement..."
                          className="min-h-[200px]"
                          data-testid="textarea-announcement-content"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowNewAnnouncement(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={announcementMutation.isPending}
                    className="flex items-center"
                    data-testid="button-post-announcement"
                  >
                    {announcementMutation.isPending ? (
                      "Publishing..."
                    ) : (
                      <>
                        <Send className="mr-2" size={16} />
                        Publish Announcement
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center">
            <Pin className="mr-2" size={20} />
            <h2 className="text-xl font-semibold">Pinned Announcements</h2>
          </div>
          
          {pinnedAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="border-l-4 border-l-blue-500" data-testid={`card-pinned-announcement-${announcement.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      <Pin className="mr-1" size={12} />
                      Pinned
                    </Badge>
                    <Badge variant="outline">Admin</Badge>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="mr-1" size={14} />
                  {announcement.createdAt ? formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true }) : 'Recently'}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Announcements</h2>
        
        {isLoading ? (
          <div className="text-center py-8">Loading announcements...</div>
        ) : regularAnnouncements.length === 0 && pinnedAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Megaphone className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Announcements Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Check back later for community announcements and updates
              </p>
              {user?.role === 'admin' && (
                <Button onClick={() => setShowNewAnnouncement(true)} data-testid="button-create-first-announcement">
                  Create First Announcement
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {regularAnnouncements.map((announcement) => (
              <Card key={announcement.id} data-testid={`card-announcement-${announcement.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <Badge variant="outline">Admin</Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1" size={14} />
                    {announcement.createdAt ? formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true }) : 'Recently'}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcement Categories</CardTitle>
          <CardDescription>
            Different types of announcements you might see
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">&#128218;</span>
              </div>
              <h3 className="font-semibold">Academic</h3>
              <p className="text-sm text-gray-500">Course updates and academic information</p>
            </div>
            <div className="text-center p-4 border rounded-lg dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">&#127919;</span>
              </div>
              <h3 className="font-semibold">Events</h3>
              <p className="text-sm text-gray-500">Study groups and community events</p>
            </div>
            <div className="text-center p-4 border rounded-lg dark:border-gray-700">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">&#9888;</span>
              </div>
              <h3 className="font-semibold">Important</h3>
              <p className="text-sm text-gray-500">Critical updates and deadlines</p>
            </div>
            <div className="text-center p-4 border rounded-lg dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">&#128161;</span>
              </div>
              <h3 className="font-semibold">Tips</h3>
              <p className="text-sm text-gray-500">Study tips and helpful resources</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
