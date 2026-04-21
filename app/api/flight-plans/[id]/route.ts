import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, context: RouteContext<"/api/flight-plans/[id]">) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flight_plans")
    .select("id, data")
    .eq("id", id)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  return Response.json(data);
}

export async function PUT(request: Request, context: RouteContext<"/api/flight-plans/[id]">) {
  const { id } = await context.params;
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
    .update(row)
    .eq("id", id)
    .select("id, data")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

