import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { FileCheck, Send, AlertCircle, ThumbsUp, Users, Clock, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Solution } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

const solutionSchema = z.object({
  subject: z.string().min(1, "Please select a subject"),
  solutionType: z.string().min(1, "Please select solution type"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  textContent: z.string().min(1, "Solution content is required"),
});

type SolutionData = z.infer<typeof solutionSchema>;

const solutionTypes = [
  { value: "assignment", label: "Assignment Solution" },
  { value: "gdb", label: "GDB Solution" },
  { value: "quiz", label: "Quiz Solution" },
];

export function Solutions({ user }: { user: any }) {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: solutions = [], isLoading } = useQuery<Solution[]>({
    queryKey: ["/api/solutions"],
  });

  const { data: mySolutions = [] } = useQuery<Solution[]>({
    queryKey: ["/api/solutions/my"],
  });

  const form = useForm<SolutionData>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      subject: "",
      solutionType: "",
      title: "",
      description: "",
      textContent: "",
    },
  });

  const solutionMutation = useMutation({
    mutationFn: async (data: SolutionData) => {
      const response = await apiRequest("POST", "/api/solutions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solution Submitted",
        description: "Your solution has been submitted for admin approval.",
      });
      form.reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/solutions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/solutions/my"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/solutions/${id}/vote`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/solutions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/solutions/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solution Deleted",
        description: "Your solution has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/solutions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/solutions/my"] });
    },
  });

  const onSubmit = (data: SolutionData) => {
    solutionMutation.mutate(data);
  };

  const subjects = user?.subjects || [];
  const totalVotes = solutions.reduce((sum, s) => sum + (s.helpfulVotes || 0), 0);

  const getSolutionTypeLabel = (value: string) => {
    return solutionTypes.find(t => t.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-solutions-title">Assignment & GDB Solutions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Share your solutions to help fellow VU students
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} data-testid="button-submit-solution">
          <FileCheck className="mr-2" size={16} />
          Submit Solution
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Submit your assignment and GDB solutions to help other students. All submissions require admin approval.
          Solutions with helpful votes will earn you community badges!
        </AlertDescription>
      </Alert>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="mr-2" size={24} />
              Submit Your Solution
            </CardTitle>
            <CardDescription>
              Share your assignment or GDB solution with detailed explanation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger data-testid="select-solution-subject">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.length > 0 ? (
                                subjects.map((subject: string) => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="general">General</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="solutionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Solution Type</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger data-testid="select-solution-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {solutionTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solution Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Assignment 1 Solution - Data Structures"
                          data-testid="input-solution-title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="textContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solution Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide your complete solution with step-by-step explanation..."
                          className="min-h-[300px]"
                          data-testid="textarea-solution-content"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes or tips for other students..."
                          data-testid="textarea-solution-notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={solutionMutation.isPending}
                    className="flex items-center"
                    data-testid="button-submit-solution-form"
                  >
                    {solutionMutation.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2" size={16} />
                        Submit Solution
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Community Solutions</CardTitle>
          <CardDescription>
            Browse solutions shared by fellow VU students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading solutions...</div>
          ) : solutions.filter(s => s.isApproved).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No approved solutions available yet. Be the first to share your solution!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {solutions.filter(s => s.isApproved).map((solution) => (
                <div 
                  key={solution.id} 
                  className="p-4 border rounded-lg dark:border-gray-700"
                  data-testid={`card-solution-${solution.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{solution.title}</h4>
                        <Badge variant="outline">{solution.subject}</Badge>
                        <Badge variant="secondary">{getSolutionTypeLabel(solution.solutionType)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
                        {solution.textContent}
                      </p>
                      {solution.description && (
                        <p className="text-xs text-gray-500 mt-2">{solution.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => voteMutation.mutate(solution.id)}
                          data-testid={`button-vote-${solution.id}`}
                        >
                          <ThumbsUp className="mr-1" size={14} />
                          {solution.helpfulVotes || 0} helpful
                        </Button>
                        <span className="text-xs text-gray-500">
                          {solution.createdAt ? formatDistanceToNow(new Date(solution.createdAt), { addSuffix: true }) : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {mySolutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Submissions</CardTitle>
            <CardDescription>Track the status of your submitted solutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mySolutions.map((solution) => (
                <div 
                  key={solution.id} 
                  className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700"
                  data-testid={`card-my-solution-${solution.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{solution.title}</h4>
                      <Badge variant="outline">{solution.subject}</Badge>
                      <Badge variant="secondary">{getSolutionTypeLabel(solution.solutionType)}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {solution.helpfulVotes || 0} helpful votes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {solution.isApproved ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="mr-1" size={14} />
                        Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock className="mr-1" size={14} />
                        Pending
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteMutation.mutate(solution.id)}
                      data-testid={`button-delete-solution-${solution.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Total Solutions</p>
                <p className="text-lg font-semibold" data-testid="text-total-solutions">{solutions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ThumbsUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Helpful Votes</p>
                <p className="text-lg font-semibold" data-testid="text-total-votes">{totalVotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Contributors</p>
                <p className="text-lg font-semibold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
