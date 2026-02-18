import { bookingSelfLookupSchema } from "@/lib/dto/bookings";
import { lookupBookingAccessToken } from "@/lib/services/bookings-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = bookingSelfLookupSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        {
          error: "Invalid booking lookup payload",
          details: payload.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await lookupBookingAccessToken(
      payload.data.booking_reference,
      payload.data.last_name,
    );

    if (!result) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      booking_reference: result.booking_reference,
      token: result.token,
    });
  } catch (error) {
    console.error("Booking lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup booking. Please try again." },
      { status: 500 },
    );
  }
}
