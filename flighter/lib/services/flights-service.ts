import { computePrices } from "@/lib/pricing-calculator";
import { FlightsSearchInput, RawFlightRoute } from "@/lib/dto/flights";
import {
  findFlightByScheduleId,
  searchFlightRoutes,
} from "@/lib/repositories/flights-repository";

const timeToMinutes = (value: Date | string) => {
  if (value instanceof Date) {
    return value.getHours() * 60 + value.getMinutes();
  }

  const [hours, minutes] = value.split(":").map((item) => Number(item));
  return hours * 60 + minutes;
};

const formatTime = (value: Date | string) => {
  const minutes = timeToMinutes(value);
  const hours24 = Math.floor(minutes / 60) % 24;
  const minutesPart = minutes % 60;
  return `${hours24.toString().padStart(2, "0")}:${minutesPart
    .toString()
    .padStart(2, "0")}`;
};

const mapFlightWithPricing = (
  flight: RawFlightRoute,
  monthForPricing: number,
) => {
  const distanceKm = flight.distance_km ?? 0;
  const departMinutes = timeToMinutes(flight.depart_time_local);
  const arriveMinutes = timeToMinutes(flight.arrive_time_local);
  const durationMinutes =
    arriveMinutes >= departMinutes
      ? arriveMinutes - departMinutes
      : 1440 - departMinutes + arriveMinutes;
  const prices = computePrices(distanceKm, flight.stops, monthForPricing);

  return {
    ...flight,
    source_airport_id: flight.source_airport_id.toString(),
    destination_airport_id: flight.destination_airport_id.toString(),
    depart_time_local: formatTime(flight.depart_time_local),
    arrive_time_local: formatTime(flight.arrive_time_local),
    duration_minutes: durationMinutes,
    pricing: {
      currency: "USD",
      economy: prices.economy,
      premium_economy: prices.premium,
      business: prices.business,
      first: prices.first,
    },
  };
};

export const searchFlights = async (input: FlightsSearchInput) => {
  const parsedDate = input.departDate ? new Date(input.departDate) : null;
  const departDate =
    parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;

  if (input.departDate && !departDate) {
    return { invalidDate: true as const, flights: [] as const };
  }

  const monthForPricing = (departDate ?? new Date()).getMonth() + 1;

  const routes = await searchFlightRoutes({
    fromAirportId: BigInt(input.fromId),
    toAirportId: BigInt(input.toId),
    departDate,
  });

  return {
    invalidDate: false as const,
    flights: routes.map((flight) => mapFlightWithPricing(flight, monthForPricing)),
  };
};

export const getFlightDetails = async (scheduleId: string) => {
  const flight = await findFlightByScheduleId(scheduleId);
  if (!flight) {
    return null;
  }

  const monthForPricing = new Date().getMonth() + 1;
  return mapFlightWithPricing(flight, monthForPricing);
};
