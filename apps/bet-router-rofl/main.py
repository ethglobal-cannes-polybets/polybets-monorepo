#!/usr/bin/env python3
"""
Bet Router ROFL - Event Listener and Bet Executor

This module listens for BetSlipCreated and BetSlipSellingStateUpdate events from the 
PolyBet smart contract, executes optimal betting strategies via marketplace APIs, and 
records the results back to the contract.

PROCESS FLOW:
1. Listen for BetSlipCreated and BetSlipSellingStateUpdate events from PolyBet contract
2. Route to appropriate flow based on event type:
   - BetSlipCreated → BUY FLOW (new bet placements)
   - BetSlipSellingStateUpdate → SELL FLOW (existing bet sales)
3. Buy Flow: Create pool configurations, execute optimal bet allocation, record bets
4. Sell Flow: Execute sell orders for existing proxied bets, record sales
5. Update bet slip status based on execution results

KEY COMPONENTS:
- Event Listener: Monitors blockchain for new bet slips and selling state updates
- Bet Executor: Executes optimal betting strategies via API calls
- Contract Recorder: Records successful bets and sales back to the smart contract
- Error Handling: Comprehensive error handling and logging

ENVIRONMENT VARIABLES REQUIRED:
- SAPPHIRETESTNET_RPC_URL: Oasis Sapphire testnet RPC endpoint
- POLYBETS_CONTRACT_ADDRESS: PolyBet smart contract address
- POLYBETS_CONTRACT_ABI_PATH: Path to contract ABI file
- PRIVATE_KEY: Private key for transaction signing
- BET_EXECUTION_BASE_URL: Base URL for marketplace adapter API

MARKETPLACE MAPPING:
- Marketplace ID 2 → "canibeton_variant1" → "slaughterhouse-predictions"
- Marketplace ID 3 → "canibeton_variant2" → "terminal-degeneracy-labs"
"""

import asyncio
import json
import os
import time
import sys
import uuid
import requests
from typing import List, Dict, Any

from dotenv import load_dotenv
from web3 import Web3

# Load environment variables from .env file
load_dotenv()

# Add bet-execution to Python path
from bet_execution.bet_executor import (
    create_pool_configs_from_market_data, 
    execute_optimal_bet, 
    OptimizationMethod, 
    BetResponse,
    get_marketplace_id_from_endpoint,
    get_schema_from_marketplace_id
)


# --- Helper Functions ---
def decode_bytes32_to_int(bytes32_value):
    """Convert bytes32 to integer."""
    return int.from_bytes(bytes32_value, byteorder="big")


def decode_bytes32_array(bytes32_array):
    """Convert array of bytes32 to array of integers."""
    return [decode_bytes32_to_int(b) for b in bytes32_array]

def uuid_to_bytes32(uuid_str: str) -> bytes:
    """Convert UUID string to bytes32."""
    # Remove hyphens and convert to bytes
    uuid_hex = uuid_str.replace('-', '')
    b = bytes.fromhex(uuid_hex)
    return b.ljust(32, b'\x00')  # pad with zeros to 32 bytes

def generate_proxied_bet_id() -> bytes:
    """Generate a unique bytes32 ID for a proxied bet."""
    return uuid_to_bytes32(str(uuid.uuid4()))

def extract_shares_from_api_response(response_data: Dict[str, Any], collateral_amount: float) -> int:
    """
    Extract shares bought from API response data.
    
    Args:
        response_data: The API response data
        collateral_amount: The collateral amount spent (for estimation fallback)
        
    Returns:
        Number of shares bought
    """
    if not response_data or not isinstance(response_data, dict):
        return int(collateral_amount)  # Fallback estimate
    
    # Try different possible field names for shares
    shares_bought = (
        response_data.get('sharesMinted') or  # New primary field
        response_data.get('shares') or
        response_data.get('sharesBought') or
        response_data.get('shares_bought') or
        response_data.get('sharesReceived') or
        response_data.get('shares_received') or
        response_data.get('amount') or
        response_data.get('quantity') or
        0
    )
    
    # If shares is a string, try to convert to int
    if isinstance(shares_bought, str):
        try:
            shares_bought = int(float(shares_bought))
        except (ValueError, TypeError):
            shares_bought = 0
    
    # If shares is a float, convert to int
    if isinstance(shares_bought, float):
        shares_bought = int(shares_bought)
    
    # If still no shares found, estimate from collateral amount
    if shares_bought <= 0:
        # This is a rough estimate - in production, the API should return accurate shares
        # For LMSR markets, shares != collateral due to price impact
        shares_bought = int(collateral_amount)
    
    return shares_bought


