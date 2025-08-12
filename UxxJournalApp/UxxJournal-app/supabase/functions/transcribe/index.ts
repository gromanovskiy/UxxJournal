// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// supabase/functions/transcribe/index.ts
// Type hints for Supabase Edge Runtime (optional but nice in editors)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Get secrets from Supabase (set via `supabase secrets set ...`)
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

Deno.serve(async (req) => {
  // Reflect the requesting origin so dev & prod both work
  const origin = req.headers.get("origin") ?? "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response("Server misconfigured: missing OPENAI_API_KEY", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Require a Supabase session token (so only signed-in users can use this)
    const auth = req.headers.get("authorization");
    if (!auth) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // Expect multipart/form-data with `file`
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new Response("No file provided", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Basic validations
    if (!file.type.startsWith("audio/")) {
      return new Response("Invalid mime type", {
        status: 415,
        headers: corsHeaders,
      });
    }
    if (file.size > 25 * 1024 * 1024) {
      return new Response("File too large (max 25MB)", {
        status: 413,
        headers: corsHeaders,
      });
    }

    // Forward to OpenAI Speech-to-Text (Audio Transcriptions API)
    const out = new FormData();
    out.append("model", "gpt-4o-mini-transcribe"); // low-cost STT model
    out.append("file", file, file.name || "audio.webm");
    out.append("response_format", "json");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: out,
    });

    if (!r.ok) {
      // Bubble up OpenAI error text so you can see it in logs
      const msg = await r.text();
      return new Response(`OpenAI error: ${msg}`, {
        status: 500,
        headers: corsHeaders,
      });
    }

    const data = await r.json(); // shape: { text: "..." , ... }
    const text = typeof data?.text === "string" ? data.text : "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(`Server error: ${e?.message ?? e}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/transcribe' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
