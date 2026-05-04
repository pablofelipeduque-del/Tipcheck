export async function GET(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    '8.8.8.8';

  const res = await fetch(`http://ip-api.com/json/${ip}`);
  const data = await res.json();

  return Response.json({
    lat: data.lat,
    lng: data.lon,
    city: data.city,
  });
}
