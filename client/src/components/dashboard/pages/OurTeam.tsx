import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Heart, Code, BookOpen, Mail, MessageCircle } from "lucide-react";

interface OurTeamProps {
  user: any;
}

const communityStats = [
  { label: "Active Students", value: "1,000+", icon: Users },
  { label: "Resources Shared", value: "500+", icon: BookOpen },
  { label: "Questions Answered", value: "2,000+", icon: Heart },
];

export function OurTeam({ user }: OurTeamProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Our Team & Community</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Meet the team behind VU Portal and join our community
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {communityStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Icon className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={20} className="text-blue-600" />
            About VU Portal
          </CardTitle>
          <CardDescription>
            A student-built platform for Virtual University of Pakistan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            VU Portal is created by students, for students. Our mission is to make academic 
            resources more accessible and help VU students succeed in their studies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Our Mission</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                To provide free, quality educational resources and support to all VU students.
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Our Values</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Collaboration, accessibility, and academic integrity in everything we do.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Join Community */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} className="text-green-600" />
            Join Our Community
          </CardTitle>
          <CardDescription>
            Connect with fellow VU students and get help
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">WhatsApp Community</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Join our WhatsApp group for instant help and updates.
              </p>
              <Button variant="outline" className="w-full">
                Join WhatsApp
              </Button>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                <Mail className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Have questions? Reach out to our support team.
              </p>
              <Button variant="outline" className="w-full">
                Contact Us
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributors */}
      <Card>
        <CardHeader>
          <CardTitle>Contributors</CardTitle>
          <CardDescription>
            Special thanks to all who help make this platform better
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Top Uploaders</Badge>
            <Badge variant="secondary">Discussion Leaders</Badge>
            <Badge variant="secondary">Solution Contributors</Badge>
            <Badge variant="secondary">Bug Reporters</Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Want to contribute? Start by sharing resources, helping others in discussions, 
            or reporting issues you find.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
