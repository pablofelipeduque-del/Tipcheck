export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!query) {
    return Response.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
    );
    const searchData = await searchRes.json();

    const places = await Promise.all(
      searchData.results.slice(0, 10).map(async (place) => {
        let tipScore = 6;
        let tipSummary = "No tipping data available yet.";

        try {
          const detailRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=reviews&key=${apiKey}`
          );
          const detailData = await detailRes.json();
          const reviews = detailData.result?.reviews || [];

          const allText = reviews.map((r) => r.text.toLowerCase()).join(" ");

          const badWords = ["pressure", "forced", "mandatory", "guilt", "awkward", "aggressive", "required", "tip screen", "flipped", "expected to tip", "made to tip", "tip jar shoved"];
          const goodWords = ["no pressure", "optional", "fair tip", "no tip", "relaxed", "no obligation", "tip was optional", "not pressured", "tipping optional"];

          let score = 6;
          let badCount = 0;
          let goodCount = 0;

          badWords.forEach((word) => {
            const matches = (allText.match(new RegExp(word, "g")) || []).length;
            badCount += matches;
          });

          goodWords.forEach((word) => {
            const matches = (allText.match(new RegExp(word, "g")) || []).length;
            goodCount += matches;
          });

          if (badCount === 0 && goodCount === 0) {
            score = 6;
            tipSummary = "No specific tipping mentions found in reviews.";
          } else if (badCount > goodCount) {
            score = Math.max(1, 5 - badCount);
            tipSummary = `${badCount} review(s) mention tipping pressure or discomfort.`;
          } else if (goodCount > badCount) {
            score = Math.min(10, 6 + goodCount);
            tipSummary = `${goodCount} review(s) praise the relaxed tipping experience.`;
          } else {
            score = 5;
            tipSummary = "Mixed tipping experiences reported.";
          }

          tipScore = score;
        } catch (e) {
          tipScore = 6;
        }

        return {
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          rating: place.rating || 0,
          reviews: place.user_ratings_total || 0,
          category: place.types?.[0]?.replace(/_/g, " ") || "Restaurant",
          tipScore,
          tip: tipSummary,
        };
      })
    );

    return Response.json({ places });
  } catch (error) {
    return Response.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}