import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { GraduationCap, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const setupSchema = z.object({
  degreeProgram: z.string().min(1, "Please select your degree program"),
  subjects: z.array(z.string()).min(1, "Please select at least one subject"),
});

type SetupData = z.infer<typeof setupSchema>;

interface SetupProfileProps {
  user: any;
}

const degreePrograms = [
  { value: "BSCS", label: "BS Computer Science" },
  { value: "BSIT", label: "BS Information Technology" },
  { value: "BSSE", label: "BS Software Engineering" },
  { value: "MCS", label: "MS Computer Science" },
  { value: "MIT", label: "MS Information Technology" },
  { value: "MBA", label: "Master of Business Administration" },
  { value: "BBA", label: "Bachelor of Business Administration" },
  { value: "BSPHY", label: "BS Physics" },
  { value: "BSMATH", label: "BS Mathematics" },
];

const subjectsByDegree: Record<string, string[]> = {
  BSCS: [
    "CS201 - Introduction to Programming",
    "CS301 - Data Structures",
    "CS401 - Computer Architecture",
    "CS501 - Software Engineering",
    "MTH601 - Operations Research",
    "MTH632 - Differential Equations",
    "STA630 - Research Methods",
  ],
  BSIT: [
    "CS201 - Introduction to Programming",
    "CS301 - Data Structures", 
    "IT430 - E-Commerce",
    "IT630 - Knowledge Management",
    "STA630 - Research Methods",
  ],
  BSSE: [
    "CS201 - Introduction to Programming",
    "CS301 - Data Structures",
    "CS501 - Software Engineering",
    "CS506 - Web Design and Development",
    "SWE622 - Software Project Management",
  ],
  MCS: [
    "CS701 - Advanced Computer Architecture",
    "CS702 - Advanced Algorithms",
    "CS703 - Advanced Database Systems",
    "STA630 - Research Methods",
  ],
  // Add more degree-specific subjects as needed
};

export function SetupProfile({ user }: SetupProfileProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SetupData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      degreeProgram: "",
      subjects: [],
    },
  });

  const selectedDegree = form.watch("degreeProgram");
  const availableSubjects = selectedDegree ? subjectsByDegree[selectedDegree] || [] : [];

  const setupMutation = useMutation({
    mutationFn: async (data: SetupData) => {
      const response = await apiRequest("POST", "/api/user/setup-profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Setup Complete",
        description: "Welcome to VU Portal! You can now access all features.",
      });
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SetupData) => {
    setupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <CardTitle className="text-2xl">Welcome to VU Portal!</CardTitle>
          <CardDescription>
            Let's set up your profile to personalize your experience
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Degree Program */}
              <div className={`transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-50'}`}>
                <FormField
                  control={form.control}
                  name="degreeProgram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        🎓 Select Your Degree Program
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Choose your degree program" />
                          </SelectTrigger>
                          <SelectContent>
                            {degreePrograms.map((degree) => (
                              <SelectItem key={degree.value} value={degree.value}>
                                {degree.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedDegree && (
                  <div className="mt-6">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full"
                      size="lg"
                    >
                      Next: Select Subjects
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 2: Subjects */}
              {selectedDegree && (
                <div className={`transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-50'}`}>
                  <FormField
                    control={form.control}
                    name="subjects"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center">
                          <BookOpen className="mr-2" size={20} />
                          📚 Select Your Subjects
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto p-4 border rounded-lg">
                            {availableSubjects.map((subject) => (
                              <FormField
                                key={subject}
                                control={form.control}
                                name="subjects"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(subject)}
                                        onCheckedChange={(checked) => {
                                          const updatedValues = checked
                                            ? [...(field.value || []), subject]
                                            : field.value?.filter((value) => value !== subject) || [];
                                          field.onChange(updatedValues);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {subject}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={setupMutation.isPending}
                      className="flex-1"
                      size="lg"
                    >
                      {setupMutation.isPending ? (
                        "Setting up..."
                      ) : (
                        <>
                          <CheckCircle className="mr-2" size={20} />
                          Complete Setup
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}