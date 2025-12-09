import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { GraduationCap, BookOpen, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const setupSchema = z.object({
    degreeProgram: z.string().min(1, "Please select your degree program"),
    subjects: z.array(z.string()).min(1, "Please select at least one subject"),
});

type SetupData = z.infer<typeof setupSchema>;

interface UpdateProfileFlowProps {
    user: {
        id: string;
        email?: string;
        degreeProgram?: string;
        subjects?: string[];
    };
    onPageChange?: (page: string) => void;
}

const degreePrograms = [
    { value: "BSCS", label: "BS Computer Science", emoji: "👨‍💻" },
    { value: "BSIT", label: "BS Information Technology", emoji: "🌐" },
    { value: "BSSE", label: "BS Software Engineering", emoji: "🛠️" },
    { value: "MCS", label: "MS Computer Science", emoji: "🎓" },
    { value: "MIT", label: "MS Information Technology", emoji: "🔌" },
];

const subjectsByDegreeAndSemester: Record<string, Record<number, string[]>> = {
    BSCS: {
        1: ["CS201 - Introduction to Programming", "MTH101 - Calculus I"],
        2: ["CS301 - Data Structures", "MTH102 - Calculus II"],
        3: ["CS401 - Computer Architecture", "CS301 - Data Structures"],
        4: ["CS501 - Software Engineering", "MTH601 - Operations Research"],
        5: ["MTH632 - Differential Equations", "STA630 - Research Methods"]
    },
    BSIT: {
        1: ["CS201 - Introduction to Programming", "IT101 - IT Fundamentals"],
        2: ["CS301 - Data Structures", "IT201 - Networking Basics"],
        3: ["IT430 - E-Commerce", "IT301 - Database Systems"],
        4: ["IT630 - Knowledge Management", "STA630 - Research Methods"]
    },
    BSSE: {
        1: ["CS201 - Introduction to Programming", "SE101 - Software Engineering Principles"],
        2: ["CS301 - Data Structures", "SE201 - Requirements Engineering"],
        3: ["CS501 - Software Engineering", "SE301 - Software Design"],
        4: ["CS506 - Web Design and Development", "SWE622 - Software Project Management"]
    },
    MCS: {
        1: ["CS701 - Advanced Computer Architecture", "CS702 - Advanced Algorithms"],
        2: ["CS703 - Advanced Database Systems", "STA630 - Research Methods"]
    }
};

const getAvailableSubjects = (degree: string, semester: number | null) => {
    if (!degree) return [];
    if (semester === null) {
        return Object.values(subjectsByDegreeAndSemester[degree] || {}).flat();
    }
    return subjectsByDegreeAndSemester[degree]?.[semester] || [];
};

export function UpdateProfileFlow({ user, onPageChange }: UpdateProfileFlowProps) {
    const [step, setStep] = useState(1);
    const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [, setLocation] = useLocation();

    // Handle navigation safely
    const handleNavigate = (path: string) => {
        if (onPageChange) {
            onPageChange(path);
        } else {
            setLocation(path === 'settings' ? '/dashboard' : '/dashboard');
        }
    };

    const form = useForm<SetupData>({
        resolver: zodResolver(setupSchema),
        defaultValues: {
            degreeProgram: user?.degreeProgram || "",
            subjects: user?.subjects || [],
        },
    });

    const selectedDegree = form.watch("degreeProgram");
    const selectedSubjects = form.watch("subjects") || [];
    const availableSubjects = getAvailableSubjects(selectedDegree, selectedSemester);

    const updateMutation = useMutation({
        mutationFn: async (data: SetupData) => {
            const response = await apiRequest("POST", "/api/user/setup-profile", data);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            toast({
                title: "Profile Updated",
                description: "Your academic profile has been successfully updated.",
            });
            handleNavigate("settings");
        },
        onError: (error: Error) => {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: SetupData) => {
        updateMutation.mutate(data);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => handleNavigate("settings")} className="rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Academic Profile</h1>
                        <p className="text-gray-500 dark:text-gray-400">Update your degree program and subjects</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => handleNavigate("settings")}>
                    Back to Settings
                </Button>
            </div>

            <Card className="border-border shadow-md">
                <CardHeader>
                    <CardTitle>
                        {step === 1 ? "Select Degree Program" : step === 2 ? "Select Semester (Optional)" : "Select Subjects"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1
                            ? "Choose your current degree program to see relevant subjects."
                            : step === 2
                                ? "Filter subjects by semester or skip to see all."
                                : "Select the subjects you are currently studying."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={(e) => e.preventDefault()}>
                            {step === 1 && (
                                <div className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="degreeProgram"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Degree Program</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            form.setValue("subjects", []); // Clear subjects when degree changes
                                                        }}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="h-12">
                                                            <SelectValue placeholder="Select Program" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {degreePrograms.map((degree) => (
                                                                <SelectItem key={degree.value} value={degree.value}>
                                                                    <span className="mr-2">{degree.emoji}</span> {degree.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={() => {
                                                if (selectedDegree) setStep(2);
                                                else form.trigger("degreeProgram");
                                            }}
                                            disabled={!selectedDegree}
                                            className="gap-2"
                                        >
                                            Next <ChevronRight size={16} />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {subjectsByDegreeAndSemester[selectedDegree] && Object.keys(subjectsByDegreeAndSemester[selectedDegree]).map((sem) => (
                                            <Button
                                                key={sem}
                                                variant={selectedSemester === Number(sem) ? "default" : "outline"}
                                                className="h-24 flex flex-col gap-2"
                                                onClick={() => setSelectedSemester(Number(sem))}
                                            >
                                                <span className="text-2xl">📚</span>
                                                <span>Semester {sem}</span>
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="flex justify-center">
                                        <Button variant="link" onClick={() => { setSelectedSemester(null); setStep(3); }}>
                                            Skip and show all subjects
                                        </Button>
                                    </div>

                                    <div className="flex justify-between pt-4 border-t">
                                        <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                                        <Button onClick={() => setStep(3)} className="gap-2" disabled={selectedSemester === null}>
                                            Next <ChevronRight size={16} />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="subjects"
                                        render={() => (
                                            <FormItem>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2 border rounded-md">
                                                    {availableSubjects.map((subject) => (
                                                        <FormField
                                                            key={subject}
                                                            control={form.control}
                                                            name="subjects"
                                                            render={({ field }) => (
                                                                <FormItem
                                                                    key={subject}
                                                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent transition-colors"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(subject)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, subject])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value) => value !== subject
                                                                                        )
                                                                                    )
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal cursor-pointer w-full">
                                                                        {subject}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-between pt-4 border-t">
                                        <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                                        <Button onClick={form.handleSubmit(onSubmit)} disabled={selectedSubjects.length === 0 || updateMutation.isPending} className="gap-2">
                                            {updateMutation.isPending ? "Saving..." : "Done"}
                                            <CheckCircle size={16} />
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
