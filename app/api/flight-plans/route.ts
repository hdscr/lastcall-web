import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flight_plans")
    .select("id, aircraft_type, registration, from_icao, to_icao, flight_date, pilots, created_at, updated_at")
    .order("flight_date", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const supabase = await createClient();

  const row = {
    aircraft_type: payload.aircraftType,
    registration: payload.registration,
    from_icao: payload.fromICAO,
    to_icao: payload.toICAO,
    flight_date: payload.date,
    pilots: payload.pilots,
    data: payload,
  };

  const { data, error } = await supabase
    .from("flight_plans")
    .insert(row)
    .select("id, data")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}

