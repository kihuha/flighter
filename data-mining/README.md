# Flighter Data Mining

This project is a data engineering and analytics showcase focused on cleaning raw, messy flight datasets into a structured, application-ready foundation. The goal is to produce clean, reliable flight routes, airports, airlines, aircraft types, and route metrics that can power a realistic dummy flight booking application.

It is intentionally designed as portfolio work: the pipeline demonstrates practical data cleaning, schema design, reproducible transforms, and business-friendly outputs that can feed a web app or a visualization layer.

## What this project demonstrates

- Data cleaning and normalization across multiple sources with inconsistent formats.
- Standardizing identifiers such as IATA/ICAO codes and de-duplicating airports and airlines.
- Enriching route data with metrics used by booking apps (distance, duration estimates, popularity proxies).
- Outputting both analytics-friendly CSVs and a normalized SQL schema.
- Clear separation of raw inputs, cleaned outputs, and transformation notebooks.

## End goal: dummy booking app data

The cleaned outputs are structured so a front end can easily search and display routes, build sample schedules, and highlight busiest city and country pairs. This mirrors the kinds of data a real booking app would rely on, but built from open data and a transparent cleaning pipeline.

Related app clone: https://github.com/kihuha/flighter

Example app features that the outputs enable:

- Autocomplete airport and city search powered by clean airport records.
- Route listings with distance and airline metadata.
- Popular routes and busiest corridors for home page or marketing cards.
- Simulated schedules and fares using normalized route metrics.

## Repository structure

- [analysis.ipynb](analysis.ipynb) exploratory analysis and validation.
- [main.ipynb](main.ipynb) primary cleaning and transformation workflow.
- [web-app-prep.ipynb](web-app-prep.ipynb) final shaping for app-friendly datasets.
- [pipeline](pipeline) CLI-based deterministic seed generation module.
- [raw_data](raw_data) original datasets as downloaded.
- [clean_data](clean_data) cleaned outputs used by the web app and analytics.
- [sql_statements](sql_statements) SQL schema and load scripts to build a relational dataset.
- [airline_images](airline_images) assets for app display.

## Data sources

Primary source: https://openflights.org/data

## Inputs and outputs

### Raw inputs

Raw sources are preserved in [raw_data](raw_data) to keep the pipeline transparent and reproducible.

- Airlines data: names, codes, and operational status.
- Airports data: locations, IATA/ICAO, coordinates, and timezone metadata.
- Routes data: origin-destination mappings with airline and aircraft details.
- Aircraft data: type identifiers and aircraft family information.

### Clean outputs

Cleaned outputs live in [clean_data](clean_data) and are designed to be safe defaults for a demo booking app.

- [clean_data/final_flight_data.csv](clean_data/final_flight_data.csv) consolidated, cleaned route dataset.
- [clean_data/busiest_city_pairs.csv](clean_data/busiest_city_pairs.csv) top city pairs by route frequency.
- [clean_data/busiest_international_country_pairs.csv](clean_data/busiest_international_country_pairs.csv) international route corridors.
- [clean_data/columns.txt](clean_data/columns.txt) schema reference for the main output.

## Data cleaning pipeline highlights

The notebooks show the full transformation logic. Key steps include:

- Standardizing column names and data types across sources.
- Removing invalid or incomplete routes and airports with missing identifiers.
- De-duplicating airports, airlines, and aircraft entries using codes and names.
- Normalizing country and city names to improve join consistency.
- Computing derived fields such as route distance using coordinate math.
- Building lookup tables that are stable for app queries.

## SQL schema and loading

The SQL scripts in [sql_statements](sql_statements) allow you to load the cleaned datasets into a relational database for more realistic app integration.

- Create core tables: airlines, airports, aircraft types, and routes.
- Insert cleaned data in a deterministic order.
- Generate route metrics and example schedules.

## Quick start

1. Install Python dependencies from lockfile:

```bash
uv sync
```

2. Generate deterministic SQL seeds from cleaned data:

```bash
uv run -m pipeline.cli generate-seeds
```

3. Optional: skip app schedule SQL when generating bundle:

```bash
uv run -m pipeline.cli generate-seeds --skip-schedules
```

4. Notebook workflows remain available for exploration:
   - [main.ipynb](main.ipynb)
   - [web-app-prep.ipynb](web-app-prep.ipynb)

## Notes on data quality and limitations

- Open datasets are incomplete and sometimes outdated. The pipeline removes invalid records and normalizes the rest, but it is still demo data.
- Airports and routes without valid IATA/ICAO codes are excluded to keep joins stable.
- Distances are approximate great-circle calculations and are intended for UI displays, not operational planning.

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

## Ports extended reference

The airport dataset is based on the OpenFlights ports-extended format. Below is the field reference used during cleaning and validation.

- Airport ID Unique OpenFlights identifier for this airport.
- Name Name of airport. May or may not contain the City name.
- City Main city served by airport. May be spelled differently from Name.
- Country Country or territory where airport is located. See Countries to cross-reference to ISO 3166-1 codes.
- IATA 3-letter IATA code. Null if not assigned or unknown.
- ICAO 4-letter ICAO code. Null if not assigned.
- Latitude Decimal degrees, usually to six significant digits. Negative is South, positive is North.
- Longitude Decimal degrees, usually to six significant digits. Negative is West, positive is East.
- Altitude In feet.
- Timezone Hours offset from UTC. Fractional hours are expressed as decimals, eg. India is 5.5.
- DST Daylight savings time. One of E (Europe), A (US/Canada), S (South America), O (Australia), Z (New Zealand), N (None) or U (Unknown).
- Tz database timezone Timezone in tz (Olson) format, eg. America/Los_Angeles.
- Type Type of the airport. Value airport for air terminals, station for train stations, port for ferry terminals, unknown if not known.
- Source Source of this data. OurAirports for data sourced from OurAirports, Legacy for old data not matched to OurAirports, User for unverified user contributions.
