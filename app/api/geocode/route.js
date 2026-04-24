const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) return Response.json({ zip: null, error: "Missing coords" });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`
    );
    const data = await res.json();
    const components = data.results?.[0]?.address_components || [];
    const zipComp = components.find((c) => c.types.includes("postal_code"));
    const cityComp = components.find((c) => c.types.includes("locality"));
    return Response.json({
      zip: zipComp?.short_name || null,
      city: cityComp?.long_name || null,
    });
  } catch (err) {
    return Response.json({ zip: null, error: "Geocode failed" });
  }
}
