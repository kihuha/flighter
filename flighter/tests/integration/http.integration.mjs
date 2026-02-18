import "dotenv/config";
import assert from "node:assert/strict";
import { Client } from "pg";

const baseUrl = process.env.INTEGRATION_BASE_URL ?? "http://127.0.0.1:3100";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for integration tests");
}

const client = new Client({ connectionString: databaseUrl });

const main = async () => {
  await client.connect();

  const routeResult = await client.query(`
    SELECT
      r.source_airport_id::text AS from_id,
      r.destination_airport_id::text AS to_id,
      fs.flight_schedule_id::text AS schedule_id,
      fs.effective_from::text AS depart_date
    FROM routes r
    INNER JOIN flight_schedules fs ON fs.route_id = r.route_id
    LIMIT 1
  `);

  assert.ok(routeResult.rows.length > 0, "expected seeded route data");
  const seeded = routeResult.rows[0];

  const flightsResponse = await fetch(
    `${baseUrl}/api/flights?fromId=${seeded.from_id}&toId=${seeded.to_id}&departDate=${encodeURIComponent(seeded.depart_date)}`,
  );
  assert.equal(flightsResponse.status, 200, "expected /api/flights status 200");
  const flightsPayload = await flightsResponse.json();
  assert.ok(Array.isArray(flightsPayload), "expected flights payload array");
  assert.ok(flightsPayload.length > 0, "expected at least one flight result");
  assert.ok(
    typeof flightsPayload[0].flight_schedule_id === "string",
    "expected flight schedule id in response",
  );

  const createBookingResponse = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      passenger_full_name: "Integration Test User",
      passenger_email: "integration@example.com",
      passenger_phone: "+15555550123",
      departure_schedule_id: seeded.schedule_id,
      adults: 1,
      children: 0,
      flight_class: "economy",
      base_price: 120,
      extras_price: 0,
      taxes_and_fees: 12,
      total_price: 132,
      payment_method: "card",
      card_last_four: "4242",
    }),
  });
  assert.equal(
    createBookingResponse.status,
    200,
    "expected /api/bookings create status 200",
  );
  const createdBooking = await createBookingResponse.json();
  assert.equal(createdBooking.success, true, "expected booking create success");
  assert.ok(
    typeof createdBooking.booking_reference === "string",
    "expected booking reference",
  );
  assert.ok(
    typeof createdBooking.booking_lookup_token === "string",
    "expected booking lookup token",
  );

  const lookupBookingResponse = await fetch(
    `${baseUrl}/api/bookings?ref=${encodeURIComponent(createdBooking.booking_reference)}&token=${createdBooking.booking_lookup_token}`,
  );
  assert.equal(
    lookupBookingResponse.status,
    200,
    "expected /api/bookings lookup status 200",
  );
  const lookedUpBooking = await lookupBookingResponse.json();
  assert.equal(
    lookedUpBooking.booking_reference,
    createdBooking.booking_reference,
    "expected lookup booking reference to match",
  );

  console.log("Integration checks passed: /api/flights and /api/bookings");
};

main()
  .catch((error) => {
    console.error("Integration checks failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
