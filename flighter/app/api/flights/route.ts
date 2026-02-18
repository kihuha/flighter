import { flightsSearchSchema } from "@/lib/dto/flights";
import { searchFlights } from "@/lib/services/flights-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = flightsSearchSchema.safeParse({
      fromId: searchParams.get("fromId") ?? undefined,
      toId: searchParams.get("toId") ?? undefined,
      departDate: searchParams.get("departDate") ?? undefined,
    });

    if (!query.success) {
      return NextResponse.json(
        { error: "Invalid flight search parameters", details: query.error.flatten() },
        { status: 400 },
      );
    }

    const result = await searchFlights(query.data);
    if (result.invalidDate) {
      return NextResponse.json({ error: "Invalid departDate value" }, { status: 400 });
    }

    return NextResponse.json(result.flights);
  } catch (error) {
    console.error("Flights search error:", error);
    return NextResponse.json(
      { error: "Failed to search flights" },
      { status: 500 },
    );
  }
}
