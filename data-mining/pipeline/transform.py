from __future__ import annotations

from dataclasses import dataclass
from uuid import NAMESPACE_URL, uuid5

import pandas as pd


ROUTE_KEY_SEPARATOR = "|"


@dataclass(frozen=True)
class SeedFrames:
    airlines: pd.DataFrame
    airports: pd.DataFrame
    aircraft_types: pd.DataFrame
    routes: pd.DataFrame
    route_metrics: pd.DataFrame


def _normalize_bool(value: object) -> bool | None:
    if pd.isna(value):
        return None
    if isinstance(value, bool):
        return value

    normalized = str(value).strip().upper()
    if normalized in {"Y", "YES", "TRUE", "1"}:
        return True
    if normalized in {"N", "NO", "FALSE", "0"}:
        return False
    return None


def _build_route_id(
    airline_id: str,
    source_airport_id: int,
    destination_airport_id: int,
    stops: int,
    plane_iso: str | None,
) -> str:
    key = ROUTE_KEY_SEPARATOR.join(
        [
            airline_id,
            str(source_airport_id),
            str(destination_airport_id),
            str(stops),
            plane_iso or "",
        ]
    )
    return str(uuid5(NAMESPACE_URL, key))


def _normalize_routes(raw_df: pd.DataFrame) -> pd.DataFrame:
    routes = raw_df[
        [
            "airline_id",
            "route_source_airport_id",
            "route_destination_airport_id",
            "route_stops",
            "route_plane_iso",
            "distance_km",
            "distance_miles",
            "is_international",
            "co2_total_kg",
        ]
    ].copy()

    routes = routes.rename(
        columns={
            "route_source_airport_id": "source_airport_id",
            "route_destination_airport_id": "destination_airport_id",
            "route_stops": "stops",
            "route_plane_iso": "plane_iso",
        }
    )

    routes["source_airport_id"] = pd.to_numeric(
        routes["source_airport_id"], errors="coerce"
    ).astype("Int64")
    routes["destination_airport_id"] = pd.to_numeric(
        routes["destination_airport_id"], errors="coerce"
    ).astype("Int64")
    routes["stops"] = pd.to_numeric(routes["stops"], errors="coerce").fillna(0).astype(int)
    routes["plane_iso"] = routes["plane_iso"].astype("string").str.strip()
    routes["plane_iso"] = routes["plane_iso"].replace({"": None, "<NA>": None})
    routes = routes.dropna(
        subset=["airline_id", "source_airport_id", "destination_airport_id"]
    ).copy()

    routes["route_id"] = routes.apply(
        lambda row: _build_route_id(
            airline_id=str(row["airline_id"]),
            source_airport_id=int(row["source_airport_id"]),
            destination_airport_id=int(row["destination_airport_id"]),
            stops=int(row["stops"]),
            plane_iso=None if pd.isna(row["plane_iso"]) else str(row["plane_iso"]),
        ),
        axis=1,
    )

    return routes


def _build_airlines(raw_df: pd.DataFrame) -> pd.DataFrame:
    airlines = raw_df[
        [
            "airline_id",
            "airline_name",
            "airline_iata",
            "airline_icao",
            "airline_call_sign",
            "airline_country",
            "airline_active",
        ]
    ].rename(
        columns={
            "airline_name": "name",
            "airline_iata": "iata_code",
            "airline_icao": "icao_code",
            "airline_call_sign": "call_sign",
            "airline_country": "country",
            "airline_active": "is_active",
        }
    )
    airlines["is_active"] = airlines["is_active"].map(_normalize_bool).fillna(True)
    airlines = airlines.dropna(subset=["airline_id"]).drop_duplicates(subset=["airline_id"])
    return airlines.sort_values(by="airline_id").reset_index(drop=True)


