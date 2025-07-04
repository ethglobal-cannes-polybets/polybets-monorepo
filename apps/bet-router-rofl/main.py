import argparse
from client import get_prices

# To run this script:
# 1. Make sure you have python and poetry installed.
# 2. Run 'poetry install' in this directory ('apps/bet-router-rofl').
# 3. Run the API server from 'apps/marketplace-adapter-rest-api' with: bun run dev
# 4. Run this script from the 'apps/bet-router-rofl' directory:
#    poetry run python main.py --marketplace-id 2 --market-id 123


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Get prices for a market from external marketplaces behind Polybets"
    )
    parser.add_argument(
        "--marketplace-id",
        type=int,
        required=True,
        help="The ID of the marketplace (2 for Slaughterhouse, 3 for Terminal Degen).",
    )
    parser.add_argument(
        "--market-id", type=int, required=True, help="The ID of the market."
    )

    args = parser.parse_args()

    prices = get_prices(args.marketplace_id, args.market_id)
    print("Response:")
    print(prices)
