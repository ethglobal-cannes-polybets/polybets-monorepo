from web3 import Web3
from web3.contract import Contract
from eth_account.account import Account


class BetSlipCreatedHandler:
    """Handler for BetSlipCreated events."""

    def __init__(
        self, w3: Web3, contract: Contract, account: Account, private_key: str
    ):
        self.w3 = w3
        self.contract = contract
        self.account = account
        self.private_key = private_key

    def handle_event(self, event):
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
            bet_slip_data = self.contract.functions.getBetSlip(bet_slip_id).call()
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
            print(
                f"⏳ Updating status for BetSlip ID: {bet_slip_id} to 'Processing'..."
            )

            # 'Processing' is the 2nd status in the enum (index 1)
            processing_status = 1

            nonce = self.w3.eth.get_transaction_count(self.account.address)

            # Get gas price for Oasis Sapphire (legacy transaction format)
            gas_price = self.w3.eth.gas_price

            # Build transaction with legacy parameters (no EIP-1559)
            update_tx = self.contract.functions.updateBetSlipStatus(
                bet_slip_id, processing_status
            ).build_transaction(
                {
                    "nonce": nonce,
                    "gasPrice": gas_price,
                    "gas": 200000,  # Set a reasonable gas limit
                    "chainId": self.w3.eth.chain_id,
                }
            )

            # Sign and send transaction
            signed_tx = self.w3.eth.account.sign_transaction(
                update_tx, private_key=self.private_key
            )
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)

            print(f"  Transaction sent to update status. Tx Hash: {tx_hash.hex()}")

            # Wait for the transaction to be mined
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

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
