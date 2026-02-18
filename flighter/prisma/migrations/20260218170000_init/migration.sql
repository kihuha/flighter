-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "aircraft_types" (
    "plane_iso" TEXT NOT NULL,
    "plane_name" TEXT,
    "aircraft_name" TEXT,
    "manufacturer" TEXT,
    "category" TEXT,
    "fuel_litre_per_100km_per_passenger" DOUBLE PRECISION,
    "capacity_min" INTEGER,
    "capacity_max" INTEGER,
    "range_nm" INTEGER,
    "co2_g_per_pax_mile" DOUBLE PRECISION,

    CONSTRAINT "aircraft_types_pkey" PRIMARY KEY ("plane_iso")
);

-- CreateTable
CREATE TABLE "airlines" (
    "airline_id" TEXT NOT NULL,
    "name" TEXT,
    "iata_code" TEXT,
    "icao_code" TEXT,
    "call_sign" TEXT,
    "country" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "logo_path" TEXT,

    CONSTRAINT "airlines_pkey" PRIMARY KEY ("airline_id")
);

-- CreateTable
CREATE TABLE "airports" (
    "airport_id" BIGINT NOT NULL,
    "name" TEXT,
    "city" TEXT,
    "country" TEXT,
    "iata_code" TEXT,
    "icao_code" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT,
    "database_timezone" TEXT,
    "type" TEXT,

    CONSTRAINT "airports_pkey" PRIMARY KEY ("airport_id")
);

-- CreateTable
CREATE TABLE "flight_schedules" (
    "flight_schedule_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "airline_id" TEXT NOT NULL,
    "flight_number" VARCHAR(8) NOT NULL,
    "depart_time_local" TIME(6) NOT NULL,
    "arrive_time_local" TIME(6) NOT NULL,
    "operating_days_mask" SMALLINT NOT NULL,
    "weekly_frequency" SMALLINT NOT NULL,
    "aircraft_iso" CHAR(3) NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE NOT NULL,

    CONSTRAINT "flight_schedules_pkey" PRIMARY KEY ("flight_schedule_id")
);

-- CreateTable
CREATE TABLE "route_metrics" (
    "route_id" UUID NOT NULL,
    "distance_km" DOUBLE PRECISION,
    "distance_miles" DOUBLE PRECISION,
    "is_international" BOOLEAN,
    "co2_total_kg" DOUBLE PRECISION,

    CONSTRAINT "route_metrics_pkey" PRIMARY KEY ("route_id")
);

-- CreateTable
CREATE TABLE "routes" (
    "route_id" UUID NOT NULL,
    "airline_id" TEXT NOT NULL,
    "source_airport_id" BIGINT NOT NULL,
    "destination_airport_id" BIGINT NOT NULL,
    "stops" INTEGER NOT NULL DEFAULT 0,
    "plane_iso" TEXT,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("route_id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "booking_id" UUID NOT NULL,
    "booking_reference" VARCHAR(20) NOT NULL,
    "passenger_full_name" VARCHAR(255) NOT NULL,
    "passenger_email" VARCHAR(255) NOT NULL,
    "passenger_phone" VARCHAR(50) NOT NULL,
    "departure_schedule_id" UUID NOT NULL,
    "return_schedule_id" UUID,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "flight_class" VARCHAR(50) NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "extras_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxes_and_fees" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "extras_json" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "hold_until" TIMESTAMP(3),
    "payment_method" VARCHAR(50),
    "payment_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "card_last_four" VARCHAR(4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateIndex
CREATE INDEX "aircraft_types_mfr_cat_idx" ON "aircraft_types"("manufacturer", "category");

-- CreateIndex
CREATE INDEX "airports_country_city_idx" ON "airports"("country", "city");

-- CreateIndex
CREATE INDEX "routes_airline_idx" ON "routes"("airline_id");

-- CreateIndex
CREATE INDEX "routes_dst_idx" ON "routes"("destination_airport_id");

-- CreateIndex
CREATE INDEX "routes_src_idx" ON "routes"("source_airport_id");

-- CreateIndex
CREATE UNIQUE INDEX "routes_natural_uq" ON "routes"("airline_id", "source_airport_id", "destination_airport_id", "stops", "plane_iso");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_reference_key" ON "bookings"("booking_reference");

-- CreateIndex
CREATE INDEX "bookings_booking_reference_idx" ON "bookings"("booking_reference");

-- CreateIndex
CREATE INDEX "bookings_passenger_email_idx" ON "bookings"("passenger_email");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_created_at_idx" ON "bookings"("created_at");

-- AddForeignKey
ALTER TABLE "route_metrics" ADD CONSTRAINT "route_metrics_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("route_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_airline_fk" FOREIGN KEY ("airline_id") REFERENCES "airlines"("airline_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_dest_fk" FOREIGN KEY ("destination_airport_id") REFERENCES "airports"("airport_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_plane_fk" FOREIGN KEY ("plane_iso") REFERENCES "aircraft_types"("plane_iso") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_source_fk" FOREIGN KEY ("source_airport_id") REFERENCES "airports"("airport_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

