from pathlib import Path

import pandas as pd


def load_flight_data(input_csv: Path) -> pd.DataFrame:
    """Load the cleaned flight dataset used for SQL seed generation."""
    return pd.read_csv(input_csv, low_memory=False)
