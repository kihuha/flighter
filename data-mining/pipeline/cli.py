from __future__ import annotations

import argparse
from pathlib import Path

from pipeline.emit_sql import load_optional_schedules_sql, render_seed_sql
from pipeline.io import load_flight_data
from pipeline.transform import SeedFrames, build_seed_frames


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Flighter data pipeline CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    generate_parser = subparsers.add_parser(
        "generate-seeds",
        help="Generate deterministic SQL seed bundle from cleaned CSV data",
    )
    generate_parser.add_argument(
        "--input-csv",
        type=Path,
        default=Path("clean_data/final_flight_data.csv"),
        help="Path to cleaned input CSV",
    )
    generate_parser.add_argument(
        "--output-sql",
        type=Path,
        default=Path("sql_statements/generated/001_seed_bundle.sql"),
        help="Output SQL file path",
    )
    generate_parser.add_argument(
        "--schedules-sql",
        type=Path,
        default=Path("sql_statements/011_generate_flight_schedules.sql"),
        help="Optional existing schedule SQL file to append",
    )
    generate_parser.add_argument(
        "--skip-schedules",
        action="store_true",
        help="Do not append schedule generation SQL",
    )

    return parser


def _print_frame_counts(seed_frames: SeedFrames) -> None:
    print("Generated seed frames:")
    print(f"  airlines: {len(seed_frames.airlines):,}")
    print(f"  airports: {len(seed_frames.airports):,}")
    print(f"  aircraft_types: {len(seed_frames.aircraft_types):,}")
    print(f"  routes: {len(seed_frames.routes):,}")
    print(f"  route_metrics: {len(seed_frames.route_metrics):,}")


def _generate_seeds(args: argparse.Namespace) -> None:
    raw_df = load_flight_data(args.input_csv)
    seed_frames = build_seed_frames(raw_df)
    _print_frame_counts(seed_frames)

    schedules_sql = None
    if not args.skip_schedules:
      schedules_sql = load_optional_schedules_sql(args.schedules_sql)

    sql = render_seed_sql(seed_frames, schedules_sql=schedules_sql)
    args.output_sql.parent.mkdir(parents=True, exist_ok=True)
    args.output_sql.write_text(sql, encoding="utf-8")
    print(f"Wrote SQL seed bundle to {args.output_sql}")


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()

    if args.command == "generate-seeds":
        _generate_seeds(args)
        return

    parser.error(f"Unsupported command: {args.command}")


if __name__ == "__main__":
    main()
