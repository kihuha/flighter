"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { IconPlane } from "@tabler/icons-react";

interface FlightSummaryCardProps {
  flight: {
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
  };
  type: "departure" | "return";
  flightClass: string;
  passengerCount: number;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour24 = parseInt(hours);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const FlightSummaryCard = ({
  flight,
  type,
  flightClass,
  passengerCount,
}: FlightSummaryCardProps) => {
  const getPrice = () => {
    if (flightClass === "business") return flight.pricing.business;
    if (flightClass === "first-class") return flight.pricing.first;
    if (flightClass === "premium-economy")
      return flight.pricing.premium_economy;
    return flight.pricing.economy;
  };

  const price = getPrice();
  const totalPrice = price * passengerCount;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={type === "departure" ? "default" : "secondary"}>
              {type === "departure" ? "Departure" : "Return"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {flight.flight_number}
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              ${totalPrice.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              ${price} × {passengerCount}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Airline and Flight Info */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border bg-white p-2">
              {flight.airline_iata ? (
                <Image
                  src={`/logos/${flight.airline_iata}.png`}
                  alt={flight.airline_name}
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold">
                  {flight.airline_name?.slice(0, 2) || "AI"}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{flight.airline_name}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {flightClass.replace("-", " ")}
              </p>
            </div>
          </div>

          {/* Flight Timeline */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-2xl font-bold">
                {formatTime(flight.depart_time_local)}
              </p>
              <p className="text-sm font-medium">{flight.source_iata}</p>
              <p className="text-xs text-muted-foreground">
                {flight.source_name}
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <p className="text-xs text-muted-foreground mb-1">
                {formatDuration(flight.duration_minutes)}
              </p>
              <div className="flex items-center gap-2 w-full">
                <div className="h-px bg-border flex-1" />
                <IconPlane className="h-4 w-4 text-muted-foreground" />
                <div className="h-px bg-border flex-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {flight.stops === 0
                  ? "Nonstop"
                  : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
              </p>
            </div>

            <div className="flex-1 text-right">
              <p className="text-2xl font-bold">
                {formatTime(flight.arrive_time_local)}
              </p>
              <p className="text-sm font-medium">{flight.destination_iata}</p>
              <p className="text-xs text-muted-foreground">
                {flight.destination_name}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
