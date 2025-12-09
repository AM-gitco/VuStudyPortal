import { useState } from "react";
import { BookOpen, Check, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    semester: number;
    description: string;
}

const AVAILABLE_COURSES: Course[] = [
    { id: "cs101", code: "CS101", name: "Introduction to Computing", credits: 3, semester: 1, description: "Basic concepts of computer systems, hardware, and software." },
    { id: "cs201", code: "CS201", name: "Introduction to Programming", credits: 3, semester: 2, description: "Fundamentals of C++ programming language." },
    { id: "cs301", code: "CS301", name: "Data Structures", credits: 3, semester: 3, description: "Advanced data organization and algorithms." },
    { id: "cs302", code: "CS302", name: "Digital Logic Design", credits: 3, semester: 3, description: "Boolean algebra, logic gates, and circuit design." },
    { id: "cs304", code: "CS304", name: "Object Oriented Programming", credits: 3, semester: 3, description: "OOP concepts using C++." },
    { id: "mth101", code: "MTH101", name: "Calculus and Analytical Geometry", credits: 3, semester: 1, description: "Limits, derivatives, and integrals." },
    { id: "eng101", code: "ENG101", name: "English Comprehension", credits: 3, semester: 1, description: "Improving reading and writing skills." },
    { id: "phy101", code: "PHY101", name: "Physics", credits: 3, semester: 1, description: "Mechanics, waves, and thermodynamics." },
    { id: "mgt211", code: "MGT211", name: "Introduction to Business", credits: 3, semester: 2, description: "Basics of business management." },
];

export function CourseSelection({ user, onPageChange }: { user: any; onPageChange: (page: string) => void }) {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourses, setSelectedCourses] = useState<string[]>(user?.subjects || []);

    const updateProfileMutation = useMutation({
        mutationFn: async (courses: string[]) => {
            // Logic to update user subjects would go here. 
            // Since we don't have a direct endpoint for JUST subjects in the snippet, we might use updateUserProfile
            const res = await apiRequest("POST", "/api/user/profile", {
                degreeProgram: user.degreeProgram || "BSCS", // Preserve existing or default
                subjects: courses
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            toast({
                title: "Courses Updated",
                description: "Your course selection has been saved successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Update Failed",
                description: "Could not save course selection. Please try again.",
                variant: "destructive",
            });
        }
    });

    const toggleCourse = (courseCode: string) => {
        if (selectedCourses.includes(courseCode)) {
            setSelectedCourses(prev => prev.filter(c => c !== courseCode));
        } else {
            setSelectedCourses(prev => [...prev, courseCode]);
        }
    };

    const handleSave = () => {
        updateProfileMutation.mutate(selectedCourses);
    };

    const filteredCourses = AVAILABLE_COURSES.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Course Selection</h1>
                    <p className="text-muted-foreground mt-1">Manage your enrolled subjects for the current semester</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => onPageChange('subjects')}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={updateProfileMutation.isPending} className="min-w-[100px]">
                        {updateProfileMutation.isPending ? "Saving..." : "Save Selection"}
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses by code or name..."
                        className="pl-9 bg-background border-border/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map(course => {
                    const isSelected = selectedCourses.includes(course.code);
                    return (
                        <Card
                            key={course.id}
                            className={`cursor-pointer transition-all duration-200 border-2 ${isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-border/50 hover:border-primary/50 text-muted-foreground'
                                }`}
                            onClick={() => toggleCourse(course.code)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant={isSelected ? "default" : "outline"} className="text-xs font-bold">
                                        {course.code}
                                    </Badge>
                                    {isSelected && <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center"><Check size={14} /></div>}
                                </div>
                                <CardTitle className={`text-lg mt-2 ${isSelected ? 'text-primary' : 'text-foreground'}`}>{course.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">{course.description}</p>
                                <div className="flex gap-2 mt-4 text-xs font-medium text-muted-foreground">
                                    <span className="bg-background px-2 py-1 rounded border border-border/50">{course.credits} Credits</span>
                                    <span className="bg-background px-2 py-1 rounded border border-border/50">Sem {course.semester}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
