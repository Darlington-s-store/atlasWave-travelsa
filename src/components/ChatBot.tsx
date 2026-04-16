import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown,
  Mic, MicOff, Paperclip, Image as ImageIcon, FileText,
  Maximize2, Minimize2, Trash2, Search, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  logId?: string;
  attachments?: { type: "image" | "file"; name: string; url?: string; preview?: string }[];
  isSearching?: boolean;
}

interface PendingAttachment {
  type: "image" | "file";
  name: string;
  file: File;
  preview?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ChatBot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [greeting, setGreeting] = useState("Hi there! 👋 I'm **AtlasBot**, your personal travel assistant.\n\nI can help you with:\n- ✈️ Flight bookings & prices\n- 🏨 Hotel recommendations\n- 🛂 Visa & work permit info\n- 🌍 Destination guides\n\nHow can I help you today?");
  const [botName, setBotName] = useState("AtlasBot");
  const [botEnabled, setBotEnabled] = useState(true);
  const [fallbackMessage, setFallbackMessage] = useState("I'm sorry, I'm having trouble connecting right now. Please try again or use the Contact page.");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const recognitionRef = useRef<any>(null);

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

  useEffect(() => {
    setMessages([{ id: 0, text: greeting, sender: "bot" }]);
  }, [greeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Voice recording
  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setInput(prev => prev + " [Voice not supported in this browser]");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";
    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setInput(finalTranscript + interim);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
    if (file.size > maxSize) {
      alert(`File too large. Max ${type === "image" ? "5MB" : "10MB"}.`);
      return;
    }

    const att: PendingAttachment = { type, name: file.name, file };
    if (type === "image") {
      att.preview = URL.createObjectURL(file);
    }
    setAttachments(prev => [...prev, att]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const next = [...prev];
      if (next[index].preview) URL.revokeObjectURL(next[index].preview!);
      next.splice(index, 1);
      return next;
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const streamChat = useCallback(async (allMessages: { role: string; content: any }[]) => {
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

    setMessages(prev => [...prev, { id: botId, text: "", sender: "bot" }]);

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
            setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: currentText } : m));
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

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
            setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: currentText } : m));
          }
        } catch { /* ignore */ }
      }
    }

    return assistantText;
  }, []);

  const saveChatLog = useCallback(async (userMessage: string, botResponse: string, matched: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    const authUser = session?.user;
    let userName = "Guest";
    if (authUser) {
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", authUser.id).maybeSingle();
      userName = profile?.full_name || authUser.email || "Guest";
    }
    await supabase.from("chat_logs").insert({
      session_id: sessionId.current,
      user_id: authUser?.id ?? null,
      user_name: userName,
      user_message: userMessage,
      bot_response: botResponse,
      matched,
    });
  }, []);

  const send = async () => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || isLoading) return;

    // Build user message with attachments
    const msgAttachments = attachments.map(a => ({
      type: a.type,
      name: a.name,
      preview: a.preview,
    }));

    const userMsg: Message = {
      id: Date.now(),
      text: trimmed || (attachments.length > 0 ? `[Sent ${attachments.length} attachment(s)]` : ""),
      sender: "user",
      attachments: msgAttachments.length > 0 ? msgAttachments : undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Show searching indicator
    setIsLoading(true);

    // Build message content - include file/image data
    let messageContent: any = trimmed;
    const currentAttachments = [...attachments];
    setAttachments([]);

    if (currentAttachments.length > 0) {
      const parts: string[] = [];
      if (trimmed) parts.push(trimmed);

      for (const att of currentAttachments) {
        if (att.type === "image") {
          const base64 = await fileToBase64(att.file);
          parts.push(`[Image uploaded: ${att.name}]\n${base64}`);
        } else {
          try {
            const text = await readFileAsText(att.file);
            parts.push(`[File: ${att.name}]\n${text.slice(0, 8000)}`);
          } catch {
            parts.push(`[File uploaded: ${att.name} - could not read contents]`);
          }
        }
      }
      messageContent = parts.join("\n\n");
    }

    const history = messages
      .filter(m => m.id !== 0)
      .map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
    history.push({ role: "user", content: messageContent });

    try {
      const assistantText = await streamChat(history);
      await saveChatLog(trimmed || "[attachment]", assistantText, true);
    } catch (e) {
      console.error("Chat error:", e);
      await saveChatLog(trimmed || "[attachment]", fallbackMessage, false);
      setMessages(prev => [...prev, { id: Date.now() + 2, text: fallbackMessage, sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    sessionId.current = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setMessages([{ id: 0, text: greeting, sender: "bot" }]);
  };

  if (!botEnabled) return null;

  const chatWidth = expanded ? "w-[600px] max-w-[calc(100vw-2rem)]" : "w-[380px] max-w-[calc(100vw-2rem)]";
  const chatHeight = expanded ? "h-[80vh]" : "h-[540px]";

  return (
    <>
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.csv" className="hidden" onChange={e => handleFileSelect(e, "file")} />
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => handleFileSelect(e, "image")} />

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105"
        aria-label="Chat with AtlasBot"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full animate-ping bg-primary/30" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 right-6 z-50 ${chatWidth} bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col ${chatHeight}`}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-bold">
                  AB
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">{botName}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[11px] text-primary-foreground/70">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={clearChat} aria-label="Clear chat">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "Minimize" : "Expand"}>
                  {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} gap-2`}>
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <MessageCircle className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-2`}>
                    {/* Attachments */}
                    {msg.attachments?.map((att, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border bg-muted/50">
                        {att.type === "image" && att.preview ? (
                          <img src={att.preview} alt={att.name} className="max-h-48 w-auto rounded-xl" />
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 text-xs">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">{att.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Text */}
                    {msg.text && (
                      <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}>
                        {msg.sender === "bot" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1 [&>p+p]:mt-2">
                            {msg.text ? (
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                <Globe className="w-3 h-3 animate-spin" />
                                Searching & thinking...
                              </span>
                            )}
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>
                    )}
                    {/* Timestamp */}
                    <p className={`text-[10px] text-muted-foreground/50 ${msg.sender === "user" ? "text-right" : ""}`}>
                      {msg.id === 0 ? "" : new Date(msg.id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.sender !== "bot" && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Search className="w-3 h-3 animate-pulse" />
                      <span>Thinking deeply...</span>
                      <span className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Attachment preview bar */}
            {attachments.length > 0 && (
              <div className="px-3 py-2 border-t bg-muted/30 flex gap-2 overflow-x-auto">
                {attachments.map((att, i) => (
                  <div key={i} className="relative shrink-0 rounded-lg border bg-card overflow-hidden group">
                    {att.type === "image" && att.preview ? (
                      <img src={att.preview} alt={att.name} className="h-16 w-16 object-cover" />
                    ) : (
                      <div className="h-16 w-16 flex flex-col items-center justify-center p-1">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[8px] text-muted-foreground truncate w-full text-center mt-1">{att.name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeAttachment(i)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove attachment"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className="p-3 border-t flex items-center gap-2 shrink-0">
              {/* Attachment menu */}
              <div className="relative group">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label="Attach file">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex flex-col bg-card border rounded-lg shadow-lg overflow-hidden z-10">
                  <button className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted whitespace-nowrap" onClick={() => imageInputRef.current?.click()}>
                    <ImageIcon className="w-3.5 h-3.5" /> Upload Image
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted whitespace-nowrap" onClick={() => fileInputRef.current?.click()}>
                    <FileText className="w-3.5 h-3.5" /> Upload File
                  </button>
                </div>
              </div>

              {/* Voice button */}
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isRecording ? "text-destructive animate-pulse" : "text-muted-foreground"}`}
                onClick={isRecording ? stopRecording : startRecording}
                aria-label={isRecording ? "Stop recording" : "Start voice input"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>

              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask me anything about travel..."
                className="flex-1 text-sm h-9"
                disabled={isLoading}
              />
              <Button size="icon" className="h-8 w-8" onClick={send} disabled={(!input.trim() && attachments.length === 0) || isLoading} aria-label="Send message">
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
