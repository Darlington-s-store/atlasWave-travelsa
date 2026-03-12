import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  logId?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState("Hello! 👋 Welcome to AtlastWave Travel and Tour. How can I help you today?");
  const [botName, setBotName] = useState("AtlasWave AI Assistant");
  const [botEnabled, setBotEnabled] = useState(true);
  const [fallbackMessage, setFallbackMessage] = useState("I'm sorry, I'm having trouble connecting right now. Please try again or use the Contact page for assistance.");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from("chatbot_settings").select("key, value");
      if (data) {
        for (const row of data as { key: string; value: string }[]) {
          if (row.key === "greeting") setGreeting(row.value);
          if (row.key === "bot_name") setBotName(row.value);
          if (row.key === "bot_enabled") setBotEnabled(row.value === "true");
          if (row.key === "fallback") setFallbackMessage(row.value);
        }
      }
    };
    loadSettings();
  }, []);

  // Set initial greeting once loaded
  useEffect(() => {
    setMessages([{ id: 0, text: greeting, sender: "bot" }]);
  }, [greeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const streamChat = useCallback(async (allMessages: { role: string; content: string }[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: allMessages,
        session_id: sessionId.current,
        page_path: window.location.pathname,
        page_title: document.title,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Failed to connect" }));
      throw new Error(err.error || "Failed to get response");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantText = "";
    const botId = Date.now() + 1;

    setMessages((prev) => [...prev, { id: botId, text: "", sender: "bot" }]);

    let streamDone = false;
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
        if (jsonStr === "[DONE]") { streamDone = true; break; }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantText += content;
            const currentText = assistantText;
            setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: currentText } : m)));
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantText += content;
            const currentText = assistantText;
            setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: currentText } : m)));
          }
        } catch { /* ignore */ }
      }
    }

    return assistantText;
  }, []);

  const saveChatLog = useCallback(async (userMessage: string, botResponse: string, matched: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    let userName = "Guest";

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      userName = profile?.full_name || user.email || "Guest";
    }

    const { error } = await supabase.from("chat_logs").insert({
      session_id: sessionId.current,
      user_id: user?.id ?? null,
      user_name: userName,
      user_message: userMessage,
      bot_response: botResponse,
      matched,
    });

    if (error) {
      console.error("Failed to save chat log:", error);
    }
  }, []);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { id: Date.now(), text: trimmed, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const history = messages
      .filter((m) => m.id !== 0)
      .map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
    history.push({ role: "user", content: trimmed });

    try {
      const assistantText = await streamChat(history);
      await saveChatLog(trimmed, assistantText, true);
    } catch (e) {
      console.error("Chat error:", e);
      await saveChatLog(trimmed, fallbackMessage, false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, text: fallbackMessage, sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!botEnabled) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105"
        aria-label="Chat with us"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: "520px" }}
          >
            <div className="bg-primary text-primary-foreground p-4">
              <h3 className="font-display font-bold text-base">{botName}</h3>
              <p className="text-xs text-primary-foreground/70">Online · Powered by AI</p>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.sender === "bot" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1 [&>p+p]:mt-2">
                        {msg.text ? (
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Thinking...
                          </span>
                        )}
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask me anything..."
                className="flex-1 text-sm"
                disabled={isLoading}
              />
              <Button size="icon" onClick={send} disabled={!input.trim() || isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
