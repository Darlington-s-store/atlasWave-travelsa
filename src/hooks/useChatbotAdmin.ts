import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TrainingPair {
  id: string;
  keywords: string[];
  response: string;
  category: string;
  active: boolean;
  created_at: string;
}

export interface ChatLog {
  id: string;
  session_id: string;
  user_name: string;
  user_message: string;
  bot_response: string;
  matched: boolean;
  feedback: "positive" | "negative" | null;
  created_at: string;
}

export interface ChatbotSettings {
  bot_name: string;
  greeting: string;
  fallback: string;
  bot_enabled: boolean;
  whatsapp_enabled: boolean;
}

const DEFAULT_SETTINGS: ChatbotSettings = {
  bot_name: "AtlasWave Assistant",
  greeting: "Hello! 👋 Welcome to AtlastWave Travel and Tour. How can I help you today?",
  fallback: "I'm not sure about that. Would you like to speak with a human agent?",
  bot_enabled: true,
  whatsapp_enabled: false,
};

export function useChatbotAdmin() {
  const { toast } = useToast();
  const [pairs, setPairs] = useState<TrainingPair[]>([]);
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [settings, setSettings] = useState<ChatbotSettings>(DEFAULT_SETTINGS);
  const [loadingPairs, setLoadingPairs] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const fetchPairs = useCallback(async () => {
    setLoadingPairs(true);
    const { data, error } = await supabase
      .from("chatbot_training")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching training pairs:", error);
    } else {
      setPairs(data as TrainingPair[]);
    }
    setLoadingPairs(false);
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from("chat_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      console.error("Error fetching chat logs:", error);
    } else {
      setLogs(data as ChatLog[]);
    }
    setLoadingLogs(false);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    const { data, error } = await supabase
      .from("chatbot_settings")
      .select("*");
    if (error) {
      console.error("Error fetching settings:", error);
    } else if (data) {
      const s = { ...DEFAULT_SETTINGS };
      for (const row of data) {
        const r = row as { key: string; value: string };
        if (r.key === "bot_name") s.bot_name = r.value;
        if (r.key === "greeting") s.greeting = r.value;
        if (r.key === "fallback") s.fallback = r.value;
        if (r.key === "bot_enabled") s.bot_enabled = r.value === "true";
        if (r.key === "whatsapp_enabled") s.whatsapp_enabled = r.value === "true";
      }
      setSettings(s);
    }
    setLoadingSettings(false);
  }, []);

  useEffect(() => {
    fetchPairs();
    fetchLogs();
    fetchSettings();
  }, [fetchPairs, fetchLogs, fetchSettings]);

  const savePair = async (pair: { keywords: string[]; response: string; category: string; active: boolean }, editId?: string) => {
    if (editId) {
      const { error } = await supabase
        .from("chatbot_training")
        .update({ keywords: pair.keywords, response: pair.response, category: pair.category, active: pair.active, updated_at: new Date().toISOString() })
        .eq("id", editId);
      if (error) { toast({ title: "Failed to update", variant: "destructive" }); return false; }
      toast({ title: "Training pair updated" });
    } else {
      const { error } = await supabase
        .from("chatbot_training")
        .insert({ keywords: pair.keywords, response: pair.response, category: pair.category, active: pair.active });
      if (error) { toast({ title: "Failed to add", variant: "destructive" }); return false; }
      toast({ title: "Training pair added" });
    }
    fetchPairs();
    return true;
  };

  const deletePair = async (id: string) => {
    const { error } = await supabase.from("chatbot_training").delete().eq("id", id);
    if (error) { toast({ title: "Failed to delete", variant: "destructive" }); return; }
    toast({ title: "Training pair deleted" });
    fetchPairs();
  };

  const saveSettings = async (s: ChatbotSettings) => {
    const updates = [
      { key: "bot_name", value: s.bot_name },
      { key: "greeting", value: s.greeting },
      { key: "fallback", value: s.fallback },
      { key: "bot_enabled", value: String(s.bot_enabled) },
      { key: "whatsapp_enabled", value: String(s.whatsapp_enabled) },
    ];
    for (const u of updates) {
      await supabase
        .from("chatbot_settings")
        .update({ value: u.value, updated_at: new Date().toISOString() })
        .eq("key", u.key);
    }
    setSettings(s);
    toast({ title: "Settings saved" });
  };

  const updateLogFeedback = async (logId: string, feedback: "positive" | "negative") => {
    await supabase.from("chat_logs").update({ feedback }).eq("id", logId);
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, feedback } : l));
  };

  return {
    pairs, logs, settings, setSettings,
    loadingPairs, loadingLogs, loadingSettings,
    savePair, deletePair, saveSettings, updateLogFeedback,
    refreshLogs: fetchLogs,
  };
}
