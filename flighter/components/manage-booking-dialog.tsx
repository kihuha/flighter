"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface ManageBookingDialogProps {
  trigger?: React.ReactNode;
  setIsSheetOpen?: (open: boolean) => void;
}

export const ManageBookingDialog = ({
  trigger = "Manage Booking",
  setIsSheetOpen,
}: ManageBookingDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingReference.trim() || !lastName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_reference: bookingReference.trim(),
          last_name: lastName.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Booking not found");
        return;
      }

      const data = await response.json();
      const { booking_reference, token } = data;
      if (setIsSheetOpen) {
        setIsSheetOpen(false);
      }

      // Redirect to booking confirmation page with token
      router.push(
        `/booking/confirmation?ref=${encodeURIComponent(booking_reference)}&token=${encodeURIComponent(token)}`,
      );
      setOpen(false);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {typeof trigger === "string" ? (
          <Button variant="ghost">{trigger}</Button>
        ) : (
          trigger
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Manage Booking</DialogTitle>
          <DialogDescription>
            Enter your booking reference and last name to access your booking
            details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-reference">Booking Reference</Label>
            <Input
              id="booking-reference"
              placeholder="e.g., FLT-MLRYZ5RHNAV9"
              value={bookingReference}
              onChange={(e) => setBookingReference(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              placeholder="Your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2" />}
            {isLoading ? "Looking up booking..." : "Access Booking"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
