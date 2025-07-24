import { useState } from "react";
import { Bot, Send, User, Sparkles, BookOpen } from "lucide-react";
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
    "How do I prepare for midterm exams?",
    "What are some effective study techniques?",
    "How should I approach GDB discussions?",
    "Tips for managing multiple assignments?",
    "How to improve programming skills?"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Q&A Assistant</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Get instant help with VU topics and academic guidance
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          <Sparkles className="mr-1" size={14} />
          AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Bot className="mr-2" size={24} />
                VU AI Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about VU courses, study tips, and academic guidance
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        {message.role === 'user' ? (
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            <User size={16} />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            <Bot size={16} />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div
                          className={`inline-block p-3 rounded-lg max-w-[80%] ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          <Bot size={16} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex space-x-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about VU courses, study tips, or academic guidance..."
                  className="flex-1 min-h-[50px] max-h-[100px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4"
                >
                  <Send size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suggested Questions</CardTitle>
              <CardDescription>
                Click on any question to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-3 whitespace-normal"
                    onClick={() => setInputMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What I Can Help With</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Study strategies & tips</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Assignment guidance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Exam preparation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">GDB participation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Academic planning</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your AI Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Questions Asked</span>
                  <span className="font-semibold">{messages.filter(m => m.role === 'user').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Responses Received</span>
                  <span className="font-semibold">{messages.filter(m => m.role === 'assistant').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}