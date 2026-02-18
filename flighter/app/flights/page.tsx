import { Suspense } from "react";
import { FlightsWrapper } from "@/components/flights/flights-wrapper";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading flights...</div>}>
      <FlightsWrapper />
    </Suspense>
  );
}
