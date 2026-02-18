import { z } from "zod";

export const bookingCreateSchema = z.object({
  passenger_full_name: z.string().trim().min(1).max(255),
  passenger_email: z.string().trim().email().max(255),
  passenger_phone: z.string().trim().min(5).max(50),
  departure_schedule_id: z.string().uuid(),
  return_schedule_id: z.string().uuid().nullable().optional(),
  adults: z.coerce.number().int().min(1).max(9),
  children: z.coerce.number().int().min(0).max(9).default(0),
  flight_class: z.enum(["economy", "premium-economy", "business", "first-class"]),
  base_price: z.coerce.number().finite().nonnegative(),
  extras_price: z.coerce.number().finite().nonnegative().default(0),
  taxes_and_fees: z.coerce.number().finite().nonnegative(),
  total_price: z.coerce.number().finite().nonnegative(),
  extras_json: z.unknown().optional().nullable(),
  payment_method: z.string().trim().min(1).max(50).optional().default("card"),
  card_last_four: z.string().regex(/^\d{4}$/).optional().nullable(),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

export const bookingLookupSchema = z
  .object({
    ref: z.string().trim().min(1).max(20).optional(),
    email: z.string().trim().email().optional(),
    token: z.string().trim().length(64).optional(),
  })
  .superRefine((value, context) => {
    if (!value.ref && !value.email) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either booking reference or email",
      });
    }

    if (value.ref && value.email) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use either booking reference lookup or email lookup, not both",
      });
    }
  });

export type BookingLookupInput = z.infer<typeof bookingLookupSchema>;

export const bookingSelfLookupSchema = z.object({
  booking_reference: z.string().trim().min(1).max(20),
  last_name: z.string().trim().min(1).max(255),
});

export type BookingSelfLookupInput = z.infer<typeof bookingSelfLookupSchema>;
