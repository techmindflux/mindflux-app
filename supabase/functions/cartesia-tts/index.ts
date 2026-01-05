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
    const { text } = await req.json();
    const CARTESIA_API_KEY = Deno.env.get("CARTESIA_API_KEY");

    if (!CARTESIA_API_KEY) {
      throw new Error("CARTESIA_API_KEY is not configured");
    }

    if (!text) {
      throw new Error("Text is required");
    }

    console.log("Generating speech with Cartesia Sonic...");

    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Cartesia-Version": "2024-06-10",
        "X-API-Key": CARTESIA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: "sonic-2",
        transcript: text,
        voice: {
          mode: "id",
          id: "79a125e8-cd45-4c13-8a67-188112f4dd22", // Female warm voice
        },
        output_format: {
          container: "mp3",
          bit_rate: 128000,
          sample_rate: 44100,
        },
        language: "en",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cartesia TTS error:", response.status, errorText);
      throw new Error(`TTS failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    console.log("Cartesia TTS generated successfully");

    return new Response(JSON.stringify({ audioContent: base64Audio }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("cartesia-tts error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
