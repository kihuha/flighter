"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonGroup } from "../ui/button-group";
import { Button } from "../ui/button";
import { IconCalendar, IconSearch } from "@tabler/icons-react";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { DestinationInput } from "../landing/destination-input";
import { FlightClassSelector } from "../landing/flight-class-selector";
import { PassengerSelector } from "../landing/passenger-selector";
import { TripTypeSelector } from "../landing/trip-type-selector";

type TripType = "round-trip" | "one-way";
type FlightClass = "economy" | "business" | "first-class";

type Destination = {
  name: string;
  airportId: string;
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsedValue = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : fallback;
};

const parseDate = (value: string | null) => {
  if (!value) return undefined;

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

const parseDestination = (
  params: ReturnType<typeof useSearchParams>,
  nameKey: string,
  idKey: string,
): Destination | undefined => {
  const name = params.get(nameKey);
  const airportId = params.get(idKey);

  if (!name || !airportId) {
    return undefined;
  }

  return { name, airportId };
};

export const FlightsForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFromDestination = parseDestination(searchParams, "from", "fromId");
  const initialToDestination = parseDestination(searchParams, "to", "toId");

  const [tripType, setTripType] = useState<TripType>(() => {
    const tripTypeParam = searchParams.get("tripType");
    return tripTypeParam === "one-way" ? "one-way" : "round-trip";
  });

  const [passengers, setPassengers] = useState(() => ({
    adults: Math.max(1, parsePositiveInt(searchParams.get("adults"), 1)),
    children: parsePositiveInt(searchParams.get("children"), 0),
  }));

  const [flightClass, setFlightClass] = useState<FlightClass>(() => {
    const classParam = searchParams.get("class");
    return classParam === "business" || classParam === "first-class"
      ? classParam
      : "economy";
  });

  const [date, setDate] = useState<DateRange | undefined>(() => {
    const from = parseDate(searchParams.get("departDate"));
    if (!from) return undefined;

    return {
      from,
      to: parseDate(searchParams.get("returnDate")),
    };
  });

  const [fromDestination, setFromDestination] = useState<Destination | undefined>(
    initialFromDestination,
  );
  const [toDestination, setToDestination] = useState<Destination | undefined>(
    initialToDestination,
  );
  const [fromSearchQuery, setFromSearchQuery] = useState(
    initialFromDestination?.name ?? "",
  );
  const [toSearchQuery, setToSearchQuery] = useState("");
  const [isFromDialogOpen, setIsFromDialogOpen] = useState(false);
  const [isToDialogOpen, setIsToDialogOpen] = useState(false);

  const handleFromSelect = (name: string, airportId: string) => {
    setFromDestination(name && airportId ? { name, airportId } : undefined);

    if (name && airportId) {
      setFromSearchQuery(name);
      setIsFromDialogOpen(false);
    }
  };

  const handleToSelect = (name: string, airportId: string) => {
    setToDestination(name && airportId ? { name, airportId } : undefined);

    if (name && airportId) {
      setToSearchQuery("");
      setIsToDialogOpen(false);
    }
  };

  const isFormComplete =
    fromDestination &&
    toDestination &&
    (tripType === "round-trip" ? date?.from && date?.to : date?.from);

  const handleSearch = () => {
    if (!isFormComplete) return;

    const params = new URLSearchParams();
    params.set("from", fromDestination!.name);
    params.set("fromId", fromDestination!.airportId);
    params.set("to", toDestination!.name);
    params.set("toId", toDestination!.airportId);
    params.set("tripType", tripType);
    params.set("adults", passengers.adults.toString());
    params.set("children", passengers.children.toString());
    params.set("class", flightClass);
    if (date?.from) {
      params.set("departDate", date.from.toISOString());
    }
    if (date?.to) {
      params.set("returnDate", date.to.toISOString());
    }

    router.push(`/flights?${params.toString()}`);
  };

  return (
    <>
      <div className="flex items-center justify-between lg:justify-start lg:gap-x-4">
        <TripTypeSelector value={tripType} onChange={setTripType} />
        <PassengerSelector
          passengers={passengers}
          setPassengers={setPassengers}
        />
        <FlightClassSelector value={flightClass} onChange={setFlightClass} />
      </div>
      <div className="flex flex-col gap-y-4 w-full mt-4 lg:flex-row lg:gap-x-4">
        <div className="w-full grid gap-y-4 md:gap-y-0 md:hidden">
          <DestinationInput
            title="From"
            onSelect={handleFromSelect}
            selectedValue={fromDestination?.name || ""}
            excludedAirportId={toDestination?.airportId}
            searchQuery={fromSearchQuery}
            onSearchQueryChange={setFromSearchQuery}
            isDialogOpen={isFromDialogOpen}
            onDialogOpenChange={setIsFromDialogOpen}
          />
          <DestinationInput
            title="Where To"
            onSelect={handleToSelect}
            selectedValue={toDestination?.name || ""}
            excludedAirportId={fromDestination?.airportId}
            searchQuery={toSearchQuery}
            onSearchQueryChange={setToSearchQuery}
            isDialogOpen={isToDialogOpen}
            onDialogOpenChange={setIsToDialogOpen}
          />
        </div>
        <ButtonGroup className="hidden w-full md:grid gap-y-4 grid-cols-2">
          <DestinationInput
            title="From"
            onSelect={handleFromSelect}
            selectedValue={fromDestination?.name || ""}
            excludedAirportId={toDestination?.airportId}
            searchQuery={fromSearchQuery}
            onSearchQueryChange={setFromSearchQuery}
            isDialogOpen={isFromDialogOpen}
            onDialogOpenChange={setIsFromDialogOpen}
          />
          <DestinationInput
            title="Where To"
            onSelect={handleToSelect}
            selectedValue={toDestination?.name || ""}
            excludedAirportId={fromDestination?.airportId}
            searchQuery={toSearchQuery}
            onSearchQueryChange={setToSearchQuery}
            isDialogOpen={isToDialogOpen}
            onDialogOpenChange={setIsToDialogOpen}
          />
        </ButtonGroup>

        <Popover>
          <PopoverTrigger asChild>
            <ButtonGroup
              className={`w-full grid ${tripType === "round-trip" ? "grid-cols-2" : "grid-cols-1"}`}
              data-testid="date-range-trigger"
            >
              <Button
                variant="outline"
                data-empty={!date}
                className="flex items-center justify-between text-sm h-12 font-normal"
                data-testid="date-range-from"
              >
                <div className="flex items-center">
                  <IconCalendar className="mr-2" />
                  {date?.from ? (
                    format(date.from, "PPP")
                  ) : (
                    <span>
                      {tripType === "one-way" ? "Departure Date" : "Date"}
                    </span>
                  )}
                </div>
              </Button>

              {tripType === "round-trip" && (
                <Button
                  variant="outline"
                  data-empty={!date}
                  className="flex items-center justify-between text-sm h-12 font-normal"
                  data-testid="date-range-to"
                >
                  <div className="flex items-center">
                    <IconCalendar className="mr-2" />
                    {date?.to ? format(date.to, "PPP") : <span>Return</span>}
                  </div>
                </Button>
              )}
            </ButtonGroup>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
            data-testid="date-range-popover"
          >
            {tripType === "round-trip" ? (
              <Calendar
                mode="range"
                selected={date}
                onSelect={setDate}
                required
              />
            ) : (
              <Calendar
                mode="single"
                selected={date?.from}
                onSelect={(day: Date | undefined) =>
                  setDate({ from: day, to: undefined })
                }
                required
              />
            )}
          </PopoverContent>
        </Popover>
      </div>
      <div className="lg:flex lg:justify-center lg:w-full">
        <Button
          className="w-full mt-4 lg:w-auto"
          size="lg"
          disabled={!isFormComplete}
          data-testid="search-flights-btn"
          onClick={handleSearch}
        >
          <IconSearch className="mr-2" />
          Search Flights
        </Button>
      </div>
    </>
  );
};
