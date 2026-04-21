import { supabase } from "../../../lib/supabase";

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

async function fetchPhoto(place_id) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=photos&key=${GOOGLE_KEY}`
    );
    const data = await res.json();
    const ref = data?.result?.photos?.[0]?.photo_reference;
    if (!ref) return null;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${ref}&key=${GOOGLE_KEY}`;
  } catch {
    return null;
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from("tip_reports")
    .select("place_id, place_name, score, pressured, tip_added, created_at")
    .not("place_name", "is", null);

  if (error || !data) return Response.json({ places: [] });

  // Aggregate by place_name
  const map = {};
  for (const r of data) {
    const key = r.place_name.toLowerCase().trim();
    if (!map[key]) {
      map[key] = {
        place_id: r.place_id,
        place_name: r.place_name,
        scores: [],
        pressured_count: 0,
        tip_added_count: 0,
        total: 0,
        latest: r.created_at,
      };
    }
    map[key].scores.push(r.score);
    map[key].total++;
    if (r.pressured === false) map[key].pressured_count++;
    if (r.tip_added === true) map[key].tip_added_count++;
    if (r.created_at > map[key].latest) map[key].latest = r.created_at;
  }

  const places = Object.values(map).map((p) => ({
    ...p,
    avgScore: Math.round((p.scores.reduce((a, b) => a + b, 0) / p.scores.length) * 10) / 10,
    noPresurePct: Math.round((p.pressured_count / p.total) * 100),
  })).sort((a, b) => b.avgScore - a.avgScore || b.total - a.total);

  // Fetch photos in parallel
  const photos = await Promise.all(places.map((p) => fetchPhoto(p.place_id)));
  const placesWithPhotos = places.map((p, i) => ({ ...p, photo: photos[i] }));

  return Response.json({ places: placesWithPhotos });
}
