import { db } from "@/lib/db";
import { RawFlightRoute } from "@/lib/dto/flights";

interface SearchFlightsParams {
  fromAirportId: bigint;
  toAirportId: bigint;
  departDate: Date | null;
}

export const searchFlightRoutes = async ({
  fromAirportId,
  toAirportId,
  departDate,
}: SearchFlightsParams) => {
  return (await db.$queryRaw`
    SELECT 
      r.route_id,
      r.airline_id,
      a.name as airline_name,
      a.iata_code as airline_iata,
      fs.flight_schedule_id,
      fs.flight_number,
      fs.depart_time_local,
      fs.arrive_time_local,
      fs.aircraft_iso,
      r.source_airport_id,
      src.name as source_name,
      src.iata_code as source_iata,
      r.destination_airport_id,
      dst.name as destination_name,
      dst.iata_code as destination_iata,
      r.stops,
      rm.distance_km,
      rm.co2_total_kg
    FROM routes r
    INNER JOIN flight_schedules fs ON r.route_id = fs.route_id
    INNER JOIN airlines a ON r.airline_id = a.airline_id
    INNER JOIN airports src ON r.source_airport_id = src.airport_id
    INNER JOIN airports dst ON r.destination_airport_id = dst.airport_id
    LEFT JOIN route_metrics rm ON r.route_id = rm.route_id
    WHERE r.source_airport_id = ${fromAirportId}
      AND r.destination_airport_id = ${toAirportId}
      AND (
        ${departDate}::date IS NULL
        OR (fs.effective_from <= ${departDate}::date AND fs.effective_to >= ${departDate}::date)
      )
    ORDER BY r.stops ASC, rm.distance_km ASC
    LIMIT 50
  `) as RawFlightRoute[];
};

export const findFlightByScheduleId = async (scheduleId: string) => {
  const flights = (await db.$queryRaw`
    SELECT 
      fs.flight_schedule_id,
      fs.route_id,
      fs.airline_id,
      fs.flight_number,
      fs.depart_time_local,
      fs.arrive_time_local,
      fs.aircraft_iso,
      a.name as airline_name,
      a.iata_code as airline_iata,
      r.source_airport_id,
      src.name as source_name,
      src.iata_code as source_iata,
      r.destination_airport_id,
      dst.name as destination_name,
      dst.iata_code as destination_iata,
      r.stops,
      rm.distance_km,
      rm.co2_total_kg
    FROM flight_schedules fs
    INNER JOIN routes r ON fs.route_id = r.route_id
    INNER JOIN airlines a ON fs.airline_id = a.airline_id
    INNER JOIN airports src ON r.source_airport_id = src.airport_id
    INNER JOIN airports dst ON r.destination_airport_id = dst.airport_id
    LEFT JOIN route_metrics rm ON r.route_id = rm.route_id
    WHERE fs.flight_schedule_id = ${scheduleId}::uuid
    LIMIT 1
  `) as RawFlightRoute[];

  return flights[0] ?? null;
};
