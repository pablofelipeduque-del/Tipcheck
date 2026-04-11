"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { label: "Surprise me", icon: "🎲", query: "restaurants" },
  { label: "Restaurants", icon: "🥘", query: "restaurants" },
  { label: "Bakeries",    icon: "🥐", query: "bakeries" },
  { label: "Coffee",      icon: "☕", query: "coffee shops" },
  { label: "Fast Food",   icon: "🍔", query: "fast food" },
  { label: "Pizza",       icon: "🍕", query: "pizza" },
  { label: "Sushi",       icon: "🍣", query: "sushi" },
  { label: "Desserts",    icon: "🍰", query: "desserts" },
];

const VIBES = ["Casual 😎", "Trendy ✨", "Cozy 🛋️", "Local Fave 📍", "Lively 🎉", "Chill 🌿", "Classic 🏛️", "Hidden Gem 💎", "Date Night 🕯️", "Quick Bite ⚡"];

const REEL_ITEMS = ["🍕", "🍣", "☕", "🥐", "🍔", "🍰", "🥘", "🌮", "🍜", "🥗", "🍱", "🍷", "🥩", "🍛", "🍝"];

function SlotReel({ items, spinning, result, delay, label }) {
  const [display, setDisplay] = useState(items[0]);
  const [lockedValue, setLockedValue] = useState(null);
  const intervalRef = useRef(null);

  const isLocked = !spinning && lockedValue !== null;

  useEffect(() => {
    if (!spinning) return;

    // Reset locked state via a ref-based approach to avoid sync setState in effect
    setLockedValue(null);

    let i = 0;
    intervalRef.current = setInterval(() => {
      i = (i + 1) % items.length;
      setDisplay(items[i]);
    }, 80);

    const lockTimer = setTimeout(() => {
      clearInterval(intervalRef.current);
      setDisplay(result);
      setLockedValue(result);
    }, delay);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(lockTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);

  return (
    <div style={{ flex: 1, minWidth: "160px" }}>
      <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", marginBottom: "10px" }}>{label}</p>
      <div style={{
        background: "#0d1117",
        border: `2px solid ${isLocked ? "#f59e0b" : "#1f2937"}`,
        borderRadius: "18px",
        height: "110px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transition: "border-color 0.3s",
        boxShadow: isLocked ? "0 0 24px rgba(245,158,11,0.2)" : "none",
        padding: "0 12px",
      }}>
        <span style={{
          fontSize: spinning && !isLocked ? "36px" : "18px",
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.3,
          color: isLocked ? "white" : "#6b7280",
          transition: "font-size 0.2s",
          fontFamily: "'Syne', sans-serif",
          letterSpacing: spinning && !isLocked ? "0" : "-0.3px",
          filter: spinning && !isLocked ? "blur(1px)" : "none",
        }}>
          {display}
        </span>
      </div>
      {isLocked && (
        <p style={{ textAlign: "center", marginTop: "8px", fontSize: "11px", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>LOCKED IN ✓</p>
      )}
    </div>
  );
}

export default function RoulettePage() {
  const router = useRouter();
  const [dark, setDark] = useState(true);
  const [zip, setZip] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [minTip, setMinTip] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [allDone, setAllDone] = useState(false);
  const [reelResults, setReelResults] = useState({ cuisine: "?", vibe: "?", name: "?" });

  const bg = dark ? "#030712" : "#f9fafb";
  const surface = dark ? "#0d1117" : "#ffffff";
  const border = dark ? "#1f2937" : "#e5e7eb";
  const text = dark ? "#ffffff" : "#111827";
  const muted = dark ? "#6b7280" : "#9ca3af";

  async function handleSpin() {
    if (!zip.trim()) { setError("Enter a location first!"); return; }
    setError("");
    setResult(null);
    setAllDone(false);
    setSpinning(true);

    try {
      const query = `${category.query} in ${zip}`;
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!data.places || data.places.length === 0) {
        setError("No places found. Try a different location!");
        setSpinning(false);
        return;
      }

      // Filter by tip score
      const filtered = data.places.filter(p => p.tipScore >= minTip);
      const pool = filtered.length > 0 ? filtered : data.places;
      const pick = pool[Math.floor(Math.random() * pool.length)];

      const vibe = VIBES[Math.floor(Math.random() * VIBES.length)];

      setReelResults({
        cuisine: `${category.icon} ${category.label === "Surprise me" ? pick.category : category.label}`,
        vibe,
        name: pick.name,
      });

      // After all reels lock (last one at 2600ms), show the result card
      setTimeout(() => {
        setResult(pick);
        setAllDone(true);
        setSpinning(false);
      }, 3200);

    } catch {
      setError("Could not connect. Try again.");
      setSpinning(false);
    }
  }

  function handleReset() {
    setResult(null);
    setAllDone(false);
    setSpinning(false);
    setReelResults({ cuisine: "?", vibe: "?", name: "?" });
  }

  const tipColor = result ? (result.tipScore >= 7 ? "#10b981" : result.tipScore >= 4 ? "#f59e0b" : "#ef4444") : "#f59e0b";
  const tipLabel = result ? (result.tipScore >= 7 ? "Friendly" : result.tipScore >= 4 ? "Moderate" : "Pressured") : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${bg}; transition: background 0.3s; }
        .toggle-btn { width: 52px; height: 28px; border-radius: 999px; border: none; cursor: pointer; position: relative; transition: background 0.3s; }
        .toggle-knob { width: 22px; height: 22px; border-radius: 50%; background: white; position: absolute; top: 3px; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .spin-btn { width: 100%; padding: 20px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #030712; font-weight: 800; font-size: 20px; font-family: 'Syne', sans-serif; border: none; border-radius: 18px; cursor: pointer; letter-spacing: -0.5px; transition: all 0.2s; }
        .spin-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(245,158,11,0.35); }
        .spin-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .cat-btn { padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; border: 1px solid; white-space: nowrap; }
        .search-input { border-radius: 14px; padding: 14px 20px; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; width: 100%; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); } 50% { box-shadow: 0 0 0 12px rgba(245,158,11,0); } }
        .spin-pulse { animation: pulse 1.2s ease-in-out infinite; }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-4px); } 40%,80% { transform: translateX(4px); } }
        .shake { animation: shake 0.4s ease; }
        .result-card { animation: fadeUp 0.6s ease forwards; }
        .nav-link { color: #6b7280; font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: ${text}; }
        .machine-body { background: ${dark ? "#0d1117" : "#ffffff"}; border: 1px solid ${dark ? "#1f2937" : "#e5e7eb"}; border-radius: 28px; padding: 32px 28px; }
      `}</style>

      <main style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s" }}>

        {/* Header */}
        <header style={{ borderBottom: `1px solid ${border}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: dark ? "rgba(3,7,18,0.92)" : "rgba(249,250,251,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push("/")}>
            <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💸</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: text }}>Tip<span style={{ color: "#f59e0b" }}>Check</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <nav style={{ display: "flex", gap: "28px" }}>
              {[["Discover", "/"], ["Top Rated", "/top-rated"], ["Dining Roulette", "/roulette"], ["About", "/about"]].map(([item, path]) => (
                <a key={item} href={path} className="nav-link" style={{ color: item === "Dining Roulette" ? "#f59e0b" : muted }}>{item}</a>
              ))}
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>☀️</span>
              <button className="toggle-btn" onClick={() => setDark(!dark)} style={{ background: dark ? "#f59e0b" : "#d1d5db" }}>
                <div className="toggle-knob" style={{ left: dark ? "27px" : "3px" }} />
              </button>
              <span style={{ fontSize: "14px" }}>🌙</span>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "52px 24px 80px" }}>

          {/* Hero text */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "inline-block", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>
              🎰 Dining Roulette
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "16px", color: text }}>
              Stop debating.<br /><span style={{ color: "#f59e0b" }}>Just spin.</span>
            </h1>
            <p style={{ color: muted, fontSize: "16px", lineHeight: 1.7, maxWidth: "440px", margin: "0 auto" }}>
              Set your location, pick a vibe, and let the machine decide where you&apos;re eating tonight.
            </p>
          </div>

          {/* Slot Machine */}
          <div className="machine-body" style={{ marginBottom: "24px" }}>

            {/* Reels */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
              <SlotReel
                items={REEL_ITEMS}
                spinning={spinning}
                result={reelResults.cuisine}
                delay={1000}
                label="Cuisine"
              />
              <SlotReel
                items={VIBES}
                spinning={spinning}
                result={reelResults.vibe}
                delay={1800}
                label="Vibe"
              />
              <SlotReel
                items={["🍽️", "🔍", "✨", "📍", "🎯", "🍴", "🌟", "🔥"]}
                spinning={spinning}
                result={reelResults.name}
                delay={2600}
                label="Your Pick"
              />
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${border}`, marginBottom: "24px" }} />

            {/* Filters */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>

              {/* Location */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>📍 Location</label>
                <input
                  className="search-input"
                  type="text"
                  placeholder="ZIP code or city..."
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSpin()}
                  style={{ background: dark ? "#111827" : "#f9fafb", border: `1px solid ${border}`, color: text }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>🍽️ Cuisine</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.label} className="cat-btn"
                      onClick={() => setCategory(cat)}
                      style={{
                        background: category.label === cat.label ? "#f59e0b" : surface,
                        color: category.label === cat.label ? "#030712" : muted,
                        borderColor: category.label === cat.label ? "#f59e0b" : border,
                      }}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tip Score Filter */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>
                  💸 Min Tip Score: <span style={{ color: minTip >= 7 ? "#10b981" : minTip >= 4 ? "#f59e0b" : "#9ca3af" }}>{minTip}/10</span>
                  {minTip === 1 && <span style={{ color: "#6b7280", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}> (any)</span>}
                  {minTip >= 7 && <span style={{ color: "#10b981", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}> (friendly only)</span>}
                </label>
                <input
                  type="range" min="1" max="10" value={minTip}
                  onChange={e => setMinTip(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "#f59e0b" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#4b5563", marginTop: "4px" }}>
                  <span>Any place</span>
                  <span>Pressure-free only</span>
                </div>
              </div>
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>{error}</p>}

            {/* Spin button */}
            <button
              className={`spin-btn ${spinning ? "spin-pulse" : ""}`}
              onClick={allDone ? handleReset : handleSpin}
              disabled={spinning}
            >
              {spinning ? "🎰  Spinning..." : allDone ? "🔄  Spin Again" : "🎰  Spin the Machine"}
            </button>
          </div>

          {/* Result Card */}
          {allDone && result && (
            <div className="result-card" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))", border: "1px solid rgba(245,158,11,0.35)", borderRadius: "24px", padding: "28px" }}>
              <p style={{ color: "#f59e0b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>🎯 Tonight you&apos;re eating at...</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.8px", color: text }}>{result.name}</h2>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "10px", padding: "5px 12px" }}>
                  <span>⭐</span>
                  <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "16px" }}>{result.rating}</span>
                </span>
              </div>
              <p style={{ color: muted, fontSize: "13px", marginBottom: "4px" }}>📍 {result.address}</p>
              <p style={{ color: muted, fontSize: "13px", marginBottom: "20px" }}>💬 {result.reviews?.toLocaleString()} reviews</p>

              {/* Tip score */}
              <div style={{ background: dark ? "#0d1117" : "#f9fafb", borderRadius: "14px", padding: "16px 18px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
                  <span style={{ color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "11px" }}>Tip Culture</span>
                  <span style={{ color: tipColor, fontWeight: 700 }}>{tipLabel} · {result.tipScore}/10</span>
                </div>
                <div style={{ width: "100%", background: dark ? "#1f2937" : "#e5e7eb", borderRadius: "999px", height: "6px" }}>
                  <div style={{ width: `${result.tipScore * 10}%`, background: tipColor, height: "6px", borderRadius: "999px" }} />
                </div>
                {result.tip && <p style={{ color: muted, fontSize: "12px", fontStyle: "italic", marginTop: "10px" }}>&ldquo;{result.tip}&rdquo;</p>}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => router.push(`/restaurant/${result.id}`)}
                  style={{ flex: 1, padding: "14px", background: "#f59e0b", color: "#030712", fontWeight: 700, fontSize: "15px", fontFamily: "'DM Sans', sans-serif", border: "none", borderRadius: "14px", cursor: "pointer" }}
                >
                  See Full Details →
                </button>
                <button
                  onClick={handleReset}
                  style={{ padding: "14px 20px", background: "transparent", color: muted, fontWeight: 600, fontSize: "14px", fontFamily: "'DM Sans', sans-serif", border: `1px solid ${border}`, borderRadius: "14px", cursor: "pointer" }}
                >
                  🔄 Spin Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${border}`, padding: "40px 32px", textAlign: "center", background: dark ? "#0d1117" : "#ffffff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>💸</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 800, color: text }}>Tip<span style={{ color: "#f59e0b" }}>Check</span></span>
          </div>
          <p style={{ color: muted, fontSize: "13px" }}>Empowering diners with transparent tipping culture data.</p>
          <p style={{ color: border, fontSize: "12px", marginTop: "24px" }}>© 2026 TipCheck. All rights reserved.</p>
        </footer>

      </main>
    </>
  );
}
