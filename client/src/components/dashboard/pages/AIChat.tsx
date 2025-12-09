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

const RESPONSES = {
  ASSIGNMENT: [
    "For assignments, ensure you:\n1. Read requirements carefully.\n2. Start early.\n3. Check the due date on LMS.\n4. Do not copy-paste; plagiarism is strictly prohibited.\n\nNeed help with a specific subject assignment?",
    "When working on assignments, always double-check the marking scheme. It helps you focus on what's important. Do you have a specific question?",
    "Pro tip: submitting assignments a few hours before the deadline avoids last-minute technical glitches. How can I help you with your current assignment?",
    "Make sure to reference your sources correctly to avoid plagiarism. Is there a specific concept you're stuck on?"
  ],
  EXAM: [
    "Exam Tips:\n- Focus on handouts/PPTs.\n- Practice MCQs from past papers.\n- Manage your time during the exam.\n- Ensure your date sheet is created on time via the VULMS link.\n\nGood luck!",
    "Preparation is key! Try to explain concepts to yourself out loud; it helps retention. Which subject are you preparing for?",
    "Don't forget to take breaks while studying. The Pomodoro technique (25min work, 5min break) works wonders. Need help with a specific topic?",
    "Reviewing your quizzes and assignments is a great way to prepare for exams. They often cover similar concepts."
  ],
  GDB: [
    "GDB tips:\n- Keep your answer concise and to the point.\n- Avoid irrelevant details.\n- Post before the deadline.\n- Check for grammatical errors.",
    "For a good GDB score, make sure your argument is logical and well-supported. Don't just copy from the internet.",
    "Read others' posts if visible to understand the discussion flow, but ensure your contribution is unique. What's the topic?",
    "GDBs are about quality, not quantity. A short, well-reasoned answer is better than a long, vague one."
  ],
  GREETING: [
    "Hello! I'm your VU AI assistant. What would you like to explore today?",
    "Hi there! Ready to study? Ask me anything about your courses or VU policies.",
    "Greetings! How can I assist you with your academic journey today?",
    "Welcome back! What's on your mind? Assignments, exams, or just general advice?"
  ],
  DEFAULT: [
    "I can help with assignments, exams, GDBs, and general academic queries. Please ask a specific question regarding your studies at VU.",
    "I'm here to support your learning. Could you please provide more details so I can give you the best advice?",
    "That's interesting. Could you clarify how this relates to your course or VU policies? I want to make sure I give you the right information.",
    "I'm not sure I fully understand. Are you asking about an administrative issue or an academic concept?"
  ]
};

const getRandomResponse = (category: keyof typeof RESPONSES) => {
  const responses = RESPONSES[category];
  return responses[Math.floor(Math.random() * responses.length)];
};

