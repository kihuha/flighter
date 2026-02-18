"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FlightsForm } from "../forms/flights-form";
import { Button } from "../ui/button";
import {
  IconArrowsUpDown,
  IconHeart,
  IconShare,
  IconCheck,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "../ui/card";

import Image from "next/image";

interface FlightRoute {
  route_id: string;
  airline_id: string;
  airline_name: string | null;
  airline_iata: string | null;
  flight_schedule_id: string;
  flight_number: string;
  depart_time_local: string;
  arrive_time_local: string;
  duration_minutes: number;
  pricing: {
    currency: string;
    economy: number;
    premium_economy: number;
    business: number;
    first: number;
  };
  source_airport_id: string;
  source_name: string | null;
  source_iata: string | null;
  destination_airport_id: string;
  destination_name: string | null;
  destination_iata: string | null;
  stops: number;
  distance_km: number | null;
  co2_total_kg: number | null;
}

const formatTime = (minutes: number) => {
  const clamped = ((minutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(clamped / 60);
  const minutesPart = clamped % 60;
  const period = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutesPart.toString().padStart(2, "0")} ${period}`;
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map((value) => Number(value));
  return hours * 60 + minutes;
};

export const FlightsWrapper = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripType = searchParams?.get("tripType") ?? "round-trip";
  const isRoundTrip = tripType === "round-trip";

  const [sort, setSort] = useState<"top-flights" | "price" | "duration">(
    "top-flights",
  );
  const [selectedDeparture, setSelectedDeparture] =
    useState<FlightRoute | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<FlightRoute | null>(
    null,
  );
  const [showReturnFlights, setShowReturnFlights] = useState(false);

  const fromId = showReturnFlights
    ? searchParams?.get("toId")
    : searchParams?.get("fromId");
  const toId = showReturnFlights
    ? searchParams?.get("fromId")
    : searchParams?.get("toId");
  const departDate = showReturnFlights
    ? searchParams?.get("returnDate")
    : searchParams?.get("departDate");
  const adults = Number(searchParams?.get("adults") ?? 1);
  const children = Number(searchParams?.get("children") ?? 0);
  const passengerCount = Math.max(1, adults + children);

  const { data: flights, isLoading } = useQuery({
    queryKey: ["flights", fromId, toId],
    queryFn: async () => {
      if (!fromId || !toId) return [];
      const query = new URLSearchParams({ fromId, toId });
      if (departDate) {
        query.set("departDate", departDate);
      }
      const response = await fetch(`/api/flights?${query.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch flights");
      return response.json();
    },
    enabled: !!fromId && !!toId,
  });

  const flightsWithMeta = useMemo(() => {
    if (!Array.isArray(flights)) return [];
    const flightClass = searchParams?.get("class") ?? "economy";

    return (flights as FlightRoute[]).map((flight, index) => {
      const perPerson =
        flightClass === "business"
          ? flight.pricing.business
          : flightClass === "first-class"
            ? flight.pricing.first
            : flightClass === "premium-economy"
              ? flight.pricing.premium_economy
              : flight.pricing.economy;

      return {
        flight,
        index,
        perPerson,
      };
    });
  }, [flights, searchParams]);

  const sortedFlights = useMemo(() => {
    const copy = [...flightsWithMeta];
    if (sort === "price") {
      copy.sort((a, b) => a.perPerson - b.perPerson);
      return copy;
    }
    if (sort === "duration") {
      copy.sort(
        (a, b) => a.flight.duration_minutes - b.flight.duration_minutes,
      );
      return copy;
    }
    return copy;
  }, [flightsWithMeta, sort]);

  const cheapestPrice = useMemo(() => {
    if (!flightsWithMeta.length) return null;
    return Math.min(...flightsWithMeta.map((item) => item.perPerson));
  }, [flightsWithMeta]);

  const bestScheduleId = useMemo(() => {
    if (!flightsWithMeta.length) return null;
    return [...flightsWithMeta].sort((a, b) => {
      const durationDiff =
        a.flight.duration_minutes - b.flight.duration_minutes;
      if (durationDiff !== 0) return durationDiff;
      return a.perPerson - b.perPerson;
    })[0]?.flight.flight_schedule_id;
  }, [flightsWithMeta]);

  const handleSelectFlight = (flight: FlightRoute) => {
    if (!showReturnFlights) {
      setSelectedDeparture(flight);
      if (isRoundTrip) {
        setShowReturnFlights(true);
      } else {
        navigateToBooking(flight, null);
      }
    } else {
      setSelectedReturn(flight);
      navigateToBooking(selectedDeparture!, flight);
    }
  };

  const navigateToBooking = (
    departure: FlightRoute,
    returnFlight: FlightRoute | null,
  ) => {
    const flightClass = searchParams?.get("class") ?? "economy";

    const params = new URLSearchParams({
      departureId: departure.flight_schedule_id,
      ...(returnFlight && { returnId: returnFlight.flight_schedule_id }),
      adults: adults.toString(),
      children: children.toString(),
      class: flightClass,
      from: searchParams?.get("from") ?? "",
      to: searchParams?.get("to") ?? "",
    });
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div>
        <FlightsForm />
      </div>

      {/* Selection Summary */}
      {(selectedDeparture || selectedReturn) && (
        <Card className="mt-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedDeparture && (
                <div className="flex items-center gap-2">
                  <IconCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Departure Selected</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedDeparture.source_iata} →{" "}
                      {selectedDeparture.destination_iata}
                    </p>
                  </div>
                </div>
              )}
              {selectedReturn && (
                <div className="flex items-center gap-2">
                  <IconCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Return Selected</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedReturn.source_iata} →{" "}
                      {selectedReturn.destination_iata}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {showReturnFlights && !selectedReturn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowReturnFlights(false);
                  setSelectedDeparture(null);
                }}
              >
                Change Departure
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold">
            {showReturnFlights
              ? "Select Return Flight"
              : "Select Departure Flight"}
          </h4>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="text-primary">
                Sorted by <span className="capitalize">{sort}</span>
                <IconArrowsUpDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel onClick={() => setSort("top-flights")}>
                Top Flights
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSort("price")}>
                Price
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("duration")}>
                Duration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500">Loading flights...</p>
          </div>
        ) : sortedFlights.length > 0 ? (
          <div className="space-y-4">
            {sortedFlights.map((item) => {
              const { flight, perPerson } = item;
              const isCheapest = cheapestPrice === perPerson;
              const isBest = bestScheduleId === flight.flight_schedule_id;
              const departMinutes = toMinutes(flight.depart_time_local);
              const arriveMinutes = toMinutes(flight.arrive_time_local);
              const timeRange = `${formatTime(departMinutes)} - ${formatTime(
                arriveMinutes,
              )}`;
              const stopsLabel =
                flight.stops === 0
                  ? "Nonstop"
                  : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`;
              const routeLabel = `${
                flight.source_iata ?? "---"
              }-${flight.destination_iata ?? "---"}`;
              const totalPrice = perPerson * passengerCount;

              return (
                <div
                  key={flight.flight_schedule_id}
                  className="rounded-2xl border bg-card shadow-sm"
                >
                  <div className="flex items-center justify-between px-4 pt-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-2">
                        <IconHeart className="h-4 w-4" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <IconShare className="h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isBest && (
                        <span className="rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                          Best
                        </span>
                      )}
                      {isCheapest && (
                        <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                          Cheapest
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 px-4 pb-4 pt-3 lg:flex-row lg:items-stretch lg:gap-0">
                    <div className="flex-1 space-y-4 pr-0 lg:pr-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full border bg-white p-2">
                              {flight.airline_iata ? (
                                <Image
                                  src={`/logos/${flight.airline_iata}.png`}
                                  alt={flight.airline_name || "Airline"}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                                  {flight.airline_name?.slice(0, 2) || "AI"}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-foreground">
                                {timeRange}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {flight.airline_name ?? "Airline"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground lg:grid-cols-3">
                          <div>
                            <p className="font-semibold text-foreground">
                              {stopsLabel}
                            </p>
                            <p>{flight.source_iata ?? "---"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {formatDuration(flight.duration_minutes)}
                            </p>
                            <p>{routeLabel}</p>
                          </div>
                          <div className="hidden lg:block">
                            <p className="font-semibold text-foreground">CO2</p>
                            <p>
                              {flight.co2_total_kg
                                ? `${Math.round(flight.co2_total_kg)} kg`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full flex-col items-start justify-center gap-3 border-t pt-4 lg:w-60 lg:border-l lg:border-t-0 lg:pl-6">
                      <div>
                        <p className="text-3xl font-semibold text-foreground">
                          ${perPerson.toLocaleString()}
                          <span className="ml-1 text-base font-normal text-muted-foreground">
                            / person
                          </span>
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          ${totalPrice.toLocaleString()} total
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {searchParams?.get("class") ?? "Economy"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full bg-primary/5 hover:bg-primary/10"
                        onClick={() => handleSelectFlight(flight)}
                      >
                        {selectedDeparture?.flight_schedule_id ===
                          flight.flight_schedule_id ||
                        selectedReturn?.flight_schedule_id ===
                          flight.flight_schedule_id
                          ? "Selected"
                          : "Select Flight"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 border rounded-lg">
            <p className="text-sm text-gray-500">
              No flights found. Try adjusting your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
