export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

  if (!placeId) {
    return Response.json({ error: 'placeId is required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`
    );
    const data = await res.json();
    const reviews = data.result?.reviews || [];

    return Response.json({
      reviews: reviews.map(r => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.relative_time_description,
      }))
    });
  } catch (e) {
    return Response.json({ reviews: [] });
  }
}
