export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&fields=name,rating,formatted_address,user_ratings_total,types,reviews&key=${apiKey}`
    );
    const data = await res.json();
    const p = data.result;

    if (!p) return Response.json({ error: "Place not found" }, { status: 404 });

    const reviews = p.reviews || [];
    const allText = reviews.map((r) => r.text.toLowerCase()).join(" ");
    const badWords = ["pressure", "forced", "mandatory", "guilt", "awkward", "aggressive", "required", "tip screen", "flipped"];
    const goodWords = ["no pressure", "optional", "fair tip", "no tip", "relaxed", "not pressured"];

    let badCount = 0;
    let goodCount = 0;
    badWords.forEach((w) => { badCount += (allText.match(new RegExp(w, "g")) || []).length; });
    goodWords.forEach((w) => { goodCount += (allText.match(new RegExp(w, "g")) || []).length; });

    let tipScore = 6;
    let tip = "No specific tipping mentions found in reviews.";
    if (badCount > goodCount) { tipScore = Math.max(1, 5 - badCount); tip = `${badCount} review(s) mention tipping pressure.`; }
    else if (goodCount > badCount) { tipScore = Math.min(10, 6 + goodCount); tip = `${goodCount} review(s) praise the relaxed tipping experience.`; }

    return Response.json({
      place: {
        id,
        name: p.name,
        rating: p.rating || 0,
        address: p.formatted_address,
        reviews: p.user_ratings_total || 0,
        category: p.types?.[0]?.replace(/_/g, " ") || "restaurant",
        tipScore,
        tip,
      }
    });
  } catch (e) {
    return Response.json({ error: "Failed to fetch" }, { status: 500 });
  }
}