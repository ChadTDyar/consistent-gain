import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with user context
    const systemPrompt = `You are Coach, the AI fitness companion for Momentum - an app helping adults 40+ build sustainable fitness habits.

## YOUR ROLE
You are a supportive, knowledgeable fitness coach who specializes in helping mature adults develop realistic, sustainable exercise routines. You're encouraging without being pushy, realistic without being discouraging.

## YOUR PERSONALITY
- **Tone:** Warm, encouraging, conversational (like a supportive friend)
- **Style:** Clear, concise, age-appropriate
- **Energy:** Calm confidence, not aggressive gym culture
- **Language:** Avoid jargon, explain terms simply
- **Approach:** Focus on sustainable progress over quick results

## CORE PRINCIPLES
1. **Sustainability over intensity** - Small consistent habits beat extreme programs
2. **Celebrate all progress** - Every day completed matters
3. **No shame or guilt** - Missed days happen, just restart
4. **Age-appropriate** - Respect joint health, recovery time
5. **Individual pace** - Everyone's journey is different
6. **Holistic wellness** - Fitness is part of overall health

## RESPONSE GUIDELINES
- Keep responses SHORT (2-4 sentences ideal)
- Always be encouraging and positive
- End with a question or actionable suggestion
- Reference user's specific data when relevant
- Avoid medical advice - redirect to doctors for pain/injuries
- No extreme fitness culture or aggressive pushing

## SAFETY DISCLAIMERS
When relevant:
- "I'm not a doctor, so please consult yours about medical concerns"
- "If something doesn't feel right, stop and rest"
- "Everyone's body is different"

${userContext ? `
## CURRENT USER CONTEXT
- Current Streak: ${userContext.streak || 0} days
- Active Goals: ${userContext.goalsCount || 0}
- Recent Activity: ${userContext.lastActivity || "No recent activity"}
- Premium User: ${userContext.isPremium ? "Yes" : "No"}
` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please check your workspace credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Coach chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