def _build_airports(raw_df: pd.DataFrame) -> pd.DataFrame:
    source_airports = raw_df[
        [
            "route_source_airport_id",
            "source_port_name",
            "source_port_city",
            "source_port_country",
            "source_port_iata",
            "source_port_icao",
            "source_port_latitude",
            "source_port_longitude",
            "source_port_timezone",
            "source_port_database_timezone",
            "source_Type",
        ]
    ].rename(
        columns={
            "route_source_airport_id": "airport_id",
            "source_port_name": "name",
            "source_port_city": "city",
            "source_port_country": "country",
            "source_port_iata": "iata_code",
            "source_port_icao": "icao_code",
            "source_port_latitude": "latitude",
            "source_port_longitude": "longitude",
            "source_port_timezone": "timezone",
            "source_port_database_timezone": "database_timezone",
            "source_Type": "type",
        }
    )

    destination_airports = raw_df[
        [
            "route_destination_airport_id",
            "destination_port_name",
            "destination_port_city",
            "destination_port_country",
            "destination_port_iata",
            "destination_port_icao",
            "destination_port_latitude",
            "destination_port_longitude",
            "destination_port_timezone",
            "destination_port_database_timezone",
            "destination_Type",
        ]
    ].rename(
        columns={
            "route_destination_airport_id": "airport_id",
            "destination_port_name": "name",
            "destination_port_city": "city",
            "destination_port_country": "country",
            "destination_port_iata": "iata_code",
            "destination_port_icao": "icao_code",
            "destination_port_latitude": "latitude",
            "destination_port_longitude": "longitude",
            "destination_port_timezone": "timezone",
            "destination_port_database_timezone": "database_timezone",
            "destination_Type": "type",
        }
    )

    airports = pd.concat([source_airports, destination_airports], ignore_index=True)
    airports["airport_id"] = pd.to_numeric(airports["airport_id"], errors="coerce").astype(
        "Int64"
    )
    airports = airports.dropna(subset=["airport_id"]).drop_duplicates(subset=["airport_id"])
    airports = airports.sort_values(by="airport_id").reset_index(drop=True)
    return airports


def _build_aircraft_types(raw_df: pd.DataFrame) -> pd.DataFrame:
    aircraft_types = raw_df[
        [
            "plane_iso",
            "plane_name",
            "aircraft_name",
            "manufacturer",
            "category",
            "fuel_litre_per_100km_per_passenger",
            "capacity_min",
            "capacity_max",
            "range_nm",
            "co2_g_per_pax_mile",
        ]
    ].copy()
    aircraft_types["plane_iso"] = aircraft_types["plane_iso"].astype("string").str.strip()
    aircraft_types["plane_iso"] = aircraft_types["plane_iso"].replace({"": None, "<NA>": None})
    aircraft_types = aircraft_types.dropna(subset=["plane_iso"])
    aircraft_types = aircraft_types.drop_duplicates(subset=["plane_iso"])
    return aircraft_types.sort_values(by="plane_iso").reset_index(drop=True)


def _build_routes(routes_df: pd.DataFrame) -> pd.DataFrame:
    routes = routes_df[
        [
            "route_id",
            "airline_id",
            "source_airport_id",
            "destination_airport_id",
            "stops",
            "plane_iso",
        ]
    ].drop_duplicates(subset=["route_id"])
    return routes.sort_values(by="route_id").reset_index(drop=True)


def _build_route_metrics(routes_df: pd.DataFrame) -> pd.DataFrame:
    metrics = routes_df[
        ["route_id", "distance_km", "distance_miles", "is_international", "co2_total_kg"]
    ].copy()
    metrics["is_international"] = metrics["is_international"].map(_normalize_bool)
    metrics = metrics.drop_duplicates(subset=["route_id"])
    return metrics.sort_values(by="route_id").reset_index(drop=True)


def build_seed_frames(raw_df: pd.DataFrame) -> SeedFrames:
    normalized_routes = _normalize_routes(raw_df)

    return SeedFrames(
        airlines=_build_airlines(raw_df),
        airports=_build_airports(raw_df),
        aircraft_types=_build_aircraft_types(raw_df),
        routes=_build_routes(normalized_routes),
        route_metrics=_build_route_metrics(normalized_routes),
    )
