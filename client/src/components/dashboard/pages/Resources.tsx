import { FileText, Download, Star, Filter, Search, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Resource {
  id: string;
  title: string;
  description: string;
  subject: string;
  type: string;
  size: string;
  rating: number;
  downloads: number;
  uploadedBy: string;
  uploadedDate: string;
}

interface ResourcesProps {
  user: any;
  onPageChange?: (page: string) => void;
}

export function Resources({ user, onPageChange }: ResourcesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Check if user has subjects
  const userSubjects = user?.subjects || [];
  const hasSubjects = userSubjects.length > 0;

  const mockResources: Resource[] = [
    {
      id: "1",
      title: "Data Structures Complete Guide",
      description: "Comprehensive guide covering arrays, linked lists, stacks, queues, trees, and graphs",
      subject: "CS201",
      type: "PDF",
      size: "15.2 MB",
      rating: 4.8,
      downloads: 234,
      uploadedBy: "Dr. Ahmed",
      uploadedDate: "2024-11-20"
    },
    {
      id: "2",
      title: "Linear Algebra Solved Problems",
      description: "200+ solved problems on matrices, determinants, and linear transformations",
      subject: "MTH601",
      type: "PDF",
      size: "8.5 MB",
      rating: 4.6,
      downloads: 189,
      uploadedBy: "Dr. Fatima",
      uploadedDate: "2024-11-18"
    },
    {
      id: "3",
      title: "Web Development Course Notes",
      description: "Complete notes from HTML, CSS, JavaScript to React and backend frameworks",
      subject: "CS301",
      type: "PDF",
      size: "22.8 MB",
      rating: 4.9,
      downloads: 456,
      uploadedBy: "Prof. Hassan",
      uploadedDate: "2024-11-15"
    },
    {
      id: "4",
      title: "Calculus Formula Sheet",
      description: "Quick reference guide for all calculus formulas and derivatives",
      subject: "MTH601",
      type: "PDF",
      size: "3.2 MB",
      rating: 4.7,
      downloads: 512,
      uploadedBy: "Dr. Aisha",
      uploadedDate: "2024-11-10"
    },
    {
      id: "5",
      title: "Database Design Patterns",
      description: "Advanced SQL patterns and optimization techniques for large-scale databases",
      subject: "CS201",
      type: "PDF",
      size: "18.9 MB",
      rating: 4.5,
      downloads: 178,
      uploadedBy: "Dr. Karim",
      uploadedDate: "2024-11-08"
    },
    {
      id: "6",
      title: "Discrete Mathematics Tutorial",
      description: "Tutorial covering set theory, logic, combinatorics, and graph theory",
      subject: "MTH601",
      type: "PDF",
      size: "12.4 MB",
      rating: 4.4,
      downloads: 145,
      uploadedBy: "Prof. Zainab",
      uploadedDate: "2024-11-05"
    }
  ];

  // Extract subject codes from user subjects
  const getUserSubjectCodes = (): string[] => {
    return userSubjects.map((subject: string) => {
      const match = subject.match(/^([A-Z]{2,4}\d{3})/);
      return match ? match[1] : subject.substring(0, 6);
    });
  };

  const userSubjectCodes = getUserSubjectCodes();
  const subjects = ["all", ...userSubjectCodes];
  const types = ["all", "PDF", "Video", "Presentation", "Code", "Document"];

  const filteredResources = mockResources.filter(resource => {
    // Only show resources for user's subjects
    if (!userSubjectCodes.includes(resource.subject)) return false;

    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || resource.subject === selectedSubject;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    
    return matchesSearch && matchesSubject && matchesType;
  });

  // Show no subjects message
  if (!hasSubjects) {
    return (
      <div className="space-y-4 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Resources</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Access learning materials for your courses
            </p>
          </div>
          <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 flex-shrink-0" />
        </div>

        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="text-center py-12 sm:py-16">
            <BookOpen className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Subjects Selected
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              Please select your subjects first to access course resources and materials.
            </p>
            <Button 
              size="lg" 
              className="text-sm sm:text-base"
              onClick={() => onPageChange?.('subjects')}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Go to My Subjects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Resources</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredResources.length} resources available
          </p>
        </div>
        <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 flex-shrink-0" />
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm h-9"
            />
          </div>
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject === "all" ? "All Subjects" : subject}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          {types.map(type => (
            <option key={type} value={type}>
              {type === "all" ? "All Types" : type}
            </option>
          ))}
        </select>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <FileText className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No Resources Found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Try adjusting your search filters or check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredResources.map(resource => (
            <Card key={resource.id} className="hover:shadow-md dark:hover:shadow-gray-800/50 transition-shadow flex flex-col border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{resource.subject}</Badge>
                      <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                    </div>
                    <CardTitle className="text-sm line-clamp-2">{resource.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                <CardDescription className="line-clamp-2 text-xs">
                  {resource.description}
                </CardDescription>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="space-y-1">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Size</p>
                    <p className="text-gray-900 dark:text-white font-semibold">{resource.size}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Downloads</p>
                    <p className="text-gray-900 dark:text-white font-semibold">{resource.downloads}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Rating</p>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <p className="text-gray-900 dark:text-white font-semibold">{resource.rating}</p>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
                  <p>By <span className="font-semibold text-gray-700 dark:text-gray-300">{resource.uploadedBy}</span></p>
                  <p>{new Date(resource.uploadedDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</p>
                </div>

                {/* Action Button */}
                <Button size="sm" className="w-full h-8 text-xs">
                  <Download className="mr-1 h-3 w-3" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredResources.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{mockResources.length}</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Subjects</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">3</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Downloads</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">1.7K</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Avg Rating</p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">4.6</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
