export async function GET(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    '';

  const res = await fetch(`https://ipapi.co/${ip}/json/`);
  const data = await res.json();

  return Response.json({
    lat: data.latitude,
    lng: data.longitude,
    city: data.city,
  });
}
