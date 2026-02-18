"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

export const PopularFlightsSection = () => {
  const destinations = [
    {
      place: "Paris",
      image: "/destinations/paris.jpg",
    },
    {
      place: "New York",
      image: "/destinations/new-york.jpg",
    },
    {
      place: "Amsterdam",
      image: "/destinations/amsterdam.jpg",
    },

    {
      place: "Cape Town",
      image: "/destinations/cape-town.jpg",
    },
    {
      place: "Beijing",
      image: "/destinations/beijing.jpg",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Popular flights destinations from Kenya
      </h2>

      <Carousel className="w-full sm:max-w-sm md:max-w-7xl mx-auto">
        <CarouselContent className="-ml-1">
          {destinations.map((destination, index) => (
            <CarouselItem key={index} className="basis-1/3 pl-1 lg:basis-1/4">
              <div className="relative rounded-md overflow-clip">
                <div className="h-32">
                  <Image
                    src={destination.image}
                    alt={destination.place}
                    width={1000}
                    height={1000}
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                <p className="absolute left-4 bottom-2 text-white text-sm font-bold">
                  {destination.place}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
