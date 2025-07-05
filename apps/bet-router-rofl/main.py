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
    os.getenv("SAPPHIRETESTNET_RPC_URL")
    or "https://oasis-sapphire-testnet.core.chainstack.com/86690140e8855e0871e6059dac29a04c"
)
POLYBETS_CONTRACT_ADDRESS = (
    os.getenv("POLYBETS_CONTRACT_ADDRESS")
    or "0x537E481a67df5e69f6C3c8AfA78079AA1E0E3ec3"
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
        return json.load(f)["abi"]


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

        # Get gas price for Oasis Sapphire (legacy transaction format)
        gas_price = w3.eth.gas_price

        # Build transaction with legacy parameters (no EIP-1559)
        update_tx = contract.functions.updateBetSlipStatus(
            bet_slip_id, processing_status
        ).build_transaction(
            {
                "nonce": nonce,
                "gasPrice": gas_price,
                "gas": 200000,  # Set a reasonable gas limit
                "chainId": w3.eth.chain_id,
            }
        )

        # Sign and send transaction
        signed_tx = w3.eth.account.sign_transaction(update_tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

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


async def log_loop(poll_interval):
    """
    Asynchronously listens for new events and passes them to the handler.
    """
    last_processed_block = w3.eth.block_number
    print(f"Starting event listener from block: {last_processed_block}")

    while True:
        current_block = w3.eth.block_number

        if current_block > last_processed_block:
            # Get logs for BetSlipCreated events from the last processed block to current block
            try:
                logs = contract.events.BetSlipCreated.get_logs(
                    from_block=last_processed_block + 1, to_block=current_block
                )

                for log in logs:
                    handle_event(log)

                last_processed_block = current_block
            except Exception as e:
                print(f"Error fetching logs: {e}")

        await asyncio.sleep(poll_interval)


async def main():
    """
    Main function to start the event listener loop.
    """
    print("🚀 Starting Bet-Router-ROFL Event Listener...")
    print(
        f"Listening for 'BetSlipCreated' events on contract: {POLYBETS_CONTRACT_ADDRESS}"
    )
    print(f"Using RPC URL: {SAPPHIRETESTNET_RPC_URL}")
    print("Press Ctrl+C to stop.")

    # Start the event listener
    try:
        await log_loop(poll_interval=2)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down listener.")


if __name__ == "__main__":
    asyncio.run(main())
