"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import FloatingParticles from "../components/FloatingParticles";
import { useTheme } from "../components/useTheme";

const SEG_COLORS = ["#f59e0b", "#10b981", "#6366f1"];
const SEG_STROKE = ["#d97706", "#059669", "#4f46e5"];
const CANVAS_SIZE = 400;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function drawWheel(canvas, entries, rotDeg, dark) {
  if (!canvas || entries.length === 0) return;
  const ctx = canvas.getContext("2d");
  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;
  const R = cx - 22;
  const N = entries.length;
  const segAngle = (2 * Math.PI) / N;
  const rotRad = ((rotDeg - 90) * Math.PI) / 180;

  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Outer shadow glow
  ctx.save();
  ctx.shadowColor = "rgba(245,158,11,0.35)";
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.arc(cx, cy, R + 4, 0, 2 * Math.PI);
  ctx.fillStyle = "transparent";
  ctx.fill();
  ctx.restore();

  entries.forEach((entry, i) => {
    const start = rotRad + i * segAngle;
    const end = start + segAngle;

    // Segment fill with subtle gradient
    const grad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
    const base = SEG_COLORS[i % SEG_COLORS.length];
    const dark2 = SEG_STROKE[i % SEG_STROKE.length];
    grad.addColorStop(0, base);
    grad.addColorStop(1, dark2);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, start, end);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = dark ? "#030712" : "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Place name
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + segAngle / 2);
    ctx.textAlign = "right";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 4;

    const rawLabel = entry.place || (entry._placeholder ? "Add a place…" : "");
    const label = rawLabel.length > 22 ? rawLabel.slice(0, 21) + "\u2026" : rawLabel;
    ctx.font = "bold 14px 'DM Sans', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, R - 16, 5);

    if (entry.player) {
      ctx.font = "11px 'DM Sans', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.shadowBlur = 2;
      const pLabel = entry.player.length > 16 ? entry.player.slice(0, 15) + "\u2026" : entry.player;
      ctx.fillText(pLabel, R - 16, 19);
    }
    ctx.restore();
  });

  // Gold outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 6;
  ctx.stroke();

  // Center hub
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
  ctx.fillStyle = dark ? "#0d1117" : "#f9fafb";
  ctx.fill();
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Center icon
  ctx.font = "22px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\uD83C\uDF7D\uFE0F", cx, cy);

  // Needle at top
  ctx.save();
  ctx.translate(cx, cy - R + 4);
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(-11, 6);
  ctx.lineTo(11, 6);
  ctx.closePath();
  ctx.fillStyle = "#ef4444";
  ctx.shadowColor = "rgba(239,68,68,0.6)";
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.strokeStyle = dark ? "#030712" : "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

