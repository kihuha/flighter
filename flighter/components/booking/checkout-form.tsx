"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { IconShield, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Field, FieldContent, FieldDescription, FieldLabel } from "../ui/field";

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

interface SelectedExtras {
  seats: { type: string; price: number }[];
  meals: { type: string; price: number }[];
  baggage: { type: string; price: number }[];
}

interface CheckoutFormProps {
  departureId: string;
  returnId: string | null;
  adults: number;
  childCount: number;
  flightClass: string;
  from: string;
  to: string;
  basePrice: number;
  extrasTotal: number;
  taxesAndFees: number;
  totalPrice: number;
  selectedExtras: SelectedExtras;
  departureFlight: FlightDetails | null;
  returnFlight: FlightDetails | null;
}

export const CheckoutForm = ({
  departureId,
  returnId,
  adults,
  childCount,
  flightClass,
  from,
  to,
  basePrice,
  extrasTotal,
  taxesAndFees,
  totalPrice,
  selectedExtras,
  departureFlight,
  returnFlight,
}: CheckoutFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const passengerCount = adults + childCount;
  const holdUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    handleInputChange("cardNumber", formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passenger_full_name: formData.fullName,
          passenger_email: formData.email,
          passenger_phone: formData.phone,
          departure_schedule_id: departureId,
          return_schedule_id: returnId,
          adults,
          children: childCount,
          flight_class: flightClass,
          base_price: basePrice,
          extras_price: extrasTotal,
          taxes_and_fees: taxesAndFees,
          total_price: totalPrice,
          extras_json: selectedExtras,
          payment_method: "card",
          card_last_four: formData.cardNumber.replace(/\s/g, "").slice(-4),
        }),
      });

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      const data = await response.json();
      setBookingSuccess(true);

      // Redirect to confirmation page after 2 seconds
      setTimeout(() => {
        const params = new URLSearchParams({
          ref: data.booking_reference,
          token: data.booking_lookup_token,
        });
        router.push(`/booking/confirmation?${params.toString()}`);
      }, 2000);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <IconCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your payment has been processed successfully. Redirecting to
          confirmation...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Hold Alert */}
          <Alert className="bg-yellow-50 border-yellow-200">
            <IconAlertCircle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="ml-2">
              <div>
                <p className="font-semibold text-yellow-900">
                  Your Booking is on Hold
                </p>
                <p className="text-sm text-yellow-800">
                  We hold your booking until{" "}
                  <strong>
                    {holdUntil.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </strong>
                  . If your reserve changes, we will get back to you.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Book Information */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Detail */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Detail</CardTitle>
              <p className="text-sm text-muted-foreground">
                Please fill out the form below. Enter your card account details.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="First Last" />
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="number">Card number</Label>
                <Input
                  id="number"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="month">Expires</Label>
                  <Select
                    value={formData.expiryMonth}
                    onValueChange={(value) =>
                      handleInputChange("expiryMonth", value)
                    }
                  >
                    <SelectTrigger
                      id="month"
                      aria-label="Month"
                      className="w-full"
                    >
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">January</SelectItem>
                      <SelectItem value="2">February</SelectItem>
                      <SelectItem value="3">March</SelectItem>
                      <SelectItem value="4">April</SelectItem>
                      <SelectItem value="5">May</SelectItem>
                      <SelectItem value="6">June</SelectItem>
                      <SelectItem value="7">July</SelectItem>
                      <SelectItem value="8">August</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={formData.expiryYear}
                    onValueChange={(value) =>
                      handleInputChange("expiryYear", value)
                    }
                  >
                    <SelectTrigger
                      id="year"
                      aria-label="Year"
                      className="w-full"
                    >
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem
                          key={i}
                          value={`${new Date().getFullYear() + i}`}
                        >
                          {new Date().getFullYear() + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) =>
                      handleInputChange(
                        "cvv",
                        e.target.value.replace(/\D/g, "").substring(0, 4),
                      )
                    }
                    maxLength={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancelation Policy */}

          <Card>
            <CardContent className="px-4">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <IconShield className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Cancelation Policy</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    At Flighter, we understand that plans can change
                    unexpectedly. That&apos;s why we&apos;ve crafted our
                    cancellation policy to provide you with flexibility and
                    peace of mind. When you book a flight with us, you have the
                    freedom to modify or cancel your reservation without
                    incurring any cancellation fees up to 12 hours/days before
                    your scheduled departure time.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    See more details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Flights</span>
                  <span className="font-medium">
                    {returnId ? "2 Flights" : "1 Flight"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-medium">
                    {from} - {to}
                  </span>
                </div>
                {departureFlight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Departure Date
                    </span>
                    <span className="font-medium">
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      - {departureFlight.depart_time_local}
                    </span>
                  </div>
                )}
                {returnFlight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return Date</span>
                    <span className="font-medium">
                      {new Date(
                        Date.now() + 4 * 24 * 60 * 60 * 1000,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      - {returnFlight.depart_time_local}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Price Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flight Price</span>
                    <span className="font-medium">
                      USD ${basePrice.toLocaleString()}
                    </span>
                  </div>
                  {extrasTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Extras</span>
                      <span className="font-medium">
                        USD ${extrasTotal.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passengers</span>
                    <span className="font-medium">{passengerCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">
                      USD ${taxesAndFees.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold ">
                    USD ${totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-12">
                <Field orientation="horizontal">
                  <Checkbox
                    id="terms-checkbox-2"
                    name="terms-checkbox-2"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) =>
                      setAgreedToTerms(checked as boolean)
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="terms-checkbox-2">
                      Accept terms and conditions
                    </FieldLabel>
                    <FieldDescription>
                      By clicking this checkbox, you agree to the terms.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting || !agreedToTerms}
              >
                {isSubmitting ? "Processing..." : "Pay for My Booking"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
