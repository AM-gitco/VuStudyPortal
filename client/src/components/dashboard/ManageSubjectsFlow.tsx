import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { BookOpen, CheckCircle, ChevronLeft, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import subjectData from "@/data/subjects.json";

// ==================== Schema & Types ====================
const subjectSchema = z.object({
    subjects: z.array(z.string()).min(1, "Please select at least one subject"),
});

type SubjectData = z.infer<typeof subjectSchema>;

export interface ManageSubjectsFlowProps {
    user: {
        id: string;
        email?: string;
        degreeProgram?: string;
        subjects?: string[];
        isVerified?: boolean;
    };
    onPageChange: (page: string) => void;
}

// ==================== Helper Functions ====================
const getEmojiForSubject = (subject: string) => {
    const keywords = Object.keys(subjectData.subjectEmojis);
    for (const keyword of keywords) {
        if (subject.includes(keyword)) {
            return (subjectData.subjectEmojis as Record<string, string>)[keyword];
        }
    }
    return "📚";
};

// ==================== Main Component ====================
export function ManageSubjectsFlow({ user, onPageChange }: ManageSubjectsFlowProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showSuccess, setShowSuccess] = useState(false);

    // Get user's degree details
    const userDegree = user.degreeProgram || "";
    const degreeInfo = subjectData.degreePrograms.find(d => d.value === userDegree);

    // Get all available subjects for this degree, grouped by semester
    const semesterSubjects = (subjectData.subjectsByDegreeAndSemester as Record<string, Record<string, string[]>>)[userDegree] || {};
    const hasSubjects = Object.keys(semesterSubjects).length > 0;

    const form = useForm<SubjectData>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            subjects: user.subjects || [],
        },
    });

    const selectedSubjects = form.watch("subjects") || [];

    const updateSubjectsMutation = useMutation({
        mutationFn: async (data: SubjectData) => {
            // We only update subjects, preserving the degree
            const payload = {
                degreeProgram: userDegree,
                subjects: data.subjects
            };
            const response = await apiRequest("POST", "/api/user/setup-profile", payload);
            return response.json();
        },
        onSuccess: () => {
            setShowSuccess(true);
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            toast({
                title: "Subjects Updated",
                description: "Your subject selection has been saved successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: SubjectData) => {
        updateSubjectsMutation.mutate(data);
    };

    if (showSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] animate-fade-in">
                <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={48} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                    Your subjects have been updated successfully based on your <strong>{degreeInfo?.label || userDegree}</strong> program.
                </p>
                <Button
                    onClick={() => onPageChange('subjects')}
                    className="px-8"
                >
                    Go to My Subjects
                </Button>
            </div>
        );
    }

    if (!userDegree || !hasSubjects) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Profile Incomplete</AlertTitle>
                    <AlertDescription>
                        You haven't selected a degree program yet. Please complete your profile setup first.
                    </AlertDescription>
                </Alert>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => onPageChange('setup-profile')}
                >
                    Go to Profile Setup
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => onPageChange('subjects')}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Subjects</h1>
                    <p className="text-muted-foreground">
                        Select subjects for your {degreeInfo?.label || userDegree} degree.
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <span className="text-2xl mr-2">{degreeInfo?.emoji || "🎓"}</span>
                                Available Subjects
                            </CardTitle>
                            <CardDescription>
                                Check the subjects you want to enroll in for this semester.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[60vh] pr-4">
                                <div className="space-y-8">
                                    {Object.entries(semesterSubjects).map(([semester, subjects]) => (
                                        <div key={semester} className="space-y-4">
                                            <h3 className="font-semibold text-lg border-b pb-2 flex items-center text-primary">
                                                <BookOpen className="mr-2 h-4 w-4" />
                                                Semester {semester}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {subjects.map((subject) => {
                                                    const [code, ...nameParts] = subject.split(' - ');
                                                    const name = nameParts.join(' - ');
                                                    const emoji = getEmojiForSubject(subject);
                                                    const isSelected = selectedSubjects.includes(subject);

                                                    return (
                                                        <FormField
                                                            key={subject}
                                                            control={form.control}
                                                            name="subjects"
                                                            render={({ field }) => (
                                                                <FormItem
                                                                    className={`
                                    flex flex-row items-start space-x-3 space-y-0 p-4 rounded-lg border transition-all duration-200 cursor-pointer
                                    ${isSelected
                                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                                            : "border-border hover:border-primary/50 hover:bg-muted/50"}
                                  `}
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(subject)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, subject])
                                                                                    : field.onChange(
                                                                                        field.value?.filter((value) => value !== subject)
                                                                                    )
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none flex-1">
                                                                        <FormLabel className="flex items-center justify-between font-medium cursor-pointer">
                                                                            <span>{code}</span>
                                                                            <span className="text-xl">{emoji}</span>
                                                                        </FormLabel>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {name}
                                                                        </p>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-6">
                            <div className="text-sm text-muted-foreground">
                                {selectedSubjects.length} subject(s) selected
                            </div>
                            <div className="flex space-x-4">
                                <Button type="button" variant="outline" onClick={() => onPageChange('subjects')}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updateSubjectsMutation.isPending}>
                                    {updateSubjectsMutation.isPending && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    )}
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
