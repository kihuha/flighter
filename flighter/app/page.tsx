import { Suspense } from "react";
import { LandingWrapper } from "@/components/landing/landing-wrapper";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <LandingWrapper />
    </Suspense>
  );
}
