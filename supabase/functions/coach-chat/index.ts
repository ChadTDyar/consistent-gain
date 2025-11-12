import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { z } from "https://esm.sh/zod@3.22.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const requestSchema = z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000)
      })).max(50),
      userContext: z.object({
        streak: z.number().optional(),
        goalsCount: z.number().optional(),
        lastActivity: z.string().optional()
      }).optional()
    });

    const body = await req.json();
    const { messages, userContext } = requestSchema.parse(body);
    
    // Get authenticated user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization');
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify user with anon key
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const userId = user.id;

    // Initialize service client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check premium status from database, not client
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // Check rate limiting for non-premium users
    if (!profile?.is_premium) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: messageCount, error: countError } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("role", "user")
        .gte("created_at", today.toISOString());

      if (countError) {
        console.error("Error checking rate limit:", countError);
      } else if (messageCount && (messageCount as any).count >= 10) {
        return new Response(
          JSON.stringify({ 
            error: "Daily message limit reached. Upgrade to Premium for unlimited messages!",
            limitReached: true 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Save user message to database
    if (userId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        await supabase.from("chat_messages").insert({
          user_id: userId,
          message: lastMessage.content,
          role: "user"
        });
      }
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request for user:", userId, "Messages:", messages.length);

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
- Current Streak: ${userContext?.streak || 0} days
- Active Goals: ${userContext?.goalsCount || 0}
- Recent Activity: ${userContext?.lastActivity || "No recent activity"}
- Premium User: ${profile?.is_premium ? "Yes" : "No"}
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
