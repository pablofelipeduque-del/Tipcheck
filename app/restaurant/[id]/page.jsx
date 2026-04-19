"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import FloatingParticles from "../../components/FloatingParticles";
import { useTheme } from "../../components/useTheme";

function ScoreBar({ score }) {
  const color = score >= 4 ? "#10b981" : score >= 3 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ width: "100%", background: "#1f2937", borderRadius: "999px", height: "6px" }}>
      <div style={{ width: `${score * 20}%`, background: color, height: "6px", borderRadius: "999px", transition: "width 0.6s ease" }} />
    </div>
  );
}

function StatPill({ icon, label, value, highlight }) {
  return (
    <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "16px 20px", flex: 1, minWidth: "120px" }}>
      <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, color: highlight || "white", marginBottom: "4px" }}>{value}</div>
      <div style={{ color: "#6b7280", fontSize: "12px", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function RestaurantPage() {
  const { id } = useParams();
  const router = useRouter();
  const { dark } = useTheme();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    pressured: null,
    tip_added: null,
    counter_order: null,
    score: 3,
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
        .select("score, pressured, tip_added, counter_order, comment, created_at")
        .eq("place_id", id)
        .order("created_at", { ascending: false });
      if (data) setReports(data);
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
      const { data: newReport } = await supabase.from("tip_reports").insert([{
        place_id: id,
        place_name: place ? place.name : id,
        pressured: form.pressured,
        tip_added: form.tip_added,
        counter_order: form.counter_order,
        score: form.score,
        comment: form.comment,
      }]).select().single();

      setSubmitted(true);
      setShowForm(false);
      if (newReport) setReports([newReport, ...reports]);
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  // Community stats
  const reportCount = reports.length;
  const avgScore = reportCount > 0
    ? Math.round((reports.reduce((sum, r) => sum + r.score, 0) / reportCount) * 10) / 10
    : null;

  // Blended score — community data takes over as reports grow
  const blended = (() => {
    if (!place) return { score: 3, label: "Unknown", color: "#f59e0b", communityWeight: 0, confidence: 0 };
    const googleScore = place.tipScore;
    if (reportCount === 0) {
      return { score: googleScore, communityWeight: 0, confidence: 1, source: "google" };
    }
    const communityWeight = reportCount >= 6 ? 0.9 : reportCount >= 3 ? 0.75 : 0.5;
    const raw = avgScore * communityWeight + googleScore * (1 - communityWeight);
    const score = Math.min(5, Math.max(1, Math.round(raw * 10) / 10));
    const confidence = reportCount >= 6 ? 4 : reportCount >= 3 ? 3 : reportCount >= 1 ? 2 : 1;
    return { score, communityWeight, confidence, source: reportCount >= 3 ? "community" : "mixed" };
  })();

  const displayScore = blended.score;
  const tipColor = displayScore >= 4 ? "#10b981" : displayScore >= 3 ? "#f59e0b" : "#ef4444";
  const tipLabel = displayScore >= 4 ? "Friendly" : displayScore >= 3 ? "Moderate" : "Pressured";
  const pctPressured = reportCount > 0
    ? Math.round((reports.filter(r => r.pressured).length / reportCount) * 100)
    : null;
  const pctAutoTip = reportCount > 0
    ? Math.round((reports.filter(r => r.tip_added).length / reportCount) * 100)
    : null;
  const comments = reports.filter(r => r.comment && r.comment.trim().length > 0);

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
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .comment-card { background: #111827; border: 1px solid #1f2937; border-radius: 14px; padding: 16px 18px; transition: border-color 0.2s; }
        .comment-card:hover { border-color: #374151; }
      `}</style>

      <FloatingParticles count={16} opacity={0.7} />
      <main style={{ minHeight: "100vh", color: "white", fontFamily: "'DM Sans', sans-serif", position: "relative", zIndex: 1 }}>
        <header style={{ borderBottom: "1px solid #111827", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(3,7,18,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => router.push("/")}>
            <img src="/Tipcheck.png" alt="TipCheck" style={{ height: "72px", width: "auto" }} />
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

              {/* Blended Tip Score */}
              <div style={{ background: "#0d1117", border: `1px solid ${tipColor === "#10b981" ? "rgba(16,185,129,0.25)" : tipColor === "#f59e0b" ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`, borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>Tipping Culture Score</h2>
                    {/* Confidence signal bars */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "14px" }}>
                        {[1,2,3,4].map(bar => (
                          <div key={bar} style={{
                            width: "4px",
                            height: `${bar * 3 + 2}px`,
                            borderRadius: "2px",
                            background: bar <= blended.confidence ? tipColor : "#1f2937",
                            transition: "background 0.3s",
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: "10px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {blended.confidence === 4 ? "High confidence" :
                         blended.confidence === 3 ? "Good confidence" :
                         blended.confidence === 2 ? "Early data" : "Google only"}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: tipColor, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{displayScore}/5</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: tipColor, marginTop: "2px" }}>{tipLabel}</div>
                  </div>
                </div>
                <ScoreBar score={displayScore} />

                {/* Source attribution */}
                <div style={{ marginTop: "14px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {reportCount > 0 && (
                    <span style={{ fontSize: "11px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", padding: "3px 10px", borderRadius: "999px", fontWeight: 600 }}>
                      {Math.round(blended.communityWeight * 100)}% community ({reportCount} report{reportCount !== 1 ? "s" : ""})
                    </span>
                  )}
                  <span style={{ fontSize: "11px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: "#f59e0b", padding: "3px 10px", borderRadius: "999px", fontWeight: 600 }}>
                    {reportCount > 0 ? `${Math.round((1 - blended.communityWeight) * 100)}% Google analysis` : "Google review analysis"}
                  </span>
                </div>

                {blended.source === "google" && place.tip && (
                  <p style={{ color: "#6b7280", fontSize: "13px", fontStyle: "italic", marginTop: "12px" }}>&ldquo;{place.tip}&rdquo;</p>
                )}
              </div>

              {/* Community Reports Section */}
              {reportCount > 0 && (
                <div className="fade-up" style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700 }}>From the Community</h2>
                    <span style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "4px 12px", fontSize: "12px", color: "#f59e0b", fontWeight: 700 }}>
                      {reportCount} report{reportCount > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Stat pills */}
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
                    <StatPill
                      icon="🏅"
                      label="Avg community score"
                      value={`${avgScore}/10`}
                      highlight={avgScore >= 4 ? "#10b981" : avgScore >= 3 ? "#f59e0b" : "#ef4444"}
                    />
                    <StatPill
                      icon="😤"
                      label="felt pressured"
                      value={`${pctPressured}%`}
                      highlight={pctPressured > 50 ? "#ef4444" : pctPressured > 25 ? "#f59e0b" : "#10b981"}
                    />
                    <StatPill
                      icon="🧾"
                      label="had auto-tip added"
                      value={`${pctAutoTip}%`}
                      highlight={pctAutoTip > 50 ? "#ef4444" : pctAutoTip > 25 ? "#f59e0b" : "#10b981"}
                    />
                  </div>

                  {/* Community avg score bar */}
                  <div style={{ marginBottom: comments.length > 0 ? "24px" : "0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
                      <span style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Community tip score</span>
                      <span style={{ color: avgScore >= 4 ? "#10b981" : avgScore >= 3 ? "#f59e0b" : "#ef4444", fontWeight: 700 }}>{avgScore}/5</span>
                    </div>
                    <ScoreBar score={avgScore} />
                  </div>

                  {/* Diner comments */}
                  {comments.length > 0 && (
                    <>
                      <p style={{ color: "#6b7280", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
                        What diners said
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {comments.map((r, i) => (
                          <div key={i} className="comment-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                              <div style={{ display: "flex", gap: "8px" }}>
                                {r.pressured && (
                                  <span style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "999px", padding: "2px 10px", fontSize: "11px", color: "#ef4444", fontWeight: 600 }}>Felt pressured</span>
                                )}
                                {r.tip_added && (
                                  <span style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "999px", padding: "2px 10px", fontSize: "11px", color: "#f59e0b", fontWeight: 600 }}>Auto-tip added</span>
                                )}
                                {r.counter_order && (
                                  <span style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "999px", padding: "2px 10px", fontSize: "11px", color: "#818cf8", fontWeight: 600 }}>Counter order</span>
                                )}
                              </div>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: r.score >= 4 ? "#10b981" : r.score >= 3 ? "#f59e0b" : "#ef4444" }}>{r.score}/5</span>
                            </div>
                            <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.6 }}>&ldquo;{r.comment}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

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
                        <p style={{ fontWeight: 600, marginBottom: "10px" }}>Rate the tipping experience: <span style={{ color: "#f59e0b" }}>{form.score}/5</span></p>
                        <input type="range" min="1" max="5" value={form.score} onChange={(e) => setForm({ ...form, score: parseInt(e.target.value) })} style={{ width: "100%", accentColor: "#f59e0b" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                          <span>1 - Very Pressured</span>
                          <span>5 - No Pressure</span>
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
