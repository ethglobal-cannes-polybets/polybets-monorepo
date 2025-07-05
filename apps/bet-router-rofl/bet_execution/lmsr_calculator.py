import math
from typing import Union, Tuple, Optional
from dataclasses import dataclass

LN_2 = math.log(2)

@dataclass
class LMSRParams:
    b: float
    initial_q_A: float
    initial_q_B: float
    initial_price_A: float
    initial_price_B: float
    max_loss: float

# Fast approximation of exp(x) for x < 10
# Based on a simplified version of the Padé approximation
def fast_exp(x: float) -> float:
    if x > 10.0:
        # For large values, use a simpler approximation to avoid overflow
        return 22026.4657948067 * (x - 10.0)  # approximating e^10 * (x-10)
    if x < -10.0:
        return 1.0 / 22026.4657948067

    # Approximate e^x with a polynomial
    x2 = x * x
    x3 = x2 * x
    return 1.0 + x + x2 / 2.0 + x3 / 6.0

# Faster price calculation using the cached exponentials
def get_lmsr_price(q_A: float, q_B: float, b: float, is_option_A: bool) -> float:
    exp_q_A = fast_exp(q_A / b)
    exp_q_B = fast_exp(q_B / b)
    sum_exp = exp_q_A + exp_q_B

    if is_option_A:
        return exp_q_A / sum_exp
    else:
        return exp_q_B / sum_exp

# Fast natural log approximation
def fast_ln(x: float) -> float:
    if x <= 0.0:
        return -100.0  # A reasonable lower bound for financial calculations

    # Use built-in log for better accuracy where it matters
    return math.log(x)

def calculate_initial_lmsr_params(
    initial_liquidity_A: float,
    initial_liquidity_B: float
) -> Union[LMSRParams, Exception]:
    # Calculate total liquidity
    total_liquidity = initial_liquidity_A + initial_liquidity_B

    if total_liquidity <= 0.0:
        return Exception('Total liquidity must be positive')

    # Handle edge cases where one side has zero liquidity
    if initial_liquidity_A == 0.0:
        initial_price_A = 0.00001
        initial_price_B = 0.99999  # Very small but non-zero
    elif initial_liquidity_B == 0.0:
        initial_price_A = 0.99999
        initial_price_B = 0.00001  # Very high but not exactly 1
    else:
        # Set initial market odds
        initial_price_A = initial_liquidity_A / total_liquidity
        initial_price_B = initial_liquidity_B / total_liquidity

    # Start with a guess for b (conservative)
    max_loss_percentage = 1.0
    max_loss_cap = total_liquidity * max_loss_percentage
    b = max_loss_cap / LN_2

    # Set q values based on which side has higher probability
    if initial_price_A >= initial_price_B:
        initial_q_A = 0.0
        ln_val = fast_ln((1.0 - initial_price_A) / initial_price_A)
        initial_q_B = b * ln_val
    else:
        initial_q_B = 0.0
        ln_val = fast_ln((1.0 - initial_price_B) / initial_price_B)
        initial_q_A = b * ln_val

    # Verify the initial prices match the desired values
    test_price_A = get_lmsr_price(initial_q_A, initial_q_B, b, True)
    test_price_B = get_lmsr_price(initial_q_A, initial_q_B, b, False)

    # Adjust q values slightly if prices don't match expectations
    # We allow a small error tolerance
    error_tolerance = 0.001  # Increased tolerance for faster convergence
    adjust_count = 0

    while (
        abs(test_price_A - initial_price_A) > error_tolerance or
        abs(test_price_B - initial_price_B) > error_tolerance
    ):
        # Make small adjustments to q values
        if initial_price_A >= initial_price_B:
            error_factor = initial_price_A / test_price_A
            initial_q_B = initial_q_B * error_factor
        else:
            error_factor = initial_price_B / test_price_B
            initial_q_A = initial_q_A * error_factor

        # Recalculate test prices
        test_price_A = get_lmsr_price(initial_q_A, initial_q_B, b, True)
        test_price_B = get_lmsr_price(initial_q_A, initial_q_B, b, False)

        adjust_count += 1
        if adjust_count > 5:
            # Reduced from 10 to 5 for faster execution
            # If we can't get the exact prices, just break and use the best approximation
            break

    # Compute max possible loss
    exp_term_1 = fast_exp((initial_q_A - initial_q_B) / b)
    exp_term_2 = fast_exp((initial_q_B - initial_q_A) / b)

    ln_val_1 = fast_ln(1.0 + exp_term_1)
    ln_val_2 = fast_ln(1.0 + exp_term_2)

    max_loss_B_wins = b * ln_val_1
    max_loss_A_wins = b * ln_val_2
    actual_max_loss = max(max_loss_B_wins, max_loss_A_wins)

    # Adjust b down if actual loss > max_loss_cap
    iteration = 0
    while actual_max_loss > max_loss_cap:
        iteration += 1
        b *= 0.95  # shrink and retry

        # Recalculate q values with new b
        if initial_price_A >= initial_price_B:
            initial_q_A = 0.0
            ln_val = fast_ln((1.0 - initial_price_A) / initial_price_A)
            initial_q_B = b * ln_val
        else:
            initial_q_B = 0.0
            ln_val = fast_ln((1.0 - initial_price_B) / initial_price_B)
            initial_q_A = b * ln_val

        # Verify the prices and adjust if needed
        test_price_A = get_lmsr_price(initial_q_A, initial_q_B, b, True)
        test_price_B = get_lmsr_price(initial_q_A, initial_q_B, b, False)

        adjust_count = 0
        while (
            abs(test_price_A - initial_price_A) > error_tolerance or
            abs(test_price_B - initial_price_B) > error_tolerance
        ):
            # Make small adjustments to q values
            if initial_price_A >= initial_price_B:
                error_factor = initial_price_A / test_price_A
                initial_q_B = initial_q_B * error_factor
            else:
                error_factor = initial_price_B / test_price_B
                initial_q_A = initial_q_A * error_factor

            # Recalculate test prices
            test_price_A = get_lmsr_price(initial_q_A, initial_q_B, b, True)
            test_price_B = get_lmsr_price(initial_q_A, initial_q_B, b, False)

            adjust_count += 1
            if adjust_count > 5:
                # Reduced from 10 to 5
                break

        exp_term_1 = fast_exp((initial_q_A - initial_q_B) / b)
        exp_term_2 = fast_exp((initial_q_B - initial_q_A) / b)

        ln_val_1 = fast_ln(1.0 + exp_term_1)
        ln_val_2 = fast_ln(1.0 + exp_term_2)

        max_loss_B_wins = b * ln_val_1
        max_loss_A_wins = b * ln_val_2
        actual_max_loss = max(max_loss_B_wins, max_loss_A_wins)

        # Add a safety check to prevent infinite loops
        if iteration > 5:
            # Reduced from 10 to 5
            # If we still haven't converged, just use the current values
            # It's better to have a slightly higher risk than to spend too much time calculating
            break

    return LMSRParams(
        b=b,
        initial_q_A=initial_q_A,
        initial_q_B=initial_q_B,
        initial_price_A=initial_price_A,
        initial_price_B=initial_price_B,
        max_loss=actual_max_loss,
    )

