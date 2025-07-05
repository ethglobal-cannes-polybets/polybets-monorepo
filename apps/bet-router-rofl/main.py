import asyncio
import json
import os
import time

from dotenv import load_dotenv
from web3 import Web3

# Load environment variables from .env file
load_dotenv()

# --- Environment Variables ---
SAPPHIRETESTNET_RPC_URL = (
    os.getenv("SAPPHIRETESTNET_RPC_URL") or "https://testnet.sapphire.oasis.io"
)
POLYBETS_CONTRACT_ADDRESS = (
    os.getenv("POLYBETS_CONTRACT_ADDRESS")
    or "0x2C7f55aB45b3B78Bd0cf041Bf752C6D1bAbD7ec7"
)
POLYBETS_CONTRACT_ABI_PATH = (
    os.getenv("POLYBETS_CONTRACT_ABI_PATH")
    or "../../contracts/artifacts/contracts/polybet.sol/PolyBet.json"
)
PRIVATE_KEY = os.getenv("PRIVATE_KEY")  # For sending transactions if needed

# --- Basic Sanity Checks ---
if not all(
    [
        SAPPHIRETESTNET_RPC_URL,
        POLYBETS_CONTRACT_ADDRESS,
        POLYBETS_CONTRACT_ABI_PATH,
        PRIVATE_KEY,
    ]
):
    raise ValueError(
        "Missing required environment variables: SAPPHIRETESTNET_RPC_URL, POLYBETS_CONTRACT_ADDRESS, POLYBETS_CONTRACT_ABI_PATH, PRIVATE_KEY"
    )

if not os.path.exists(POLYBETS_CONTRACT_ABI_PATH):
    raise FileNotFoundError(
        f"Contract ABI file not found at: {POLYBETS_CONTRACT_ABI_PATH}"
    )


def load_contract_abi():
    """Loads the contract ABI from the specified file path."""
    with open(POLYBETS_CONTRACT_ABI_PATH, "r") as f:
        return json.load()["abi"]


# --- Web3 Setup ---
w3 = Web3(Web3.HTTPProvider(SAPPHIRETESTNET_RPC_URL))
if not w3.is_connected():
    raise ConnectionError(
        f"Failed to connect to the RPC node at {SAPPHIRETESTNET_RPC_URL}"
    )

account = w3.eth.account.from_key(PRIVATE_KEY)
w3.eth.default_account = account.address

CONTRACT_ABI = load_contract_abi()
contract = w3.eth.contract(address=POLYBETS_CONTRACT_ADDRESS, abi=CONTRACT_ABI)


# --- Event Handling ---
def handle_event(event):
    """
    Callback function to handle a new BetSlipCreated event.
    Fetches the bet slip data, prints it, and updates its status to "Processing".
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

        # --- Update Bet Slip Status ---
        print(f"⏳ Updating status for BetSlip ID: {bet_slip_id} to 'Processing'...")

        # 'Processing' is the 2nd status in the enum (index 1)
        processing_status = 1

        nonce = w3.eth.get_transaction_count(account.address)

        # Build transaction
        update_tx = contract.functions.updateBetSlipStatus(
            bet_slip_id, processing_status
        ).build_transaction({"nonce": nonce})

        # Sign and send transaction
        signed_tx = w3.eth.account.sign_transaction(update_tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

        print(f"  Transaction sent to update status. Tx Hash: {tx_hash.hex()}")

        # Wait for the transaction to be mined
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status == 1:
            print(
                f"  ✅ Transaction successful! Status for BetSlip ID {bet_slip_id} is now 'Processing'."
            )
        else:
            print(
                f"  ❌ Transaction failed! Could not update status for BetSlip ID {bet_slip_id}."
            )
            print(f"  Receipt: {receipt}")

    except Exception as e:
        print(f"🚨 Error processing bet slip: {e}")


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
    print(
        f"Listening for 'BetSlipCreated' events on contract: {POLYBETS_CONTRACT_ADDRESS}"
    )
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
