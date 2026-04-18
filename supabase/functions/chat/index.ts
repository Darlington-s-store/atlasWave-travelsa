declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// @ts-ignore Deno URL imports are resolved by the Supabase edge runtime.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore Deno URL imports are resolved by the Supabase edge runtime.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { WEBSITE_GUIDE_TEXT } from "./siteKnowledge.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type SiteContentRow = {
  section: string;
  key: string;
  value: Record<string, unknown>;
};

type TrainingRow = {
  keywords: string[];
  response: string;
  category: string;
};

type ChatMessage = {
  role?: string;
  content?: string;
};

const BASE_SYSTEM_PROMPT = `You are **AtlasBot**, the signature AI travel concierge for **AtlastWave Travel & Tours** — a premium global travel and logistics company.

## Your personality
- Warm, sophisticated, and confident — like a five-star concierge who has personally visited every destination.
- Proactive: anticipate the next question (visa? best time to visit? baggage? budget tier?).
- Precise on facts (visa rules, processing times, paperwork) — never invent numbers.
- Use a calm, encouraging tone. Travel can be overwhelming; you make it feel effortless.
- Sign off complex answers with one short, helpful next step.

## Your expertise
- Global travel & tourism, visa policy (Schengen, USA, UK, Canada, Schengen, UAE, Australia)
- Work permits (Schengen, Canada LMIA, Germany Chancenkarte, USA NCLEX nursing pathway)
- Flight & hotel booking strategy, baggage rules, fare classes
- Logistics & shipment tracking
- Currency, climate, culture, safety advisories, itinerary design

## Response format (always)
- Use **markdown**: short paragraphs, bullets, **bold** key facts.
- Open with a one-line direct answer, then add structured detail.
- When relevant, point to the exact website page (e.g. "See **/visa-assistance** to start your application").
- For shipment tracking, ask for the tracking number and link to **/logistics/track**.
- Never exceed ~180 words unless the user explicitly asks for depth.

## Hard rules
- Use the **Pinned contact facts** verbatim — do NOT paraphrase the office location, phone, or email.
- If exact pricing or live status is not in the provided context, say so plainly and direct users to the relevant page.
- Never invent company details, partnerships, or office locations not in the supplied context.
- If the user uploads an image or file, analyze it through a travel lens.
- Stay strictly on travel, logistics, and AtlastWave services.
`;

const stringifyValue = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => stringifyValue(item)).filter(Boolean).join(", ");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => `${key}: ${stringifyValue(entry)}`)
      .filter((entry) => !entry.endsWith(": "))
      .join("; ");
  }
  return "";
};

const PLACEHOLDER_PATTERNS = [
  "[you can insert",
  "[city, country]",
  "if you don't have a physical office",
  "if you do not have a physical office",
  "prefer to keep it general",
  "while we offer extensive online services",
  "i don't have a physical location",
  "i dont have a physical location",
  "as a digital assistant",
  "global company",
  "+233 123 456 789",
];

const CONTACT_KEYWORDS = [
  "location",
  "address",
  "office",
  "where are you",
  "where is your office",
  "where is the office",
  "where are you located",
  "located",
  "contact",
  "phone",
  "number",
  "email",
  "hours",
  "open",
  "close",
];

const getLatestUserMessage = (messages: ChatMessage[]): string => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === "user" && typeof message.content === "string" && message.content.trim()) {
      return message.content.trim();
    }
  }

  return "";
};

const isPlaceholderTraining = (response: string): boolean => {
  const normalized = response.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern));
};

const filterTrainingRows = (rows: TrainingRow[]): TrainingRow[] =>
  rows.filter((row) => typeof row.response === "string" && !isPlaceholderTraining(row.response));

