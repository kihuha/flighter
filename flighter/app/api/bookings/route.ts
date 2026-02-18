import { bookingCreateSchema, bookingLookupSchema } from "@/lib/dto/bookings";
import {
  createBookingLookupToken,
  createConfirmedBooking,
  getBookingByReference,
  getBookingsByEmail,
  verifyBookingLookupToken,
} from "@/lib/services/bookings-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = bookingCreateSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: "Invalid booking payload", details: payload.error.flatten() },
        { status: 400 },
      );
    }

    const created = await createConfirmedBooking(payload.data);
    if (!created.success) {
      return NextResponse.json(
        { error: "Payment processing failed. Please try again." },
        { status: 402 },
      );
    }

    return NextResponse.json({
      success: true,
      booking_id: created.booking.booking_id,
      booking_reference: created.booking.booking_reference,
      booking_lookup_token: created.bookingLookupToken,
      status: created.booking.status,
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Failed to create booking. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lookup = bookingLookupSchema.safeParse({
      ref: searchParams.get("ref") ?? undefined,
      email: searchParams.get("email") ?? undefined,
      token: searchParams.get("token") ?? undefined,
    });

    if (!lookup.success) {
      return NextResponse.json(
        {
          error: "Invalid booking lookup parameters",
          details: lookup.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { ref, email, token } = lookup.data;

    if (ref) {
      const requestToken = token ?? request.headers.get("x-booking-token");
      if (!requestToken) {
        return NextResponse.json(
          { error: "Missing booking lookup token" },
          { status: 401 },
        );
      }

      const booking = await getBookingByReference(ref);
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      const expectedToken = createBookingLookupToken(
        booking.booking_reference,
        booking.passenger_email,
      );

      if (!verifyBookingLookupToken(requestToken, expectedToken)) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      return NextResponse.json(booking);
    }

    if (email) {
      const adminKey = process.env.BOOKING_ADMIN_KEY;
      const requestAdminKey = request.headers.get("x-booking-admin-key");

      if (!adminKey) {
        return NextResponse.json(
          { error: "Email booking lookup is disabled" },
          { status: 403 },
        );
      }

      if (requestAdminKey !== adminKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json(await getBookingsByEmail(email));
    }

    return NextResponse.json(
      { error: "Please provide booking reference or email lookup" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Booking retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve booking" },
      { status: 500 },
    );
  }
}
