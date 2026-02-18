import {
  AirportSearchOption,
  DestinationSearchResult,
} from "@/lib/dto/destinations";
import { searchAirports } from "@/lib/repositories/destinations-repository";

export const searchDestinations = async (query: string) => {
  const airports = await searchAirports(query);

  const citiesMap = new Map<
    string,
    {
      airports: AirportSearchOption[];
    }
  >();

  airports.forEach((airport) => {
    const cityName = airport.city || "Unknown";
    if (!citiesMap.has(cityName)) {
      citiesMap.set(cityName, { airports: [] });
    }
    citiesMap.get(cityName)!.airports.push({
      type: "airport",
      value: airport.name || `${airport.iata_code || "Unknown Airport"}`,
      airportId: airport.airport_id.toString(),
    });
  });

  const results: DestinationSearchResult[] = [];

  citiesMap.forEach((cityData, cityName) => {
    if (cityData.airports.length > 1) {
      results.push({
        type: "city",
        value: "locations",
        trigger: cityName,
        content: cityData.airports,
      });
    }
  });

  airports.forEach((airport) => {
    const cityName = airport.city || "Unknown";
    const cityAirports = citiesMap.get(cityName);

    if (!cityAirports || cityAirports.airports.length === 1) {
      results.push({
        type: "airport",
        value: airport.name || `${airport.iata_code || "Unknown Airport"}`,
        airportId: airport.airport_id.toString(),
      });
    }
  });

  return results;
};
