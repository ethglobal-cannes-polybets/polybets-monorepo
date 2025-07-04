import asyncio
import json
import os
import time

from dotenv import load_dotenv
from web3 import Web3

# Load environment variables from .env file
load_dotenv()

# --- Environment Variables ---
RPC_URL = os.getenv("RPC_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
CONTRACT_ABI_PATH = os.getenv("CONTRACT_ABI_PATH")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")  # For sending transactions if needed

# --- Basic Sanity Checks ---
if not all([RPC_URL, CONTRACT_ADDRESS, CONTRACT_ABI_PATH]):
    raise ValueError(
        "Missing required environment variables: RPC_URL, CONTRACT_ADDRESS, CONTRACT_ABI_PATH"
    )

if not os.path.exists(CONTRACT_ABI_PATH):
    raise FileNotFoundError(f"Contract ABI file not found at: {CONTRACT_ABI_PATH}")


def load_contract_abi():
    """Loads the contract ABI from the specified file path."""
    with open(CONTRACT_ABI_PATH, "r") as f:
        return json.load()["abi"]


# --- Web3 Setup ---
w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    raise ConnectionError(f"Failed to connect to the RPC node at {RPC_URL}")

CONTRACT_ABI = load_contract_abi()
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)


# --- Event Handling ---
def handle_event(event):
    """
    Callback function to handle a new BetSlipCreated event.
    Fetches the bet slip data and prints it.
    """
    print("-----------------------------------")
    print(f"🎉 BetSlipCreated event detected!")
    print(f"Transaction Hash: {event['transactionHash'].hex()}")

    bet_slip_id = event["args"]["betId"]
    print(f"🔍 Fetching details for BetSlip ID: {bet_slip_id}...")

    try:
        # Call the getBetSlip function from the contract
        bet_slip_data = contract.functions.getBetSlip(bet_slip_id).call()
        print("\n=== Bet Slip Details ===")
        print(f"  Bet ID: {bet_slip_id}")
        print(f"  Strategy: {bet_slip_data[0]}")
        print(f"  Initial Collateral: {bet_slip_data[1]}")
        print(f"  Final Collateral: {bet_slip_data[2]}")
        print(f"  Failure Reason: {bet_slip_data[3]}")
        print(f"  Outcome: {bet_slip_data[4]}")
        print(f"  Status: {bet_slip_data[5]}")
        print("========================\n")
    except Exception as e:
        print(f"🚨 Error fetching bet slip data: {e}")


async def log_loop(event_filter, poll_interval):
    """
    Asynchronously listens for new events and passes them to the handler.
    """
    while True:
        for event in event_filter.get_new_entries():
            handle_event(event)
        await asyncio.sleep(poll_interval)


def main():
    """
    Main function to set up the event filter and start the listener loop.
    """
    print("🚀 Starting Bet-Router-ROFL Event Listener...")
    print(f"Listening for 'BetSlipCreated' events on contract: {CONTRACT_ADDRESS}")
    print("Press Ctrl+C to stop.")

    # Create a filter for the BetSlipCreated event
    event_filter = contract.events.BetSlipCreated.create_filter(fromBlock="latest")

    # Start the asynchronous event loop
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(asyncio.gather(log_loop(event_filter, poll_interval=2)))
    except KeyboardInterrupt:
        print("\n🛑 Shutting down listener.")
    finally:
        loop.close()


if __name__ == "__main__":
    main()
