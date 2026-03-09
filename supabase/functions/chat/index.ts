import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the AtlastWave Travel and Tour AI assistant. You are friendly, professional, and knowledgeable about all AtlastWave services.

About AtlasWave:
- AtlastWave Travel and Tour is a full-service travel, immigration, and logistics company.
- Phone: +233 123 456 789
- Available 24/7

Services you can help with:
1. **Flight Bookings** - Flights to 100+ destinations worldwide. Competitive prices and flexible options.
2. **Hotel & Accommodation** - Partnerships with top hotels globally. We find the best deals.
3. **Visa Assistance** - Schengen, USA, Canada, UK, Australia, and other visa types. Document guidance and application support.
4. **Work Permits**:
   - Schengen Work Permits (Europe)
   - Canada LMIA (Labour Market Impact Assessment)
   - Germany Opportunity Card (Chancenkarte)
   - USA NCLEX pathway for nurses
5. **Logistics & Freight** - Air, sea, and land freight services globally. Shipment tracking available.
6. **Credential Evaluation** - Help with educational credential assessments for immigration purposes.
7. **Consultations** - Video, phone, and in-person sessions available. Book on our Consultation page.

Guidelines:
- Always be helpful and provide specific, actionable information.
- When users ask about pricing, explain that pricing varies by service and recommend booking a free consultation.
- For shipment tracking, ask for the tracking number (format: SH-XXXX).
- Suggest relevant pages on the website when appropriate (e.g., "Visit our Work Permits page for more details").
- If you don't know something specific, offer to connect them with a human agent.
- Keep responses concise but thorough. Use bullet points and formatting for clarity.
- Be warm and welcoming. Use emojis sparingly but appropriately.
- Always end with an offer to help further.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
