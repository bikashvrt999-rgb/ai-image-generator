import { NextResponse } from "next/server";

// Simple in-memory cooldown store (per server instance).
// Good enough for a small free project — resets on redeploy/restart.
const lastRequestByIP = new Map();
const COOLDOWN_MS = 15000; // 15 seconds between requests per IP

// Very basic banned-word filter. Add more terms as needed.
const BLOCKED_WORDS = ["nude", "naked", "nsfw", "porn", "sex"];

function containsBlockedWord(text) {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((w) => lower.includes(w));
}

export async function POST(req) {
  try {
    const { prompt, width = 768, height = 768, style = "" } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt দিতে হবে।" },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: "Prompt খুব বড়, ৫০০ character এর মধ্যে রাখো।" },
        { status: 400 }
      );
    }

    if (containsBlockedWord(prompt)) {
      return NextResponse.json(
        { error: "এই ধরনের prompt allowed না।" },
        { status: 400 }
      );
    }

    // Basic per-IP cooldown (works when deployed; may be undefined locally)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const now = Date.now();
    const last = lastRequestByIP.get(ip) || 0;

    if (now - last < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
      return NextResponse.json(
        { error: `একটু wait করো — আরও ${waitSec} সেকেন্ড পর আবার try করো।` },
        { status: 429 }
      );
    }
    lastRequestByIP.set(ip, now);

    const fullPrompt = style ? `${prompt}, ${style}` : prompt;
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(fullPrompt);

    // Pollinations.ai — free, no API key required
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    // Warm the URL so we can catch failures before sending to client
    const check = await fetch(imageUrl, { method: "GET" });
    if (!check.ok) {
      return NextResponse.json(
        { error: "Image generate করতে সমস্যা হয়েছে, আবার try করো।" },
        { status: 502 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    return NextResponse.json(
      { error: "কিছু একটা ভুল হয়েছে, আবার try করো।" },
      { status: 500 }
    );
  }
}
