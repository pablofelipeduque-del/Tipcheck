"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FloatingParticles from "./components/FloatingParticles";
import { useTheme } from "./components/useTheme";

const categories = [
  { label: "All", icon: "🍽️" },
  { label: "Restaurants", icon: "🥘" },
  { label: "Bakeries", icon: "🥐" },
  { label: "Coffee", icon: "☕" },
  { label: "Fast Food", icon: "🍔" },
  { label: "Pizza", icon: "🍕" },
  { label: "Sushi", icon: "🍣" },
  { label: "Desserts", icon: "🍰" },
];

function TipMeter({ score, dark }) {
  const color = score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";
  const label = score >= 7 ? "Friendly" : score >= 4 ? "Moderate" : "Pressured";
  return (
    <div style={{ marginTop: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "6px", fontFamily: "'DM Sans', sans-serif" }}>
        <span style={{ color: dark ? "#6b7280" : "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>Tip Culture</span>
        <span style={{ color, fontWeight: 700 }}>{label} · {score}/10</span>
      </div>
      <div style={{ width: "100%", background: dark ? "#1f2937" : "#e5e7eb", borderRadius: "999px", height: "6px" }}>
        <div style={{ width: `${score * 10}%`, background: color, height: "6px", borderRadius: "999px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function FoodIllustration() {
  return (
    <svg width="420" height="320" viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: "100%", filter: "drop-shadow(0 20px 40px rgba(245,158,11,0.15))" }}>
      {/* Plate */}
      <ellipse cx="210" cy="200" rx="130" ry="20" fill="rgba(245,158,11,0.1)" />
      <circle cx="210" cy="180" r="110" fill="white" stroke="#f3f4f6" strokeWidth="2"/>
      <circle cx="210" cy="180" r="90" fill="#fafafa" stroke="#f3f4f6" strokeWidth="1"/>
      {/* Food items on plate */}
      <circle cx="185" cy="165" r="28" fill="#fde68a"/>
      <circle cx="185" cy="165" r="22" fill="#fbbf24"/>
      <circle cx="185" cy="165" r="14" fill="#f59e0b"/>
      <circle cx="235" cy="175" r="24" fill="#fca5a5"/>
      <circle cx="235" cy="175" r="18" fill="#f87171"/>
      <circle cx="235" cy="175" r="10" fill="#ef4444"/>
      <ellipse cx="210" cy="195" rx="20" ry="10" fill="#86efac"/>
      <ellipse cx="210" cy="195" rx="14" ry="7" fill="#4ade80"/>
      {/* Fork */}
      <rect x="340" y="100" width="6" height="80" rx="3" fill="#d1d5db"/>
      <rect x="338" y="100" width="2" height="30" rx="1" fill="#9ca3af"/>
      <rect x="342" y="100" width="2" height="30" rx="1" fill="#9ca3af"/>
      <rect x="346" y="100" width="2" height="30" rx="1" fill="#9ca3af"/>
      {/* Knife */}
      <rect x="360" y="100" width="6" height="80" rx="3" fill="#d1d5db"/>
      <path d="M360 100 L366 100 L366 130 L360 140 Z" fill="#9ca3af"/>
      {/* Steam */}
      <path d="M185 80 Q190 65 185 50" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
      </path>
      <path d="M210 70 Q215 55 210 40" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite"/>
      </path>
      <path d="M235 75 Q240 60 235 45" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite"/>
      </path>
      {/* Floating food items */}
      <text x="50" y="100" fontSize="32" opacity="0.7">🍕</text>
      <text x="330" y="60" fontSize="28" opacity="0.6">☕</text>
      <text x="20" y="200" fontSize="24" opacity="0.5">🥐</text>
      <text x="360" y="220" fontSize="26" opacity="0.6">🍣</text>
      <text x="80" y="280" fontSize="20" opacity="0.4">🍰</text>
      <text x="300" y="290" fontSize="22" opacity="0.5">🍔</text>
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const { dark, toggle: toggleDark } = useTheme();
  const [zip, setZip] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const bg = dark ? "#030712" : "#f9fafb";
  const surface = dark ? "#0d1117" : "#ffffff";
  const border = dark ? "#1f2937" : "#e5e7eb";
  const text = dark ? "#ffffff" : "#111827";
  const muted = dark ? "#6b7280" : "#9ca3af";
  const subtle = dark ? "#111827" : "#f3f4f6";

  async function handleSearch() {
    if (!zip.trim()) return;
    setIsLoading(true);
    setHasSearched(false);
    setError("");
    try {
      const category = activeCategory === "All" ? "restaurants" : activeCategory;
      const res = await fetch(`/api/search?query=${encodeURIComponent(category + " in " + zip)}`);
      const data = await res.json();
      if (data.error) { setError("Something went wrong."); setPlaces([]); }
      else { setPlaces(data.places); }
    } catch { setError("Could not connect."); setPlaces([]); }
    setIsLoading(false);
    setHasSearched(true);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${bg}; transition: background 0.3s; }
        .card { transition: all 0.3s ease; cursor: pointer; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 24px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(245,158,11,0.3) !important; border-color: #f59e0b !important; }
        .toggle-btn { width: 52px; height: 28px; border-radius: 999px; border: none; cursor: pointer; position: relative; transition: background 0.3s; }
        .toggle-knob { width: 22px; height: 22px; border-radius: 50%; background: white; position: absolute; top: 3px; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .search-input { flex: 1; border-radius: 14px; padding: 16px 22px; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; }
        .search-btn { background: #f59e0b; color: #030712; font-weight: 700; padding: 16px 32px; border-radius: 14px; border: none; cursor: pointer; font-size: 15px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap; }
        .search-btn:hover { background: #fbbf24; transform: translateY(-1px); }
        .search-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .cat-btn { padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; border: 1px solid; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 44px; height: 44px; border: 3px solid ${border}; border-top-color: #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .card-animate { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .float { animation: float 4s ease-in-out infinite; }
      `}</style>

      <FloatingParticles count={22} />
      <main style={{ minHeight: "100vh", color: text, fontFamily: "'DM Sans', sans-serif", transition: "color 0.3s", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <header style={{ borderBottom: `1px solid ${border}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: dark ? "rgba(3,7,18,0.92)" : "rgba(249,250,251,0.92)", backdropFilter: "blur(12px)", zIndex: 100, transition: "all 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💸</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: text }}>
              Tip<span style={{ color: "#f59e0b" }}>Check</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <nav style={{ display: "flex", gap: "28px" }}>
             {[["Discover", "/"], ["Top Rated", "/top-rated"], ["Dining Roulette", "/roulette"], ["About", "/about"]].map(([item, path]) => (
  <a key={item} href={path} style={{ color: muted, fontSize: "14px", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = text}
onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = muted}
    
  >{item}</a>
))}
            </nav>
            {/* Dark/Light Toggle */}
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
        <section style={{ padding: "60px 32px 40px", maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={{ display: "inline-block", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "24px" }}>
              Know Before You Go
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(38px, 5vw, 68px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "20px", color: text }}>
              Find great places.<br />
              <span style={{ color: "#f59e0b" }}>Skip the tip guilt.</span>
            </h1>
            <p style={{ color: muted, fontSize: "17px", maxWidth: "480px", marginBottom: "40px", lineHeight: 1.7 }}>
              Discover top-rated restaurants, bakeries, and cafés near you — with real tipping culture scores so you always know what to expect.
            </p>
            <div style={{ display: "flex", gap: "12px", maxWidth: "520px" }}>
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
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
            {hasSearched && !error && (
              <p style={{ color: muted, fontSize: "13px", marginTop: "14px" }}>
                Showing <span style={{ color: "#f59e0b", fontWeight: 600 }}>"{zip}"</span> · {places.length} places found
              </p>
            )}
            {error && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "14px" }}>{error}</p>}
          </div>

          {/* Illustration */}
          <div className="float" style={{ flex: 1, minWidth: "280px", display: "flex", justifyContent: "center" }}>
            <FoodIllustration />
          </div>
        </section>

        {/* Stats Bar */}
        <div style={{ background: dark ? "#0d1117" : "#ffffff", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, padding: "20px 32px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "center", gap: "60px", flexWrap: "wrap" }}>
            {[["10M+", "Restaurants"], ["Real", "Review Data"], ["Free", "Always"]].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, color: "#f59e0b" }}>{val}</div>
                <div style={{ fontSize: "12px", color: muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <section style={{ padding: "32px 32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button key={cat.label} className="cat-btn"
                onClick={() => setActiveCategory(cat.label)}
                style={{
                  background: activeCategory === cat.label ? "#f59e0b" : surface,
                  color: activeCategory === cat.label ? "#030712" : muted,
                  borderColor: activeCategory === cat.label ? "#f59e0b" : border,
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Results */}
        <section style={{ padding: "0 32px 80px", maxWidth: "1200px", margin: "0 auto" }}>
          {isLoading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div className="spinner" />
              <p style={{ color: muted, fontSize: "16px", fontWeight: 500 }}>Finding places near you...</p>
            </div>
          )}
          {!isLoading && hasSearched && places.length === 0 && !error && (
            <div style={{ textAlign: "center", padding: "80px 0", color: muted }}>
              <p style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</p>
              <p style={{ fontSize: "18px", fontWeight: 600, color: text }}>No places found.</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>Try a different ZIP code or category.</p>
            </div>
          )}
          {!isLoading && places.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {places.map((place, i) => (
                <div key={place.id} className="card card-animate"
                  style={{ background: surface, border: `1px solid ${border}`, borderRadius: "20px", padding: "22px", animationDelay: `${i * 0.07}s` }}
                  onClick={() => router.push(`/restaurant/${place.id}`)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "17px", fontWeight: 700, letterSpacing: "-0.3px", flex: 1, paddingRight: "12px", color: text }}>{place.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "4px 10px" }}>
                      <span style={{ fontSize: "12px" }}>⭐</span>
                      <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "14px" }}>{place.rating}</span>
                    </div>
                  </div>
                  <p style={{ color: muted, fontSize: "13px", marginBottom: "4px", textTransform: "capitalize" }}>{place.category}</p>
                  <p style={{ color: muted, fontSize: "12px", marginBottom: "4px" }}>📍 {place.address}</p>
                  <p style={{ color: muted, fontSize: "12px" }}>💬 {place.reviews.toLocaleString()} reviews</p>
                  <TipMeter score={place.tipScore} dark={dark} />
                  <p style={{ color: muted, fontSize: "12px", marginTop: "12px", fontStyle: "italic", lineHeight: 1.5 }}>"{place.tip}"</p>
                </div>
              ))}
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