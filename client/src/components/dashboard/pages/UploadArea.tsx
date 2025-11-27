import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Upload, FileText, Link, Send, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Upload as UploadType } from "@shared/schema";

const uploadSchema = z.object({
  subject: z.string().min(1, "Please select a subject"),
  uploadType: z.string().min(1, "Please select upload type"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  textContent: z.string().optional(),
  externalLink: z.string().url().optional().or(z.literal("")),
});

type UploadData = z.infer<typeof uploadSchema>;

const uploadTypes = [
  { value: "handout", label: "Handout" },
  { value: "notes", label: "Notes" },
  { value: "guide", label: "Study Guide" },
  { value: "past_paper", label: "Past Paper" },
  { value: "guess_paper", label: "Guess Paper" },
];

export function UploadArea({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("text");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: myUploads = [], isLoading } = useQuery<UploadType[]>({
    queryKey: ["/api/uploads/my"],
  });

  const form = useForm<UploadData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      subject: "",
      uploadType: "",
      title: "",
      description: "",
      textContent: "",
      externalLink: "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadData) => {
      const response = await apiRequest("POST", "/api/uploads", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Submitted",
        description: "Your upload has been submitted for admin approval.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/uploads/my"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UploadData) => {
    uploadMutation.mutate(data);
  };

  const subjects = user?.subjects || [];

  const getUploadTypeLabel = (value: string) => {
    return uploadTypes.find(t => t.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-upload-title">Upload Area</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Share your study materials with fellow VU students
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
          Admin Approval Required
        </Badge>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          All uploads require admin approval before becoming publicly available. 
          Make sure to select the correct subject and provide accurate descriptions.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2" size={24} />
            Upload Study Material
          </CardTitle>
          <CardDescription>
            Choose how you want to share your content: write text or share a link
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
                          <SelectTrigger data-testid="select-subject">
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
                  name="uploadType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger data-testid="select-upload-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {uploadTypes.map((type) => (
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
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a descriptive title for your upload"
                        data-testid="input-title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text" className="flex items-center" data-testid="tab-text">
                      <FileText className="mr-2" size={16} />
                      Text Content
                    </TabsTrigger>
                    <TabsTrigger value="link" className="flex items-center" data-testid="tab-link">
                      <Link className="mr-2" size={16} />
                      External Link
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text">
                    <FormField
                      control={form.control}
                      name="textContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write your content here..."
                              className="min-h-[200px]"
                              data-testid="textarea-content"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="link">
                    <FormField
                      control={form.control}
                      name="externalLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>External Link</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/resource"
                              data-testid="input-external-link"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional details about your upload..."
                        data-testid="textarea-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="flex items-center"
                  data-testid="button-submit-upload"
                >
                  {uploadMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="mr-2" size={16} />
                      Submit for Approval
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Recent Uploads</CardTitle>
          <CardDescription>
            Track the status of your submitted materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : myUploads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Upload className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No uploads yet. Submit your first material above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myUploads.map((upload) => (
                <div 
                  key={upload.id} 
                  className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700"
                  data-testid={`card-upload-${upload.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{upload.title}</h4>
                      <Badge variant="outline">{upload.subject}</Badge>
                      <Badge variant="secondary">{getUploadTypeLabel(upload.uploadType)}</Badge>
                    </div>
                    {upload.description && (
                      <p className="text-sm text-gray-500 mt-1">{upload.description}</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    {upload.isApproved ? (
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
