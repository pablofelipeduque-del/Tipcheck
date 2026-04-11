"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

function MiniMeter({ score, label }) {
  const color = score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";
  const textColor = score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
        <span style={{ color: "#6b7280" }}>{label}</span>
        <span style={{ color: textColor, fontWeight: 700 }}>{score}/10</span>
      </div>
      <div style={{ width: "100%", background: "#1f2937", borderRadius: "999px", height: "6px" }}>
        <div style={{ width: `${score * 10}%`, background: color, height: "6px", borderRadius: "999px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

export default function RestaurantPage() {
  const { id } = useParams();
  const router = useRouter();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [form, setForm] = useState({
    pressured: null,
    tip_added: null,
    counter_order: null,
    score: 5,
    comment: ""
  });

  useEffect(() => {
    async function fetchPlace() {
      try {
        const res = await fetch(`/api/place?id=${id}`);
        const data = await res.json();
        if (data.place) setPlace(data.place);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }

    async function fetchReports() {
      const { data } = await supabase
        .from("tip_reports")
        .select("score")
        .eq("place_id", id);
      if (data) setReportCount(data.length);
    }

    fetchPlace();
    fetchReports();
  }, [id]);

  async function handleSubmit() {
    if (form.pressured === null || form.tip_added === null || form.counter_order === null) {
      alert("Please answer all questions!");
      return;
    }
    setSubmitting(true);
    try {
      await supabase.from("tip_reports").insert([{
        place_id: id,
        place_name: place ? place.name : id,
        pressured: form.pressured,
        tip_added: form.tip_added,
        counter_order: form.counter_order,
        score: form.score,
        comment: form.comment,
      }]);
      setSubmitted(true);
      setShowForm(false);
      setReportCount(reportCount + 1);
    } catch (e) {
      alert("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  const tipColor = place ? (place.tipScore >= 7 ? "#10b981" : place.tipScore >= 4 ? "#f59e0b" : "#ef4444") : "#f59e0b";
  const tipLabel = place ? (place.tipScore >= 7 ? "Friendly" : place.tipScore >= 4 ? "Moderate" : "Pressured") : "Unknown";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .yesno-btn { padding: 10px 24px; border-radius: 10px; border: 1px solid #1f2937; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; transition: all 0.2s; background: #0d1117; color: #9ca3af; }
        .yesno-btn.selected { background: #f59e0b; color: #030712; border-color: #f59e0b; }
        .yesno-btn:not(.selected):hover { border-color: #f59e0b; color: white; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 40px; height: 40px; border: 3px solid #1f2937; border-top-color: #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#030712", color: "white", fontFamily: "'DM Sans', sans-serif" }}>
        <header style={{ borderBottom: "1px solid #111827", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(3,7,18,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push("/")}>
            <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💸</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" }}>Tip<span style={{ color: "#f59e0b" }}>Check</span></span>
          </div>
          <button onClick={() => router.push("/")} style={{ color: "#6b7280", fontSize: "14px", background: "none", border: "none", cursor: "pointer" }}>← Back to Search</button>
        </header>

        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div className="spinner" />
              <p style={{ color: "#6b7280", marginTop: "16px" }}>Loading place details...</p>
            </div>
          ) : place ? (
            <>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", background: "#111827", color: "#6b7280", padding: "4px 12px", borderRadius: "999px", textTransform: "capitalize" }}>{place.category}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "8px" }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>{place.name}</h1>
                <span style={{ color: "#f59e0b", fontSize: "20px", fontWeight: 700 }}>⭐ {place.rating}</span>
              </div>
              <p style={{ color: "#6b7280", marginBottom: "6px" }}>📍 {place.address}</p>
              <p style={{ color: "#6b7280", marginBottom: "24px" }}>💬 {place.reviews?.toLocaleString()} reviews</p>

              {/* Tip Score */}
              <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700 }}>Tipping Culture Score</h2>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: tipColor }}>{place.tipScore}/10 · {tipLabel}</span>
                </div>
                <div style={{ width: "100%", background: "#1f2937", borderRadius: "999px", height: "8px", marginBottom: "16px" }}>
                  <div style={{ width: `${place.tipScore * 10}%`, background: tipColor, height: "8px", borderRadius: "999px" }} />
                </div>
                <p style={{ color: "#6b7280", fontSize: "13px", fontStyle: "italic" }}>"{place.tip}"</p>
                {reportCount > 0 && (
                  <p style={{ color: "#4b5563", fontSize: "12px", marginTop: "8px" }}>Based on {reportCount} TipCheck report{reportCount > 1 ? "s" : ""} + review analysis</p>
                )}
              </div>

              {/* Report Form */}
              {!submitted ? (
                <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>Report Your Experience</h2>
                      <p style={{ color: "#6b7280", fontSize: "13px" }}>Help others by sharing your tipping experience here.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} style={{ background: "#f59e0b", color: "#030712", fontWeight: 700, padding: "12px 24px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>
                      {showForm ? "Cancel" : "📝 Report Tipping Experience"}
                    </button>
                  </div>

                  {showForm && (
                    <div style={{ marginTop: "24px", borderTop: "1px solid #1f2937", paddingTop: "24px" }}>
                      <div style={{ marginBottom: "20px" }}>
                        <p style={{ fontWeight: 600, marginBottom: "10px" }}>Were you pressured to tip?</p>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button className={`yesno-btn ${form.pressured === true ? "selected" : ""}`} onClick={() => setForm({ ...form, pressured: true })}>Yes</button>
                          <button className={`yesno-btn ${form.pressured === false ? "selected" : ""}`} onClick={() => setForm({ ...form, pressured: false })}>No</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: "20px" }}>
                        <p style={{ fontWeight: 600, marginBottom: "10px" }}>Was a tip automatically added to your bill?</p>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button className={`yesno-btn ${form.tip_added === true ? "selected" : ""}`} onClick={() => setForm({ ...form, tip_added: true })}>Yes</button>
                          <button className={`yesno-btn ${form.tip_added === false ? "selected" : ""}`} onClick={() => setForm({ ...form, tip_added: false })}>No</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: "20px" }}>
                        <p style={{ fontWeight: 600, marginBottom: "10px" }}>Was this a counter/pickup order?</p>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button className={`yesno-btn ${form.counter_order === true ? "selected" : ""}`} onClick={() => setForm({ ...form, counter_order: true })}>Yes</button>
                          <button className={`yesno-btn ${form.counter_order === false ? "selected" : ""}`} onClick={() => setForm({ ...form, counter_order: false })}>No</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: "20px" }}>
                        <p style={{ fontWeight: 600, marginBottom: "10px" }}>Rate the tipping experience: <span style={{ color: "#f59e0b" }}>{form.score}/10</span></p>
                        <input type="range" min="1" max="10" value={form.score} onChange={(e) => setForm({ ...form, score: parseInt(e.target.value) })} style={{ width: "100%", accentColor: "#f59e0b" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                          <span>1 - Very Pressured</span>
                          <span>10 - No Pressure</span>
                        </div>
                      </div>
                      <div style={{ marginBottom: "24px" }}>
                        <p style={{ fontWeight: 600, marginBottom: "10px" }}>Any comments? (optional)</p>
                        <textarea placeholder="Tell us about your tipping experience..." value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={3} style={{ width: "100%", background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "12px 16px", color: "white", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", outline: "none", resize: "vertical" }} />
                      </div>
                      <button onClick={handleSubmit} disabled={submitting} style={{ background: "#f59e0b", color: "#030712", fontWeight: 700, padding: "14px 32px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", width: "100%", opacity: submitting ? 0.6 : 1 }}>
                        {submitting ? "Submitting..." : "Submit Report"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "20px", padding: "24px", marginBottom: "20px", textAlign: "center" }}>
                  <p style={{ fontSize: "32px", marginBottom: "8px" }}>✅</p>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, color: "#10b981", marginBottom: "8px" }}>Thank you for your report!</h3>
                  <p style={{ color: "#6b7280", fontSize: "14px" }}>Your feedback helps other diners make informed decisions.</p>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</p>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Place not found</p>
              <button onClick={() => router.push("/")} style={{ color: "#f59e0b", background: "none", border: "none", cursor: "pointer", fontSize: "14px", marginTop: "8px" }}>← Back to search</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}