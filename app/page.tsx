import { createClient } from "@/lib/supabase/server";
import { FlightPlanEditor, type PlanListItem } from "./components/flight-plan-editor";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("flight_plans")
    .select("id, aircraft_type, registration, from_icao, to_icao, flight_date, pilots, created_at")
    .order("flight_date", { ascending: false });

  return <FlightPlanEditor initialSavedPlans={(data as PlanListItem[]) ?? []} />;
}
