import { supabase } from "../../../lib/supabase";

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

function photoUrl(ref) {
  if (!ref) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${ref}&key=${GOOGLE_KEY}`;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) return Response.json({ places: [], error: "Missing coordinates" });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&type=restaurant&key=${GOOGLE_KEY}`
    );
    const data = await res.json();

    if (!data.results?.length) return Response.json({ places: [] });

    const top = data.results
      .filter((p) => p.rating >= 3.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
      .map((p) => ({
        place_id: p.place_id,
        name: p.name,
        address: p.vicinity,
        rating: p.rating || null,
        total_ratings: p.user_ratings_total || 0,
        photo: photoUrl(p.photos?.[0]?.photo_reference),
        types: (p.types || []).filter((t) => t !== "point_of_interest" && t !== "establishment").slice(0, 1),
      }));

    // Fetch community scores for these places
    const placeIds = top.map((p) => p.place_id);
    const { data: reports } = await supabase
      .from("tip_reports")
      .select("place_id, score")
      .in("place_id", placeIds);

    const communityMap = {};
    if (reports) {
      for (const r of reports) {
        if (!communityMap[r.place_id]) communityMap[r.place_id] = [];
        communityMap[r.place_id].push(r.score);
      }
    }

    const places = top.map((p) => {
      const scores = communityMap[p.place_id];
      const communityScore = scores
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null;
      return { ...p, communityScore, communityReports: scores?.length || 0 };
    });

    return Response.json({ places });
  } catch (err) {
    console.error("[Nearby] Error:", err);
    return Response.json({ places: [], error: "Failed to fetch nearby places" });
  }
}
