import { z } from "zod";

export interface AirportData {
  airport_id: bigint;
  name: string | null;
  city: string | null;
  iata_code: string | null;
}

export interface AirportSearchOption {
  type: "airport";
  value: string;
  airportId: string;
}

export interface CitySearchOption {
  type: "city";
  value: string;
  trigger: string;
  content: AirportSearchOption[];
}

export type DestinationSearchResult = CitySearchOption | AirportSearchOption;

export const destinationSearchSchema = z.object({
  q: z.string().trim().min(2).max(80),
});
