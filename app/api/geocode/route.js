export async function GET(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    '';

  try {
    const res = await fetch(`https://freeipapi.com/api/json/${ip}`);
    const data = await res.json();

    if (!data.latitude || !data.longitude) {
      return Response.json({ lat: 36.1069, lng: -115.1694, city: 'Las Vegas' });
    }

    return Response.json({
      lat: data.latitude,
      lng: data.longitude,
      city: data.cityName,
    });
  } catch (e) {
    return Response.json({ lat: 36.1069, lng: -115.1694, city: 'Las Vegas' });
  }
}
