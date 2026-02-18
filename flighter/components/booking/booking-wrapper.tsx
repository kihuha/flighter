"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FlightSummaryCard } from "./flight-summary-card";
import { ExtrasSelection } from "./extras-selection";
import { PriceSummary } from "./price-summary";
import { CheckoutForm } from "./checkout-form";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useState } from "react";

interface FlightDetails {
  flight_schedule_id: string;
  flight_number: string;
  airline_name: string;
  airline_iata: string;
  source_iata: string;
  source_name: string;
  destination_iata: string;
  destination_name: string;
  depart_time_local: string;
  arrive_time_local: string;
  duration_minutes: number;
  stops: number;
  pricing: {
    currency: string;
    economy: number;
    premium_economy: number;
    business: number;
    first: number;
  };
}

export interface SelectedExtras {
  seats: { type: string; price: number }[];
  meals: { type: string; price: number }[];
  baggage: { type: string; price: number }[];
}

export const BookingWrapper = () => {
  const searchParams = useSearchParams();
  const departureId = searchParams?.get("departureId");
  const returnId = searchParams?.get("returnId");
  const adults = Number(searchParams?.get("adults") ?? 1);
  const childCount = Number(searchParams?.get("children") ?? 0);
  const flightClass = searchParams?.get("class") ?? "economy";
  const from = searchParams?.get("from") ?? "";
  const to = searchParams?.get("to") ?? "";

  const [selectedExtras, setSelectedExtras] = useState<SelectedExtras>({
    seats: [],
    meals: [],
    baggage: [],
  });
  const [showCheckout, setShowCheckout] = useState(false);

  const { data: departureFlight, isLoading: isLoadingDeparture } = useQuery({
    queryKey: ["flight-details", departureId],
    queryFn: async () => {
      const response = await fetch(
        `/api/flights/details?scheduleId=${departureId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch flight details");
      return response.json();
    },
    enabled: !!departureId,
  });

  const { data: returnFlight, isLoading: isLoadingReturn } = useQuery({
    queryKey: ["flight-details", returnId],
    queryFn: async () => {
      if (!returnId) return null;
      const response = await fetch(
        `/api/flights/details?scheduleId=${returnId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch flight details");
      return response.json();
    },
    enabled: !!returnId,
  });

  const isLoading = isLoadingDeparture || (returnId && isLoadingReturn);
  const passengerCount = adults + childCount;

  const getPrice = (flight: FlightDetails | null) => {
    if (!flight) return 0;
    if (flightClass === "business") return flight.pricing.business;
    if (flightClass === "first-class") return flight.pricing.first;
    if (flightClass === "premium-economy")
      return flight.pricing.premium_economy;
    return flight.pricing.economy;
  };

  const basePrice =
    getPrice(departureFlight) * passengerCount +
    (returnFlight ? getPrice(returnFlight) * passengerCount : 0);

  const extrasTotal =
    selectedExtras.seats.reduce((sum, item) => sum + item.price, 0) +
    selectedExtras.meals.reduce((sum, item) => sum + item.price, 0) +
    selectedExtras.baggage.reduce((sum, item) => sum + item.price, 0);

  const taxesAndFees = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + extrasTotal + taxesAndFees;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Show checkout form when user proceeds to payment
  if (showCheckout) {
    return (
      <CheckoutForm
        departureId={departureId!}
        returnId={returnId}
        adults={adults}
        childCount={childCount}
        flightClass={flightClass}
        from={from}
        to={to}
        basePrice={basePrice}
        extrasTotal={extrasTotal}
        taxesAndFees={taxesAndFees}
        totalPrice={totalPrice}
        selectedExtras={selectedExtras}
        departureFlight={departureFlight}
        returnFlight={returnFlight}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Complete Your Booking</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {from} → {to} · {passengerCount} passenger
          {passengerCount > 1 ? "s" : ""} · {flightClass}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Flight Summary Cards */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Flights</h2>
            {departureFlight && (
              <FlightSummaryCard
                flight={departureFlight}
                type="departure"
                flightClass={flightClass}
                passengerCount={passengerCount}
              />
            )}
            {returnFlight && (
              <FlightSummaryCard
                flight={returnFlight}
                type="return"
                flightClass={flightClass}
                passengerCount={passengerCount}
              />
            )}
          </div>

          {/* Extras Selection */}
          <ExtrasSelection
            passengerCount={passengerCount}
            selectedExtras={selectedExtras}
            onExtrasChange={setSelectedExtras}
          />
        </div>

        {/* Price Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <PriceSummary
              basePrice={basePrice}
              extrasTotal={extrasTotal}
              taxesAndFees={taxesAndFees}
              totalPrice={totalPrice}
              currency="USD"
            />
            <Button
              className="w-full mt-4 "
              size="lg"
              onClick={() => setShowCheckout(true)}
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