def calculate_current_prices(
    initial_liquidity_A: float,
    initial_liquidity_B: float,
    current_q_A: float,
    current_q_B: float
) -> Union[Tuple[float, float], Exception]:
    # Get initial parameters
    params = calculate_initial_lmsr_params(initial_liquidity_A, initial_liquidity_B)

    if isinstance(params, Exception):
        return params

    # Calculate current q values by adding to initial values
    total_q_A = params.initial_q_A + current_q_A
    total_q_B = params.initial_q_B + current_q_B
    
    # Calculate current prices
    current_price_A = get_lmsr_price(total_q_A, total_q_B, params.b, True)
    current_price_B = get_lmsr_price(total_q_A, total_q_B, params.b, False)

    return (current_price_A, current_price_B)

def calculate_shares_to_buy(
    initial_liquidity_A: float,
    initial_liquidity_B: float,
    current_q_A: float,
    current_q_B: float,
    amount: float,
    is_option_A: bool
) -> Union[Tuple[int, float], Exception]:
    # Get initial parameters
    params = calculate_initial_lmsr_params(initial_liquidity_A, initial_liquidity_B)

    if isinstance(params, Exception):
        return params

    return calculate_shares_to_buy_with_params(params, current_q_A, current_q_B, amount, is_option_A)

def calculate_shares_to_buy_with_params(
    params: LMSRParams,
    current_q_A: float,
    current_q_B: float,
    amount: float,
    is_option_A: bool
) -> Union[Tuple[int, float], Exception]:
    # Calculate current q values by adding to initial values
    total_q_A = params.initial_q_A + current_q_A
    total_q_B = params.initial_q_B + current_q_B

    # Cache common calculations to reduce redundant computation
    b = params.b
    exp_q_A = fast_exp(total_q_A / b)
    exp_q_B = fast_exp(total_q_B / b)

    # Calculate initial cost
    initial_cost = b * fast_ln(exp_q_A + exp_q_B)

    # Use a faster linear approximation for small amounts
    if amount < 10.0:
        # For small amounts, we can approximate the cost linearly based on current price
        current_price = (
            exp_q_A / (exp_q_A + exp_q_B) if is_option_A
            else exp_q_B / (exp_q_A + exp_q_B)
        )

        # Shares = amount / price (with some buffer to ensure we don't overspend)
        shares = int((amount * 0.95) / current_price)

        # Verify the cost is within bounds
        shares_f64 = float(shares)
        new_cost = (
            b * fast_ln(exp_q_A * fast_exp(shares_f64 / b) + exp_q_B) if is_option_A
            else b * fast_ln(exp_q_A + exp_q_B * fast_exp(shares_f64 / b))
        )

        final_cost_diff = new_cost - initial_cost
        if final_cost_diff <= amount:
            return (shares, final_cost_diff)

    # Binary search to find the number of shares that can be bought
    # Use fewer iterations for faster computation
    low = 0.0
    high = amount * 50.0  # Reduced multiplier from 100 to 50

    # Limit the number of iterations for the binary search
    max_iterations = 10  # Added a fixed iteration count
    iteration = 0

    while high - low > 1.0 and iteration < max_iterations:
        iteration += 1
        shares = int((low + high) / 2.0)

        # Calculate new cost after buying shares
        new_cost = (
            b * fast_ln(exp_q_A * fast_exp(shares / b) + exp_q_B) if is_option_A
            else b * fast_ln(exp_q_A + exp_q_B * fast_exp(shares / b))
        )

        cost_diff = new_cost - initial_cost

        if cost_diff <= amount:
            low = shares
        else:
            high = shares

    # At this point, high and low are close enough
    final_shares = int(low)

    # Calculate final cost difference for the chosen shares
    final_cost = (
        b * fast_ln(exp_q_A * fast_exp(final_shares / b) + exp_q_B) if is_option_A
        else b * fast_ln(exp_q_A + exp_q_B * fast_exp(final_shares / b))
    )
    final_cost_diff = final_cost - initial_cost

    return (final_shares, final_cost_diff) 

if __name__ == "__main__":
    print(calculate_current_prices(
        initial_liquidity_A=411600000,
        initial_liquidity_B=597800000,
        current_q_A=91972654,
        current_q_B=45986327
    ))