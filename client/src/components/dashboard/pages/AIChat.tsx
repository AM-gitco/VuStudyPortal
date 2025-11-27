import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, BookOpen, GraduationCap, Lightbulb, FileText, Users, Zap, Clock, MessageSquare, ArrowDown, MoreVertical, Copy, RefreshCw, Plus, Trash2, Download } from "lucide-react";
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

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
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
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      name: 'Current Session',
      messages: messages,
      createdAt: new Date()
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Session ${sessions.length + 1}`,
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your VU AI assistant. I can help you with questions about your courses, study tips, VU policies, and academic guidance. What would you like to know?',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    };
    setSessions([...sessions, newSession]);
    setCurrentSessionId(newSession.id);
    setMessages(newSession.messages);
    setShowDropdown(false);
  };

  const handleSwitchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setShowDropdown(false);
    }
  };

  const handleClearChat = () => {
    const newMessages = [messages[0]];
    setMessages(newMessages);
    setSessions(sessions.map(s => s.id === currentSessionId ? { ...s, messages: newMessages } : s));
    setShowDropdown(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (sessions.length === 1) return;
    const newSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(newSessions);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(newSessions[0].id);
      setMessages(newSessions[0].messages);
    }
  };

  useEffect(() => {
    setSessions(sessions.map(s => s.id === currentSessionId ? { ...s, messages } : s));
  }, [messages]);

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
    { icon: Clock, text: "How do I prepare for midterm exams?", color: "text-orange-500" },
    { icon: Lightbulb, text: "What are some effective study techniques?", color: "text-yellow-500" },
    { icon: Users, text: "How should I approach GDB discussions?", color: "text-pink-500" },
    { icon: Zap, text: "Tips for managing multiple assignments?", color: "text-purple-500" },
    { icon: FileText, text: "How to improve programming skills?", color: "text-indigo-500" }
  ];

  const capabilities = [
    { icon: BookOpen, title: "Study", description: "Strategies", color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    { icon: FileText, title: "Assignments", description: "Help", color: "from-green-500 to-emerald-500", bgColor: "bg-green-50 dark:bg-green-900/20" },
    { icon: GraduationCap, title: "Exams", description: "Tips", color: "from-purple-500 to-pink-500", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
    { icon: Users, title: "GDB", description: "Guide", color: "from-orange-500 to-red-500", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
    { icon: Lightbulb, title: "Concepts", description: "Explain", color: "from-amber-500 to-yellow-500", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
    { icon: Zap, title: "Time Mgmt", description: "Plan", color: "from-indigo-500 to-purple-500", bgColor: "bg-indigo-50 dark:bg-indigo-900/20" }
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 dark:from-purple-700 dark:via-blue-700 dark:to-cyan-600 p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        <div className="absolute inset-0 opacity-5 bg-white/10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AI Learning Assistant</h1>
                  <p className="text-white/90 mt-2 text-lg">Your intelligent study companion</p>
                </div>
              </div>
            </div>
            <Badge className="bg-white/20 backdrop-blur-md text-white border border-white/40 text-base px-6 py-2 rounded-full hover:bg-white/30 transition-all shadow-lg">
              <span className="inline-flex h-2.5 w-2.5 bg-green-400 rounded-full animate-pulse mr-2"></span>
              AI Powered
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Main Chat Area - Full Width */}
        <div className="flex flex-col">
          {/* Chat Container */}
          <Card className="flex-1 flex flex-col shadow-2xl border-0 overflow-hidden bg-white dark:bg-gray-900/50 backdrop-blur transition-all hover:shadow-3xl duration-300">
            {/* Enhanced Chat Header with Dropdown */}
            <CardHeader className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-cyan-900/30 border-b dark:border-gray-700/50 pb-4 relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform">
                    <Bot className="text-white" size={28} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2 font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      VU AI Assistant
                      <span className="inline-flex h-3 w-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
                    </CardTitle>
                    <CardDescription className="mt-1 text-base">Session: {sessions.find(s => s.id === currentSessionId)?.name}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 relative" ref={dropdownRef}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="hover:bg-blue-100 dark:hover:bg-blue-900/30 relative"
                  >
                    <MoreVertical size={18} />
                  </Button>
                  
                  {showDropdown && (
                    <div className="absolute top-10 right-0 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-4 py-2.5 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-none border-b dark:border-gray-700"
                        onClick={handleNewSession}
                        data-testid="button-new-session"
                      >
                        <Plus size={16} className="mr-2" />
                        New Session
                      </Button>
                      
                      <div className="px-3 py-2 border-b dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Active Sessions</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {sessions.map(session => (
                            <div key={session.id} className="flex items-center justify-between gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors group">
                              <Button
                                variant="ghost"
                                className={`flex-1 justify-start text-xs font-medium px-2 py-1 ${
                                  currentSessionId === session.id
                                    ? 'bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                                onClick={() => handleSwitchSession(session.id)}
                              >
                                {session.name}
                              </Button>
                              {sessions.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleDeleteSession(session.id)}
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-4 py-2.5 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 rounded-none border-b dark:border-gray-700 text-red-600 dark:text-red-400"
                        onClick={handleClearChat}
                        data-testid="button-clear-chat"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Clear Chat
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-4 py-2.5 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 rounded-none"
                      >
                        <Download size={16} className="mr-2" />
                        Export Chat
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Enhanced Chat Messages Area */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-gradient-to-b from-white via-white/95 to-gray-50/50 dark:from-gray-900/50 dark:via-gray-900/50 dark:to-gray-800/50 scroll-smooth chat-scrollbar max-h-[500px]"
              style={{ scrollBehavior: 'smooth' }}
              data-testid="chat-messages-container"
            >
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-11 w-11 flex-shrink-0 mt-1 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-cyan-600 text-white font-bold text-lg">
                        <Bot size={22} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex flex-col gap-2 max-w-xs lg:max-w-md ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-6 py-4 rounded-2xl transition-all duration-200 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-lg hover:shadow-xl dark:shadow-black/50'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">{message.content}</p>
                    </div>
                    <div className="flex gap-2 px-2 items-center">
                      <time className="text-xs text-gray-500 dark:text-gray-400">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                      {message.role === 'assistant' && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <Copy size={14} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-11 w-11 flex-shrink-0 mt-1 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg">
                        <User size={22} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 items-start animate-in fade-in duration-300">
                  <Avatar className="h-11 w-11 flex-shrink-0 mt-1 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-cyan-600 text-white font-bold">
                      <Bot size={22} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-lg">
                    <div className="flex gap-2.5">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s' }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll Down Button */}
            {showScrollButton && (
              <div className="flex justify-center p-3 bg-gradient-to-t from-white via-white/80 dark:from-gray-900/50 dark:via-gray-900/40">
                <Button
                  size="sm"
                  onClick={scrollToBottom}
                  className="rounded-full px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
                  data-testid="button-scroll-down"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Enhanced Input Area */}
            <CardContent className="p-4 bg-gradient-to-t from-white to-white/95 dark:from-gray-900 dark:to-gray-900/95 border-t dark:border-gray-700/50">
              <div className="flex gap-3 items-end">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything... (Shift+Enter for new line)"
                  className="flex-1 min-h-[52px] max-h-[120px] rounded-xl resize-none bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-0 transition-all font-medium"
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
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-6 h-[52px] rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                  data-testid="button-send-ai-message"
                >
                  <Send size={24} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Quick Questions, Capabilities, Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quick Questions Card */}
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-900/50 backdrop-blur overflow-hidden hover:shadow-2xl transition-all duration-300 lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-3">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                Quick Questions
              </CardTitle>
              <CardDescription className="text-blue-100 mt-1">
                Start a conversation
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {suggestedQuestions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full text-left justify-start h-auto p-3 whitespace-normal hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group border border-transparent hover:border-blue-300 dark:hover:border-blue-700 rounded-xl font-medium hover:scale-105 duration-200"
                    onClick={() => setInputMessage(item.text)}
                    data-testid={`button-question-${index}`}
                  >
                    <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${item.color} group-hover:scale-125 transition-transform`} />
                    <span className="text-sm">{item.text}</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* AI Capabilities Grid */}
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-900/50 backdrop-blur overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Zap className="w-5 h-5" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {capabilities.slice(0, 3).map((cap, index) => {
                  const Icon = cap.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors">
                      <div className={`p-2 bg-gradient-to-br ${cap.color} rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{cap.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{cap.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Usage Stats Card */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white pb-3">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                Session Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 group hover:shadow-lg transition-all">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Questions Asked</p>
                <p className="text-4xl font-black text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text mt-2">
                  {Math.max(0, messages.filter(m => m.role === 'user').length - 1)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 group hover:shadow-lg transition-all">
                <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">Answers Received</p>
                <p className="text-4xl font-black text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text mt-2">
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
