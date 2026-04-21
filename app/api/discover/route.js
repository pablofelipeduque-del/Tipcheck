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

async function getPlaceIdsNearZip(zip) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+${zip}&key=${GOOGLE_KEY}`
    );
    const data = await res.json();
    return new Set((data.results || []).map((p) => p.place_id));
  } catch {
    return null;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const zip = searchParams.get("zip");

  const { data, error } = await supabase
    .from("tip_reports")
    .select("place_id, place_name, score, pressured, tip_added, created_at")
    .not("place_name", "is", null);

  if (error || !data) return Response.json({ topPicks: [], trending: [], hiddenGems: [] });

  // If ZIP provided, get nearby place_ids from Google and filter
  let nearbyIds = null;
  if (zip) {
    nearbyIds = await getPlaceIdsNearZip(zip);
  }

  // Aggregate by place_name
  const map = {};
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  for (const r of data) {
    if (nearbyIds && !nearbyIds.has(r.place_id)) continue;
    const key = r.place_name.toLowerCase().trim();
    if (!map[key]) {
      map[key] = {
        place_id: r.place_id,
        place_name: r.place_name,
        scores: [],
        pressured_count: 0,
        tip_added_count: 0,
        total: 0,
        recent: 0,
        latest: r.created_at,
      };
    }
    map[key].scores.push(r.score);
    map[key].total++;
    if (r.pressured === false) map[key].pressured_count++;
    if (r.tip_added === true) map[key].tip_added_count++;
    if (now - new Date(r.created_at).getTime() < sevenDays) map[key].recent++;
    if (r.created_at > map[key].latest) map[key].latest = r.created_at;
  }

  const places = Object.values(map).map((p) => ({
    ...p,
    avgScore: Math.round((p.scores.reduce((a, b) => a + b, 0) / p.scores.length) * 10) / 10,
    noPresurePct: Math.round((p.pressured_count / p.total) * 100),
  }));

  // Sections
  const topPicks = [...places]
    .filter((p) => p.total >= 2)
    .sort((a, b) => b.avgScore - a.avgScore || b.total - a.total)
    .slice(0, 8);

  const trending = [...places]
    .filter((p) => p.recent > 0)
    .sort((a, b) => b.recent - a.recent || b.avgScore - a.avgScore)
    .slice(0, 6);

  const hiddenGems = [...places]
    .filter((p) => p.total <= 3 && p.avgScore >= 4)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 6);

  // Fetch photos for all unique places
  const allPlaces = [...new Map([...topPicks, ...trending, ...hiddenGems].map((p) => [p.place_id, p])).values()];
  const photos = await Promise.all(allPlaces.map((p) => fetchPhoto(p.place_id)));
  const photoMap = {};
  allPlaces.forEach((p, i) => { photoMap[p.place_id] = photos[i]; });

  const addPhoto = (list) => list.map((p) => ({ ...p, photo: photoMap[p.place_id] || null }));

  return Response.json({
    topPicks: addPhoto(topPicks),
    trending: addPhoto(trending),
    hiddenGems: addPhoto(hiddenGems),
  });
}
