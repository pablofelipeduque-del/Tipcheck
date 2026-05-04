"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import FloatingParticles from "../components/FloatingParticles";
import NavigateButton from "../components/NavigateButton";
import { useTheme } from "../components/useTheme";

// ── Shared nav (no Dining Roulette) ──────────────────────────────────────────
const NAV_LINKS = [["Home", "/"], ["Discover", "/discover"], ["Top Rated", "/top-rated"], ["Food Wheel", "/wheel"], ["About", "/about"]];

// ── Place Card ────────────────────────────────────────────────────────────────
function PlaceCard({ place, dark, border, surface, text, muted, router, badge }) {
  const hasComm = place.communityScore !== null;
  const score = hasComm ? place.communityScore : null;
  const scoreColor = !score ? "#6b7280" : score >= 4 ? "#10b981" : score >= 3 ? "#f59e0b" : "#ef4444";

  return (
    <div
      onClick={() => router.push(`/restaurant/${place.place_id}`)}
      style={{ flexShrink: 0, width: "280px", background: surface, border: `1px solid ${border}`, borderRadius: "20px", overflow: "hidden", cursor: "pointer", transition: "all 0.3s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#f59e0b"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ width: "100%", height: "160px", background: dark ? "#1f2937" : "#e5e7eb", position: "relative", overflow: "hidden" }}>
        {place.photo
          ? <img src={place.photo} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", opacity: 0.2 }}>🍽️</div>
        }
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "70px", background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }} />
        {place.rating && (
          <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(0,0,0,0.7)", color: "#fbbf24", fontWeight: 800, fontSize: "12px", padding: "4px 10px", borderRadius: "999px", display: "flex", alignItems: "center", gap: "4px" }}>
            ⭐ {place.rating}
          </div>
        )}
        {hasComm && (
          <div style={{ position: "absolute", top: "10px", right: "10px", background: scoreColor, color: "#fff", fontWeight: 800, fontSize: "11px", padding: "4px 10px", borderRadius: "999px" }}>
            TC {place.communityScore}/5
          </div>
        )}
        {badge && !hasComm && (
          <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.75)", color: "#f59e0b", fontWeight: 800, fontSize: "11px", padding: "4px 10px", borderRadius: "999px" }}>
            {badge}
          </div>
        )}
      </div>
      <div style={{ padding: "16px" }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: 800, color: text, marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {place.name}
        </h3>
        <p style={{ color: muted, fontSize: "12px", marginBottom: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {place.address}
        </p>
        {hasComm ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
              <span style={{ color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tip Culture</span>
              <span style={{ color: scoreColor, fontWeight: 700 }}>{score}/5 · {place.communityReports} report{place.communityReports !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ width: "100%", background: dark ? "#1f2937" : "#e5e7eb", borderRadius: "999px", height: "4px" }}>
              <div style={{ width: `${score * 20}%`, background: scoreColor, height: "4px", borderRadius: "999px" }} />
            </div>
          </div>
        ) : (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", borderRadius: "999px", padding: "5px 12px" }}>
            <span style={{ fontSize: "10px" }}>📡</span>
            <span style={{ color: muted, fontSize: "11px", fontWeight: 600 }}>No community reports yet</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <NavigateButton placeId={place.place_id} name={place.name} address={place.address} size="sm" />
        </div>
      </div>
    </div>
  );
}

// ── Section Row ───────────────────────────────────────────────────────────────
function SectionRow({ icon, title, subtitle, children, border, text, muted, delay = 0 }) {
  return (
    <div style={{ marginBottom: "52px", animation: `fadeUp 0.5s ease ${delay}s both` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <span style={{ fontSize: "24px" }}>{icon}</span>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, color: text }}>{title}</h2>
        <div style={{ flex: 1, height: "1px", background: border, marginLeft: "8px" }} />
      </div>
      {subtitle && <p style={{ color: muted, fontSize: "13px", marginBottom: "18px" }}>{subtitle}</p>}
      <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px" }}>
        {children}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Roulette Components
// ══════════════════════════════════════════════════════════════════════════════

const ROULETTE_CATEGORIES = [
  { label: "Surprise me", icon: "🎲", query: "restaurants" },
  { label: "Restaurants", icon: "🥘", query: "restaurants" },
  { label: "Bakeries",    icon: "🥐", query: "bakeries" },
  { label: "Coffee",      icon: "☕", query: "coffee shops" },
  { label: "Fast Food",   icon: "🍔", query: "fast food" },
  { label: "Pizza",       icon: "🍕", query: "pizza" },
  { label: "Sushi",       icon: "🍣", query: "sushi" },
  { label: "Desserts",    icon: "🍰", query: "desserts" },
];

const VIBES = ["Casual 😎","Trendy ✨","Cozy 🛋️","Local Fave 📍","Lively 🎉","Chill 🌿","Classic 🏛️","Hidden Gem 💎","Date Night 🕯️","Quick Bite ⚡"];
const DRUM_1 = ["🍕","🍣","☕","🥐","🍔","🍰","🥘","🌮","🍜","🥗","🍱","🍷","🥩","🍛","🍝"];
const DRUM_2 = ["✨","😎","🛋️","📍","🎉","🌿","🏛️","💎","🕯️","⚡","🌟","🔥","💫","🎭","🎪"];
const DRUM_3 = ["🍽️","🔍","🌟","🔥","🎯","🍴","🏆","💫","🎪","🎭","✨","💥","🎰","🎲","🎡"];

function useSoundEngine() {
  const ctxRef = useRef(null);
  const spinRef = useRef(null);
  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);
  const leverPull = useCallback(() => {
    const c = getCtx(); const dur = 0.28;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) { const t = i / c.sampleRate; d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 22) * 0.35 + Math.sin(2 * Math.PI * 85 * t) * Math.exp(-t * 14) * 0.6; }
    const src = c.createBufferSource(); src.buffer = buf;
    const g = c.createGain(); g.gain.value = 0.8;
    src.connect(g); g.connect(c.destination); src.start();
  }, [getCtx]);
  const startSpin = useCallback(() => {
    const c = getCtx();
    spinRef.current = setInterval(() => {
      const len = Math.floor(c.sampleRate * 0.016);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.14;
      const src = c.createBufferSource(); src.buffer = buf;
      src.connect(c.destination); src.start();
    }, 65);
  }, [getCtx]);
  const stopSpin = useCallback(() => { if (spinRef.current) { clearInterval(spinRef.current); spinRef.current = null; } }, []);
  const reelLock = useCallback((idx) => {
    const c = getCtx(); const pairs = [[640,320],[720,360],[840,420]]; const [hi, lo] = pairs[idx] ?? [640, 320];
    const osc = c.createOscillator(); osc.type = "square";
    const g = c.createGain();
    osc.frequency.setValueAtTime(hi, c.currentTime); osc.frequency.exponentialRampToValueAtTime(lo, c.currentTime + 0.08);
    g.gain.setValueAtTime(0.22, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
    osc.connect(g); g.connect(c.destination); osc.start(); osc.stop(c.currentTime + 0.22);
  }, [getCtx]);
  const winJingle = useCallback(() => {
    const c = getCtx();
    [[523,0],[659,0.11],[784,0.22],[1047,0.37],[1319,0.54]].forEach(([freq, delay]) => {
      const osc = c.createOscillator(); osc.type = "triangle"; osc.frequency.value = freq;
      const g = c.createGain(); const t = c.currentTime + delay;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.38, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(g); g.connect(c.destination); osc.start(t); osc.stop(t + 0.32);
    });
  }, [getCtx]);
  return { leverPull, startSpin, stopSpin, reelLock, winJingle };
}

function Drum({ items, spinning, result, lockDelay, label, onLock }) {
  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    if (!spinning) { setLocked(false); return; }
    setLocked(false);
    let i = 0; let running = true;
    const cycle = (ms) => { timerRef.current = setTimeout(() => { if (!running) return; i = (i + 1) % items.length; setIdx(i); cycle(ms); }, ms); };
    cycle(55);
    const lockTimer = setTimeout(() => {
      running = false; clearTimeout(timerRef.current);
      let ds = 80;
      const decel = () => { i = (i + 1) % items.length; setIdx(i); ds = Math.min(ds + 55, 480); if (ds >= 480) { setLocked(true); onLock?.(); return; } timerRef.current = setTimeout(decel, ds); };
      timerRef.current = setTimeout(decel, ds);
    }, lockDelay);
    return () => { running = false; clearTimeout(timerRef.current); clearTimeout(lockTimer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);
  const blurring = spinning && !locked;
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ color: "#92400e", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", textAlign: "center", marginBottom: "8px" }}>{label}</p>
      <div style={{ position: "relative", background: "#030303", border: `3px solid ${locked ? "#f59e0b" : "#1c1008"}`, borderRadius: "10px", height: "126px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: locked ? "0 0 28px rgba(245,158,11,0.55), inset 0 2px 10px rgba(0,0,0,0.9)" : "inset 0 2px 10px rgba(0,0,0,0.9), 0 0 0 1px #0a0500", transition: "border-color 0.25s, box-shadow 0.3s" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #030303 0%, transparent 32%, transparent 68%, #030303 100%)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "8px", right: "8px", top: "50%", transform: "translateY(-50%)", height: "40px", background: locked ? "rgba(245,158,11,0.06)" : "transparent", border: locked ? "1px solid rgba(245,158,11,0.15)" : "none", borderRadius: "6px", zIndex: 1, transition: "all 0.3s" }} />
        <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "0 8px", width: "100%" }}>
          {locked ? <span style={{ fontSize: "12px", fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.2px", lineHeight: 1.35, display: "block" }}>{result}</span>
                  : <span style={{ fontSize: "42px", lineHeight: 1, display: "block", filter: blurring ? "blur(2.5px)" : "none", transition: "filter 0.05s", userSelect: "none" }}>{items[idx]}</span>}
        </div>
      </div>
      <div style={{ height: "16px", textAlign: "center", marginTop: "5px" }}>
        {locked && <span style={{ fontSize: "8px", color: "#f59e0b", fontWeight: 800, letterSpacing: "0.2em" }}>● LOCKED ●</span>}
      </div>
    </div>
  );
}

function Lever({ pulling, onPull }) {
  return (
    <div onClick={onPull ?? undefined} title="Pull to spin!" style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: onPull ? "pointer" : "default", padding: "0 14px", userSelect: "none" }}>
      <div style={{ width: "22px", height: "22px", background: "linear-gradient(135deg, #9ca3af, #6b7280)", borderRadius: "50%", border: "3px solid #4b5563", boxShadow: "0 2px 6px rgba(0,0,0,0.6)", zIndex: 2 }} />
      <div style={{ width: "10px", height: "106px", background: "linear-gradient(90deg, #e5e7eb 0%, #adb5bd 45%, #6b7280 100%)", borderRadius: "5px", marginTop: "-4px", transformOrigin: "top center", transform: pulling ? "rotate(28deg)" : "rotate(-7deg)", transition: "transform 0.13s ease-out", boxShadow: "2px 2px 8px rgba(0,0,0,0.5)" }} />
      <div style={{ width: "32px", height: "32px", background: "radial-gradient(circle at 36% 34%, #f87171, #ef4444 55%, #b91c1c)", borderRadius: "50%", border: "3px solid #991b1b", marginTop: "-4px", boxShadow: "0 4px 14px rgba(239,68,68,0.55), inset 0 -2px 4px rgba(0,0,0,0.35)", position: "relative" }}>
        <div style={{ position: "absolute", top: "6px", left: "7px", width: "7px", height: "5px", background: "rgba(255,255,255,0.38)", borderRadius: "50%", transform: "rotate(-28deg)" }} />
      </div>
      <p style={{ color: "#92400e", fontSize: "8px", fontWeight: 800, letterSpacing: "0.15em", marginTop: "10px", textTransform: "uppercase" }}>PULL</p>
    </div>
  );
}

function Bulb({ on }) {
  return (
    <div style={{ width: "13px", height: "13px", borderRadius: "50%", flexShrink: 0, background: on ? "radial-gradient(circle, #fef08a, #f59e0b)" : "#1c0e00", boxShadow: on ? "0 0 7px 3px rgba(245,158,11,0.65)" : "none", border: `2px solid ${on ? "#d97706" : "#3b1f00"}`, transition: "all 0.15s ease" }} />
  );
}

// ── Main Discover Page ────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const router = useRouter();
  const { dark, toggle: toggleDark } = useTheme();

  // Discover state
  const [inputZip, setInputZip] = useState("");
  const [zip, setZip] = useState("");
  const [categories, setCategories] = useState([]);
  const [hiddenGems, setHiddenGems] = useState([]);
  const [greatTippingSpots, setGreatTippingSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Roulette state
  const sounds = useSoundEngine();
  const [rouletteCategory, setRouletteCategory] = useState(ROULETTE_CATEGORIES[0]);
  const [spinning, setSpinning] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [result, setResult] = useState(null);
  const [rouletteError, setRouletteError] = useState("");
  const [allDone, setAllDone] = useState(false);
  const [reelResults, setReelResults] = useState({ cuisine: "", vibe: "", name: "" });
  const [bulbs, setBulbs] = useState(Array(18).fill(false));
  const [winning, setWinning] = useState(false);
  const [minTip, setMinTip] = useState(1);

  const bg = dark ? "#030712" : "#f9fafb";
  const surface = dark ? "#0d1117" : "#ffffff";
  const border = dark ? "#1f2937" : "#e5e7eb";
  const text = dark ? "#ffffff" : "#111827";
  const muted = dark ? "#6b7280" : "#9ca3af";

  // Bulb animation
  useEffect(() => {
    let frame = 0;
    const iv = setInterval(() => {
      frame++;
      if (winning)       setBulbs(prev => prev.map(() => Math.random() > 0.25));
      else if (spinning) setBulbs(prev => prev.map((_, i) => (i + frame) % 3 === 0));
      else               setBulbs(prev => prev.map((_, i) => (i + frame) % 5 === 0));
    }, winning ? 110 : spinning ? 95 : 700);
    return () => clearInterval(iv);
  }, [spinning, winning]);

  useEffect(() => {
    if (!winning) return;
    const t = setTimeout(() => setWinning(false), 3200);
    return () => clearTimeout(t);
  }, [winning]);

  async function handleSearch(overrideZip) {
    const zipVal = overrideZip || inputZip.trim();
    if (!zipVal) return;
    setLoading(true);
    setSearched(false);
    setZip(zipVal);
    if (!overrideZip) setInputZip(zipVal);
    const res = await fetch(`/api/discover?zip=${encodeURIComponent(zipVal)}`);
    const data = await res.json();
    setCategories(data.categories || []);
    setHiddenGems(data.hiddenGems || []);
    setGreatTippingSpots(data.greatTippingSpots || []);
    setLoading(false);
    setSearched(true);
  }

  async function handleLocateMe() {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const geo = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          const geoData = await geo.json();
          const location = geoData.zip || geoData.city || `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
          setInputZip(location);
          await handleSearch(location);
        } catch { setLoading(false); }
      },
      () => { setLoading(false); }
    );
  }

  async function handleSpin() {
    const zipToUse = inputZip.trim() || zip;
    if (!zipToUse) { setRouletteError("Enter a ZIP above first!"); return; }
    setRouletteError(""); setResult(null); setAllDone(false);
    setPulling(true); sounds.leverPull();
    setTimeout(() => setPulling(false), 280);
    setTimeout(async () => {
      setSpinning(true); sounds.startSpin();
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(`${rouletteCategory.query} in ${zipToUse}`)}`);
        const data = await res.json();
        if (!data.places?.length) { sounds.stopSpin(); setSpinning(false); setRouletteError("No places found. Try a different location!"); return; }
        const pool = data.places.filter(p => p.tipScore >= minTip);
        const pick = (pool.length ? pool : data.places)[Math.floor(Math.random() * (pool.length || data.places.length))];
        const vibe = VIBES[Math.floor(Math.random() * VIBES.length)];
        setReelResults({
          cuisine: `${rouletteCategory.icon} ${rouletteCategory.label === "Surprise me" ? (pick.category || "restaurant").replace(/_/g, " ") : rouletteCategory.label}`,
          vibe,
          name: pick.name,
        });
        setTimeout(() => { sounds.stopSpin(); setSpinning(false); setResult(pick); setAllDone(true); setWinning(true); sounds.winJingle(); }, 3400);
      } catch { sounds.stopSpin(); setSpinning(false); setRouletteError("Could not connect. Try again."); }
    }, 220);
  }

  function handleReset() {
    setResult(null); setAllDone(false); setSpinning(false); setWinning(false);
    setReelResults({ cuisine: "", vibe: "", name: "" });
  }

  const tipColor = result ? (result.tipScore >= 4 ? "#10b981" : result.tipScore >= 3 ? "#f59e0b" : "#ef4444") : "#f59e0b";
  const tipLabel = result ? (result.tipScore >= 4 ? "Friendly" : result.tipScore >= 3 ? "Moderate" : "Pressured") : "";
  const cardProps = { dark, border, surface, text, muted, router };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${bg}; transition: background 0.3s; }
        .toggle-btn { width: 52px; height: 28px; border-radius: 999px; border: none; cursor: pointer; position: relative; transition: background 0.3s; }
        .toggle-knob { width: 22px; height: 22px; border-radius: 50%; background: white; position: absolute; top: 3px; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .nav-link { font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; padding: 6px 14px; border-radius: 999px; }
        .nav-link:hover { background: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; color: #f59e0b !important; }
        ::-webkit-scrollbar { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 48px; height: 48px; border: 3px solid ${border}; border-top-color: #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .cat-btn { padding: 7px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; border: 1px solid; white-space: nowrap; }
        .spin-btn { width: 100%; padding: 18px; font-weight: 900; font-size: 18px; font-family: 'Syne', sans-serif; border-radius: 14px; cursor: pointer; letter-spacing: 0.04em; transition: all 0.1s; }
        .spin-btn:active:not(:disabled) { transform: translateY(3px) !important; box-shadow: none !important; }
        @keyframes winPulse { 0%,100% { box-shadow: 0 0 40px rgba(245,158,11,0.25); } 50% { box-shadow: 0 0 90px rgba(245,158,11,0.75), 0 0 140px rgba(245,158,11,0.25); } }
        .machine-win { animation: winPulse 0.38s ease-in-out infinite; }
        @keyframes coinFall { 0% { transform: translateY(-10px) rotate(0deg); opacity:1; } 100% { transform: translateY(90px) rotate(400deg); opacity:0; } }
        .coin { position: absolute; animation: coinFall linear forwards; font-size: 18px; pointer-events: none; }
      `}</style>

      <FloatingParticles count={18} />
      <main style={{ minHeight: "100vh", color: text, fontFamily: "'DM Sans', sans-serif", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <header style={{ borderBottom: `1px solid ${border}`, padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: dark ? "rgba(3,7,18,0.92)" : "rgba(249,250,251,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
          <div style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            <img src={dark ? "/Tipcheck.png" : "/Tipcheck-dark.png"} alt="TipCheck" style={{ height: "96px", width: "auto" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <nav style={{ display: "flex", gap: "4px" }}>
              {NAV_LINKS.map(([item, path]) => (
                <a key={item} href={path} className="nav-link"
                  style={{ color: item === "Discover" ? "#f59e0b" : dark ? "#e5e7eb" : "#1f2937", background: item === "Discover" ? (dark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.1)") : "transparent" }}
                >{item}</a>
              ))}
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>☀️</span>
              <button className="toggle-btn" onClick={toggleDark} style={{ background: dark ? "#f59e0b" : "#d1d5db" }}>
                <div className="toggle-knob" style={{ left: dark ? "27px" : "3px" }} />
              </button>
              <span>🌙</span>
            </div>
          </div>
        </header>

        {/* Hero + Search */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "56px 32px 48px" }}>
          <div className="fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "6px 16px", marginBottom: "20px" }}>
              <span>⭐</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase" }}>App Exclusive</span>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", color: text, marginBottom: "12px" }}>
              Top picks near you.<br />
              <span style={{ color: "#f59e0b" }}>Every cuisine. No pressure.</span>
            </h1>
            <p style={{ color: muted, fontSize: "16px", lineHeight: 1.7, maxWidth: "520px", marginBottom: "32px" }}>
              Enter your ZIP and we'll surface hidden gems, great tipping spots, top picks per cuisine — and spin the roulette when you can't decide.
            </p>
            <div style={{ display: "flex", gap: "12px", maxWidth: "460px" }}>
              <div style={{ flex: 1, background: dark ? "rgba(255,255,255,0.06)" : "#ffffff", border: `1px solid ${border}`, borderRadius: "14px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>📍</span>
                <input
                  type="text"
                  placeholder="Enter ZIP code..."
                  value={inputZip}
                  onChange={(e) => setInputZip(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "15px", color: text, fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                style={{ background: "#f59e0b", color: "#030712", fontWeight: 700, padding: "14px 28px", borderRadius: "14px", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", opacity: loading ? 0.6 : 1, transition: "all 0.2s" }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#fbbf24"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f59e0b"; e.currentTarget.style.transform = ""; }}
              >
                {loading ? "Loading..." : "Discover →"}
              </button>
              <button
                onClick={handleLocateMe}
                disabled={loading}
                style={{ background: "#f59e0b", color: "#030712", fontWeight: 700, padding: "14px 22px", borderRadius: "14px", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", opacity: loading ? 0.6 : 1, transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#fbbf24"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f59e0b"; e.currentTarget.style.transform = ""; }}
              >
                📍 Locate Near Me
              </button>
            </div>
            {zip && !loading && (
              <p style={{ color: muted, fontSize: "13px", marginTop: "12px" }}>
                📍 Showing results near <strong style={{ color: text }}>{zip}</strong> ·{" "}
                <span style={{ color: "#f59e0b", cursor: "pointer" }} onClick={() => { setZip(""); setInputZip(""); setCategories([]); setHiddenGems([]); setGreatTippingSpots([]); setSearched(false); }}>Clear</span>
              </p>
            )}
          </div>
        </section>

        {/* Results */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 20px" }}>

          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div className="spinner" />
              <p style={{ color: muted, fontSize: "15px" }}>Finding the best spots near {inputZip}...</p>
              <p style={{ color: muted, fontSize: "12px", marginTop: "8px", opacity: 0.6 }}>Searching across 14 categories</p>
            </div>
          )}

          {!loading && !searched && (
            <div style={{ paddingBottom: "20px" }}>
              {/* How It Works */}
              <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
                {/* Left: intro */}
                <div style={{ flex: "1 1 280px", minWidth: "260px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "5px 14px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "11px" }}>🔬</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.1em", textTransform: "uppercase" }}>Our Algorithm</span>
                  </div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: text, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "16px" }}>
                    How TipCheck builds your perfect recommendation
                  </h2>
                  <p style={{ color: muted, fontSize: "15px", lineHeight: 1.7, marginBottom: "24px" }}>
                    We don't just show you star ratings. We layer Google's venue data with real community tipping reports to surface places that are both great <em>and</em> guilt-free.
                  </p>
                  {/* Score preview */}
                  <div style={{ background: dark ? "#0d1117" : "#f9fafb", border: `1px solid ${dark ? "#1f2937" : "#e5e7eb"}`, borderRadius: "16px", padding: "18px 20px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>Example TipCheck score</p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: "100px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
                          <span style={{ color: dark ? "#e5e7eb" : "#374151", fontWeight: 600 }}>Google ⭐</span>
                          <span style={{ color: "#f59e0b", fontWeight: 700 }}>4.6 / 5</span>
                        </div>
                        <div style={{ width: "100%", background: dark ? "#1f2937" : "#e5e7eb", borderRadius: "999px", height: "5px" }}>
                          <div style={{ width: "92%", background: "#f59e0b", height: "5px", borderRadius: "999px" }} />
                        </div>
                      </div>
                      <span style={{ color: muted, fontSize: "18px" }}>+</span>
                      <div style={{ flex: 1, minWidth: "100px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
                          <span style={{ color: dark ? "#e5e7eb" : "#374151", fontWeight: 600 }}>TC Score</span>
                          <span style={{ color: "#10b981", fontWeight: 700 }}>4.8 / 5</span>
                        </div>
                        <div style={{ width: "100%", background: dark ? "#1f2937" : "#e5e7eb", borderRadius: "999px", height: "5px" }}>
                          <div style={{ width: "96%", background: "#10b981", height: "5px", borderRadius: "999px" }} />
                        </div>
                      </div>
                      <span style={{ color: muted, fontSize: "18px" }}>=</span>
                      <div style={{ background: "linear-gradient(135deg, #f59e0b, #10b981)", borderRadius: "12px", padding: "8px 14px", textAlign: "center", flexShrink: 0 }}>
                        <p style={{ fontSize: "9px", fontWeight: 800, color: "#030712", letterSpacing: "0.1em" }}>TOP PICK</p>
                        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 900, color: "#030712", lineHeight: 1, marginTop: "2px" }}>💎</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: steps */}
                <div style={{ flex: "1 1 280px", minWidth: "260px" }}>
                  {[
                    { icon: "🌐", color: "#6366f1", bg: "rgba(99,102,241,0.1)", step: "01", title: "Google Places scan", body: "We query Google's database of 10M+ venues — pulling ratings, review counts, photos, and location data in real time for your area." },
                    { icon: "💎", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", step: "02", title: "Hidden Gems filter", body: "Our algorithm flags venues with fewer than 150 reviews but a rating above 4.2 — genuinely great places that haven't gone mainstream yet.", highlight: true },
                    { icon: "📡", color: "#10b981", bg: "rgba(16,185,129,0.1)", step: "03", title: "TipCheck community layer", body: "Real diner reports are mapped onto each venue. We score tip pressure (1–5) and whether staff manipulated the checkout screen." },
                    { icon: "✨", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", step: "04", title: "Unified score", body: "Google quality + community tip culture = your recommendation. Not just stars — but how it actually feels to eat there." },
                  ].map(({ icon, color, bg, step, title, body, highlight }, i) => (
                    <div key={step} style={{ display: "flex", gap: "14px", marginBottom: "12px", background: highlight ? (dark ? "rgba(245,158,11,0.07)" : "rgba(245,158,11,0.05)") : (dark ? "rgba(255,255,255,0.03)" : "#ffffff"), border: `1px solid ${highlight ? "rgba(245,158,11,0.25)" : (dark ? "#1f2937" : "#e5e7eb")}`, borderRadius: "14px", padding: "14px", animation: `fadeUp 0.4s ease ${i * 0.08}s both` }}>
                      <div style={{ flexShrink: 0, width: "38px", height: "38px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>{icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" }}>
                          <span style={{ fontSize: "9px", fontWeight: 800, color, letterSpacing: "0.12em", textTransform: "uppercase" }}>STEP {step}</span>
                          {highlight && <span style={{ fontSize: "9px", fontWeight: 800, color: "#f59e0b", background: "rgba(245,158,11,0.15)", padding: "1px 6px", borderRadius: "999px" }}>EXCLUSIVE</span>}
                        </div>
                        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "13px", fontWeight: 700, color: text, marginBottom: "3px" }}>{title}</p>
                        <p style={{ fontSize: "12px", color: muted, lineHeight: 1.55 }}>{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && searched && categories.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>😕</div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, color: text, marginBottom: "12px" }}>No results found for {zip}</h2>
              <p style={{ color: muted, fontSize: "15px" }}>Try a different ZIP code.</p>
            </div>
          )}

          {!loading && searched && categories.length > 0 && (
            <>
              {/* Hidden Gems */}
              {hiddenGems.length > 0 && (
                <SectionRow icon="💎" title="Hidden Gems" subtitle={`Underrated spots near ${zip} — low profile, high quality`} border={border} text={text} muted={muted} delay={0}>
                  {hiddenGems.map((place) => (
                    <PlaceCard key={place.place_id} place={place} {...cardProps} badge="💎 Gem" />
                  ))}
                </SectionRow>
              )}

              {/* Great Tipping Spots */}
              {greatTippingSpots.length > 0 && (
                <SectionRow icon="✅" title="Great Tipping Spots" subtitle="Community-verified — no pressure, great experience" border={border} text={text} muted={muted} delay={0.05}>
                  {greatTippingSpots.map((place) => (
                    <PlaceCard key={place.place_id} place={place} {...cardProps} />
                  ))}
                </SectionRow>
              )}

              {/* Per-category sections */}
              {categories.map((cat, ci) => (
                <SectionRow key={cat.name} icon={cat.icon} title={cat.name} subtitle={`Top ${cat.places.length} near ${zip}`} border={border} text={text} muted={muted} delay={(ci + 1) * 0.05}>
                  {cat.places.map((place) => (
                    <PlaceCard key={place.place_id} place={place} {...cardProps} />
                  ))}
                </SectionRow>
              ))}
            </>
          )}
        </section>

        {/* ══ DINING ROULETTE SECTION ══ */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 80px" }}>
          <div style={{ borderTop: `1px solid ${border}`, paddingTop: "52px" }}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "6px 16px", marginBottom: "16px" }}>
                <span>🎰</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase" }}>Dining Roulette</span>
              </div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", color: text, marginBottom: "10px" }}>
                Can't decide? <span style={{ color: "#f59e0b" }}>Just spin.</span>
              </h2>
              <p style={{ color: muted, fontSize: "15px", lineHeight: 1.7, maxWidth: "380px", margin: "0 auto" }}>
                Pull the lever and let fate decide where you're eating tonight.
                {zip && <span style={{ color: "#f59e0b" }}> Using {zip}.</span>}
              </p>
            </div>

            <div style={{ maxWidth: "680px", margin: "0 auto" }}>
              {/* Slot machine */}
              <div className={winning ? "machine-win" : ""} style={{ background: "linear-gradient(170deg, #1c0900 0%, #0d0400 100%)", border: "4px solid #92400e", borderRadius: "24px", overflow: "hidden", boxShadow: "0 28px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(245,158,11,0.15)", marginBottom: "22px", position: "relative" }}>
                <div style={{ background: "linear-gradient(90deg, #78350f, #b45309, #92400e, #b45309, #78350f)", padding: "10px 24px", textAlign: "center", borderBottom: "2px solid #78350f" }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "12px", fontWeight: 800, color: "#fef3c7", letterSpacing: "0.32em", textTransform: "uppercase" }}>✦ Dining Roulette ✦</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "9px 16px", background: "#080300", borderBottom: "1px solid #1c0900" }}>
                  {bulbs.map((on, i) => <Bulb key={i} on={on} />)}
                </div>
                <div style={{ display: "flex", alignItems: "center", padding: "20px 18px 14px", background: "linear-gradient(180deg, #180700 0%, #0d0400 100%)" }}>
                  <div style={{ flex: 1, background: "#020100", border: "3px solid #78350f", borderRadius: "16px", padding: "16px 14px", display: "flex", gap: "10px", boxShadow: "inset 0 4px 18px rgba(0,0,0,0.85)" }}>
                    <Drum items={DRUM_1} spinning={spinning} result={reelResults.cuisine} lockDelay={900}  label="Cuisine"   onLock={() => sounds.reelLock(0)} />
                    <Drum items={DRUM_2} spinning={spinning} result={reelResults.vibe}    lockDelay={1750} label="Vibe"      onLock={() => sounds.reelLock(1)} />
                    <Drum items={DRUM_3} spinning={spinning} result={reelResults.name}    lockDelay={2650} label="Your Pick" onLock={() => sounds.reelLock(2)} />
                  </div>
                  <Lever pulling={pulling} onPull={!spinning ? (allDone ? handleReset : handleSpin) : null} />
                </div>
                <div style={{ display: "flex", justifyContent: "center", padding: "0 0 6px", gap: "24px" }}>
                  {[0, 1].map(i => <div key={i} style={{ width: "44px", height: "7px", background: "#020100", border: "2px solid #78350f", borderRadius: "4px" }} />)}
                </div>
                <div style={{ background: "#080300", borderTop: "2px solid #78350f", padding: "18px 22px" }}>
                  {rouletteError && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px", textAlign: "center", fontWeight: 600 }}>{rouletteError}</p>}
                  <button
                    className="spin-btn"
                    onClick={spinning ? undefined : allDone ? handleReset : handleSpin}
                    disabled={spinning}
                    style={{ background: spinning ? "#1f1208" : "linear-gradient(135deg, #f59e0b, #d97706)", color: spinning ? "#6b7280" : "#0d0400", border: `2px solid ${spinning ? "#3b2000" : "#92400e"}`, boxShadow: spinning ? "none" : "0 5px 0 #78350f, 0 10px 24px rgba(245,158,11,0.28)", transform: "translateY(0)" }}
                  >
                    {spinning ? "🎰  Spinning..." : allDone ? "🔄  SPIN AGAIN" : "🎰  PULL & SPIN"}
                  </button>
                </div>
                {winning && (
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                    {["💰","🪙","💰","🪙","💰","🪙","💰","🪙","💰","🪙"].map((c, i) => (
                      <span key={i} className="coin" style={{ left: `${5 + i * 9.5}%`, top: "15%", animationDelay: `${i * 0.11}s`, animationDuration: `${0.75 + (i % 3) * 0.2}s` }}>{c}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Roulette filters */}
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: "20px", padding: "22px 24px", marginBottom: "22px" }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: 700, color: text, marginBottom: "18px" }}>⚙️ Preferences</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {!zip && (
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>📍 Location (or enter ZIP above)</label>
                      <input type="text" placeholder="ZIP code or city..." value={inputZip}
                        onChange={e => setInputZip(e.target.value)}
                        style={{ width: "100%", borderRadius: "12px", padding: "12px 18px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", background: dark ? "#111827" : "#f9fafb", border: `1px solid ${border}`, color: text }} />
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>🍽️ Cuisine</label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {ROULETTE_CATEGORIES.map(cat => (
                        <button key={cat.label} className="cat-btn" onClick={() => setRouletteCategory(cat)}
                          style={{ background: rouletteCategory.label === cat.label ? "#f59e0b" : surface, color: rouletteCategory.label === cat.label ? "#030712" : muted, borderColor: rouletteCategory.label === cat.label ? "#f59e0b" : border }}>
                          {cat.icon} {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>
                      💸 Min tip score: <span style={{ color: minTip >= 4 ? "#10b981" : minTip >= 3 ? "#f59e0b" : "#9ca3af" }}>{minTip}/5</span>
                      {minTip === 1 && <span style={{ color: muted, textTransform: "none", letterSpacing: 0, fontWeight: 400 }}> (any)</span>}
                      {minTip >= 4 && <span style={{ color: "#10b981", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}> (friendly only)</span>}
                    </label>
                    <input type="range" min="1" max="5" value={minTip} onChange={e => setMinTip(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#f59e0b" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#4b5563", marginTop: "4px" }}>
                      <span>Any place</span><span>Pressure-free only</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roulette result card */}
              {allDone && result && (
                <div className="fade-up" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))", border: "1px solid rgba(245,158,11,0.35)", borderRadius: "24px", padding: "28px" }}>
                  <p style={{ color: "#f59e0b", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>🎯 Tonight you're eating at...</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.8px", color: text }}>{result.name}</h2>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "10px", padding: "5px 12px" }}>
                      <span>⭐</span><span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "16px" }}>{result.rating}</span>
                    </span>
                  </div>
                  <p style={{ color: muted, fontSize: "13px", marginBottom: "4px" }}>📍 {result.address}</p>
                  <p style={{ color: muted, fontSize: "13px", marginBottom: "20px" }}>💬 {result.reviews?.toLocaleString()} reviews</p>
                  <div style={{ background: dark ? "#0d1117" : "#f9fafb", borderRadius: "14px", padding: "16px 18px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
                      <span style={{ color: muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "10px" }}>Tip Culture</span>
                      <span style={{ color: tipColor, fontWeight: 700 }}>{tipLabel} · {result.tipScore}/5</span>
                    </div>
                    <div style={{ width: "100%", background: dark ? "#1f2937" : "#e5e7eb", borderRadius: "999px", height: "6px" }}>
                      <div style={{ width: `${result.tipScore * 20}%`, background: tipColor, height: "6px", borderRadius: "999px" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button onClick={() => router.push(`/restaurant/${result.id}`)}
                      style={{ flex: 1, padding: "14px", background: "#f59e0b", color: "#030712", fontWeight: 700, fontSize: "15px", fontFamily: "'DM Sans', sans-serif", border: "none", borderRadius: "14px", cursor: "pointer" }}>
                      See Full Details →
                    </button>
                    <NavigateButton placeId={result.id} name={result.name} address={result.address} size="lg" style={{ borderRadius: "14px" }} />
                    <button onClick={handleReset}
                      style={{ padding: "14px 20px", background: "transparent", color: muted, fontWeight: 600, fontSize: "14px", fontFamily: "'DM Sans', sans-serif", border: `1px solid ${border}`, borderRadius: "14px", cursor: "pointer" }}>
                      🔄 Spin Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${border}`, padding: "40px 32px", textAlign: "center", background: dark ? "#0d1117" : "#ffffff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
            <img src={dark ? "/Tipcheck.png" : "/Tipcheck-dark.png"} alt="TipCheck" style={{ height: "32px", width: "auto" }} />
          </div>
          <p style={{ color: muted, fontSize: "13px" }}>Empowering diners with transparent tipping culture data.</p>
          <p style={{ color: border, fontSize: "12px", marginTop: "24px" }}>© 2026 TipCheck. All rights reserved.</p>
        </footer>

      </main>
    </>
  );
}
