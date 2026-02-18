import { flightDetailsQuerySchema } from "@/lib/dto/flights";
import { getFlightDetails } from "@/lib/services/flights-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = flightDetailsQuerySchema.safeParse({
      scheduleId: searchParams.get("scheduleId") ?? undefined,
    });

    if (!query.success) {
      return NextResponse.json(
        {
          error: "Invalid flight details parameters",
          details: query.error.flatten(),
        },
        { status: 400 },
      );
    }

    const flight = await getFlightDetails(query.data.scheduleId);
    if (!flight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    return NextResponse.json(flight);
  } catch (error) {
    console.error("Flight details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flight details" },
      { status: 500 },
    );
  }
}
