import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