export default function WheelPage() {
  const router = useRouter();
  const { dark, toggle: toggleDark } = useTheme();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const rotRef = useRef(0);

  const [entries, setEntries] = useState([
    { place: "", player: "" },
    { place: "", player: "" },
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Winner search state
  const [winnerZip, setWinnerZip] = useState("");
  const [winnerPlaces, setWinnerPlaces] = useState([]);
  const [winnerSearching, setWinnerSearching] = useState(false);
  const [winnerSearched, setWinnerSearched] = useState(false);
  const [winnerError, setWinnerError] = useState("");

  const validEntries = useMemo(
    () => entries.filter((e) => e.place.trim()),
    [entries]
  );

  const bg = dark ? "#030712" : "#f9fafb";
  const surface = dark ? "#0d1117" : "#ffffff";
  const border = dark ? "#1f2937" : "#e5e7eb";
  const text = dark ? "#ffffff" : "#111827";
  const muted = dark ? "#6b7280" : "#9ca3af";

  // Redraw whenever entries/theme change
  useEffect(() => {
    const display =
      validEntries.length >= 2
        ? validEntries
        : [
            { place: "", player: "", _placeholder: true },
            { place: "", player: "", _placeholder: true },
          ];
    drawWheel(canvasRef.current, display, rotRef.current, dark);
  }, [validEntries, dark]);

  const spin = useCallback(() => {
    if (isSpinning || validEntries.length < 2) return;
    setWinner(null);
    setShowConfetti(false);
    setIsSpinning(true);

    const snap = [...validEntries];
    const N = snap.length;
    const segAngle = 360 / N;
    const winnerIdx = Math.floor(Math.random() * N);
    const currentAngle = rotRef.current % 360;
    const targetCenter = winnerIdx * segAngle + segAngle / 2;
    const extraAngle = ((targetCenter - currentAngle) + 360) % 360;
    const from = rotRef.current;
    const to = from + 5 * 360 + extraAngle;
    const duration = 4200 + Math.random() * 800;
    const startTime = performance.now();
    const isDark = dark;

    function animate(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = easeOutCubic(t);
      rotRef.current = from + (to - from) * eased;
      drawWheel(canvasRef.current, snap, rotRef.current, isDark);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rotRef.current = to;
        setIsSpinning(false);
        setWinner({ idx: winnerIdx, entry: snap[winnerIdx] });
        setShowConfetti(true);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [isSpinning, validEntries, dark]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function clearWinnerSearch() {
    setWinnerZip("");
    setWinnerPlaces([]);
    setWinnerSearching(false);
    setWinnerSearched(false);
    setWinnerError("");
  }

  function updateEntry(i, field, value) {
    setEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e))
    );
    setWinner(null);
    setShowConfetti(false);
    clearWinnerSearch();
  }

  function addEntry() {
    if (entries.length < 3)
      setEntries((prev) => [...prev, { place: "", player: "" }]);
  }

  function removeEntry(i) {
    if (entries.length <= 2) return;
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
    setWinner(null);
    setShowConfetti(false);
  }

  async function handleWinnerSearch() {
    if (!winnerZip.trim() || !winner) return;
    setWinnerSearching(true);
    setWinnerSearched(false);
    setWinnerError("");
    setWinnerPlaces([]);
    try {
      const query = `${winner.entry.place} in ${winnerZip}`;
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.error) {
        setWinnerError("Could not find places. Try a different ZIP.");
      } else {
        const sorted = [...data.places].sort((a, b) => b.tipScore - a.tipScore);
        setWinnerPlaces(sorted);
      }
    } catch {
      setWinnerError("Could not connect. Check your connection.");
    }
    setWinnerSearching(false);
    setWinnerSearched(true);
  }

  function resetAll() {
    setEntries([
      { place: "", player: "" },
      { place: "", player: "" },
    ]);
    setWinner(null);
    setShowConfetti(false);
    clearWinnerSearch();
    rotRef.current = 0;
    drawWheel(
      canvasRef.current,
      [
        { place: "", player: "", _placeholder: true },
        { place: "", player: "", _placeholder: true },
      ],
      0,
      dark
    );
  }

  // Confetti particles (generated once per win)
  const confettiItems = useMemo(() => {
    if (!showConfetti) return [];
    return Array.from({ length: 55 }, (_, i) => ({
      id: i,
      left: `${(i * 7.3) % 100}%`,
      color: ["#f59e0b", "#10b981", "#6366f1", "#ef4444", "#ec4899", "#3b82f6"][
        i % 6
      ],
      delay: `${(i * 0.06) % 1.4}s`,
      duration: `${2.2 + (i % 4) * 0.5}s`,
      size: `${7 + (i % 5) * 3}px`,
      rotate: `${(i * 47) % 360}deg`,
    }));
  }, [showConfetti]);

  const canSpin = validEntries.length >= 2 && !isSpinning;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${bg}; transition: background 0.3s; }

        .toggle-btn { width: 52px; height: 28px; border-radius: 999px; border: none; cursor: pointer; position: relative; transition: background 0.3s; }
        .toggle-knob { width: 22px; height: 22px; border-radius: 50%; background: white; position: absolute; top: 3px; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .nav-link { color: #6b7280; font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: ${text}; }

        .entry-card { border-radius: 16px; padding: 18px; transition: all 0.2s; }
        .entry-card:hover { transform: translateY(-1px); }

        .field-input { width: 100%; border-radius: 10px; padding: 10px 14px; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; border: 1px solid ${border}; background: ${dark ? "#111827" : "#f9fafb"}; color: ${text}; }
        .field-input:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.15); }
        .field-input::placeholder { color: ${muted}; }

        .spin-btn { width: 100%; padding: 18px; border-radius: 16px; font-size: 18px; font-weight: 800; font-family: 'Syne', sans-serif; cursor: pointer; border: none; transition: all 0.25s; letter-spacing: -0.3px; }
        .spin-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(245,158,11,0.4); }
        .spin-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes winPop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.06); }
          100% { transform: scale(1); opacity: 1; }
        }
        .winner-banner { animation: winPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }

        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50%      { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
        }
        .winner-pulse { animation: pulse 1.5s ease-in-out infinite; }

        @keyframes wheelGlow {
          0%,100% { filter: drop-shadow(0 0 8px rgba(245,158,11,0.4)); }
          50%      { filter: drop-shadow(0 0 24px rgba(245,158,11,0.8)); }
        }
        .spinning-canvas { animation: wheelGlow 0.6s ease-in-out infinite; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .add-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; border: 1px dashed; }
        .add-btn:hover { transform: translateY(-1px); }
        .wcard { border-radius: 16px; padding: 18px 20px; cursor: pointer; transition: all 0.25s; }
        .wcard:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease forwards; opacity: 0; }
        .zip-input { flex: 1; border-radius: 12px; padding: 14px 18px; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; border: 1px solid ${border}; background: ${dark ? "#111827" : "#f9fafb"}; color: ${text}; }
        .zip-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.18); }
        .zip-input::placeholder { color: ${muted}; }
        .zip-btn { background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; font-weight: 700; padding: 14px 26px; border-radius: 12px; border: none; cursor: pointer; font-size: 15px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap; }
        .zip-btn:hover:not(:disabled) { background: linear-gradient(135deg,#818cf8,#6366f1); transform: translateY(-1px); }
        .zip-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .w-spinner { width: 36px; height: 36px; border: 3px solid ${dark ? "#1f2937" : "#e5e7eb"}; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
      `}</style>

      {/* Confetti layer */}
      {showConfetti && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200, overflow: "hidden" }}>
          {confettiItems.map((c) => (
            <div
              key={c.id}
              style={{
                position: "absolute",
                top: "-20px",
                left: c.left,
                width: c.size,
                height: c.size,
                background: c.color,
                borderRadius: "2px",
                transform: `rotate(${c.rotate})`,
                animation: `confettiFall ${c.duration} ${c.delay} ease-in forwards`,
              }}
            />
          ))}
        </div>
      )}

      <FloatingParticles count={18} />
      <main style={{ minHeight: "100vh", color: text, fontFamily: "'DM Sans', sans-serif", transition: "color 0.3s", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <header style={{ borderBottom: `1px solid ${border}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: dark ? "rgba(3,7,18,0.92)" : "rgba(249,250,251,0.92)", backdropFilter: "blur(12px)", zIndex: 100, transition: "all 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => router.push("/")}>
            <img src="/Tipcheck.png" alt="TipCheck" style={{ height: "72px", width: "auto" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <nav style={{ display: "flex", gap: "24px" }}>
              {[
                ["Discover", "/"],
                ["Top Rated", "/top-rated"],
                ["Dining Roulette", "/roulette"],
                ["Food Wheel", "/wheel"],
                ["About", "/about"],
              ].map(([item, path]) => (
                <a key={item} href={path} className="nav-link"
                  style={{ color: item === "Food Wheel" ? "#f59e0b" : muted }}
                >{item}</a>
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

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "52px 32px 36px", maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontWeight: 700, color: "#6366f1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>
            Multiplayer Food Wheel
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px,5vw,56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "16px", color: text }}>
            Let the wheel <span style={{ color: "#f59e0b" }}>decide</span> 🎡
          </h1>
          <p style={{ color: muted, fontSize: "16px", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
            Add up to 3 places, throw in who suggested each one, spin — and the winner earns the right to say &ldquo;I told you so.&rdquo;
          </p>
        </section>

        {/* Main content */}
        <section style={{ maxWidth: "960px", margin: "0 auto", padding: "0 32px 80px", display: "flex", gap: "40px", alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* LEFT — Entry form */}
          <div style={{ flex: "1 1 280px", minWidth: "260px" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "20px", color: text }}>
              🍽️ Add Places
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              {entries.map((entry, i) => (
                <div
                  key={i}
                  className="entry-card"
                  style={{
                    background: surface,
                    border: `2px solid ${
                      i === 0 ? "rgba(245,158,11,0.5)"
                      : i === 1 ? "rgba(16,185,129,0.5)"
                      : "rgba(99,102,241,0.5)"
                    }`,
                  }}
                >
                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, fontFamily: "'Syne', sans-serif",
                        background: i === 0 ? "#f59e0b" : i === 1 ? "#10b981" : "#6366f1",
                        color: "#ffffff",
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: muted }}>Option {i + 1}</span>
                    </div>
                    {entries.length > 2 && (
                      <button
                        onClick={() => removeEntry(i)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: muted, fontSize: "18px", lineHeight: 1, padding: "2px 4px", borderRadius: "6px", transition: "color 0.2s" }}
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Place name */}
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      Restaurant / Place
                    </label>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="e.g. Nobu, Taco Bell, Mom&apos;s Kitchen…"
                      value={entry.place}
                      onChange={(e) => updateEntry(i, "place", e.target.value)}
                    />
                  </div>

                  {/* Player name */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      Suggested by (optional)
                    </label>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="Player name…"
                      value={entry.player}
                      onChange={(e) => updateEntry(i, "player", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add place button */}
            {entries.length < 3 && (
              <button
                className="add-btn"
                onClick={addEntry}
                style={{
                  background: "transparent",
                  color: "#6366f1",
                  borderColor: "rgba(99,102,241,0.4)",
                  width: "100%",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <span style={{ fontSize: "18px" }}>+</span>
                Add a 3rd place
              </button>
            )}

            {/* Hint */}
            <p style={{ fontSize: "12px", color: muted, lineHeight: 1.6 }}>
              {validEntries.length < 2
                ? "⬆️ Fill in at least 2 places to enable the spin."
                : `✅ ${validEntries.length} place${validEntries.length > 1 ? "s" : ""} ready — spin when you&apos;re set!`}
            </p>
          </div>

          {/* RIGHT — Wheel + spin button */}
          <div style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>

            {/* Canvas */}
            <div style={{ position: "relative" }}>
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className={isSpinning ? "spinning-canvas" : ""}
                style={{ display: "block", maxWidth: "100%", borderRadius: "50%" }}
              />
            </div>

            {/* Spin button */}
            <button
              className="spin-btn"
              onClick={spin}
              disabled={!canSpin}
              style={{
                background: canSpin
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : dark ? "#1f2937" : "#e5e7eb",
                color: canSpin ? "#030712" : muted,
                maxWidth: "380px",
              }}
            >
              {isSpinning ? "Spinning\u2026 \uD83C\uDFA1" : "\uD83C\uDFA1 Spin the Wheel!"}
            </button>

            {/* Reset */}
            {winner && (
              <button
                onClick={resetAll}
                style={{ background: "none", border: `1px solid ${border}`, borderRadius: "10px", padding: "9px 22px", fontSize: "13px", color: muted, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}
              >
                🔄 Reset &amp; Play Again
              </button>
            )}
          </div>
        </section>

        {/* Winner banner + nearby search */}
        {winner && (
          <section style={{ maxWidth: "760px", margin: "0 auto 80px", padding: "0 32px", display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* Banner */}
            <div
              className="winner-banner winner-pulse"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))",
                border: "2px solid #10b981",
                borderRadius: "24px",
                padding: "36px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px,4vw,34px)", fontWeight: 800, color: "#10b981", letterSpacing: "-1px", marginBottom: "10px" }}>
                {winner.entry.player
                  ? `${winner.entry.player}, your pick won!`
                  : "We have a winner!"}
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px,4vw,46px)", fontWeight: 800, color: text, letterSpacing: "-1.5px", marginBottom: "14px" }}>
                {winner.entry.place}
              </div>
              <p style={{ color: muted, fontSize: "16px", lineHeight: 1.6, marginBottom: "20px" }}>
                {winner.entry.player
                  ? `Congrats \uD83C\uDF1F The wheel has spoken \u2014 ${winner.entry.player} gets to pick, and it\u2019s ${winner.entry.place}!`
                  : `The wheel has spoken \u2014 time to head to ${winner.entry.place}!`}
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                {["\uD83D\uDE97 Let\u2019s go!", "\uD83D\uDE0B Great choice!", "\uD83C\uDF7D\uFE0F Let\u2019s eat!"].map((tag) => (
                  <span key={tag} style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "999px", padding: "6px 16px", fontSize: "14px", fontWeight: 600, color: "#10b981" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Nearby search box */}
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: "20px", padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📍</div>
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "17px", fontWeight: 800, color: text, letterSpacing: "-0.4px" }}>
                    Find {winner.entry.place} near you
                  </h3>
                  <p style={{ color: muted, fontSize: "13px" }}>
                    Enter your ZIP and we&apos;ll show top-rated {winner.entry.place} spots sorted by tip friendliness.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <input
                  className="zip-input"
                  type="text"
                  placeholder="ZIP code or city…"
                  value={winnerZip}
                  onChange={(e) => setWinnerZip(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleWinnerSearch()}
                />
                <button className="zip-btn" onClick={handleWinnerSearch} disabled={winnerSearching || !winnerZip.trim()}>
                  {winnerSearching ? "Searching\u2026" : "Find Spots"}
                </button>
              </div>

              {winnerError && (
                <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "12px" }}>{winnerError}</p>
              )}

              {/* Results */}
              {winnerSearching && (
                <div style={{ textAlign: "center", padding: "36px 0" }}>
                  <div className="w-spinner" />
                  <p style={{ color: muted, fontSize: "14px" }}>Finding the best {winner.entry.place} near you&hellip;</p>
                </div>
              )}

              {!winnerSearching && winnerSearched && winnerPlaces.length === 0 && !winnerError && (
                <div style={{ textAlign: "center", padding: "32px 0", color: muted }}>
                  <p style={{ fontSize: "36px", marginBottom: "10px" }}>🍽️</p>
                  <p style={{ fontWeight: 600, color: text }}>No results found</p>
                  <p style={{ fontSize: "13px", marginTop: "6px" }}>Try a different ZIP or city name.</p>
                </div>
              )}

              {!winnerSearching && winnerPlaces.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <p style={{ fontSize: "12px", color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
                    {winnerPlaces.length} spot{winnerPlaces.length !== 1 ? "s" : ""} found &mdash; sorted by tip friendliness
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {winnerPlaces.map((place, i) => {
                      const tipColor = place.tipScore >= 4 ? "#10b981" : place.tipScore >= 3 ? "#f59e0b" : "#ef4444";
                      const tipLabel = place.tipScore >= 4 ? "Friendly" : place.tipScore >= 3 ? "Moderate" : "Pressured";
                      return (
                        <div
                          key={place.id}
                          className="wcard fade-up"
                          style={{
                            background: dark ? "#111827" : "#f9fafb",
                            border: `1px solid ${i === 0 ? "rgba(16,185,129,0.4)" : border}`,
                            animationDelay: `${i * 0.07}s`,
                          }}
                          onClick={() => router.push(`/restaurant/${place.id}`)}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                {i === 0 && <span style={{ fontSize: "16px" }}>🏆</span>}
                                <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: 700, color: text, letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {place.name}
                                </h4>
                              </div>
                              <p style={{ color: muted, fontSize: "12px" }}>📍 {place.address}</p>
                              {place.tip && (
                                <p style={{ color: muted, fontSize: "12px", fontStyle: "italic", marginTop: "6px", lineHeight: 1.5 }}>
                                  &ldquo;{place.tip}&rdquo;
                                </p>
                              )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                              <span style={{ fontSize: "18px", fontWeight: 800, color: tipColor, fontFamily: "'Syne', sans-serif" }}>
                                {place.tipScore}/5
                              </span>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: tipColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                {tipLabel}
                              </span>
                              <span style={{ display: "flex", alignItems: "center", gap: "3px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "6px", padding: "2px 8px", fontSize: "12px" }}>
                                <span>⭐</span>
                                <span style={{ color: "#f59e0b", fontWeight: 700 }}>{place.rating}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </section>
        )}

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${border}`, padding: "40px 32px", textAlign: "center", background: dark ? "#0d1117" : "#ffffff", transition: "all 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
            <img src="/Tipcheck.png" alt="TipCheck" style={{ height: "32px", width: "auto" }} />
          </div>
          <p style={{ color: muted, fontSize: "13px" }}>Empowering diners with transparent tipping culture data.</p>
          <p style={{ color: border, fontSize: "12px", marginTop: "24px" }}>© 2026 TipCheck. All rights reserved.</p>
        </footer>

      </main>
    </>
  );
}