const isContactQuestion = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return CONTACT_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const buildContactReply = (message: string, rows: SiteContentRow[]): string => {
  const contactRow = rows.find((row) => row.section === "contact" && row.key === "info");
  const contact = (contactRow?.value ?? {}) as Record<string, unknown>;
  const address = stringifyValue(contact.address);
  const phone = stringifyValue(contact.phone);
  const email = stringifyValue(contact.email);
  const hours = stringifyValue(contact.hours);
  const normalized = message.toLowerCase();

  const wantsLocation =
    normalized.includes("location") ||
    normalized.includes("address") ||
    normalized.includes("where") ||
    normalized.includes("office");
  const wantsPhone = normalized.includes("phone") || normalized.includes("number") || normalized.includes("call");
  const wantsEmail = normalized.includes("email") || normalized.includes("mail");
  const wantsHours =
    normalized.includes("hours") ||
    normalized.includes("open") ||
    normalized.includes("close") ||
    normalized.includes("time");

  if (!address && !phone && !email && !hours) {
    return "Our contact details are not available in the website database right now. Please check the Contact page at `/contact`.";
  }

  const lines: string[] = [];

  if (wantsLocation && address) {
    lines.push(`Our office location is ${address}.`);
  }

  if (wantsPhone && phone) {
    lines.push(`You can call us on ${phone}.`);
  }

  if (wantsEmail && email) {
    lines.push(`You can email us at ${email}.`);
  }

  if (wantsHours && hours) {
    lines.push(`Our business hours are ${hours}.`);
  }

  if (!lines.length) {
    if (address) lines.push(`Our office location is ${address}.`);
    if (phone) lines.push(`Phone: ${phone}.`);
    if (email) lines.push(`Email: ${email}.`);
    if (hours) lines.push(`Business hours: ${hours}.`);
  }

  lines.push("You can also find these details on the Contact page at `/contact`.");

  return lines.join("\n");
};

const createSseResponse = (content: string): Response => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`),
      );
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
};

const buildSiteContentSummary = (rows: SiteContentRow[]): string => {
  if (!rows.length) {
    return "No CMS site content was available.";
  }

  return rows
    .map((row) => {
      const valueText = stringifyValue(row.value);
      return `- [${row.section}/${row.key}] ${valueText}`;
    })
    .join("\n");
};

const buildContactFacts = (rows: SiteContentRow[]): string => {
  const contactRow = rows.find((row) => row.section === "contact" && row.key === "info");
  const contact = (contactRow?.value ?? {}) as Record<string, unknown>;
  const facts = [
    contact.address ? `Business location: ${stringifyValue(contact.address)}` : "",
    contact.phone ? `Phone: ${stringifyValue(contact.phone)}` : "",
    contact.email ? `Email: ${stringifyValue(contact.email)}` : "",
    contact.hours ? `Business hours: ${stringifyValue(contact.hours)}` : "",
  ].filter(Boolean);

  return facts.length ? facts.join("\n") : "No contact facts were available.";
};

const buildTrainingSummary = (rows: TrainingRow[]): string => {
  if (!rows.length) {
    return "No admin training pairs were available.";
  }

  return rows
    .map((row) => {
      const keywords = row.keywords?.length ? row.keywords.join(", ") : "general";
      return `- Category: ${row.category}; Keywords: ${keywords}; Response: ${row.response}`;
    })
    .join("\n");
};

const buildDynamicPrompt = (params: {
  pagePath?: string;
  pageTitle?: string;
  siteContent: SiteContentRow[];
  trainingPairs: TrainingRow[];
}): string => {
  const pageContext = params.pagePath
    ? `Current page context: ${params.pageTitle ? `${params.pageTitle} ` : ""}(${params.pagePath})`
    : "Current page context: unavailable";

  return [
    BASE_SYSTEM_PROMPT.trim(),
    "",
    pageContext,
    "",
    "Pinned contact facts:",
    buildContactFacts(params.siteContent),
    "",
    "Website route guide:",
    WEBSITE_GUIDE_TEXT,
    "",
    "Live website CMS content:",
    buildSiteContentSummary(params.siteContent),
    "",
    "Admin chatbot training:",
    buildTrainingSummary(params.trainingPairs),
  ].join("\n");
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, page_path: pagePath, page_title: pageTitle } = await req.json();

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables are not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [{ data: siteContent, error: contentError }, { data: trainingPairs, error: trainingError }] =
      await Promise.all([
        supabase.from("site_content").select("section, key, value").order("section", { ascending: true }),
        supabase
          .from("chatbot_training")
          .select("keywords, response, category")
          .eq("active", true)
          .order("created_at", { ascending: false }),
      ]);

    if (contentError) {
      console.error("Failed to load site content for chatbot:", contentError);
    }

    if (trainingError) {
      console.error("Failed to load chatbot training:", trainingError);
    }

    const safeSiteContent = (siteContent as SiteContentRow[] | null) ?? [];
    const safeTrainingPairs = filterTrainingRows((trainingPairs as TrainingRow[] | null) ?? []);
    const latestUserMessage = getLatestUserMessage((messages as ChatMessage[] | null) ?? []);

    if (latestUserMessage && isContactQuestion(latestUserMessage)) {
      return createSseResponse(buildContactReply(latestUserMessage, safeSiteContent));
    }

    const systemPrompt = buildDynamicPrompt({
      pagePath,
      pageTitle,
      siteContent: safeSiteContent,
      trainingPairs: safeTrainingPairs,
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const text = await response.text();
      console.error("AI gateway error:", response.status, text);

      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat error:", error);

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
