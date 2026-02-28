import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { analytics } from "@/lib/analytics";
import { chatMessageSchema } from "@/lib/validations";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface CoachChatProps {
  userContext?: {
    streak?: number;
    goalsCount?: number;
    lastActivity?: string;
    isPremium?: boolean;
    plan?: string;
  };
  autoOpen?: boolean;
  welcomeMessage?: string;
  fullPage?: boolean;
}

export function CoachChat({ userContext, autoOpen = false, welcomeMessage, fullPage = false }: CoachChatProps) {
  const [isOpen, setIsOpen] = useState(autoOpen || fullPage);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: welcomeMessage || "Hey there! I'm Coach, your AI habit companion. I'm here to help you build sustainable habits. What's on your mind today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const loadUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Load message count for today
        if (!userContext?.isPremium) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const { count } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("role", "user")
            .gte("created_at", today.toISOString());
          
          setMessageCount(count || 0);
        }
      }
    };
    loadUserId();
  }, [userContext?.isPremium]);

  const streamChat = async (userMessage: string) => {
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required", {
          description: "Please log in to use the coach chat",
        });
        setIsLoading(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userContext: {
            streak: userContext?.streak,
            goalsCount: userContext?.goalsCount,
            lastActivity: userContext?.lastActivity,
          }
        }),
      });

      if (resp.status === 429) {
        const data = await resp.json();
        if (data.limitReached) {
          toast.error("Daily message limit reached!", {
            description: "Upgrade to Premium for unlimited messages.",
            action: {
              label: "Upgrade",
              onClick: () => navigate("/pricing"),
            },
          });
        } else {
          toast.error("Rate limit reached. Please try again in a moment.");
        }
        setIsLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast.error("AI usage limit reached. Please contact support.");
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to start stream");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message
      if (userId && assistantContent) {
        await supabase.from("chat_messages").insert({
          user_id: userId,
          message: assistantContent,
          role: "assistant"
        });
      }

      // Update message count
      if (!userContext?.isPremium) {
        setMessageCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response from Coach");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Validate message
    const validationResult = chatMessageSchema.safeParse({
      message: input.trim()
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    analytics.coachMessageSent();
    const userMessage = validationResult.data.message;
    setInput("");
    await streamChat(userMessage);
  };

  const remainingMessages = !userContext?.isPremium ? Math.max(0, 10 - messageCount) : null;

  if (fullPage) {
    return (
      <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-primary">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">Coach</h3>
              <p className="text-xs text-white/80">Your AI Habit Companion</p>
            </div>
            {remainingMessages !== null && (
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs text-white font-semibold">{remainingMessages} left</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === "user" ? "bg-gradient-primary text-white" : "bg-muted text-foreground"
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Coach anything..." disabled={isLoading} className="flex-1" />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="btn-gradient">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">Coach is AI-powered. Always consult your doctor for medical advice.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => {
          if (!isOpen) analytics.coachChatOpened();
          setIsOpen(!isOpen);
        }}
        className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-xl btn-gradient z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-36 right-6 w-[380px] h-[500px] bg-card rounded-2xl shadow-2xl border-2 border-primary/20 flex flex-col z-50 slide-up">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-primary rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">💪</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">Coach</h3>
                <p className="text-xs text-white/80">Your AI Habit Companion</p>
              </div>
              {remainingMessages !== null && (
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                  <Sparkles className="h-3 w-3 text-white" />
                  <span className="text-xs text-white font-semibold">{remainingMessages} left</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === "user" ? "bg-gradient-primary text-white" : "bg-muted text-foreground"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Coach anything..." disabled={isLoading} className="flex-1" />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="btn-gradient">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">Coach is AI-powered. Always consult your doctor for medical advice.</p>
          </div>
        </div>
      )}
    </>
  );
}
