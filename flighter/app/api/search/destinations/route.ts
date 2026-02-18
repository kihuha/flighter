import { destinationSearchSchema } from "@/lib/dto/destinations";
import { searchDestinations } from "@/lib/services/destinations-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = destinationSearchSchema.safeParse({
      q: searchParams.get("q") ?? undefined,
    });

    if (!query.success) {
      return NextResponse.json([]);
    }

    return NextResponse.json(await searchDestinations(query.data.q));
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search destinations" },
      { status: 500 },
    );
  }
}
