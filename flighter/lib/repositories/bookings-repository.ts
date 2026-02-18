import { db } from "@/lib/db";
import { BookingCreateInput } from "@/lib/dto/bookings";

interface CreateBookingParams {
  bookingReference: string;
  holdUntil: Date;
  payload: BookingCreateInput;
}

export const createBooking = ({ bookingReference, holdUntil, payload }: CreateBookingParams) => {
  return db.bookings.create({
    data: {
      booking_reference: bookingReference,
      passenger_full_name: payload.passenger_full_name,
      passenger_email: payload.passenger_email,
      passenger_phone: payload.passenger_phone,
      departure_schedule_id: payload.departure_schedule_id,
      return_schedule_id: payload.return_schedule_id ?? null,
      adults: payload.adults,
      children: payload.children,
      flight_class: payload.flight_class,
      base_price: payload.base_price,
      extras_price: payload.extras_price,
      taxes_and_fees: payload.taxes_and_fees,
      total_price: payload.total_price,
      extras_json: payload.extras_json ?? undefined,
      status: "confirmed",
      hold_until: holdUntil,
      payment_method: payload.payment_method,
      payment_status: "completed",
      card_last_four: payload.card_last_four ?? null,
    },
  });
};

export const findBookingByReference = (bookingReference: string) => {
  return db.bookings.findUnique({
    where: { booking_reference: bookingReference },
  });
};

export const findBookingsByEmail = (email: string, limit = 20) => {
  return db.bookings.findMany({
    where: { passenger_email: email },
    orderBy: { created_at: "desc" },
    take: limit,
  });
};
