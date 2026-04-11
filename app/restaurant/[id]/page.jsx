"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";

const allPlaces = [
  { id: "the-rustic-table", name: "The Rustic Table", category: "Restaurants", rating: 4.8, tipScore: 8, address: "123 Main St, Pensacola FL 32501", reviews: 342, phone: "(850) 555-0101", hours: "Mon-Sun 11am - 10pm", tip: "Fair tipping culture. Staff never pressures customers.", priceRange: "$$", about: "A cozy neighborhood restaurant serving farm-to-table American cuisine.", tipBreakdown: { pressure: 8, transparency: 9, fairness: 8, takeoutExperience: 7 }, recentReviews: [{ author: "Maria G.", text: "Never felt pressured to tip. Loved the experience!", rating: 5 }, { author: "James T.", text: "Great food, staff was super friendly and no awkward tip screen.", rating: 5 }, { author: "Sandra K.", text: "Comfortable tipping experience. Will come back!", rating: 4 }] },
  { id: "morning-bloom-bakery", name: "Morning Bloom Bakery", category: "Bakeries", rating: 4.9, tipScore: 9, address: "456 Oak Ave, Pensacola FL 32502", reviews: 215, phone: "(850) 555-0202", hours: "Mon-Sat 7am - 3pm", tip: "Tip jar only. Zero pressure. Great vibes.", priceRange: "$", about: "A charming local bakery known for its fresh pastries and artisan breads.", tipBreakdown: { pressure: 10, transparency: 9, fairness: 9, takeoutExperience: 9 }, recentReviews: [{ author: "Carlos M.", text: "Best bakery in town and no guilt when you just grab a coffee.", rating: 5 }, { author: "Linda H.", text: "Simple tip jar, totally voluntary. Love this place.", rating: 5 }, { author: "Tom B.", text: "Refreshing to just pay and go without the awkward tablet flip.", rating: 4 }] },
  { id: "urban-grind-coffee", name: "Urban Grind Coffee", category: "Coffee", rating: 4.5, tipScore: 3, address: "789 Pine Rd, Pensacola FL 32501", reviews: 198, phone: "(850) 555-0303", hours: "Mon-Fri 6am - 6pm", tip: "Tablet flipped aggressively. Feels uncomfortable for quick orders.", priceRange: "$", about: "Trendy coffee shop with great espresso drinks but aggressive tipping experience.", tipBreakdown: { pressure: 2, transparency: 4, fairness: 3, takeoutExperience: 2 }, recentReviews: [{ author: "Rachel P.", text: "Love the coffee but the tip screen is turned to face you before you even see the total.", rating: 3 }, { author: "Mike S.", text: "Felt really pressured even just picking up a drip coffee.", rating: 2 }, { author: "Anna L.", text: "Good drinks, but the tipping situation is uncomfortable.", rating: 3 }] },
];

