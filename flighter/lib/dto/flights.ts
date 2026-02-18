import { z } from "zod";

export const flightsSearchSchema = z
  .object({
    fromId: z.string().trim().regex(/^\d+$/),
    toId: z.string().trim().regex(/^\d+$/),
    departDate: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.fromId === value.toId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toId"],
        message: "Destination airport must be different from source airport",
      });
    }
  });

export type FlightsSearchInput = z.infer<typeof flightsSearchSchema>;

export const flightDetailsQuerySchema = z.object({
  scheduleId: z.string().trim().uuid(),
});

export interface RawFlightRoute {
  route_id: string;
  airline_id: string;
  airline_name: string | null;
  airline_iata: string | null;
  flight_schedule_id: string;
  flight_number: string;
  depart_time_local: Date | string;
  arrive_time_local: Date | string;
  aircraft_iso: string;
  source_airport_id: bigint;
  source_name: string | null;
  source_iata: string | null;
  destination_airport_id: bigint;
  destination_name: string | null;
  destination_iata: string | null;
  stops: number;
  distance_km: number | null;
  co2_total_kg: number | null;
}
