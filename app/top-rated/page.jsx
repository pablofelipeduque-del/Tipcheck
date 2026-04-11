"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FloatingParticles from "../components/FloatingParticles";
import { useTheme } from "../components/useTheme";

const MEDAL = ["🥇", "🥈", "🥉"];

function TipBar({ score }) {
  const color = score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";
  const label = score >= 7 ? "Friendly" : score >= 4 ? "Moderate" : "Pressured";
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
        <span style={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Tip Culture</span>
        <span style={{ color, fontWeight: 700 }}>{label} · {score}/10</span>
      </div>
      <div style={{ width: "100%", background: "#1f2937", borderRadius: "999px", height: "6px" }}>
        <div style={{ width: `${score * 10}%`, background: color, height: "6px", borderRadius: "999px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

export default function TopRatedPage() {
  const router = useRouter();
  const { dark, toggle: toggleDark } = useTheme();
  const [zip, setZip] = useState("");
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const bg = dark ? "#030712" : "#f9fafb";
  const surface = dark ? "#0d1117" : "#ffffff";
  const border = dark ? "#1f2937" : "#e5e7eb";
  const text = dark ? "#ffffff" : "#111827";
  const muted = dark ? "#6b7280" : "#9ca3af";

  async function handleSearch() {
    if (!zip.trim()) return;
    setIsLoading(true);
    setHasSearched(false);
    setError("");
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent("restaurants in " + zip)}`);
      const data = await res.json();
      if (data.error) {
        setError("Something went wrong. Please try again.");
        setPlaces([]);
      } else {
        // Sort by tipScore descending
        const sorted = [...data.places].sort((a, b) => b.tipScore - a.tipScore);
        setPlaces(sorted);
      }
    } catch {
      setError("Could not connect. Check your connection and try again.");
      setPlaces([]);
    }
    setIsLoading(false);
    setHasSearched(true);
  }


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${bg}; transition: background 0.3s; }
        .toggle-btn { width: 52px; height: 28px; border-radius: 999px; border: none; cursor: pointer; position: relative; transition: background 0.3s; }
        .toggle-knob { width: 22px; height: 22px; border-radius: 50%; background: white; position: absolute; top: 3px; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .search-input { border-radius: 14px; padding: 16px 22px; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; width: 100%; }
        .search-btn { background: #f59e0b; color: #030712; font-weight: 700; padding: 16px 32px; border-radius: 14px; border: none; cursor: pointer; font-size: 15px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap; }
        .search-btn:hover:not(:disabled) { background: #fbbf24; transform: translateY(-1px); }
        .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rank-row { border-radius: 20px; padding: 20px 24px; transition: all 0.25s; cursor: pointer; display: flex; align-items: center; gap: 20px; }
        .rank-row:hover { transform: translateX(4px); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 44px; height: 44px; border: 3px solid #1f2937; border-top-color: #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .nav-link { color: #6b7280; font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: ${text}; }
      `}</style>

      <FloatingParticles count={20} />
      <main style={{ minHeight: "100vh", color: text, fontFamily: "'DM Sans', sans-serif", transition: "color 0.3s", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <header style={{ borderBottom: `1px solid ${border}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: dark ? "rgba(3,7,18,0.92)" : "rgba(249,250,251,0.92)", backdropFilter: "blur(12px)", zIndex: 100, transition: "all 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push("/")}>
            <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💸</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: text }}>
              Tip<span style={{ color: "#f59e0b" }}>Check</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <nav style={{ display: "flex", gap: "28px" }}>
              {[["Discover", "/"], ["Top Rated", "/top-rated"], ["Dining Roulette", "/roulette"], ["About", "/about"]].map(([item, path]) => (
                <a key={item} href={path} className="nav-link"
                  style={{ color: item === "Top Rated" ? "#f59e0b" : muted }}
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
        <section style={{ maxWidth: "860px", margin: "0 auto", padding: "60px 32px 48px", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "24px" }}>
            Tip-Friendly Rankings
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "20px", color: text }}>
            The most <span style={{ color: "#f59e0b" }}>pressure-free</span><br />spots near you.
          </h1>
          <p style={{ color: muted, fontSize: "17px", maxWidth: "520px", margin: "0 auto 36px", lineHeight: 1.7 }}>
            We rank local restaurants by their tipping culture score — so you can walk in relaxed, not anxious.
          </p>

          {/* Search */}
          <div style={{ display: "flex", gap: "12px", maxWidth: "520px", margin: "0 auto" }}>
            <input
              className="search-input"
              type="text"
              placeholder="Enter ZIP code or city..."
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ background: surface, border: `1px solid ${border}`, color: text }}
            />
            <button className="search-btn" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Rank 'Em"}
            </button>
          </div>

          {hasSearched && !error && places.length > 0 && (
            <p style={{ color: muted, fontSize: "13px", marginTop: "14px" }}>
              Ranked <span style={{ color: "#f59e0b", fontWeight: 600 }}>{places.length} places</span> in &ldquo;{zip}&rdquo; by tip friendliness
            </p>
          )}
          {error && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "14px" }}>{error}</p>}
        </section>

        {/* Results */}
        <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 32px 80px" }}>

          {isLoading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div className="spinner" />
              <p style={{ color: muted, fontSize: "16px", fontWeight: 500 }}>Ranking places near you...</p>
            </div>
          )}

          {!isLoading && hasSearched && places.length === 0 && !error && (
            <div style={{ textAlign: "center", padding: "80px 0", color: muted }}>
              <p style={{ fontSize: "48px", marginBottom: "16px" }}>🏆</p>
              <p style={{ fontSize: "18px", fontWeight: 600, color: text }}>No results found.</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>Try a different ZIP or city name.</p>
            </div>
          )}

          {!isLoading && places.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {places.map((place, i) => {
                const isTop = i === 0;
                const tipColor = place.tipScore >= 7 ? "#10b981" : place.tipScore >= 4 ? "#f59e0b" : "#ef4444";
                const glowStyle = isTop ? { boxShadow: "0 0 0 1px rgba(245,158,11,0.4), 0 12px 40px rgba(245,158,11,0.1)" } : {};

                return (
                  <div
                    key={place.id}
                    className="rank-row fade-up"
                    style={{
                      background: isTop
                        ? `linear-gradient(135deg, rgba(245,158,11,0.08), ${surface})`
                        : surface,
                      border: `1px solid ${isTop ? "rgba(245,158,11,0.35)" : border}`,
                      animationDelay: `${i * 0.06}s`,
                      ...glowStyle,
                    }}
                    onClick={() => router.push(`/restaurant/${place.id}`)}
                  >
                    {/* Rank number */}
                    <div style={{ minWidth: "48px", textAlign: "center" }}>
                      {i < 3 ? (
                        <span style={{ fontSize: "28px" }}>{MEDAL[i]}</span>
                      ) : (
                        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: 800, color: muted }}>#{i + 1}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "4px" }}>
                        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 700, color: text, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {place.name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "3px 9px", fontSize: "13px" }}>
                            <span>⭐</span>
                            <span style={{ color: "#f59e0b", fontWeight: 700 }}>{place.rating}</span>
                          </span>
                          <span style={{ fontSize: "22px", fontWeight: 800, color: tipColor, fontFamily: "'Syne', sans-serif" }}>
                            {place.tipScore}/10
                          </span>
                        </div>
                      </div>

                      <p style={{ color: muted, fontSize: "12px", marginBottom: "10px" }}>
                        📍 {place.address} · 💬 {place.reviews.toLocaleString()} reviews
                      </p>

                      <TipBar score={place.tipScore} />

                      {place.tip && (
                        <p style={{ color: muted, fontSize: "12px", fontStyle: "italic", marginTop: "8px", lineHeight: 1.5 }}>
                          &ldquo;{place.tip}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state before search */}
          {!hasSearched && !isLoading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: muted }}>
              <div style={{ fontSize: "72px", marginBottom: "20px", filter: "grayscale(0.3)" }}>🏆</div>
              <p style={{ fontSize: "18px", fontWeight: 600, color: text, marginBottom: "8px" }}>Enter a location to see the rankings</p>
              <p style={{ fontSize: "14px" }}>We&apos;ll sort every restaurant by how pressure-free their tipping experience is.</p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${border}`, padding: "40px 32px", textAlign: "center", background: dark ? "#0d1117" : "#ffffff", transition: "all 0.3s" }}>
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
