"use client";

import { CheapFlightsSection } from "./cheap-flights-section";
import { PopularFlightsSection } from "./popular-flights-section";
import { FAQ } from "./faq";
import { AIBanner } from "./ai-banner";
import { FlightsForm } from "../forms/flights-form";

export const LandingWrapper = () => {
  return (
    <div data-testid="landing-wrapper" className="max-w-6xl mx-auto">
      <div className="w-full relative overflow-hidden">
        <div
          className="w-full h-50 lg:h-80 bg-center lg:bg-position-[25%_60%] bg-cover"
          style={{
            backgroundImage: 'url("/hero.png")',
          }}
        ></div>
        <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-white/40 pointer-events-none dark:from-black dark:to-black/40" />
      </div>

      <div className="p-4 md:p-8">
        <FlightsForm />
      </div>

      <div className="p-4 md:p-8">
        <CheapFlightsSection />
      </div>
      <div className="p-4 md:p-8">
        <AIBanner />
      </div>

      <div className="p-4 md:p-8">
        <PopularFlightsSection />
      </div>

      <div className="p-4 md:p-8">
        <FAQ />
      </div>
    </div>
  );
};
