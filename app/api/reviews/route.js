import { supabase } from "../../../lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("tip_reports")
    .select("id, place_name, score, comment, pressured, tip_added, created_at")
    .not("place_name", "is", null)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) return Response.json({ reviews: [] });
  return Response.json({ reviews: data || [] });
}

export async function POST(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  const body = await request.json();
  const { place_name, score, comment, pressured, tip_added } = body;

  const { error } = await supabase
    .from("tip_reports")
    .insert([{ place_name, score, comment, pressured, tip_added }]);

  if (error) return Response.json({ success: false }, { headers });
  return Response.json({ success: true }, { headers });
}
