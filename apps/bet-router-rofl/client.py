import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")

MARKETPLACE_PATHS = {
    2: "slaughterhouse-predictions",
    3: "terminal-degenerecy-labs",
}


def get_prices(marketplace_id: int, market_id: int):
    """
    Calls the get-prices endpoint for a given marketplace and market.
    """
    if marketplace_id not in MARKETPLACE_PATHS:
        print(
            f"Error: Invalid marketplaceId: {marketplace_id}. Must be 2 or 3.",
            file=sys.stderr,
        )
        sys.exit(1)

    path = MARKETPLACE_PATHS[marketplace_id]
    url = f"{BASE_URL}/{path}/get-prices"
    payload = {"marketId": market_id}

    print(f"Calling {url} with payload: {payload}")

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        sys.exit(1)
