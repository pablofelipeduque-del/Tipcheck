"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FloatingParticles from "../components/FloatingParticles";
import { useTheme } from "../components/useTheme";

function PlaceCard({ place, dark, border, surface, text, muted, router }) {
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
      {/* Photo */}
      <div style={{ width: "100%", height: "160px", background: dark ? "#1f2937" : "#e5e7eb", position: "relative", overflow: "hidden" }}>
        {place.photo
          ? <img src={place.photo} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", opacity: 0.2 }}>🍽️</div>
        }
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "70px", background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }} />

        {/* Google rating badge */}
        {place.rating && (
          <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(0,0,0,0.7)", color: "#fbbf24", fontWeight: 800, fontSize: "12px", padding: "4px 10px", borderRadius: "999px", display: "flex", alignItems: "center", gap: "4px" }}>
            ⭐ {place.rating}
          </div>
        )}

        {/* Community score badge */}
        {hasComm && (
          <div style={{ position: "absolute", top: "10px", right: "10px", background: scoreColor, color: "#fff", fontWeight: 800, fontSize: "11px", padding: "4px 10px", borderRadius: "999px" }}>
            TC {place.communityScore}/5
          </div>
        )}
      </div>

      {/* Body */}
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
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const { dark, toggle: toggleDark } = useTheme();
  const [inputZip, setInputZip] = useState("");
  const [zip, setZip] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const bg = dark ? "#030712" : "#f9fafb";
  const surface = dark ? "#0d1117" : "#ffffff";
  const border = dark ? "#1f2937" : "#e5e7eb";
  const text = dark ? "#ffffff" : "#111827";
  const muted = dark ? "#6b7280" : "#9ca3af";

  async function handleSearch() {
    if (!inputZip.trim()) return;
    setLoading(true);
    setSearched(false);
    setZip(inputZip.trim());
    const res = await fetch(`/api/discover?zip=${encodeURIComponent(inputZip.trim())}`);
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
    setSearched(true);
  }

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
              Enter your ZIP and we'll show you the highest-rated spots in every category — with real TipCheck community scores layered on top.
            </p>

            {/* ZIP input */}
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
                onClick={handleSearch}
                disabled={loading}
                style={{ background: "#f59e0b", color: "#030712", fontWeight: 700, padding: "14px 28px", borderRadius: "14px", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", opacity: loading ? 0.6 : 1, transition: "all 0.2s" }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#fbbf24"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f59e0b"; e.currentTarget.style.transform = ""; }}
              >
                {loading ? "Loading..." : "Discover →"}
              </button>
            </div>
            {zip && !loading && (
              <p style={{ color: muted, fontSize: "13px", marginTop: "12px" }}>
                📍 Showing top picks near <strong style={{ color: text }}>{zip}</strong> ·{" "}
                <span style={{ color: "#f59e0b", cursor: "pointer" }} onClick={() => { setZip(""); setInputZip(""); setCategories([]); setSearched(false); }}>Clear</span>
              </p>
            )}
          </div>
        </section>

        {/* Results */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 80px" }}>

          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div className="spinner" />
              <p style={{ color: muted, fontSize: "15px" }}>Finding the best spots near {inputZip}...</p>
              <p style={{ color: muted, fontSize: "12px", marginTop: "8px", opacity: 0.6 }}>Searching across 14 categories</p>
            </div>
          )}

          {!loading && !searched && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🗺️</div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "26px", fontWeight: 800, color: text, marginBottom: "12px" }}>Enter your ZIP to start</h2>
              <p style={{ color: muted, fontSize: "15px", maxWidth: "380px", margin: "0 auto", lineHeight: 1.7 }}>
                We'll find the top-rated places in every cuisine category near you and show any TipCheck community scores on top.
              </p>
            </div>
          )}

          {!loading && searched && categories.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>😕</div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, color: text, marginBottom: "12px" }}>No results found for {zip}</h2>
              <p style={{ color: muted, fontSize: "15px" }}>Try a different ZIP code.</p>
            </div>
          )}

          {!loading && searched && categories.length > 0 && categories.map((cat, ci) => (
            <div key={cat.name} style={{ marginBottom: "52px", animation: `fadeUp 0.5s ease ${ci * 0.05}s both` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span style={{ fontSize: "24px" }}>{cat.icon}</span>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, color: text }}>{cat.name}</h2>
                <div style={{ flex: 1, height: "1px", background: border, marginLeft: "8px" }} />
              </div>
              <p style={{ color: muted, fontSize: "13px", marginBottom: "18px" }}>Top {cat.places.length} near {zip}</p>
              <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px" }}>
                {cat.places.map((place) => (
                  <PlaceCard key={place.place_id} place={place} dark={dark} border={border} surface={surface} text={text} muted={muted} router={router} />
                ))}
              </div>
            </div>
          ))}
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
