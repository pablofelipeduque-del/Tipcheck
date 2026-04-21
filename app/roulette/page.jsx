"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import FloatingParticles from "../components/FloatingParticles";
import { useTheme } from "../components/useTheme";

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

const VIBES = ["Casual 😎","Trendy ✨","Cozy 🛋️","Local Fave 📍","Lively 🎉","Chill 🌿","Classic 🏛️","Hidden Gem 💎","Date Night 🕯️","Quick Bite ⚡"];
const DRUM_1 = ["🍕","🍣","☕","🥐","🍔","🍰","🥘","🌮","🍜","🥗","🍱","🍷","🥩","🍛","🍝"];
const DRUM_2 = ["✨","😎","🛋️","📍","🎉","🌿","🏛️","💎","🕯️","⚡","🌟","🔥","💫","🎭","🎪"];
const DRUM_3 = ["🍽️","🔍","🌟","🔥","🎯","🍴","🏆","💫","🎪","🎭","✨","💥","🎰","🎲","🎡"];

// ── Sound Engine ──────────────────────────────────────────────────────────────
function useSoundEngine() {
  const ctxRef = useRef(null);
  const spinRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const leverPull = useCallback(() => {
    const c = getCtx();
    const dur = 0.28;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / c.sampleRate;
      d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 22) * 0.35
            + Math.sin(2 * Math.PI * 85 * t) * Math.exp(-t * 14) * 0.6;
    }
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

  const stopSpin = useCallback(() => {
    if (spinRef.current) { clearInterval(spinRef.current); spinRef.current = null; }
  }, []);

  const reelLock = useCallback((idx) => {
    const c = getCtx();
    const pairs = [[640, 320], [720, 360], [840, 420]];
    const [hi, lo] = pairs[idx] ?? [640, 320];
    const osc = c.createOscillator(); osc.type = "square";
    const g = c.createGain();
    osc.frequency.setValueAtTime(hi, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(lo, c.currentTime + 0.08);
    g.gain.setValueAtTime(0.22, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
    osc.connect(g); g.connect(c.destination); osc.start(); osc.stop(c.currentTime + 0.22);
  }, [getCtx]);

  const winJingle = useCallback(() => {
    const c = getCtx();
    [[523, 0], [659, 0.11], [784, 0.22], [1047, 0.37], [1319, 0.54]].forEach(([freq, delay]) => {
      const osc = c.createOscillator(); osc.type = "triangle"; osc.frequency.value = freq;
      const g = c.createGain();
      const t = c.currentTime + delay;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.38, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(g); g.connect(c.destination); osc.start(t); osc.stop(t + 0.32);
    });
    [0.8, 0.9, 0.97, 1.04, 1.12].forEach(d => {
      setTimeout(() => {
        const c2 = getCtx();
        const len = Math.floor(c2.sampleRate * 0.06);
        const buf = c2.createBuffer(1, len, c2.sampleRate);
        const bd = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          const t2 = i / c2.sampleRate;
          bd[i] = Math.sin(2 * Math.PI * 2600 * t2) * Math.exp(-t2 * 65) * 0.35
                + Math.sin(2 * Math.PI * 3400 * t2) * Math.exp(-t2 * 85) * 0.25;
        }
        const src = c2.createBufferSource(); src.buffer = buf;
        src.connect(c2.destination); src.start();
      }, d * 1000);
    });
  }, [getCtx]);

  return { leverPull, startSpin, stopSpin, reelLock, winJingle };
}

// ── Slot Drum ─────────────────────────────────────────────────────────────────
function Drum({ items, spinning, result, lockDelay, label, onLock }) {
  const [idx, setIdx]       = useState(0);
  const [locked, setLocked] = useState(false);
  const timerRef            = useRef(null);

  useEffect(() => {
    if (!spinning) { setLocked(false); return; }
    setLocked(false);
    let i = 0; let running = true;
    const cycle = (ms) => {
      timerRef.current = setTimeout(() => {
        if (!running) return;
        i = (i + 1) % items.length; setIdx(i); cycle(ms);
      }, ms);
    };
    cycle(55);
    const lockTimer = setTimeout(() => {
      running = false; clearTimeout(timerRef.current);
      let ds = 80;
      const decel = () => {
        i = (i + 1) % items.length; setIdx(i);
        ds = Math.min(ds + 55, 480);
        if (ds >= 480) { setLocked(true); onLock?.(); return; }
        timerRef.current = setTimeout(decel, ds);
      };
      timerRef.current = setTimeout(decel, ds);
    }, lockDelay);
    return () => { running = false; clearTimeout(timerRef.current); clearTimeout(lockTimer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);

  const blurring = spinning && !locked;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ color: "#92400e", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", textAlign: "center", marginBottom: "8px" }}>{label}</p>
      <div style={{
        position: "relative", background: "#030303",
        border: `3px solid ${locked ? "#f59e0b" : "#1c1008"}`,
        borderRadius: "10px", height: "126px",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        boxShadow: locked
          ? "0 0 28px rgba(245,158,11,0.55), inset 0 2px 10px rgba(0,0,0,0.9)"
          : "inset 0 2px 10px rgba(0,0,0,0.9), 0 0 0 1px #0a0500",
        transition: "border-color 0.25s, box-shadow 0.3s",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #030303 0%, transparent 32%, transparent 68%, #030303 100%)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "8px", right: "8px", top: "50%", transform: "translateY(-50%)", height: "40px", background: locked ? "rgba(245,158,11,0.06)" : "transparent", border: locked ? "1px solid rgba(245,158,11,0.15)" : "none", borderRadius: "6px", zIndex: 1, transition: "all 0.3s" }} />
        <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "0 8px", width: "100%" }}>
          {locked ? (
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.2px", lineHeight: 1.35, display: "block" }}>{result}</span>
          ) : (
            <span style={{ fontSize: "42px", lineHeight: 1, display: "block", filter: blurring ? "blur(2.5px)" : "none", transition: "filter 0.05s", userSelect: "none" }}>{items[idx]}</span>
          )}
        </div>
      </div>
      <div style={{ height: "16px", textAlign: "center", marginTop: "5px" }}>
        {locked && <span style={{ fontSize: "8px", color: "#f59e0b", fontWeight: 800, letterSpacing: "0.2em" }}>● LOCKED ●</span>}
      </div>
    </div>
  );
}

// ── Lever ─────────────────────────────────────────────────────────────────────
function Lever({ pulling, onPull }) {
  return (
    <div onClick={onPull ?? undefined} title="Pull to spin!"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: onPull ? "pointer" : "default", padding: "0 14px", userSelect: "none" }}
    >
      <div style={{ width: "22px", height: "22px", background: "linear-gradient(135deg, #9ca3af, #6b7280)", borderRadius: "50%", border: "3px solid #4b5563", boxShadow: "0 2px 6px rgba(0,0,0,0.6)", zIndex: 2 }} />
      <div style={{
        width: "10px", height: "106px",
        background: "linear-gradient(90deg, #e5e7eb 0%, #adb5bd 45%, #6b7280 100%)",
        borderRadius: "5px", marginTop: "-4px",
        transformOrigin: "top center",
        transform: pulling ? "rotate(28deg)" : "rotate(-7deg)",
        transition: "transform 0.13s ease-out",
        boxShadow: "2px 2px 8px rgba(0,0,0,0.5)",
      }} />
      <div style={{
        width: "32px", height: "32px",
        background: "radial-gradient(circle at 36% 34%, #f87171, #ef4444 55%, #b91c1c)",
        borderRadius: "50%", border: "3px solid #991b1b", marginTop: "-4px",
        boxShadow: "0 4px 14px rgba(239,68,68,0.55), inset 0 -2px 4px rgba(0,0,0,0.35)",
        position: "relative",
      }}>
        <div style={{ position: "absolute", top: "6px", left: "7px", width: "7px", height: "5px", background: "rgba(255,255,255,0.38)", borderRadius: "50%", transform: "rotate(-28deg)" }} />
      </div>
      <p style={{ color: "#92400e", fontSize: "8px", fontWeight: 800, letterSpacing: "0.15em", marginTop: "10px", textTransform: "uppercase" }}>PULL</p>
    </div>
  );
}

// ── Bulb ──────────────────────────────────────────────────────────────────────
function Bulb({ on }) {
  return (
    <div style={{
      width: "13px", height: "13px", borderRadius: "50%", flexShrink: 0,
      background: on ? "radial-gradient(circle, #fef08a, #f59e0b)" : "#1c0e00",
      boxShadow: on ? "0 0 7px 3px rgba(245,158,11,0.65)" : "none",
      border: `2px solid ${on ? "#d97706" : "#3b1f00"}`,
      transition: "all 0.15s ease",
    }} />
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RoulettePage() {
  const router  = useRouter();
  const sounds  = useSoundEngine();

  const { dark, toggle: toggleDark } = useTheme();
  const [zip,         setZip]         = useState("");
  const [category,    setCategory]    = useState(CATEGORIES[0]);
  const [minTip,      setMinTip]      = useState(1);
  const [spinning,    setSpinning]    = useState(false);
  const [pulling,     setPulling]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState("");
  const [allDone,     setAllDone]     = useState(false);
  const [reelResults, setReelResults] = useState({ cuisine: "", vibe: "", name: "" });
  const [bulbs,       setBulbs]       = useState(Array(18).fill(false));
  const [winning,     setWinning]     = useState(false);

  const bg      = dark ? "#030712" : "#f9fafb";
  const surface = dark ? "#0d1117" : "#ffffff";
  const border  = dark ? "#1f2937" : "#e5e7eb";
  const text    = dark ? "#ffffff" : "#111827";
  const muted   = dark ? "#6b7280" : "#9ca3af";

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

  async function handleSpin() {
    if (!zip.trim()) { setError("Enter a location first!"); return; }
    setError(""); setResult(null); setAllDone(false);
    setPulling(true); sounds.leverPull();
    setTimeout(() => setPulling(false), 280);

    setTimeout(async () => {
      setSpinning(true); sounds.startSpin();
      try {
        const res  = await fetch(`/api/search?query=${encodeURIComponent(`${category.query} in ${zip}`)}`);
        const data = await res.json();
        if (!data.places?.length) {
          sounds.stopSpin(); setSpinning(false);
          setError("No places found. Try a different location!"); return;
        }
        const pool = data.places.filter(p => p.tipScore >= minTip);
        const pick = (pool.length ? pool : data.places)[Math.floor(Math.random() * (pool.length || data.places.length))];
        const vibe = VIBES[Math.floor(Math.random() * VIBES.length)];
        setReelResults({
          cuisine: `${category.icon} ${category.label === "Surprise me" ? (pick.category || "restaurant").replace(/_/g, " ") : category.label}`,
          vibe,
          name: pick.name,
        });
        setTimeout(() => {
          sounds.stopSpin(); setSpinning(false);
          setResult(pick); setAllDone(true); setWinning(true); sounds.winJingle();
        }, 3400);
      } catch {
        sounds.stopSpin(); setSpinning(false); setError("Could not connect. Try again.");
      }
    }, 220);
  }

  function handleReset() {
    setResult(null); setAllDone(false); setSpinning(false); setWinning(false);
    setReelResults({ cuisine: "", vibe: "", name: "" });
  }

  const tipColor = result ? (result.tipScore >= 4 ? "#10b981" : result.tipScore >= 3 ? "#f59e0b" : "#ef4444") : "#f59e0b";
  const tipLabel = result ? (result.tipScore >= 4 ? "Friendly" : result.tipScore >= 3 ? "Moderate" : "Pressured") : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${bg}; transition: background 0.3s; }
        .toggle-btn { width: 52px; height: 28px; border-radius: 999px; border: none; cursor: pointer; position: relative; transition: background 0.3s; }
        .toggle-knob { width: 22px; height: 22px; border-radius: 50%; background: white; position: absolute; top: 3px; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .cat-btn { padding: 7px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; border: 1px solid; white-space: nowrap; }
        .search-input { border-radius: 12px; padding: 12px 18px; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; width: 100%; }
        .nav-link { font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; padding: 6px 14px; border-radius: 999px; }
        .nav-link:hover { background: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; color: #f59e0b !important; }
        .spin-btn { width: 100%; padding: 18px; font-weight: 900; font-size: 18px; font-family: 'Syne', sans-serif; border-radius: 14px; cursor: pointer; letter-spacing: 0.04em; transition: all 0.1s; }
        .spin-btn:active:not(:disabled) { transform: translateY(3px) !important; box-shadow: none !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        @keyframes winPulse { 0%,100% { box-shadow: 0 0 40px rgba(245,158,11,0.25); } 50% { box-shadow: 0 0 90px rgba(245,158,11,0.75), 0 0 140px rgba(245,158,11,0.25); } }
        .machine-win { animation: winPulse 0.38s ease-in-out infinite; }
        @keyframes coinFall { 0% { transform: translateY(-10px) rotate(0deg); opacity:1; } 100% { transform: translateY(90px) rotate(400deg); opacity:0; } }
        .coin { position: absolute; animation: coinFall linear forwards; font-size: 18px; pointer-events: none; }
      `}</style>

      <FloatingParticles count={14} opacity={0.6} />
      <main style={{ minHeight: "100vh", color: text, fontFamily: "'DM Sans', sans-serif", transition: "color 0.3s", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <header style={{ borderBottom: `1px solid ${border}`, padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: dark ? "rgba(3,7,18,0.92)" : "rgba(249,250,251,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => router.push("/")}>
            <img src={dark ? "/Tipcheck.png" : "/Tipcheck-dark.png"} alt="TipCheck" style={{ height: "96px", width: "auto" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <nav style={{ display: "flex", gap: "28px" }}>
              {[["Home", "/"], ["Discover", "/discover"], ["Top Rated", "/top-rated"], ["Dining Roulette", "/roulette"], ["Food Wheel", "/wheel"], ["About", "/about"]].map(([item, path]) => (
                <a key={item} href={path} className="nav-link" style={{ color: item === "Dining Roulette" ? "#f59e0b" : dark ? "#e5e7eb" : "#1f2937", background: item === "Dining Roulette" ? (dark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.1)") : "transparent" }}>{item}</a>
              ))}
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>☀️</span>
              <button className="toggle-btn" onClick={toggleDark} style={{ background: dark ? "#f59e0b" : "#d1d5db" }}>
                <div className="toggle-knob" style={{ left: dark ? "27px" : "3px" }} />
              </button>
              <span style={{ fontSize: "14px" }}>🌙</span>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ display: "inline-block", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
              🎰 Dining Roulette
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(30px, 5vw, 50px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "12px", color: text }}>
              Stop debating.<br /><span style={{ color: "#f59e0b" }}>Just spin.</span>
            </h1>
            <p style={{ color: muted, fontSize: "15px", lineHeight: 1.7, maxWidth: "380px", margin: "0 auto" }}>
              Pull the lever and let fate decide where you&apos;re eating tonight.
            </p>
          </div>

          {/* ═══ SLOT MACHINE ═══ */}
          <div className={winning ? "machine-win" : ""} style={{ background: "linear-gradient(170deg, #1c0900 0%, #0d0400 100%)", border: "4px solid #92400e", borderRadius: "24px", overflow: "hidden", boxShadow: "0 28px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(245,158,11,0.15)", marginBottom: "22px", position: "relative" }}>

            {/* Name plate */}
            <div style={{ background: "linear-gradient(90deg, #78350f, #b45309, #92400e, #b45309, #78350f)", padding: "10px 24px", textAlign: "center", borderBottom: "2px solid #78350f" }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "12px", fontWeight: 800, color: "#fef3c7", letterSpacing: "0.32em", textTransform: "uppercase" }}>✦ Dining Roulette ✦</span>
            </div>

            {/* Bulb row */}
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "9px 16px", background: "#080300", borderBottom: "1px solid #1c0900" }}>
              {bulbs.map((on, i) => <Bulb key={i} on={on} />)}
            </div>

            {/* Reels + Lever */}
            <div style={{ display: "flex", alignItems: "center", padding: "20px 18px 14px", background: "linear-gradient(180deg, #180700 0%, #0d0400 100%)" }}>
              <div style={{ flex: 1, background: "#020100", border: "3px solid #78350f", borderRadius: "16px", padding: "16px 14px", display: "flex", gap: "10px", boxShadow: "inset 0 4px 18px rgba(0,0,0,0.85)" }}>
                <Drum items={DRUM_1} spinning={spinning} result={reelResults.cuisine} lockDelay={900}  label="Cuisine"   onLock={() => sounds.reelLock(0)} />
                <Drum items={DRUM_2} spinning={spinning} result={reelResults.vibe}    lockDelay={1750} label="Vibe"      onLock={() => sounds.reelLock(1)} />
                <Drum items={DRUM_3} spinning={spinning} result={reelResults.name}    lockDelay={2650} label="Your Pick" onLock={() => sounds.reelLock(2)} />
              </div>
              <Lever pulling={pulling} onPull={!spinning ? (allDone ? handleReset : handleSpin) : null} />
            </div>

            {/* Decorative coin slots */}
            <div style={{ display: "flex", justifyContent: "center", padding: "0 0 6px", gap: "24px" }}>
              {[0, 1].map(i => <div key={i} style={{ width: "44px", height: "7px", background: "#020100", border: "2px solid #78350f", borderRadius: "4px" }} />)}
            </div>

            {/* Bottom panel / spin button */}
            <div style={{ background: "#080300", borderTop: "2px solid #78350f", padding: "18px 22px" }}>
              {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px", textAlign: "center", fontWeight: 600 }}>{error}</p>}
              <button
                className="spin-btn"
                onClick={spinning ? undefined : allDone ? handleReset : handleSpin}
                disabled={spinning}
                style={{
                  background: spinning ? "#1f1208" : "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: spinning ? "#6b7280" : "#0d0400",
                  border: `2px solid ${spinning ? "#3b2000" : "#92400e"}`,
                  boxShadow: spinning ? "none" : "0 5px 0 #78350f, 0 10px 24px rgba(245,158,11,0.28)",
                  transform: "translateY(0)",
                }}
              >
                {spinning ? "🎰  Spinning..." : allDone ? "🔄  SPIN AGAIN" : "🎰  PULL & SPIN"}
              </button>
            </div>

            {/* Win coin rain */}
            {winning && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                {["💰","🪙","💰","🪙","💰","🪙","💰","🪙","💰","🪙"].map((c, i) => (
                  <span key={i} className="coin" style={{ left: `${5 + i * 9.5}%`, top: "15%", animationDelay: `${i * 0.11}s`, animationDuration: `${0.75 + (i % 3) * 0.2}s` }}>{c}</span>
                ))}
              </div>
            )}
          </div>

          {/* ═══ FILTERS ═══ */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: "20px", padding: "22px 24px", marginBottom: "22px" }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: 700, color: text, marginBottom: "18px" }}>⚙️ Set your preferences</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>📍 Location</label>
                <input className="search-input" type="text" placeholder="ZIP code or city..." value={zip}
                  onChange={e => setZip(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !spinning && handleSpin()}
                  style={{ background: dark ? "#111827" : "#f9fafb", border: `1px solid ${border}`, color: text }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>🍽️ Cuisine</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.label} className="cat-btn" onClick={() => setCategory(cat)}
                      style={{ background: category.label === cat.label ? "#f59e0b" : surface, color: category.label === cat.label ? "#030712" : muted, borderColor: category.label === cat.label ? "#f59e0b" : border }}>
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

          {/* ═══ RESULT CARD ═══ */}
          {allDone && result && (
            <div className="fade-up" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))", border: "1px solid rgba(245,158,11,0.35)", borderRadius: "24px", padding: "28px" }}>
              <p style={{ color: "#f59e0b", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>🎯 Tonight you&apos;re eating at...</p>
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
                {result.tip && <p style={{ color: muted, fontSize: "12px", fontStyle: "italic", marginTop: "10px" }}>&ldquo;{result.tip}&rdquo;</p>}
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button onClick={() => router.push(`/restaurant/${result.id}`)}
                  style={{ flex: 1, padding: "14px", background: "#f59e0b", color: "#030712", fontWeight: 700, fontSize: "15px", fontFamily: "'DM Sans', sans-serif", border: "none", borderRadius: "14px", cursor: "pointer" }}>
                  See Full Details →
                </button>
                <button onClick={handleReset}
                  style={{ padding: "14px 20px", background: "transparent", color: muted, fontWeight: 600, fontSize: "14px", fontFamily: "'DM Sans', sans-serif", border: `1px solid ${border}`, borderRadius: "14px", cursor: "pointer" }}>
                  🔄 Spin Again
                </button>
              </div>
            </div>
          )}
        </div>

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
