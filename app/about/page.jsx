"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AboutPage() {
  const router = useRouter();
  const [dark, setDark] = useState(true);

  const bg = dark ? "#030712" : "#f9fafb";
  const surface = dark ? "#0d1117" : "#ffffff";
  const border = dark ? "#1f2937" : "#e5e7eb";
  const text = dark ? "#ffffff" : "#111827";
  const muted = dark ? "#6b7280" : "#9ca3af";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .toggle-btn { width: 52px; height: 28px; border-radius: 999px; border: none; cursor: pointer; position: relative; transition: background 0.3s; }
        .toggle-knob { width: 22px; height: 22px; border-radius: 50%; background: white; position: absolute; top: 3px; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        .value-card { border-radius: 20px; padding: 28px; transition: all 0.3s; }
        .value-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); border-color: #f59e0b !important; }
      `}</style>

      <main style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s" }}>

        {/* Header */}
        <header style={{ borderBottom: `1px solid ${border}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: dark ? "rgba(3,7,18,0.92)" : "rgba(249,250,251,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push("/")}>
            <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💸</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: text }}>
              Tip<span style={{ color: "#f59e0b" }}>Check</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <nav style={{ display: "flex", gap: "28px" }}>
              {[["Discover", "/"], ["Top Rated", "/"], ["Dining Roulette", "/"], ["About", "/about"]].map(([item, path]) => (
                <a key={item} href={path} style={{ color: item === "About" ? "#f59e0b" : muted, fontSize: "14px", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}>{item}</a>
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

        {/* Hero */}
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 32px 60px", textAlign: "center" }}>
          <div className="fade-up" style={{ animationDelay: "0s" }}>
            <div style={{ display: "inline-block", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "24px" }}>
              Our Mission
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "24px", color: text }}>
              Tipping should be a <span style={{ color: "#f59e0b" }}>choice,</span><br />not a trap.
            </h1>
            <p style={{ color: muted, fontSize: "18px", lineHeight: 1.8, maxWidth: "620px", margin: "0 auto" }}>
              TipCheck was built because we believe in one simple truth — <strong style={{ color: text }}>workers deserve fair wages paid by their employers,</strong> not extracted from customers through guilt and social pressure.
            </p>
          </div>
        </section>

        {/* Main Mission Statement */}
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "0 32px 60px" }}>
          <div className="fade-up" style={{ animationDelay: "0.1s", background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "24px", padding: "40px" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>✊</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "26px", fontWeight: 800, color: text, marginBottom: "16px", letterSpacing: "-0.5px" }}>
              We stand against tip abuse.
            </h2>
            <p style={{ color: muted, fontSize: "16px", lineHeight: 1.9, marginBottom: "16px" }}>
              In recent years, tipping has been weaponized. Business owners who refuse to pay their employees honest, living wages have quietly shifted that burden onto customers. What was once a genuine gesture of appreciation for exceptional service has been twisted into a mandatory surcharge — enforced through guilt, awkward tablet screens, and social pressure.
            </p>
            <p style={{ color: muted, fontSize: "16px", lineHeight: 1.9, marginBottom: "16px" }}>
              We all know what service is. <strong style={{ color: text }}>Service is a waiter who takes your order, refills your drink, and checks on your table throughout the night.</strong> Service is not someone handing you a pre-packaged sandwich, a barista who presses a button on a machine, or a cashier who swipes your card and turns a screen toward you before you've even seen your total.
            </p>
            <p style={{ color: muted, fontSize: "16px", lineHeight: 1.9 }}>
              <strong style={{ color: text }}>You should never feel pressured to tip for no service.</strong> And you should never have to wonder if a business is going to make you feel guilty for simply making a purchase.
            </p>
          </div>
        </section>

        {/* Values */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px 60px" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, color: text, marginBottom: "32px", textAlign: "center", letterSpacing: "-1px" }}>What we believe</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { icon: "💰", title: "Fair Wages Are Not Optional", body: "Employers have a responsibility to pay their staff honest wages. Tipping culture exists because businesses pushed that responsibility onto customers. We think that's wrong." },
              { icon: "🙅", title: "No Pressure, Ever", body: "No one should feel manipulated, guilted, or watched while deciding whether to tip. A tip is a gesture of appreciation — not a fee, not a tax, not an expectation." },
              { icon: "🔍", title: "Transparency Matters", body: "Before you walk into a restaurant, bakery, or café, you deserve to know what kind of tipping experience awaits you. That's exactly what TipCheck provides." },
              { icon: "⚖️", title: "Real Service Deserves Real Tips", body: "We are not anti-tipping. We are anti-abuse. When someone truly serves you, reward them generously. But that should always be your choice — not a forced transaction." },
              { icon: "📢", title: "Your Voice Counts", body: "Every review, every score, every piece of feedback on TipCheck helps other diners make informed decisions and sends a clear message to businesses about what customers expect." },
              { icon: "🤝", title: "Built for Diners, By Diners", body: "TipCheck is a community tool. We use real customer reviews to calculate honest tipping culture scores — no paid placements, no business influence, no agenda except yours." },
            ].map(({ icon, title, body }, i) => (
              <div key={title} className="value-card fade-up" style={{ background: surface, border: `1px solid ${border}`, animationDelay: `${0.1 + i * 0.08}s` }}>
                <div style={{ fontSize: "32px", marginBottom: "14px" }}>{icon}</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "17px", fontWeight: 700, color: text, marginBottom: "10px", letterSpacing: "-0.3px" }}>{title}</h3>
                <p style={{ color: muted, fontSize: "14px", lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "0 32px 100px", textAlign: "center" }}>
          <div className="fade-up" style={{ animationDelay: "0.5s", background: dark ? "#0d1117" : "#ffffff", border: `1px solid ${border}`, borderRadius: "24px", padding: "52px 40px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💸</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, color: text, marginBottom: "16px", letterSpacing: "-1px" }}>
              Ready to eat without the guilt?
            </h2>
            <p style={{ color: muted, fontSize: "16px", lineHeight: 1.7, marginBottom: "32px" }}>
              Search for restaurants near you and see their real tipping culture scores before you walk through the door.
            </p>
            <button
              onClick={() => router.push("/")}
              style={{ background: "#f59e0b", color: "#030712", fontWeight: 700, padding: "16px 40px", borderRadius: "14px", border: "none", cursor: "pointer", fontSize: "16px", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.background = "#fbbf24"; e.target.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.target.style.background = "#f59e0b"; e.target.style.transform = "translateY(0)"; }}
            >
              Start Exploring →
            </button>
          </div>
        </section>

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