import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, BookOpen, GraduationCap, Lightbulb, FileText, Users, Zap, Clock, MessageSquare, ArrowDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleScroll = (e: any) => {
    const container = e.target;
    const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollButton(!isBottom);
  };

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
    { icon: BookOpen, title: "Study Strategies", description: "Tips and techniques", color: "from-blue-500 to-cyan-500" },
    { icon: FileText, title: "Assignments", description: "Homework guidance", color: "from-green-500 to-emerald-500" },
    { icon: GraduationCap, title: "Exams", description: "Preparation tips", color: "from-purple-500 to-pink-500" },
    { icon: Users, title: "GDB Help", description: "Discussion board", color: "from-orange-500 to-red-500" },
    { icon: Lightbulb, title: "Concepts", description: "Explain topics", color: "from-amber-500 to-yellow-500" },
    { icon: Zap, title: "Time Mgmt", description: "Schedule planning", color: "from-indigo-500 to-purple-500" }
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 dark:from-purple-700 dark:via-blue-700 dark:to-cyan-600 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur rounded-xl border border-white/30">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">AI Learning Assistant</h1>
                  <p className="text-white/80 mt-1">Your 24/7 academic companion</p>
                </div>
              </div>
            </div>
            <Badge className="bg-white/20 backdrop-blur text-white border border-white/30 text-base px-4 py-2 rounded-full hover:bg-white/30 transition-all">
              <Sparkles className="mr-2" size={16} />
              Powered by AI
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 flex flex-col max-h-[750px] overflow-y-auto chat-scrollbar">
          {/* Chat Container */}
          <Card className="flex-1 flex flex-col shadow-2xl border-0 bg-white dark:bg-gray-900/50 backdrop-blur">
            {/* Chat Header */}
            <CardHeader className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 border-b dark:border-gray-700 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg">
                    <Bot className="text-white" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      VU AI Assistant
                      <span className="inline-flex h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                    </CardTitle>
                    <CardDescription className="mt-0.5">Ready to help with your studies</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Chat Messages Area */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-white via-white to-gray-50/50 dark:from-gray-900/50 dark:via-gray-900/50 dark:to-gray-800/50 scroll-smooth chat-scrollbar"
              style={{
                scrollBehavior: 'smooth'
              }}
              data-testid="chat-messages-container"
            >
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-10 w-10 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-cyan-600 text-white font-bold">
                        <Bot size={20} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex flex-col gap-2 max-w-xs lg:max-w-md ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-5 py-4 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <time className={`text-xs text-gray-500 dark:text-gray-400 px-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-10 w-10 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold">
                        <User size={20} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 items-start">
                  <Avatar className="h-10 w-10 flex-shrink-0 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-cyan-600 text-white font-bold">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white dark:bg-gray-800 px-5 py-4 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-md">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll Down Button */}
            {showScrollButton && (
              <div className="flex justify-center p-2 bg-gradient-to-t from-white via-white dark:from-gray-900/50 dark:via-gray-900/50">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={scrollToBottom}
                  className="rounded-full px-3 py-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all"
                  data-testid="button-scroll-down"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Input Area */}
            <CardContent className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-700">
              <div className="flex gap-3">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything... (Shift+Enter for new line)"
                  className="flex-1 min-h-[52px] max-h-[120px] rounded-xl resize-none border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 bg-gray-50 dark:bg-gray-800 transition-all"
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
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-5 h-[52px] rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-send-ai-message"
                >
                  <Send size={22} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6 flex flex-col">
          {/* Quick Questions Card */}
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-900/50 backdrop-blur overflow-hidden hover:shadow-2xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5" />
                Quick Questions
              </CardTitle>
              <CardDescription className="text-blue-100 mt-1">
                Start a conversation
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {suggestedQuestions.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full text-left justify-start h-auto p-3 whitespace-normal hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group border border-transparent hover:border-blue-200 dark:hover:border-blue-800 rounded-lg"
                      onClick={() => setInputMessage(item.text)}
                      data-testid={`button-question-${index}`}
                    >
                      <Icon className="w-4 h-4 mr-3 flex-shrink-0 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{item.text}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Capabilities Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 px-1">
              <Zap className="w-5 h-5 text-yellow-500" />
              AI Capabilities
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {capabilities.map((cap, index) => {
                const Icon = cap.icon;
                return (
                  <Card 
                    key={index} 
                    className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer group overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur"
                  >
                    <div className={`h-1 w-full bg-gradient-to-r ${cap.color}`}></div>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      </div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{cap.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{cap.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Usage Stats Card */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Session Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 group hover:shadow-md transition-all">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Questions Asked</p>
                <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text mt-1">
                  {Math.max(0, messages.filter(m => m.role === 'user').length - 1)}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 group hover:shadow-md transition-all">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Answers Received</p>
                <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text mt-1">
                  {Math.max(0, messages.filter(m => m.role === 'assistant').length - 1)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
