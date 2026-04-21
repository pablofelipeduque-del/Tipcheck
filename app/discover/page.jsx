"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FloatingParticles from "../components/FloatingParticles";
import { useTheme } from "../components/useTheme";

export default function DiscoverPage() {
  const router = useRouter();
  const { dark, toggle: toggleDark } = useTheme();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const bg = dark ? "#030712" : "#f9fafb";
  const surface = dark ? "#0d1117" : "#ffffff";
  const border = dark ? "#1f2937" : "#e5e7eb";
  const text = dark ? "#ffffff" : "#111827";
  const muted = dark ? "#6b7280" : "#9ca3af";

  useEffect(() => {
    fetch("/api/discover")
      .then((r) => r.json())
      .then((d) => { setPlaces(d.places || []); setLoading(false); });
  }, []);

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
        .place-card { border-radius: 20px; padding: 24px; cursor: pointer; transition: all 0.3s; }
        .place-card:hover { transform: translateY(-4px); box-shadow: 0 24px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(245,158,11,0.3); border-color: #f59e0b !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 44px; height: 44px; border: 3px solid ${border}; border-top-color: #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
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
              <span style={{ fontSize: "14px" }}>☀️</span>
              <button className="toggle-btn" onClick={toggleDark} style={{ background: dark ? "#f59e0b" : "#d1d5db" }}>
                <div className="toggle-knob" style={{ left: dark ? "27px" : "3px" }} />
              </button>
              <span style={{ fontSize: "14px" }}>🌙</span>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 32px 40px" }}>
          <div className="fade-up" style={{ animationDelay: "0s" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "6px 16px", marginBottom: "24px" }}>
              <span style={{ fontSize: "14px" }}>⭐</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase" }}>App Exclusive</span>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", color: text, marginBottom: "16px" }}>
              Community's top picks.<br />
              <span style={{ color: "#f59e0b" }}>Real scores. No pressure.</span>
            </h1>
            <p style={{ color: muted, fontSize: "17px", lineHeight: 1.7, maxWidth: "560px" }}>
              These places were rated directly by the TipCheck community. Every score is from a real visit — no paid placements, no influence.
            </p>
          </div>
        </section>

        {/* Content */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 80px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div className="spinner" />
              <p style={{ color: muted }}>Loading community picks...</p>
            </div>
          )}

          {!loading && places.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>📡</div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, color: text, marginBottom: "12px" }}>App data coming soon</h2>
              <p style={{ color: muted, fontSize: "15px", maxWidth: "400px", margin: "0 auto", lineHeight: 1.7 }}>
                As the TipCheck app collects more community reports, the best-rated places will appear here automatically.
              </p>
            </div>
          )}

          {!loading && places.length > 0 && (
            <>
              <p style={{ color: muted, fontSize: "13px", marginBottom: "24px" }}>
                {places.length} place{places.length !== 1 ? "s" : ""} rated by the community
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {places.map((place, i) => {
                  const scoreColor = place.avgScore >= 4 ? "#10b981" : place.avgScore >= 3 ? "#f59e0b" : "#ef4444";
                  const scoreLabel = place.avgScore >= 4 ? "Tip Friendly" : place.avgScore >= 3 ? "Moderate" : "Pressured";
                  const isTop = i === 0;
                  return (
                    <div
                      key={place.place_id}
                      className="place-card fade-up"
                      onClick={() => router.push(`/restaurant/${place.place_id}`)}
                      style={{
                        background: surface,
                        border: `${isTop ? "2px" : "1px"} solid ${isTop ? "#f59e0b" : border}`,
                        animationDelay: `${i * 0.07}s`,
                        position: "relative",
                        overflow: "hidden",
                        padding: "0",
                      }}
                    >
                      {/* Photo header */}
                      <div style={{ width: "100%", height: "180px", background: dark ? "#1f2937" : "#e5e7eb", position: "relative", overflow: "hidden" }}>
                        {place.photo ? (
                          <img
                            src={place.photo}
                            alt={place.place_name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", opacity: 0.3 }}>🍽️</div>
                        )}
                        {/* Gradient overlay */}
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
                        {isTop && (
                          <div style={{ position: "absolute", top: "12px", left: "12px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#030712", fontSize: "10px", fontWeight: 800, padding: "4px 10px", borderRadius: "999px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            ⭐ Top Pick
                          </div>
                        )}
                        <div style={{ position: "absolute", top: "12px", right: "12px", background: scoreColor, color: "#fff", fontWeight: 800, fontSize: "13px", padding: "4px 12px", borderRadius: "999px" }}>
                          {place.avgScore}/5
                        </div>
                      </div>

                      {/* Card body */}
                      <div style={{ padding: "20px" }}>
                        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 800, color: text, marginBottom: "6px" }}>
                          {place.place_name}
                        </h3>
                        <span style={{ color: scoreColor, fontSize: "13px", fontWeight: 600 }}>{scoreLabel}</span>
                        <div style={{ width: "100%", background: dark ? "#1f2937" : "#e5e7eb", borderRadius: "999px", height: "5px", margin: "12px 0" }}>
                          <div style={{ width: `${place.avgScore * 20}%`, background: scoreColor, height: "5px", borderRadius: "999px" }} />
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", borderRadius: "10px", padding: "10px 14px", flex: 1, textAlign: "center" }}>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 800, color: "#f59e0b" }}>{place.total}</div>
                            <div style={{ color: muted, fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>Reports</div>
                          </div>
                          <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6", borderRadius: "10px", padding: "10px 14px", flex: 1, textAlign: "center" }}>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 800, color: "#10b981" }}>{place.noPresurePct}%</div>
                            <div style={{ color: muted, fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>No Pressure</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
