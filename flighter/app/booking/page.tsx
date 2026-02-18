import { Suspense } from "react";
import { BookingWrapper } from "@/components/booking/booking-wrapper";

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading booking details...</div>}>
      <BookingWrapper />
    </Suspense>
  );
}
