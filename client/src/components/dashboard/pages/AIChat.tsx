import { useState } from "react";
import { Bot, Send, User, Sparkles, BookOpen, GraduationCap, Lightbulb, FileText, Users, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChat({ user }: { user: any }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your VU AI assistant. I can help you with questions about your courses, study tips, VU policies, and academic guidance. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('assignment') || lowerMessage.includes('homework')) {
      return 'For assignments, I recommend:\n\n1. Read the requirements carefully\n2. Break down the task into smaller parts\n3. Start early to avoid last-minute stress\n4. Use VU library resources\n5. Ask your course instructor if you need clarification\n\nWould you like specific help with any particular assignment?';
    }
    
    if (lowerMessage.includes('exam') || lowerMessage.includes('test')) {
      return 'Here are some effective exam preparation strategies:\n\n📚 Create a study schedule\n📝 Practice past papers\n🎯 Focus on key concepts\n👥 Form study groups\n💤 Get adequate sleep\n\nWhich subject are you preparing for? I can provide more specific guidance.';
    }
    
    if (lowerMessage.includes('gdb') || lowerMessage.includes('discussion board')) {
      return 'For GDB (Graded Discussion Board) success:\n\n✅ Participate early and regularly\n✅ Provide thoughtful, detailed responses\n✅ Support your points with examples\n✅ Engage respectfully with classmates\n✅ Follow the discussion guidelines\n\nNeed help with a specific GDB topic?';
    }
    
    if (lowerMessage.includes('programming') || lowerMessage.includes('code')) {
      return 'Programming tips for VU students:\n\n💻 Practice coding daily\n📖 Read course materials thoroughly\n🔍 Debug systematically\n📚 Use online resources like VU\'s LMS\n👥 Join programming study groups\n\nWhat programming language or concept do you need help with?';
    }
    
    return 'I understand you\'re asking about VU-related topics. As your AI assistant, I can help with:\n\n📚 Study strategies and tips\n📝 Assignment guidance\n🎯 Exam preparation\n💬 GDB participation\n📖 Course-specific questions\n🎓 Academic planning\n\nCould you please be more specific about what you\'d like help with?';
  };

  const suggestedQuestions = [
    { icon: Clock, text: "How do I prepare for midterm exams?" },
    { icon: Lightbulb, text: "What are some effective study techniques?" },
    { icon: Users, text: "How should I approach GDB discussions?" },
    { icon: Zap, text: "Tips for managing multiple assignments?" },
    { icon: FileText, text: "How to improve programming skills?" }
  ];

  const capabilities = [
    { icon: BookOpen, title: "Study Strategies", description: "Tips and techniques for effective learning", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
    { icon: FileText, title: "Assignments", description: "Guidance on homework and projects", color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
    { icon: GraduationCap, title: "Exams", description: "Preparation strategies and tips", color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" },
    { icon: Users, title: "GDB Help", description: "Discussion board strategies", color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" },
    { icon: Lightbulb, title: "Concepts", description: "Explain complex topics clearly", color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
    { icon: Zap, title: "Time Management", description: "Plan your academic schedule", color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 dark:from-purple-700 dark:via-purple-600 dark:to-pink-600 p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-4xl font-bold">AI Q&A Assistant</h1>
              </div>
              <p className="text-purple-100 mt-2 text-lg">
                Your smart learning companion for VU success
              </p>
            </div>
            <Badge className="bg-white text-purple-600 hover:bg-purple-50 text-base px-4 py-2">
              <Sparkles className="mr-2" size={16} />
              Powered by AI
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b dark:border-gray-700 pb-4">
              <CardTitle className="flex items-center text-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg mr-3">
                  <Bot className="text-purple-600 dark:text-purple-300" size={20} />
                </div>
                VU AI Assistant
              </CardTitle>
              <CardDescription className="mt-2">
                Ask me anything about your courses, studies, and academic goals
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col bg-white dark:bg-gray-900">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-end space-x-3 ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        {message.role === 'user' ? (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <User size={18} />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            <Bot size={18} />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div
                          className={`inline-block p-4 rounded-2xl shadow-sm max-w-[85%] ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none'
                              : 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-end space-x-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          <Bot size={18} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-200 dark:border-gray-600">
                        <div className="flex space-x-1">
                          <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything... (Shift+Enter for new line)"
                  className="flex-1 min-h-[50px] max-h-[100px] rounded-lg resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  data-testid="input-ai-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 h-[50px] rounded-lg shadow-md"
                  data-testid="button-send-ai-message"
                >
                  <Send size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b dark:border-gray-700">
              <CardTitle className="flex items-center text-lg">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                Quick Questions
              </CardTitle>
              <CardDescription className="mt-1">
                Click to explore topics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {suggestedQuestions.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full text-left justify-start h-auto p-3 whitespace-normal hover:bg-purple-50 dark:hover:bg-purple-900/20 border-gray-200 dark:border-gray-700 group transition-all"
                      onClick={() => setInputMessage(item.text)}
                      data-testid={`button-question-${index}`}
                    >
                      <Icon className="w-4 h-4 mr-3 flex-shrink-0 text-purple-600 dark:text-purple-400 group-hover:text-purple-700" />
                      <span className="text-sm">{item.text}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Capabilities Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              I Can Help With
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {capabilities.map((cap, index) => {
                const Icon = cap.icon;
                return (
                  <Card key={index} className={`border shadow-sm cursor-pointer hover:shadow-md hover:scale-105 transition-all ${cap.color}`}>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      </div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{cap.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{cap.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Usage Stats */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b dark:border-gray-700">
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                Session Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Questions Asked</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{messages.filter(m => m.role === 'user').length - 1}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Answers Received</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">{messages.filter(m => m.role === 'assistant').length - 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
