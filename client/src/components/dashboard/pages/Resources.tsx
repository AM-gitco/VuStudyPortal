import { FileText, Download, Star, Filter, Search, BookOpen } from "lucide-react";
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

export function Resources({ user }: { user: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

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

  const subjects = ["all", "CS201", "CS301", "MTH601"];
  const types = ["all", "PDF", "Video", "Presentation", "Code", "Document"];

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || resource.subject === selectedSubject;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    
    return matchesSearch && matchesSubject && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resources Library</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {filteredResources.length} resources available
          </p>
        </div>
        <BookOpen className="h-12 w-12 text-blue-500" />
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Resources Found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search filters or check back later for more resources.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{resource.subject}</Badge>
                      <Badge variant="outline">{resource.type}</Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <CardDescription className="line-clamp-2">
                  {resource.description}
                </CardDescription>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Size</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{resource.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Downloads</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{resource.downloads}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <p className="font-semibold text-gray-900 dark:text-white">{resource.rating}</p>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-3">
                  <p>Uploaded by <span className="font-semibold text-gray-700 dark:text-gray-300">{resource.uploadedBy}</span></p>
                  <p>{new Date(resource.uploadedDate).toLocaleDateString()}</p>
                </div>

                {/* Action Button */}
                <Button size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Resource
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredResources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockResources.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Subjects Covered</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1.7K</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Rating</p>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4.6</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