function MiniMeter({ score, label }) {
  const color = score >= 7 ? "bg-emerald-500" : score >= 4 ? "bg-amber-400" : "bg-red-500";
  const textColor = score >= 7 ? "text-emerald-400" : score >= 4 ? "text-amber-400" : "text-red-400";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={textColor}>{score}/10</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${score * 10}%` }} />
      </div>
    </div>
  );
}

export default function RestaurantPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    pressured: null,
    tip_added: null,
    counter_order: null,
    score: 5,
    comment: ""
  });

  const place = allPlaces.find((p) => p.id === id);

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
    } catch (e) {
      alert("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  const overallColor = place ? (place.tipScore >= 7 ? "text-emerald-400" : place.tipScore >= 4 ? "text-amber-400" : "text-red-400") : "text-amber-400";
  const overallLabel = place ? (place.tipScore >= 7 ? "Friendly" : place.tipScore >= 4 ? "Moderate" : "Pressured") : "Unknown";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .yesno-btn { padding: 10px 24px; border-radius: 10px; border: 1px solid #1f2937; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; transition: all 0.2s; background: #0d1117; color: #9ca3af; }
        .yesno-btn.selected { background: #f59e0b; color: #030712; border-color: #f59e0b; }
        .yesno-btn:not(.selected):hover { border-color: #f59e0b; color: white; }
        @keyndef fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#030712", color: "white", fontFamily: "'DM Sans', sans-serif" }}>
        <header style={{ borderBottom: "1px solid #111827", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(3,7,18,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push("/")}>
            <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💸</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" }}>Tip<span style={{ color: "#f59e0b" }}>Check</span></span>
          </div>
          <button onClick={() => router.push("/")} style={{ color: "#6b7280", fontSize: "14px", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}>← Back to Search</button>
        </header>

        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>
          
          {place ? (
            <>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", background: "#111827", color: "#6b7280", padding: "4px 12px", borderRadius: "999px" }}>{place.category}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "8px" }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>{place.name}</h1>
                <span style={{ color: "#f59e0b", fontSize: "20px", fontWeight: 700 }}>⭐ {place.rating}</span>
              </div>
              <p style={{ color: "#6b7280", marginBottom: "6px" }}>📍 {place.address}</p>
              <p style={{ color: "#6b7280", marginBottom: "6px" }}>📞 {place.phone}</p>
              <p style={{ color: "#6b7280", marginBottom: "24px" }}>🕐 {place.hours} · {place.priceRange}</p>
              <p style={{ color: "#d1d5db", marginBottom: "32px", lineHeight: 1.7 }}>{place.about}</p>
            </>
          ) : (
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>Restaurant Details</h1>
              <p style={{ color: "#6b7280" }}>Showing tipping reports for this location.</p>
            </div>
          )}

          {/* Tip Score */}
          {place && (
            <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700 }}>Tipping Culture Score</h2>
                <span style={{ fontSize: "22px", fontWeight: 800 }} className={overallColor}>{place.tipScore}/10 · {overallLabel}</span>
              </div>
              <MiniMeter score={place.tipBreakdown.pressure} label="No Pressure" />
              <MiniMeter score={place.tipBreakdown.transparency} label="Transparency" />
              <MiniMeter score={place.tipBreakdown.fairness} label="Fairness" />
              <MiniMeter score={place.tipBreakdown.takeoutExperience} label="Takeout Experience" />
              <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "16px", fontStyle: "italic" }}>"{place.tip}"</p>
            </div>
          )}

          {/* Report Button */}
          {!submitted ? (
            <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>Report Your Experience</h2>
                  <p style={{ color: "#6b7280", fontSize: "13px" }}>Help others by sharing your tipping experience here.</p>
                </div>
                <button
                  onClick={() => setShowForm(!showForm)}
                  style={{ background: "#f59e0b", color: "#030712", fontWeight: 700, padding: "12px 24px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}
                >
                  {showForm ? "Cancel" : "📝 Report Tipping Experience"}
                </button>
              </div>

              {showForm && (
                <div className="fade-in" style={{ marginTop: "24px", borderTop: "1px solid #1f2937", paddingTop: "24px" }}>
                  
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
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={form.score}
                      onChange={(e) => setForm({ ...form, score: parseInt(e.target.value) })}
                      style={{ width: "100%", accentColor: "#f59e0b" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                      <span>1 - Very Pressured</span>
                      <span>10 - No Pressure</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <p style={{ fontWeight: 600, marginBottom: "10px" }}>Any comments? (optional)</p>
                    <textarea
                      placeholder="Tell us about your tipping experience..."
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      rows={3}
                      style={{ width: "100%", background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "12px 16px", color: "white", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", outline: "none", resize: "vertical" }}
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ background: "#f59e0b", color: "#030712", fontWeight: 700, padding: "14px 32px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", width: "100%", opacity: submitting ? 0.6 : 1 }}
                  >
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

          {/* Reviews */}
          {place && (
            <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: "20px", padding: "24px" }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Recent Reviews</h2>
              {place.recentReviews.map((review, i) => (
                <div key={i} style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: i < place.recentReviews.length - 1 ? "1px solid #111827" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>{review.author}</span>
                    <span style={{ color: "#f59e0b", fontSize: "13px" }}>{"⭐".repeat(review.rating)}</span>
                  </div>
                  <p style={{ color: "#6b7280", fontSize: "13px", lineHeight: 1.6 }}>"{review.text}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}