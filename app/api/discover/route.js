import { supabase } from "../../../lib/supabase";

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

const CATEGORIES = [
  { name: "Italian",            icon: "🍕", query: "Italian restaurants" },
  { name: "Mexican",            icon: "🌮", query: "Mexican restaurants" },
  { name: "Latin",              icon: "🥘", query: "Latin restaurants" },
  { name: "Greek/Mediterranean",icon: "🫒", query: "Greek Mediterranean restaurants" },
  { name: "Asian",              icon: "🥡", query: "Asian restaurants" },
  { name: "American",           icon: "🍔", query: "American restaurants" },
  { name: "Indian",             icon: "🍛", query: "Indian restaurants" },
  { name: "Japanese",           icon: "🍣", query: "Japanese restaurants" },
  { name: "Middle Eastern",     icon: "🧆", query: "Middle Eastern restaurants" },
  { name: "Healthy/Salads",     icon: "🥗", query: "healthy salad restaurants" },
  { name: "Bars & Pubs",        icon: "🍺", query: "bars pubs" },
  { name: "Coffee & Cafés",     icon: "☕", query: "coffee cafes" },
  { name: "Bakeries",           icon: "🥐", query: "bakeries" },
  { name: "Desserts",           icon: "🍰", query: "dessert shops" },
];

function photoUrl(ref) {
  if (!ref) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${ref}&key=${GOOGLE_KEY}`;
}

async function searchCategory(query, zip) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + " near " + zip)}&key=${GOOGLE_KEY}`
    );
    const data = await res.json();
    return (data.results || []).slice(0, 3).map((p) => ({
      place_id: p.place_id,
      name: p.name,
      address: p.formatted_address,
      rating: p.rating || null,
      total_ratings: p.user_ratings_total || 0,
      photo: photoUrl(p.photos?.[0]?.photo_reference),
    }));
  } catch {
    return [];
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const zip = searchParams.get("zip");

  if (!zip) return Response.json({ categories: [], needsZip: true });

  // Fetch all categories in parallel
  const results = await Promise.all(
    CATEGORIES.map((cat) => searchCategory(cat.query, zip))
  );

  // Fetch all community reports from Supabase
  const { data: reports } = await supabase
    .from("tip_reports")
    .select("place_id, score, pressured");

  // Build community score map
  const communityMap = {};
  if (reports) {
    for (const r of reports) {
      if (!communityMap[r.place_id]) communityMap[r.place_id] = { scores: [], noPressure: 0 };
      communityMap[r.place_id].scores.push(r.score);
      if (r.pressured === false) communityMap[r.place_id].noPressure++;
    }
  }

  // Merge community data into results
  const categories = CATEGORIES.map((cat, i) => ({
    ...cat,
    places: results[i].map((p) => {
      const community = communityMap[p.place_id];
      const communityScore = community
        ? Math.round((community.scores.reduce((a, b) => a + b, 0) / community.scores.length) * 10) / 10
        : null;
      return {
        ...p,
        communityScore,
        communityReports: community ? community.scores.length : 0,
      };
    }).filter((p) => p.name),
  })).filter((cat) => cat.places.length > 0);

  return Response.json({ categories, needsZip: false });
}
