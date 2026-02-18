"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCheck,
  IconDownload,
  IconMail,
  IconCalendar,
  IconMapPin,
} from "@tabler/icons-react";
import Link from "next/link";

const BookingConfirmationFallback = () => (
  <div className="max-w-3xl mx-auto p-4 space-y-6">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingRef = searchParams?.get("ref");
  const bookingToken = searchParams?.get("token");
  const hasLookupCredentials = Boolean(bookingRef && bookingToken);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingRef, bookingToken],
    queryFn: async () => {
      const params = new URLSearchParams({
        ref: bookingRef!,
        token: bookingToken!,
      });
      const response = await fetch(`/api/bookings?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch booking");
      return response.json();
    },
    enabled: hasLookupCredentials,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <p className="text-muted-foreground">
          {hasLookupCredentials
            ? "Booking not found"
            : "This confirmation link is missing a secure lookup token"}
        </p>
        <Link href="/">
          <Button className="mt-4">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="mb-4 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <IconCheck className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground">
          Your flight has been successfully booked. A confirmation email has
          been sent to{" "}
          <span className="font-medium">{booking.passenger_email}</span>
        </p>
      </div>

      {/* Booking Reference */}
      <Card className="mb-6">
        <CardContent>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Booking Reference
            </p>
            <p className="text-3xl font-bold tracking-wider text-primary">
              {booking.booking_reference}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Please keep this reference number for your records
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Passenger Name</p>
              <p className="font-medium">{booking.passenger_full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Number</p>
              <p className="font-medium">{booking.passenger_phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Flight Class</p>
              <p className="font-medium capitalize">
                {booking.flight_class.replace("-", " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Passengers</p>
              <p className="font-medium">
                {booking.adults} Adult{booking.adults > 1 ? "s" : ""}
                {booking.children > 0 &&
                  `, ${booking.children} Child${booking.children > 1 ? "ren" : ""}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Price</span>
            <span className="font-medium">
              USD ${Number(booking.base_price).toLocaleString()}
            </span>
          </div>
          {Number(booking.extras_price) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Extras</span>
              <span className="font-medium">
                USD ${Number(booking.extras_price).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxes & Fees</span>
            <span className="font-medium">
              USD ${Number(booking.taxes_and_fees).toLocaleString()}
            </span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="font-semibold">Total Paid</span>
            <span className="text-xl font-bold text-green-600">
              USD ${Number(booking.total_price).toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Payment Method:{" "}
            {booking.payment_method === "card"
              ? `Card ending in ${booking.card_last_four}`
              : booking.payment_method}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 gap-2" variant="outline">
          <IconDownload className="h-4 w-4" />
          Download E-Ticket
        </Button>
        <Button className="flex-1 gap-2" variant="outline">
          <IconMail className="h-4 w-4" />
          Email Confirmation
        </Button>
      </div>

      {/* Next Steps */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">What&apos;s Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <IconMail className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div>
              <p className="font-medium text-sm">Check Your Email</p>
              <p className="text-xs text-muted-foreground">
                We&apos;ve sent your e-ticket and booking confirmation to your
                email
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <IconCalendar className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div>
              <p className="font-medium text-sm">Check-in Online</p>
              <p className="text-xs text-muted-foreground">
                Online check-in opens 24 hours before departure
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <IconMapPin className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div>
              <p className="font-medium text-sm">Arrive Early</p>
              <p className="text-xs text-muted-foreground">
                Please arrive at the airport at least 2 hours before departure
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Link href="/">
          <Button size="lg">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<BookingConfirmationFallback />}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