# --- Environment Variables ---
SAPPHIRETESTNET_RPC_URL = (
    os.getenv("SAPPHIRETESTNET_RPC_URL")
    or "https://oasis-sapphire-testnet.core.chainstack.com/86690140e8855e0871e6059dac29a04c"
)
POLYBETS_CONTRACT_ADDRESS = (
    os.getenv("POLYBETS_CONTRACT_ADDRESS")
    or "0xb6efB7885279Ebb7032bB096799ff6b29ccf280f"
)
POLYBETS_CONTRACT_ABI_PATH = (
    os.getenv("POLYBETS_CONTRACT_ABI_PATH")
    or "../../contracts/artifacts/contracts/polybet.sol/PolyBet.json"
)
PRIVATE_KEY = os.getenv("PRIVATE_KEY")  # For sending transactions if needed

BET_EXECUTION_BASE_URL = os.getenv("BET_EXECUTION_BASE_URL") or "http://localhost:3000"

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


# --- Smart Contract Interaction ---
def record_proxied_bet_on_contract(
    bet_slip_id: int,
    successful_bet: BetResponse,
    shares_bought: int,
    option: int
) -> bool:
    """
    Record a successful proxied bet on the smart contract.
    
    Args:
        bet_slip_id: The bet slip ID this bet belongs to
        successful_bet: The successful bet response
        shares_bought: Number of shares bought
        option: The option index (0 for YES, 1 for NO)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Validate inputs
        if bet_slip_id < 0:
            print(f"  ❌ Invalid bet slip ID: {bet_slip_id}")
            return False
        
        if shares_bought <= 0:
            print(f"  ❌ Invalid shares bought: {shares_bought}")
            return False
        
        if option not in [0, 1]:
            print(f"  ❌ Invalid option: {option}. Must be 0 (YES) or 1 (NO)")
            return False
        
        # Generate unique ID for this proxied bet
        proxied_bet_id = generate_proxied_bet_id() # bytes(32)
        
        # Get marketplace ID from endpoint
        marketplace_id = get_marketplace_id_from_endpoint(successful_bet.endpoint_name)
        
        # Convert collateral amount to wei (USDC has 6 decimals)
        collateral_amount_wei = int(successful_bet.collateral_amount * 1_000_000)
        
        # Create ProxiedBet struct for the contract call
        # Based on the ProxiedBet struct:
        # (bytes32 id, uint256 betSlipId, uint256 marketplaceId, uint256 marketId, 
        #  uint256 optionIndex, uint256 minimumShares, uint256 blockTimestamp,
        #  uint256 originalCollateralAmount, uint256 finalCollateralAmount, 
        #  uint256 sharesBought, uint256 sharesSold, uint8 outcome, string failureReason)
        
        # Use tuple format for proper struct encoding
        proxied_bet_struct = (
            proxied_bet_id,                        # bytes32 id (already bytes)
            int(bet_slip_id),                      # uint256 betSlipId
            int(marketplace_id),                   # uint256 marketplaceId  
            int(successful_bet.market_id),         # uint256 marketId
            int(option),                           # uint256 optionIndex
            int(0),                                # uint256 minimumShares
            int(time.time()),                      # uint256 blockTimestamp
            int(collateral_amount_wei),            # uint256 originalCollateralAmount
            int(0),                                # uint256 finalCollateralAmount
            int(shares_bought),                    # uint256 sharesBought
            int(0),                                # uint256 sharesSold
            int(1),                                # uint8 outcome (explicit int cast)
            str("")                                # string failureReason
        )
        
        print(f"  📝 Recording proxied bet on contract...")
        print(f"     Bet ID: {proxied_bet_id.hex()}")
        print(f"     Market: {successful_bet.market_id} on marketplace {marketplace_id}")
        print(f"     Option: {'YES' if option == 0 else 'NO'}")
        print(f"     Amount: ${successful_bet.collateral_amount:.2f} → {shares_bought} shares")
        
        # Get current nonce and ensure we have enough gas
        nonce = w3.eth.get_transaction_count(account.address)
        gas_price = w3.eth.gas_price
        
        # Check account balance
        balance = w3.eth.get_balance(account.address)
        estimated_gas_cost = 300000 * gas_price
        
        if balance < estimated_gas_cost:
            print(f"  ❌ Insufficient balance for gas. Need: {estimated_gas_cost}, Have: {balance}")
            return False
        
        # Build transaction - use tuple format with proper type casting
        record_tx = contract.functions.recordProxiedBetPlaced(
            int(bet_slip_id),
            proxied_bet_struct
        ).build_transaction({
            "nonce": nonce,
            "gasPrice": gas_price,
            "gas": 300000,  # Increased gas limit for struct operations
            "chainId": w3.eth.chain_id,
        })
        
        # Sign and send transaction
        signed_tx = w3.eth.account.sign_transaction(record_tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        print(f"     Transaction sent. Tx Hash: {tx_hash.hex()}")
        
        # Wait for transaction to be mined (with timeout)
        try:
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt.status == 1:
                print(f"     ✅ Proxied bet recorded successfully!")
                print(f"     Gas used: {receipt.gasUsed}")
                return True
            else:
                print(f"     ❌ Transaction failed! Receipt: {receipt}")
                return False
                
        except Exception as receipt_error:
            print(f"     ❌ Error waiting for transaction receipt: {receipt_error}")
            return False
            
    except Exception as e:
        print(f"  🚨 Error recording proxied bet: {e}")
        print(f"     Bet details: Market {successful_bet.market_id}, Amount ${successful_bet.collateral_amount:.2f}")
        return False


# --- Event Handling ---
def handle_bet_slip_created_event(event):
    """
    Callback function to handle a new BetSlipCreated event.
    
    BetSlipCreated events are always for new bet placements (BUY FLOW).
    
    PROCESSING FLOW:
    1. Extract bet slip data from blockchain event
    2. Route directly to buy flow for bet placement
    
    Args:
        event: The BetSlipCreated event from the smart contract
    """
    print("-----------------------------------")
    print(f"🎉 BetSlipCreated event detected!")
    print(f"Transaction Hash: {event['transactionHash'].hex()}")

    bet_slip_id = event["args"]["betId"]
    print(f"🔍 Fetching details for BetSlip ID: {bet_slip_id}...")

    try:
        # STEP 1: Fetch bet slip data from contract
        bet_slip_data = contract.functions.getBetSlip(bet_slip_id).call()
        print("\n=== Bet Slip Details ===")
        print(f"  Bet ID: {bet_slip_id}")
        print(f"  Raw bet slip data: {bet_slip_data}")
        print(f"  Data length: {len(bet_slip_data)}")
        print(f"  Strategy: {bet_slip_data[0]}")
        print(f"  Initial Collateral: {bet_slip_data[1]}")
        print(f"  Final Collateral: {bet_slip_data[2]}")
        print(f"  Outcome: {bet_slip_data[3]}")
        print(f"  Parent ID: {bet_slip_data[4]}")
        print(f"  Instant Arbitrage: {bet_slip_data[5]}")
        print(f"  Status: {bet_slip_data[6]}")
        print(f"  Failure Reason: {bet_slip_data[7]}")
        print(f"  Marketplace IDs: {decode_bytes32_array(bet_slip_data[8])}")
        print(f"  Market IDs: {decode_bytes32_array(bet_slip_data[9])}")
        print(f"  Proxied Bets: {[bet_id.hex() for bet_id in bet_slip_data[10]]}")
        print("========================\n")

        # STEP 2: Route directly to buy flow (new bet placement)
        print(f"💰 BUY EVENT - Processing new bet placement...")
        handle_buy_flow(bet_slip_id, bet_slip_data)

    except Exception as e:
        print(f"🚨 Error processing bet slip: {e}")


def handle_bet_slip_selling_state_update_event(event):
    """
    Callback function to handle a BetSlipSellingStateUpdate event.
    
    This event is specifically emitted when a bet slip is updated to selling state,
    so we can directly route to the sell flow without checking the status.
    
    Args:
        event: The BetSlipSellingStateUpdate event from the smart contract
    """
    print("-----------------------------------")
    print(f"🔄 BetSlipSellingStateUpdate event detected!")
    print(f"Transaction Hash: {event['transactionHash'].hex()}")

    bet_slip_id = event["args"]["betId"]
    print(f"🔍 Fetching details for BetSlip ID: {bet_slip_id}...")

    try:
        # STEP 1: Fetch bet slip data from contract
        bet_slip_data = contract.functions.getBetSlip(bet_slip_id).call()
        print("\n=== Bet Slip Details ===")
        print(f"  Bet ID: {bet_slip_id}")
        print(f"  Strategy: {bet_slip_data[0]}")
        print(f"  Initial Collateral: {bet_slip_data[1]}")
        print(f"  Final Collateral: {bet_slip_data[2]}")
        print(f"  Outcome: {bet_slip_data[3]}")
        print(f"  Parent ID: {bet_slip_data[4]}")
        print(f"  Instant Arbitrage: {bet_slip_data[5]}")
        print(f"  Status: {bet_slip_data[6]}")
        print(f"  Failure Reason: {bet_slip_data[7]}")
        print(f"  Marketplace IDs: {decode_bytes32_array(bet_slip_data[8])}")
        print(f"  Market IDs: {decode_bytes32_array(bet_slip_data[9])}")
        print(f"  Proxied Bets: {[bet_id.hex() for bet_id in bet_slip_data[10]]}")
        print("========================\n")

        # STEP 2: Route directly to sell flow since this is a selling state update
        proxied_bet_ids = bet_slip_data[10]  # Array of proxied bet IDs
        print(f"💸 SELLING STATE UPDATE - Processing sell orders...")
        handle_sell_flow(bet_slip_id, bet_slip_data, proxied_bet_ids)

    except Exception as e:
        print(f"🚨 Error processing selling state update: {e}")


def handle_buy_flow(bet_slip_id: int, bet_slip_data):
    """
    Handle the buy flow - execute optimal betting strategy and record bets.
    
    Args:
        bet_slip_id: The bet slip ID
        bet_slip_data: The bet slip data from the contract
    """
    try:
        print(f"⚡ Executing BUY flow for BetSlip ID: {bet_slip_id}...")
        
        # Initialize execution variables
        failure_reason = ""
        execution_result = None
        
        # Extract market and marketplace data with corrected indexing
        market_ids = decode_bytes32_array(bet_slip_data[9])  # marketIds at index 9
        marketplace_ids = decode_bytes32_array(bet_slip_data[8])  # marketplaceIds at index 8
        initial_collateral = bet_slip_data[1]  # initialCollateral at index 1
        
        # Convert wei to USDC (assuming 6 decimals)
        collateral_amount_usdc = initial_collateral / 1_000_000
        
        print(f"  Total amount to bet: {collateral_amount_usdc} USDC")
        print(f"  Markets: {market_ids}")
        print(f"  Marketplaces: {marketplace_ids}")
        
        # STEP 3: Create pool configurations for optimal betting
        pool_configs = create_pool_configs_from_market_data(market_ids, marketplace_ids)
        
        if isinstance(pool_configs, Exception):
            print(f"  ❌ Error creating pool configs: {pool_configs}")
            failure_reason = f"Pool config error: {pool_configs}"
        else:
            # Execute optimal bet allocation
            option = bet_slip_data[3]  # outcomeIndex
            
            print(f"  Executing optimal allocation across {len(pool_configs)} pools...")
            execution_result = execute_optimal_bet(
                pool_configs=pool_configs,
                total_amount=collateral_amount_usdc,
                option=option,
                base_url=BET_EXECUTION_BASE_URL,  # Marketplace adapter API
                optimization_method=OptimizationMethod.GRID_SEARCH,
                dry_run=False  # Set to True for testing
            )

            print(f"Done executing optimal bet. Execution result: {execution_result}")
            
            if isinstance(execution_result, Exception):
                print(f"  ❌ Bet execution failed: {execution_result}")
                failure_reason = f"Execution error: {execution_result}"
            else:
                print(f"  ✅ Bet execution completed: {execution_result}")
                print(f"  Strategy used: {execution_result.strategy_used}")
                print(f"  Success rate: {execution_result.success_rate:.1%}")
                
                # Log successful bets
                for i, bet in enumerate(execution_result.successful_bets, 1):
                    print(f"    {i}. ${bet.collateral_amount:.2f} → {bet.endpoint_name} (market {bet.market_id})")
                
                # Log failed bets
                for i, bet in enumerate(execution_result.failed_bets, 1):
                    print(f"    ❌ Failed bet {i}: {bet.error_message}")
                
                # Record successful bets on the smart contract
                print(f"  📝 Recording {len(execution_result.successful_bets)} successful bets on contract...")
                
                successful_recordings = 0
                for bet in execution_result.successful_bets:
                    # Extract shares bought from API response
                    shares_bought = extract_shares_from_api_response(bet.response_data, bet.collateral_amount)
                    
                    # Record the proxied bet on the contract
                    if record_proxied_bet_on_contract(bet_slip_id, bet, shares_bought, option):
                        successful_recordings += 1
                
                print(f"  ✅ Successfully recorded {successful_recordings}/{len(execution_result.successful_bets)} bets on contract")
                
                failure_reason = "" if execution_result.success_rate > 0 else "All bets failed"

        # Update Bet Slip Status
        update_bet_slip_status(bet_slip_id, pool_configs, execution_result, failure_reason)

    except Exception as e:
        print(f"🚨 Error in buy flow: {e}")


def handle_sell_flow(bet_slip_id: int, bet_slip_data, proxied_bet_ids: list):
    """
    Handle the sell flow - execute sell orders for the specified proxied bets.
    
    Args:
        bet_slip_id: The bet slip ID
        bet_slip_data: The bet slip data from the contract
        proxied_bet_ids: List of proxied bet IDs that need to be sold
    """
    try:
        print(f"💸 Executing SELL flow for BetSlip ID: {bet_slip_id}...")
        print(f"  Selling {len(proxied_bet_ids)} proxied bets...")
        
        successful_sales = 0
        
        for bet_id in proxied_bet_ids:
            try:
                # Get proxied bet details
                proxied_bet_data = contract.functions.getProxiedBet(bet_id).call()
                
                marketplace_id = proxied_bet_data[2]  # marketplaceId at index 2
                market_id = proxied_bet_data[3]       # marketId at index 3
                shares_to_sell = proxied_bet_data[9]  # sharesBought at index 9
                option_index = proxied_bet_data[4]    # optionIndex at index 4
                
                print(f"  📤 Selling bet {bet_id.hex()[:8]}...")
                print(f"     Market: {market_id} on marketplace {marketplace_id}")
                print(f"     Shares to sell: {shares_to_sell}")
                print(f"     Option: {'YES' if option_index == 0 else 'NO'}")
                
                # Get marketplace schema and endpoint
                schema = get_schema_from_marketplace_id(marketplace_id)
                if isinstance(schema, Exception):
                    print(f"     ❌ Error getting schema: {schema}")
                    continue
                
                # Map schema to endpoint
                if schema == "canibeton_variant1":
                    endpoint_name = "slaughterhouse-predictions"
                elif schema == "canibeton_variant2":
                    endpoint_name = "terminal-degeneracy-labs"
                else:
                    print(f"     ❌ Unknown schema: {schema}")
                    continue
                
                # Execute sell order via API
                sell_url = f"{BET_EXECUTION_BASE_URL}/{endpoint_name}/sell-shares"
                sell_payload = {
                    "marketId": market_id,
                    "optionIndex": option_index,
                    "amount": shares_to_sell
                }
                
                print(f"     Making sell request to: {sell_url}")
                print(f"     Payload: {sell_payload}")
                response = requests.post(sell_url, json=sell_payload, timeout=30)
                
                print(f"     Response status: {response.status_code}")
                print(f"     Response headers: {dict(response.headers)}")
                print(f"     Response content: {response.text}")
                
                if response.status_code == 200 or response.status_code == 201:
                    # Safe JSON parsing with error handling
                    try:
                        response_data = response.json() if response.content else {}
                    except ValueError as json_error:
                        print(f"     ❌ Invalid JSON response: {json_error}")
                        print(f"     Raw response: {response.text}")
                        continue
                    
                    print(f"     ✅ Sell successful: {response_data}")
                    
                    # Extract collateral received from sell
                    # New API format returns {"transactionId": "...", "collateralReceived": 3.536336}
                    collateral_received = response_data.get('collateralReceived', 0)
                    if not collateral_received:
                        # Fallback estimation
                        collateral_received = shares_to_sell  # Rough estimate
                    
                    # Record the sell on the contract using recordProxiedBetSold
                    if record_proxied_bet_sold(bet_id, shares_to_sell, collateral_received):
                        successful_sales += 1
                        print(f"     ✅ Recorded sell on contract")
                    else:
                        print(f"     ❌ Failed to record sell on contract")
                else:
                    # Handle error responses
                    try:
                        error_data = response.json() if response.content else {"error": "Empty response"}
                    except ValueError:
                        error_data = {"error": "Invalid JSON response", "raw_response": response.text}
                    
                    print(f"     ❌ Sell failed: HTTP {response.status_code}: {error_data}")
                    
                    # Log slippage errors but don't retry with parameters that don't exist in the API
                    if "SlippageToleranceExceeded" in response.text or "slippage" in response.text.lower():
                        print(f"     ⚠️  Slippage tolerance exceeded - this is handled by the API internally")
            except Exception as bet_error:
                print(f"     🚨 Error selling bet {bet_id.hex()}: {bet_error}")
        
        print(f"  ✅ Successfully sold {successful_sales}/{len(proxied_bet_ids)} bets")
        
        # Update bet slip status to "Closed" after successful selling
        if successful_sales > 0:
            print(f"  📝 Updating bet slip status to 'Closed'...")
            update_bet_slip_status_to_closed(bet_slip_id)
        else:
            print(f"  ❌ No successful sales, keeping current status")

    except Exception as e:
        print(f"🚨 Error in sell flow: {e}")


def record_proxied_bet_sold(bet_id: bytes, shares_sold: int, collateral_received: float) -> bool:
    """
    Record a successful proxied bet sale on the smart contract.
    
    Args:
        bet_id: The proxied bet ID
        shares_sold: Number of shares sold
        collateral_received: Collateral amount received from the sale
        
    Returns:
        True if successful, False otherwise
    """
    try:
        print(f"  📝 Recording proxied bet sale on contract...")
        print(f"     Bet ID: {bet_id.hex()}")
        print(f"     Shares sold: {shares_sold}")
        print(f"     Collateral received: ${collateral_received:.2f}")
        
        # Convert collateral to wei (USDC has 6 decimals)
        collateral_received_wei = int(collateral_received * 1_000_000)
        
        # Get current nonce and gas info
        nonce = w3.eth.get_transaction_count(account.address)
        gas_price = w3.eth.gas_price
        
        # Build transaction
        record_tx = contract.functions.recordProxiedBetSold(
            bet_id,
            int(shares_sold),
            int(collateral_received_wei)
        ).build_transaction({
            "nonce": nonce,
            "gasPrice": gas_price,
            "gas": 300000,
            "chainId": w3.eth.chain_id,
        })
        
        # Sign and send transaction
        signed_tx = w3.eth.account.sign_transaction(record_tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        print(f"     Transaction sent. Tx Hash: {tx_hash.hex()}")
        
        # Wait for transaction to be mined
        try:
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt.status == 1:
                print(f"     ✅ Proxied bet sale recorded successfully!")
                print(f"     Gas used: {receipt.gasUsed}")
                return True
            else:
                print(f"     ❌ Transaction failed! Receipt: {receipt}")
                return False
                
        except Exception as receipt_error:
            print(f"     ❌ Error waiting for transaction receipt: {receipt_error}")
            return False
            
    except Exception as e:
        print(f"  🚨 Error recording proxied bet sale: {e}")
        return False


def update_bet_slip_status(bet_slip_id: int, pool_configs, execution_result, failure_reason: str):
    """
    Update the bet slip status based on execution results.
    
    Args:
        bet_slip_id: The bet slip ID
        pool_configs: Pool configurations (or Exception if failed)
        execution_result: Execution result (or Exception if failed)
        failure_reason: Failure reason string
    """
    try:
        print(f"⏳ Updating status for BetSlip ID: {bet_slip_id}...")

        # BetSlipStatus enum values:
        # Pending(0), Processing(1), Placed(2), Selling(3), Failed(4), Closed(5)
        
        # Determine status based on execution results
        if isinstance(pool_configs, Exception):
            # Failed to create pool configs
            new_status = 4  # Failed
            status_name = "Failed"
        elif execution_result is None or isinstance(execution_result, Exception):
            # Bet execution failed or didn't run
            new_status = 4  # Failed
            status_name = "Failed"
        elif hasattr(execution_result, 'success_rate') and execution_result.success_rate > 0:
            # At least some bets succeeded
            new_status = 2  # Placed
            status_name = "Placed"
        else:
            # All bets failed
            new_status = 4  # Failed
            status_name = "Failed"

        print(f"  Setting status to: {status_name} ({new_status})")

        nonce = w3.eth.get_transaction_count(account.address)
        gas_price = w3.eth.gas_price

        # Build transaction
        update_tx = contract.functions.updateBetSlipStatus(
            bet_slip_id, new_status
        ).build_transaction({
            "nonce": nonce,
            "gasPrice": gas_price,
            "gas": 200000,
            "chainId": w3.eth.chain_id,
        })

        # Sign and send transaction
        signed_tx = w3.eth.account.sign_transaction(update_tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        print(f"  Transaction sent to update status. Tx Hash: {tx_hash.hex()}")

        # Wait for the transaction to be mined
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status == 1:
            print(f"  ✅ Transaction successful! Status for BetSlip ID {bet_slip_id} is now '{status_name}'.")
        else:
            print(f"  ❌ Transaction failed! Could not update status for BetSlip ID {bet_slip_id}.")
            print(f"  Receipt: {receipt}")

    except Exception as e:
        print(f"🚨 Error updating bet slip status: {e}")


def update_bet_slip_status_to_closed(bet_slip_id: int):
    """
    Update the bet slip status to Closed (enum value 5).
    
    Args:
        bet_slip_id: The bet slip ID
    """
    try:
        print(f"⏳ Updating status to 'Closed' for BetSlip ID: {bet_slip_id}...")

        # BetSlipStatus.Closed = 5
        new_status = 5
        status_name = "Closed"

        print(f"  Setting status to: {status_name} ({new_status})")

        nonce = w3.eth.get_transaction_count(account.address)
        gas_price = w3.eth.gas_price

        # Build transaction
        update_tx = contract.functions.updateBetSlipStatus(
            bet_slip_id, new_status
        ).build_transaction({
            "nonce": nonce,
            "gasPrice": gas_price,
            "gas": 200000,
            "chainId": w3.eth.chain_id,
        })

        # Sign and send transaction
        signed_tx = w3.eth.account.sign_transaction(update_tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        print(f"  Transaction sent to update status. Tx Hash: {tx_hash.hex()}")

        # Wait for the transaction to be mined
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status == 1:
            print(f"  ✅ Transaction successful! Status for BetSlip ID {bet_slip_id} is now '{status_name}'.")
        else:
            print(f"  ❌ Transaction failed! Could not update status for BetSlip ID {bet_slip_id}.")
            print(f"  Receipt: {receipt}")

    except Exception as e:
        print(f"🚨 Error updating bet slip status to closed: {e}")


async def log_loop(poll_interval):
    """
    Asynchronously listens for new events and passes them to the appropriate handlers.
    
    Event Routing:
    - BetSlipCreated → BUY FLOW (new bet placements)
    - BetSlipSellingStateUpdate → SELL FLOW (sell order processing)
    """
    last_processed_block = w3.eth.block_number
    print(f"Starting event listener from block: {last_processed_block}")
    print(f"Event Routing: BetSlipCreated→BUY, BetSlipSellingStateUpdate→SELL")

    while True:
        current_block = w3.eth.block_number

        if current_block > last_processed_block:
            try:
                # Get logs for BetSlipCreated events
                bet_slip_created_logs = contract.events.BetSlipCreated.get_logs(
                    from_block=last_processed_block + 1, to_block=current_block
                )

                # Get logs for BetSlipSellingStateUpdate events
                bet_slip_selling_logs = contract.events.BetSlipSellingStateUpdate.get_logs(
                    from_block=last_processed_block + 1, to_block=current_block
                )

                # Process BetSlipCreated events
                for log in bet_slip_created_logs:
                    handle_bet_slip_created_event(log)

                # Process BetSlipSellingStateUpdate events
                for log in bet_slip_selling_logs:
                    handle_bet_slip_selling_state_update_event(log)

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
        f"Listening for 'BetSlipCreated' and 'BetSlipSellingStateUpdate' events on contract: {POLYBETS_CONTRACT_ADDRESS}"
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
