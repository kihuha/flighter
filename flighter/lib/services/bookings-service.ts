import { createHmac, timingSafeEqual } from "node:crypto";
import { BookingCreateInput } from "@/lib/dto/bookings";
import {
  createBooking,
  findBookingByReference,
  findBookingsByEmail,
} from "@/lib/repositories/bookings-repository";

const BOOKING_LOOKUP_SECRET =
  process.env.BOOKING_LOOKUP_SECRET ?? "development-only-booking-secret";

export const generateBookingReference = () => {
  const prefix = "FLT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
};

export const createBookingLookupToken = (
  bookingReference: string,
  passengerEmail: string,
) =>
  createHmac("sha256", BOOKING_LOOKUP_SECRET)
    .update(`${bookingReference}:${passengerEmail.toLowerCase()}`)
    .digest("hex");

export const verifyBookingLookupToken = (
  providedToken: string,
  expectedToken: string,
) => {
  const provided = Buffer.from(providedToken);
  const expected = Buffer.from(expectedToken);

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
};

const isPaymentSuccessful = () => Math.random() > 0.1;
const shouldForcePaymentSuccess = process.env.BOOKING_FORCE_PAYMENT_SUCCESS === "true";

export const createConfirmedBooking = async (payload: BookingCreateInput) => {
  if (!shouldForcePaymentSuccess && !isPaymentSuccessful()) {
    return { success: false as const };
  }

  const bookingReference = generateBookingReference();
  const holdUntil = new Date(Date.now() + 15 * 60 * 1000);
  const booking = await createBooking({
    bookingReference,
    holdUntil,
    payload,
  });

  return {
    success: true as const,
    booking,
    bookingLookupToken: createBookingLookupToken(
      booking.booking_reference,
      booking.passenger_email,
    ),
  };
};

export const getBookingByReference = (bookingReference: string) =>
  findBookingByReference(bookingReference);

export const getBookingsByEmail = (email: string) => findBookingsByEmail(email);

export const lookupBookingAccessToken = async (
  bookingReference: string,
  lastName: string,
) => {
  const booking = await findBookingByReference(bookingReference);
  if (!booking) {
    return null;
  }

  const nameParts = booking.passenger_full_name.trim().split(/\s+/);
  const storedLastName = nameParts[nameParts.length - 1]?.toLowerCase() ?? "";
  if (storedLastName !== lastName.toLowerCase()) {
    return null;
  }

  return {
    booking_reference: booking.booking_reference,
    token: createBookingLookupToken(
      booking.booking_reference,
      booking.passenger_email,
    ),
  };
};
