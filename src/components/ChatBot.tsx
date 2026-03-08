import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const AUTO_REPLIES: Record<string, string> = {
  flight: "We offer flight bookings to over 100 destinations worldwide! Visit our Travel Services page or call +233 123 456 789 for the best deals.",
  hotel: "We partner with top hotels globally. Share your destination and dates, and we'll find the best accommodation for you!",
  visa: "We assist with Schengen, USA, Canada, UK, and other visa types. Visit our Documentation page for required documents, or book a consultation.",
  "work permit": "We handle Schengen Work Permits, Canada LMIA, Germany Opportunity Card, and USA NCLEX pathways. Check our Work Permits page for details!",
  logistics: "We provide air, sea, and land freight services globally. Track your shipment on our Logistics page or share your tracking number here.",
  track: "Please share your tracking number (e.g., SH-XXXX) and we'll look it up for you. You can also use our Tracking page.",
  price: "Pricing varies by service. Book a free consultation and our team will provide a detailed quote within 24 hours!",
  consultation: "You can book a consultation at our Consultation page. We offer video, phone, and in-person sessions.",
  hello: "Hello! 👋 Welcome to AtlasWave Travel & Tours. How can I help you today? I can assist with travel bookings, visa applications, work permits, and logistics.",
  hi: "Hi there! 👋 How can I assist you today? Ask me about flights, visas, work permits, or logistics!",
  help: "I can help with:\n• ✈️ Flight & hotel bookings\n• 📋 Visa applications\n• 🛂 Work permits (Schengen, Canada, Germany, USA)\n• 🚢 Logistics & shipment tracking\n• 📅 Booking consultations\n\nJust type your question!",
};

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, reply] of Object.entries(AUTO_REPLIES)) {
    if (lower.includes(key)) return reply;
  }
  return "Thank you for reaching out! Our team is available 24/7. For specific inquiries, please book a consultation or call us at +233 123 456 789. Can I help with flights, visas, work permits, or logistics?";
}

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "Hello! 👋 Welcome to AtlasWave. How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: "user" };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((p) => [...p, { id: Date.now() + 1, text: getBotReply(input), sender: "bot" }]);
    }, 600);
  };

  return (
    <>
      {/* Floating button */}
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
            style={{ height: "480px" }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4">
              <h3 className="font-display font-bold text-base">AtlasWave Support</h3>
              <p className="text-xs text-primary-foreground/70">Online · Typically replies instantly</p>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message..."
                className="flex-1 text-sm"
              />
              <Button size="icon" onClick={send} disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
