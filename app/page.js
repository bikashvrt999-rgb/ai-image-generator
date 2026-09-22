"use client";

import { useState, useRef } from "react";

const STYLES = [
  { label: "কোনো style না", value: "" },
  { label: "Realistic", value: "photorealistic, highly detailed" },
  { label: "Anime", value: "anime style, vibrant colors" },
  { label: "Fantasy Art", value: "fantasy digital art, dramatic lighting" },
  { label: "3D Render", value: "3d render, octane render, cinematic" },
];

const SIZES = [
  { label: "Square (768x768)", value: "768x768" },
  { label: "Portrait (768x1024)", value: "768x1024" },
  { label: "Landscape (1024x768)", value: "1024x768" },
];

const COOLDOWN_SECONDS = 15;

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [size, setSize] = useState("768x768");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function handleGenerate() {
    if (!prompt.trim() || loading || cooldown > 0) return;

    setLoading(true);
    setError("");
    setImageUrl("");

    const [width, height] = size.split("x").map(Number);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, width, height }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "কিছু একটা সমস্যা হয়েছে।");
      } else {
        setImageUrl(data.imageUrl);
        startCooldown();
      }
    } catch (e) {
      setError("Network এ সমস্যা হয়েছে, আবার try করো।");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }

  return (
    <div className="container">
      <h1>AI Image Generator</h1>
      <p className="subtitle">সম্পূর্ণ ফ্রি — যত ইচ্ছা image বানাও</p>

      <div className="form-row">
        <textarea
          placeholder="তোমার prompt লেখো... (যেমন: a cat wearing sunglasses on a beach)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="options-row">
        <select value={style} onChange={(e) => setStyle(e.target.value)}>
          {STYLES.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          {SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading || cooldown > 0 || !prompt.trim()}
        >
          {loading
            ? "বানাচ্ছি..."
            : cooldown > 0
            ? `${cooldown}s wait`
            : "Generate করো"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {cooldown > 0 && !error && (
        <p className="cooldown">পরের image এর জন্য {cooldown} সেকেন্ড wait করো</p>
      )}

      <div className="result">
        {loading && <div className="skeleton" />}
        {!loading && imageUrl && (
          <>
            <img src={imageUrl} alt={prompt} />
            <a href={imageUrl} download target="_blank" rel="noreferrer">
              <button className="download-btn">Download করো</button>
            </a>
          </>
        )}
      </div>
    </div>
  );
  }