export function AIChat({ user }: { user: any }) {
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: getRandomResponse('GREETING'),
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
          content: getRandomResponse('GREETING'),
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
    const resetMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: getRandomResponse('GREETING'),
      timestamp: new Date()
    };
    setMessages([resetMessage]);
    setSessions(sessions.map(s => s.id === currentSessionId ? { ...s, messages: [resetMessage] } : s));
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
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages } : s));
  }, [messages, currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = (e: any) => {
    const container = e.target;
    const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollButton(!isBottom);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setRecentQuestions(prev => {
      const unique = prev.filter(q => q !== inputMessage);
      return [inputMessage, ...unique].slice(0, 5);
    });

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
        content: getAIResponse(newMessage.content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('assignment') || lowerMessage.includes('homework')) {
      return getRandomResponse('ASSIGNMENT');
    }
    if (lowerMessage.includes('exam') || lowerMessage.includes('papers') || lowerMessage.includes('test')) {
      return getRandomResponse('EXAM');
    }
    if (lowerMessage.includes('gdb') || lowerMessage.includes('discussion')) {
      return getRandomResponse('GDB');
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return getRandomResponse('GREETING');
    }

    return getRandomResponse('DEFAULT');
  };

  const suggestedQuestions = [
    { icon: Clock, text: "Exam preparation tips?", color: "text-orange-500" },
    { icon: Lightbulb, text: "How to study effectively?", color: "text-yellow-500" },
    { icon: Users, text: "GDB Guidelines", color: "text-pink-500" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] gap-4 pb-2 animate-fade-in">
      {/* Premium Header - Refined Gradients */}
      <div className="flex-shrink-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-xl p-4 md:p-6 text-white shadow-xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/15 backdrop-blur-xl rounded-xl ring-1 ring-white/30 shadow-inner">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">AI Assistant</h1>
              <p className="text-xs md:text-sm text-purple-100 hidden md:block font-medium">Your 24/7 intelligent study companion</p>
            </div>
          </div>
          <Badge className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full shadow-lg">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
            Online
          </Badge>
        </div>
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col shadow-2xl border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">

        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <span className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100 block">
                {sessions.find(s => s.id === currentSessionId)?.name}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Active Session</span>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setShowDropdown(!showDropdown)}>
              <MoreVertical className="w-4 h-4" />
            </Button>

            {showDropdown && (
              <div className="absolute right-0 top-10 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                <Button variant="ghost" className="w-full justify-start text-sm rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20" onClick={handleNewSession}>
                  <Plus className="w-4 h-4 mr-2 text-purple-600" /> New Session
                </Button>
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                <Button variant="ghost" className="w-full justify-start text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600" onClick={handleClearChat}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Restart Chat
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 content-start space-y-6 bg-gray-50/30 dark:bg-black/20 scroll-smooth"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
              {msg.role === 'assistant' && (
                <Avatar className="w-8 h-8 mt-0.5 ring-2 ring-white dark:ring-gray-800 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"><Bot size={14} /></AvatarFallback>
                </Avatar>
              )}

              <div className={`max-w-[85%] md:max-w-[75%] space-y-1`}>
                <div className={`p-3.5 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                  }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                <div className={`text-[10px] px-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${msg.role === 'user' ? 'justify-end text-gray-500' : 'text-gray-400'}`}>
                  <span>{msg.role === 'assistant' ? 'AI Assistant' : 'You'}</span>
                  <span>•</span>
                  <time>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                </div>
              </div>

              {msg.role === 'user' && (
                <Avatar className="w-8 h-8 mt-0.5 ring-2 ring-white dark:ring-gray-800 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-cyan-600 text-white"><User size={14} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8"><AvatarFallback><Bot size={16} /></AvatarFallback></Avatar>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none border shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Area */}
        <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800">
          {/* Quick Suggestions - Cleaner Style */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-1 chat-scrollbar items-center">
            {/* Recent Questions */}
            {recentQuestions.length > 0 && (
              <>
                <span className="text-[10px] text-gray-400 mr-1 uppercase font-bold tracking-wider flex-shrink-0">Recent</span>
                {recentQuestions.slice(0, 2).map((q, i) => {
                  const truncated = q.split(' ').slice(0, 4).join(' ') + (q.split(' ').length > 4 ? '...' : '');
                  return (
                    <Button
                      key={`recent-${i}`}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap flex-shrink-0 text-xs h-8 max-w-[200px] truncate bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => setInputMessage(q)}
                      title={q} // Show full text on hover
                    >
                      <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                      {truncated}
                    </Button>
                  );
                })}
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1 flex-shrink-0" />
              </>
            )}

            {/* Always Show Quick Suggestions */}
            {suggestedQuestions.map((q, i) => (
              <Button
                key={`suggest-${i}`}
                variant="secondary"
                size="sm"
                className="whitespace-nowrap flex-shrink-0 text-xs h-8 bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                onClick={() => setInputMessage(q.text)}
              >
                <q.icon className={`w-3 h-3 mr-1.5 ${q.color}`} />
                {q.text}
              </Button>
            ))}
          </div>

          <div className="relative group">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything..."
              className="min-h-[56px] max-h-[120px] resize-none py-4 pr-14 pl-4 rounded-xl border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 shadow-sm bg-white dark:bg-gray-800 text-base"
            />
            <div className="absolute right-2 bottom-2">
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className={`h-10 w-10 rounded-lg transition-all duration-300 ${inputMessage.trim() ? 'bg-purple-600 hover:bg-purple-700 shadow-md transform scale-100' : 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95'}`}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">AI can make mistakes. Verify important academic information.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
