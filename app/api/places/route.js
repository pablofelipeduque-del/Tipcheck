const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

export async function GET(request) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
const sortMode = searchParams.get("sortMode") || "both";

  if (!query) {
    return Response.json({ error: "Query is required" }, { status: 400 });
  }
if (!/\d/.test(query)) {
  return Response.json([], { headers });
}
  try {
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_KEY}`
    );
    const searchData = await searchRes.json();

    const places = await Promise.all(
      searchData.results.slice(0, 10).map(async (place) => {
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
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address,
          rating: place.rating || 0,
          tipScore,
          tip: tipSummary,
tipColor: tipScore <= 2 ? '#FF4444' : tipScore === 3 ? '#F5A623' : '#4CAF50',
        isHighPressure: tipScore <= 2,
        isAverageTipping: tipScore === 3,
        isLowPressure: tipScore > 3,
        };
      })
    );

    // Return plain array — no wrapper object
    return Response.json(
  places
    .filter((p) => p.name && p.name.trim())
    .sort((a, b) => {
      if (sortMode === "food") return b.rating - a.rating;
      return (b.rating + b.tipScore) - (a.rating + a.tipScore);
    }),
  { headers }
);
  } catch {
    return Response.json({ error: "Failed to fetch places" }, { status: 500, headers });
  }
}
