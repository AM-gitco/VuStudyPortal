import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { MessageSquare, Send, ThumbsUp, Users, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Discussion } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

const discussionSchema = z.object({
  subject: z.string().optional(),
  content: z.string().min(1, "Discussion content is required"),
});

type DiscussionData = z.infer<typeof discussionSchema>;

export function Discussions({ user }: { user: any }) {
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: discussions = [], isLoading } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions"],
  });

  const form = useForm<DiscussionData>({
    resolver: zodResolver(discussionSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });

  const discussionMutation = useMutation({
    mutationFn: async (data: DiscussionData) => {
      const response = await apiRequest("POST", "/api/discussions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Discussion Posted",
        description: "Your discussion has been posted successfully.",
      });
      form.reset();
      setShowNewDiscussion(false);
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Post Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/discussions/${id}/like`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/discussions/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Discussion Deleted",
        description: "Your discussion has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
    },
  });

  const onSubmit = (data: DiscussionData) => {
    discussionMutation.mutate(data);
  };

  const subjects = user?.subjects || [];
  const totalLikes = discussions.reduce((sum, d) => sum + (d.likes || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-discussions-title">Public Discussions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Ask questions and share knowledge with fellow VU students
          </p>
        </div>
        <Button onClick={() => setShowNewDiscussion(!showNewDiscussion)} data-testid="button-new-discussion">
          <Plus className="mr-2" size={16} />
          New Discussion
        </Button>
      </div>

      {showNewDiscussion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2" size={24} />
              Start New Discussion
            </CardTitle>
            <CardDescription>
              Share your questions or start a discussion on any VU topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject (Optional)</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger data-testid="select-discussion-subject">
                            <SelectValue placeholder="Select subject or leave general" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Discussion</SelectItem>
                            {subjects.map((subject: string) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <FormLabel>Discussion Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your question, experience, or start a discussion..."
                          className="min-h-[150px]"
                          data-testid="textarea-discussion-content"
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
                    onClick={() => setShowNewDiscussion(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={discussionMutation.isPending}
                    className="flex items-center"
                    data-testid="button-post-discussion"
                  >
                    {discussionMutation.isPending ? (
                      "Posting..."
                    ) : (
                      <>
                        <Send className="mr-2" size={16} />
                        Post Discussion
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Discussions</h2>
        
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-12">Loading discussions...</CardContent>
          </Card>
        ) : discussions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Discussions Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Be the first to start a discussion and help build our community!
              </p>
              <Button onClick={() => setShowNewDiscussion(true)} data-testid="button-start-first-discussion">
                Start First Discussion
              </Button>
            </CardContent>
          </Card>
        ) : (
          discussions.map((discussion) => (
            <Card key={discussion.id} data-testid={`card-discussion-${discussion.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold">VU Student</span>
                      {discussion.subject && (
                        <Badge variant="secondary" className="text-xs">
                          {discussion.subject}
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {discussion.createdAt ? formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true }) : 'Recently'}
                      </span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                      {discussion.content}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-auto"
                        onClick={() => likeMutation.mutate(discussion.id)}
                        data-testid={`button-like-${discussion.id}`}
                      >
                        <ThumbsUp className="mr-1" size={14} />
                        {discussion.likes || 0} likes
                      </Button>
                      {(discussion.userId === user?.id || user?.role === 'admin') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-auto text-red-500 hover:text-red-700"
                          onClick={() => deleteMutation.mutate(discussion.id)}
                          data-testid={`button-delete-${discussion.id}`}
                        >
                          <Trash2 className="mr-1" size={14} />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Total Discussions</p>
                <p className="text-lg font-semibold" data-testid="text-total-discussions">{discussions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ThumbsUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Total Likes</p>
                <p className="text-lg font-semibold" data-testid="text-total-likes">{totalLikes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Active Members</p>
                <p className="text-lg font-semibold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
