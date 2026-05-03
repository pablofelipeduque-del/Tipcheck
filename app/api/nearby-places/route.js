const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

// Plain-array nearby endpoint built for Felipe / FlutterFlow.
// Matches the response shape of /api/places exactly:
//   [{ id, name, address, rating, tipScore, tip }, ...]
// Inputs:
//   ?lat=<number>&lng=<number>&radius=<meters, optional, default 3000>

export async function GET(request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") || "3000";
  const zip = searchParams.get("zip") || "";

let finalLat = lat;
let finalLng = lng;

if (zip) {
  const geoRes = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${GOOGLE_KEY}`
  );
  const geoData = await geoRes.json();
  if (geoData.results?.[0]?.geometry?.location) {
    finalLat = geoData.results[0].geometry.location.lat;
    finalLng = geoData.results[0].geometry.location.lng;
  }
}
  const keyword = searchParams.get("keyword") || "";

  if ((!lat || !lng) && !zip) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || '';
  if (ip) {
    const ipRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const ipData = await ipRes.json();
    if (ipData.latitude && ipData.longitude) {
      finalLat = ipData.latitude;
      finalLng = ipData.longitude;
    }
  }
  if (!finalLat || !finalLng) {
    return Response.json({ error: "Could not determine location" }, { status: 400 });
  }
}

  try {
    const nearbyRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${finalLat},${finalLng}&radius=${radius}&keyword=${keyword}&type=restaurant&key=${GOOGLE_KEY}`
    );
    const nearbyData = await nearbyRes.json();

    if (!nearbyData.results?.length) {
      return Response.json([]);
    }

    const top = nearbyData.results
      .filter((p) => (p.rating || 0) >= 3.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);

    const places = await Promise.all(
      top.map(async (place) => {
        let tipScore = 3;
        let tipSummary = "No tipping data available yet.";

        try {
          const detailRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=reviews&key=${GOOGLE_KEY}`
          );
          const detailData = await detailRes.json();
          const reviews = detailData.result?.reviews || [];

          const allText = reviews.map((r) => r.text.toLowerCase()).join(" ");

          const badWords = ["pressure", "forced", "mandatory", "guilt", "awkward", "aggressive", "required", "tip screen", "flipped", "expected to tip", "made to tip", "tip jar shoved"];
          const goodWords = ["no pressure", "optional", "fair tip", "no tip", "relaxed", "no obligation", "tip was optional", "not pressured", "tipping optional"];

          let badCount = 0;
          let goodCount = 0;

          badWords.forEach((word) => {
            badCount += (allText.match(new RegExp(word, "g")) || []).length;
          });
          goodWords.forEach((word) => {
            goodCount += (allText.match(new RegExp(word, "g")) || []).length;
          });

          if (badCount === 0 && goodCount === 0) {
            tipScore = 3;
            tipSummary = "No specific tipping mentions found in reviews.";
          } else if (badCount > goodCount) {
            tipScore = Math.max(1, 3 - badCount);
            tipSummary = `${badCount} review(s) mention tipping pressure or discomfort.`;
          } else if (goodCount > badCount) {
            tipScore = Math.min(5, 3 + goodCount);
            tipSummary = `${goodCount} review(s) praise the relaxed tipping experience.`;
          } else {
            tipScore = 3;
            tipSummary = "Mixed tipping experiences reported.";
          }
        } catch {
          tipScore = 3;
        }

        return {
          id: place.place_id,
          name: place.name,
          address: place.vicinity || place.formatted_address || "",
          rating: place.rating || 0,
          tipScore,
          tip: tipSummary,
          reviews: place.user_ratings_total || 0,
          tipColor: tipScore <= 2 ? '#FF4444' : tipScore === 3 ? '#F5A623' : '#4CAF50',
        };
      })
    );

    // Plain array — no wrapper object (matches /api/places shape for FlutterFlow)
    return Response.json(places.filter((p) => p.name && p.name.trim()), { headers });
  } catch (err) {
    console.error("[NearbyPlaces] Error:", err);
    return Response.json({ error: "Failed to fetch nearby places" }, { status: 500, headers });
  }
}
