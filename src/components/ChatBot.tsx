import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown,
  Mic, MicOff, Paperclip, Image as ImageIcon, FileText,
  Maximize2, Minimize2, Trash2, Sparkles, Volume2, VolumeX,
  Plane, Hotel, Globe, FileCheck
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

const DEFAULT_GREETING = `✨ **Welcome to AtlasWave** — I'm **AtlasBot**, your personal travel concierge.

I'm here to make global travel feel effortless. Ask me anything about:

- ✈️ **Flights & airfares** — best routes, fares, baggage rules
- 🏨 **Hotels & stays** — curated picks worldwide
- 🛂 **Visas & work permits** — Schengen, Canada LMIA, USA, UK, Germany
- 🌍 **Destinations** — what to see, when to go, what to pack
- 📦 **Logistics tracking** — share your tracking number anytime

How may I assist you today?`;

const QUICK_REPLIES = [
  { label: "Find flights", icon: Plane, text: "Help me find flights" },
  { label: "Book hotel", icon: Hotel, text: "I need hotel recommendations" },
  { label: "Visa guide", icon: FileCheck, text: "What visa do I need?" },
  { label: "Top destinations", icon: Globe, text: "Show me popular destinations" },
];

const ChatBot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const [botName, setBotName] = useState("AtlasBot");
  const [botEnabled, setBotEnabled] = useState(true);
  const [fallbackMessage, setFallbackMessage] = useState("I'm having trouble connecting right now. Please try again, or reach our team via the Contact page.");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // TTS speak-back
  const [interimTranscript, setInterimTranscript] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from("chatbot_settings").select("key, value");
      if (data) {
        for (const row of data as { key: string; value: string }[]) {
          if (row.key === "greeting" && row.value?.trim()) setGreeting(row.value);
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
  }, [messages, interimTranscript]);

  // Cleanup speech synthesis on unmount/close
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak text using browser TTS — strips markdown for natural speech
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[*_`#>~|]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleanText) return;
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = 1.02;
    utter.pitch = 1;
    utter.volume = 0.95;
    // Try to pick a high-quality English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /Google.*US English|Samantha|Karen|Microsoft.*Aria/i.test(v.name)) ||
                      voices.find(v => v.lang.startsWith("en"));
    if (preferred) utter.voice = preferred;
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [voiceEnabled]);

  // Voice recognition
  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }
    // Stop any TTS playback so we don't hear ourselves
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    let finalTranscript = "";
    let manuallyStopped = false;
    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (finalTranscript) setInput(prev => (prev ? `${prev} ${finalTranscript}` : finalTranscript).trim());
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error);
      manuallyStopped = true;
      setIsRecording(false);
      setInterimTranscript("");
    };
    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript("");
      const toSend = finalTranscript.trim();
      // Auto-submit voice input when recognition ends naturally
      if (!manuallyStopped && toSend) {
        setInput("");
        // Small delay so the input state flush doesn't race with send
        setTimeout(() => sendText(toSend), 50);
      }
      recognitionRef.current = null;
    };
    (recognition as any).__manualStop = () => { manuallyStopped = true; };
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      (recognitionRef.current as any).__manualStop?.();
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript("");
  }, []);

  const toggleVoiceOutput = useCallback(() => {
    setVoiceEnabled(prev => {
      const next = !prev;
      if (!next && "speechSynthesis" in window) window.speechSynthesis.cancel();
      return next;
    });
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
    if (type === "image") att.preview = URL.createObjectURL(file);
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

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

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

  const sendText = async (textOverride?: string) => {
    const trimmed = (textOverride ?? input).trim();
    if ((!trimmed && attachments.length === 0) || isLoading) return;

    if (isRecording) stopRecording();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    const msgAttachments = attachments.map(a => ({ type: a.type, name: a.name, preview: a.preview }));

    const userMsg: Message = {
      id: Date.now(),
      text: trimmed || (attachments.length > 0 ? `[Sent ${attachments.length} attachment(s)]` : ""),
      sender: "user",
      attachments: msgAttachments.length > 0 ? msgAttachments : undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

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
      // Speak after the full response is ready
      if (voiceEnabled) speak(assistantText);
    } catch (e) {
      console.error("Chat error:", e);
      await saveChatLog(trimmed || "[attachment]", fallbackMessage, false);
      setMessages(prev => [...prev, { id: Date.now() + 2, text: fallbackMessage, sender: "bot" }]);
      if (voiceEnabled) speak(fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    sessionId.current = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setMessages([{ id: 0, text: greeting, sender: "bot" }]);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  if (!botEnabled) return null;

  const chatWidth = expanded ? "w-[640px] max-w-[calc(100vw-2rem)]" : "w-[400px] max-w-[calc(100vw-2rem)]";
  const chatHeight = expanded ? "h-[80vh]" : "h-[600px]";
  const showQuickReplies = messages.length === 1 && !isLoading;

  return (
    <>
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.csv" className="hidden" onChange={e => handleFileSelect(e, "file")} />
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => handleFileSelect(e, "image")} />

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full text-primary-foreground shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
        style={{ background: "var(--gradient-primary)" }}
        aria-label="Chat with AtlasBot — your travel concierge"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="relative">
              <Sparkles className="w-6 h-6" />
              <span className="absolute inset-0 -m-1 rounded-full animate-ping bg-accent/40" />
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
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className={`fixed bottom-24 right-6 z-50 ${chatWidth} bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col ${chatHeight}`}
          >
            {/* Header — premium gradient */}
            <div
              className="text-primary-foreground p-4 flex items-center justify-between shrink-0 relative overflow-hidden"
              style={{ background: "var(--gradient-primary)" }}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
              <div className="flex items-center gap-3 relative">
                <div className="w-10 h-10 rounded-xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center ring-2 ring-accent/40">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base leading-tight">{botName}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    <span className="text-[11px] text-primary-foreground/80">Travel concierge · Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 relative">
                <Button
                  variant="ghost" size="icon"
                  className={`h-7 w-7 hover:bg-primary-foreground/15 ${voiceEnabled ? "text-accent" : "text-primary-foreground/70 hover:text-primary-foreground"}`}
                  onClick={toggleVoiceOutput}
                  aria-label={voiceEnabled ? "Mute voice replies" : "Enable voice replies"}
                  title={voiceEnabled ? "Voice replies on" : "Voice replies off"}
                >
                  {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/15" onClick={clearChat} aria-label="Clear chat">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/15" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "Minimize" : "Expand"}>
                  {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gradient-to-b from-muted/30 to-background">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", damping: 30, stiffness: 200 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} gap-3`}
                >
                  {msg.sender === "bot" && (
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ring-2 ring-accent/40 shadow-md" 
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <Sparkles className="w-4 h-4 text-accent" />
                    </motion.div>
                  )}
                  <div className="max-w-[82%] space-y-2">
                    {msg.attachments?.map((att, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl overflow-hidden border-2 border-accent/20 bg-gradient-to-br from-card to-muted/50 shadow-md hover:shadow-lg transition-shadow"
                      >
                        {att.type === "image" && att.preview ? (
                          <img src={att.preview} alt={att.name} className="max-h-48 w-auto rounded-xl" />
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3 text-xs text-foreground">
                            <FileText className="w-4 h-4 text-accent" />
                            <span className="truncate font-medium">{att.name}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {msg.text && (
                      <motion.div 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md transition-all ${
                          msg.sender === "user"
                            ? "text-primary-foreground rounded-br-lg font-medium"
                            : "bg-card border-2 border-border text-foreground rounded-bl-lg shadow-card hover:shadow-card-hover"
                        }`}
                        style={msg.sender === "user" ? { background: "var(--gradient-primary)" } : undefined}
                      >
                        {msg.sender === "bot" ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0 [&>p]:leading-relaxed [&>ul]:my-2 [&>ol]:my-2 [&>p+p]:mt-3 [&_strong]:text-primary [&_strong]:font-semibold [&_code]:bg-accent/10 [&_code]:text-accent [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_a]:text-secondary [&_a]:underline [&_li]:my-1 [&_li]:ml-2">
                            <ReactMarkdown>{msg.text || "…"}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.text
                        )}
                      </motion.div>
                    )}
                    {msg.id !== 0 && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`text-[10px] text-muted-foreground/60 px-2 ${msg.sender === "user" ? "text-right" : ""}`}
                      >
                        {new Date(msg.id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Quick reply chips */}
              {showQuickReplies && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="pl-10 flex flex-wrap gap-2 pt-1">
                  {QUICK_REPLIES.map((qr, i) => (
                    <button
                      key={i}
                      onClick={() => sendText(qr.text)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-card border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all hover:shadow-sm"
                    >
                      <qr.icon className="w-3 h-3" />
                      {qr.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1]?.sender !== "bot" && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-2 ring-accent/40 shadow-md" 
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card border-2 border-accent/30 rounded-2xl rounded-bl-lg px-4 py-3 shadow-card"
                  >
                    <div className="flex items-center gap-1.5">
                      {[0, 150, 300].map((delay) => (
                        <motion.span
                          key={delay}
                          animate={{ y: [-4, 4, -4] }}
                          transition={{ duration: 0.6, delay: delay / 1000, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
                        />
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Live transcription bubble */}
              {isRecording && interimTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[82%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm bg-accent/15 text-foreground border border-accent/30 italic">
                    {interimTranscript}…
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

            {/* Recording bar */}
            {isRecording && (
              <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 flex items-center gap-3 text-xs text-destructive">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  Listening…
                </span>
                <span className="flex-1 flex items-center gap-0.5">
                  {[...Array(20)].map((_, i) => (
                    <span
                      key={i}
                      className="flex-1 bg-destructive/60 rounded-full animate-pulse"
                      style={{
                        height: `${4 + Math.random() * 14}px`,
                        animationDelay: `${i * 50}ms`,
                        animationDuration: "0.8s",
                      }}
                    />
                  ))}
                </span>
                <button onClick={stopRecording} className="font-semibold underline">Stop</button>
              </div>
            )}

            {/* Input bar */}
            <div className="p-3 border-t flex items-center gap-2 shrink-0 bg-card">
              <div className="relative group">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" aria-label="Attach file">
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

              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${isRecording ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-primary"}`}
                onClick={isRecording ? stopRecording : startRecording}
                aria-label={isRecording ? "Stop voice input" : "Start voice input (microphone)"}
                title={isRecording ? "Stop recording" : "Speak your question"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>

              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendText())}
                placeholder={isRecording ? "Listening… speak now" : "Ask AtlasBot anything…"}
                className="flex-1 text-sm h-10 border-input focus-visible:ring-primary"
                disabled={isLoading}
                aria-label="Type your message"
              />
              <Button
                size="icon"
                className="h-10 w-10 shrink-0"
                style={{ background: "var(--gradient-primary)" }}
                onClick={() => sendText()}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                aria-label="Send message"
              >
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
