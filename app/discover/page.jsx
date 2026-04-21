"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FloatingParticles from "../components/FloatingParticles";
import { useTheme } from "../components/useTheme";

function PlaceCard({ place, dark, border, surface, text, muted, router, badge }) {
  const scoreColor = place.avgScore >= 4 ? "#10b981" : place.avgScore >= 3 ? "#f59e0b" : "#ef4444";
  const scoreLabel = place.avgScore >= 4 ? "Tip Friendly" : place.avgScore >= 3 ? "Moderate" : "Pressured";

  return (
    <div
      onClick={() => router.push(`/restaurant/${place.place_id}`)}
      style={{
        flexShrink: 0,
        width: "300px",
        background: surface,
        border: `1px solid ${border}`,
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 24px 48px rgba(0,0,0,0.15)"; e.currentTarget.style.borderColor = "#f59e0b"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = border; }}
    >
      {/* Photo */}
      <div style={{ width: "100%", height: "170px", background: dark ? "#1f2937" : "#e5e7eb", position: "relative", overflow: "hidden" }}>
        {place.photo
          ? <img src={place.photo} alt={place.place_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", opacity: 0.25 }}>🍽️</div>
        }
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }} />
        {badge && (
          <div style={{ position: "absolute", top: "10px", left: "10px", background: badge.bg, color: badge.color, fontSize: "10px", fontWeight: 800, padding: "4px 10px", borderRadius: "999px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            {badge.label}
          </div>
        )}
        <div style={{ position: "absolute", top: "10px", right: "10px", background: scoreColor, color: "#fff", fontWeight: 800, fontSize: "12px", padding: "3px 10px", borderRadius: "999px" }}>
          {place.avgScore}/5
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px" }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 800, color: text, marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {place.place_name}
        </h3>
        <span style={{ color: scoreColor, fontSize: "12px", fontWeight: 600 }}>{scoreLabel}</span>
        <div style={{ width: "100%", background: dark ? "#1f2937" : "#e5e7eb", borderRadius: "999px", height: "4px", margin: "10px 0" }}>
          <div style={{ width: `${place.avgScore * 20}%`, background: scoreColor, height: "4px", borderRadius: "999px" }} />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", borderRadius: "8px", padding: "8px 12px", flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 800, color: "#f59e0b" }}>{place.total}</div>
            <div style={{ color: muted, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Reports</div>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", borderRadius: "8px", padding: "8px 12px", flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 800, color: "#10b981" }}>{place.noPresurePct}%</div>
            <div style={{ color: muted, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>No Pressure</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, subtitle, places, dark, border, surface, text, muted, router, badgeFn }) {
  if (!places || places.length === 0) return null;
  return (
    <div style={{ marginBottom: "56px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "6px" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, color: text }}>
          {icon} {title}
        </h2>
      </div>
      <p style={{ color: muted, fontSize: "13px", marginBottom: "20px" }}>{subtitle}</p>
      <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px", scrollbarWidth: "none" }}>
        {places.map((place, i) => (
          <PlaceCard key={place.place_id} place={place} dark={dark} border={border} surface={surface} text={text} muted={muted} router={router} badge={badgeFn ? badgeFn(place, i) : null} />
        ))}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const { dark, toggle: toggleDark } = useTheme();
  const [zip, setZip] = useState("");
  const [inputZip, setInputZip] = useState("");
  const [data, setData] = useState({ topPicks: [], trending: [], hiddenGems: [] });
  const [loading, setLoading] = useState(true);

  const bg = dark ? "#030712" : "#f9fafb";
  const surface = dark ? "#0d1117" : "#ffffff";
  const border = dark ? "#1f2937" : "#e5e7eb";
  const text = dark ? "#ffffff" : "#111827";
  const muted = dark ? "#6b7280" : "#9ca3af";

  async function load(z) {
    setLoading(true);
    const url = z ? `/api/discover?zip=${encodeURIComponent(z)}` : "/api/discover";
    const res = await fetch(url);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => { load(""); }, []);

  function handleSearch() {
    if (!inputZip.trim()) return;
    setZip(inputZip.trim());
    load(inputZip.trim());
  }

  const hasResults = data.topPicks.length > 0 || data.trending.length > 0 || data.hiddenGems.length > 0;

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
        .spinner { width: 44px; height: 44px; border: 3px solid ${border}; border-top-color: #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
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
              {[["Home", "/"], ["Discover", "/discover"], ["Top Rated", "/top-rated"], ["Dining Roulette", "/roulette"], ["Food Wheel", "/wheel"], ["About", "/about"]].map(([item, path]) => (
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

        {/* Hero + ZIP */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "56px 32px 40px" }}>
          <div className="fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "6px 16px", marginBottom: "20px" }}>
              <span style={{ fontSize: "14px" }}>⭐</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase" }}>App Exclusive</span>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", color: text, marginBottom: "12px" }}>
              Community's top picks.<br />
              <span style={{ color: "#f59e0b" }}>Real scores. No pressure.</span>
            </h1>
            <p style={{ color: muted, fontSize: "16px", lineHeight: 1.7, maxWidth: "520px", marginBottom: "32px" }}>
              Places rated directly by TipCheck users. No paid placements. Enter your ZIP to see what's near you.
            </p>

            {/* ZIP input */}
            <div style={{ display: "flex", gap: "12px", maxWidth: "440px" }}>
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
                onClick={handleSearch}
                style={{ background: "#f59e0b", color: "#030712", fontWeight: 700, padding: "14px 28px", borderRadius: "14px", border: "none", cursor: "pointer", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fbbf24"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f59e0b"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Explore →
              </button>
            </div>
            {zip && <p style={{ color: muted, fontSize: "13px", marginTop: "12px" }}>📍 Showing results near <strong style={{ color: text }}>{zip}</strong> · <span style={{ color: "#f59e0b", cursor: "pointer" }} onClick={() => { setZip(""); setInputZip(""); load(""); }}>Clear</span></p>}
          </div>
        </section>

        {/* Results */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 80px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div className="spinner" />
              <p style={{ color: muted }}>Loading community picks...</p>
            </div>
          )}

          {!loading && !hasResults && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>📡</div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, color: text, marginBottom: "12px" }}>
                {zip ? `No community reports near ${zip} yet` : "App data coming soon"}
              </h2>
              <p style={{ color: muted, fontSize: "15px", maxWidth: "400px", margin: "0 auto", lineHeight: 1.7 }}>
                {zip ? "Try a different ZIP, or check back as more people submit reports through the TipCheck app." : "As the TipCheck app collects community reports, the best places will appear here automatically."}
              </p>
            </div>
          )}

          {!loading && hasResults && (
            <>
              <Section title="Top Picks" icon="🏆" subtitle="Highest-rated places with the most community reports"
                places={data.topPicks} dark={dark} border={border} surface={surface} text={text} muted={muted} router={router}
                badgeFn={(p, i) => i === 0 ? { label: "⭐ #1 Pick", bg: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#030712" } : null}
              />
              <Section title="Trending" icon="🔥" subtitle="Places getting the most reports in the last 7 days"
                places={data.trending} dark={dark} border={border} surface={surface} text={text} muted={muted} router={router}
                badgeFn={() => ({ label: "🔥 Trending", bg: "rgba(239,68,68,0.85)", color: "#fff" })}
              />
              <Section title="Hidden Gems" icon="💎" subtitle="High scores, few reports — discovered before the crowd"
                places={data.hiddenGems} dark={dark} border={border} surface={surface} text={text} muted={muted} router={router}
                badgeFn={() => ({ label: "💎 Hidden Gem", bg: "rgba(99,102,241,0.85)", color: "#fff" })}
              />
            </>
          )}
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
