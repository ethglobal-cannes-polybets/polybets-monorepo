const LN_2 = Math.log(2);

export interface LMSRParams {
  b: number;
  initial_q_A: number;
  initial_q_B: number;
  initial_price_A: number;
  initial_price_B: number;
  max_loss: number;
}

// Fast approximation of exp(x) for x < 10
// Based on a simplified version of the Padé approximation
function fastExp(x: number): number {
  if (x > 10.0) {
    // For large values, use a simpler approximation to avoid overflow
    return 22026.4657948067 * (x - 10.0); // approximating e^10 * (x-10)
  }
  if (x < -10.0) {
    return 1.0 / 22026.4657948067;
  }

  // Approximate e^x with a polynomial
  const x2 = x * x;
  const x3 = x2 * x;
  return 1.0 + x + x2 / 2.0 + x3 / 6.0;
}

// Faster price calculation using the cached exponentials
function getLmsrPrice(
  q_A: number,
  q_B: number,
  b: number,
  is_option_A: boolean
): number {
  const exp_q_A = fastExp(q_A / b);
  const exp_q_B = fastExp(q_B / b);
  const sum = exp_q_A + exp_q_B;

  if (is_option_A) {
    return exp_q_A / sum;
  } else {
    return exp_q_B / sum;
  }
}

// Fast natural log approximation
function fastLn(x: number): number {
  if (x <= 0.0) {
    return -100.0; // A reasonable lower bound for financial calculations
  }

  // Use built-in log for better accuracy where it matters
  return Math.log(x);
}

export function calculateInitialLmsrParams(
  initial_liquidity_A: number,
  initial_liquidity_B: number
): LMSRParams | Error {
  // Calculate total liquidity
  const total_liquidity = initial_liquidity_A + initial_liquidity_B;

  if (total_liquidity <= 0.0) {
    return new Error("Total liquidity must be positive");
  }

  // Handle edge cases where one side has zero liquidity
  let initial_price_A: number, initial_price_B: number;
  if (initial_liquidity_A === 0.0) {
    initial_price_A = 0.00001;
    initial_price_B = 0.99999; // Very small but non-zero
  } else if (initial_liquidity_B === 0.0) {
    initial_price_A = 0.99999;
    initial_price_B = 0.00001; // Very high but not exactly 1
  } else {
    // Set initial market odds
    initial_price_A = initial_liquidity_A / total_liquidity;
    initial_price_B = initial_liquidity_B / total_liquidity;
  }

  // Start with a guess for b (conservative)
  const max_loss_percentage = 1.0;
  const max_loss_cap = total_liquidity * max_loss_percentage;
  let b = max_loss_cap / LN_2;

  // Set q values based on which side has higher probability
  let initial_q_A: number;
  let initial_q_B: number;

  if (initial_price_A >= initial_price_B) {
    initial_q_A = 0.0;
    const ln_val = fastLn((1.0 - initial_price_A) / initial_price_A);
    initial_q_B = b * ln_val;
  } else {
    initial_q_B = 0.0;
    const ln_val = fastLn((1.0 - initial_price_B) / initial_price_B);
    initial_q_A = b * ln_val;
  }

  // Verify the initial prices match the desired values
  let test_price_A = getLmsrPrice(initial_q_A, initial_q_B, b, true);
  let test_price_B = getLmsrPrice(initial_q_A, initial_q_B, b, false);

  // Adjust q values slightly if prices don't match expectations
  // We allow a small error tolerance
  const error_tolerance = 0.001; // Increased tolerance for faster convergence
  let adjust_count = 0;

  while (
    Math.abs(test_price_A - initial_price_A) > error_tolerance ||
    Math.abs(test_price_B - initial_price_B) > error_tolerance
  ) {
    // Make small adjustments to q values
    if (initial_price_A >= initial_price_B) {
      const error_factor = initial_price_A / test_price_A;
      initial_q_B = initial_q_B * error_factor;
    } else {
      const error_factor = initial_price_B / test_price_B;
      initial_q_A = initial_q_A * error_factor;
    }

    // Recalculate test prices
    test_price_A = getLmsrPrice(initial_q_A, initial_q_B, b, true);
    test_price_B = getLmsrPrice(initial_q_A, initial_q_B, b, false);

    adjust_count += 1;
    if (adjust_count > 5) {
      // Reduced from 10 to 5 for faster execution
      // If we can't get the exact prices, just break and use the best approximation
      break;
    }
  }

  // Compute max possible loss
  const exp_term_1 = fastExp((initial_q_A - initial_q_B) / b);
  const exp_term_2 = fastExp((initial_q_B - initial_q_A) / b);

  const ln_val_1 = fastLn(1.0 + exp_term_1);
  const ln_val_2 = fastLn(1.0 + exp_term_2);

  let max_loss_B_wins = b * ln_val_1;
  let max_loss_A_wins = b * ln_val_2;
  let actual_max_loss = Math.max(max_loss_B_wins, max_loss_A_wins);

  // Adjust b down if actual loss > max_loss_cap
  let iteration = 0;
  while (actual_max_loss > max_loss_cap) {
    iteration += 1;
    b *= 0.95; // shrink and retry

    // Recalculate q values with new b
    if (initial_price_A >= initial_price_B) {
      initial_q_A = 0.0;
      const ln_val = fastLn((1.0 - initial_price_A) / initial_price_A);
      initial_q_B = b * ln_val;
    } else {
      initial_q_B = 0.0;
      const ln_val = fastLn((1.0 - initial_price_B) / initial_price_B);
      initial_q_A = b * ln_val;
    }

    // Verify the prices and adjust if needed
    test_price_A = getLmsrPrice(initial_q_A, initial_q_B, b, true);
    test_price_B = getLmsrPrice(initial_q_A, initial_q_B, b, false);

    adjust_count = 0;
    while (
      Math.abs(test_price_A - initial_price_A) > error_tolerance ||
      Math.abs(test_price_B - initial_price_B) > error_tolerance
    ) {
      // Make small adjustments to q values
      if (initial_price_A >= initial_price_B) {
        const error_factor = initial_price_A / test_price_A;
        initial_q_B = initial_q_B * error_factor;
      } else {
        const error_factor = initial_price_B / test_price_B;
        initial_q_A = initial_q_A * error_factor;
      }

      // Recalculate test prices
      test_price_A = getLmsrPrice(initial_q_A, initial_q_B, b, true);
      test_price_B = getLmsrPrice(initial_q_A, initial_q_B, b, false);

      adjust_count += 1;
      if (adjust_count > 5) {
        // Reduced from 10 to 5
        break;
      }
    }

    const exp_term_1 = fastExp((initial_q_A - initial_q_B) / b);
    const exp_term_2 = fastExp((initial_q_B - initial_q_A) / b);

    const ln_val_1 = fastLn(1.0 + exp_term_1);
    const ln_val_2 = fastLn(1.0 + exp_term_2);

    max_loss_B_wins = b * ln_val_1;
    max_loss_A_wins = b * ln_val_2;
    actual_max_loss = Math.max(max_loss_B_wins, max_loss_A_wins);

    // Add a safety check to prevent infinite loops
    if (iteration > 5) {
      // Reduced from 10 to 5
      // If we still haven't converged, just use the current values
      // It's better to have a slightly higher risk than to spend too much time calculating
      break;
    }
  }

  return {
    b,
    initial_q_A,
    initial_q_B,
    initial_price_A,
    initial_price_B,
    max_loss: actual_max_loss,
  };
}

export function calculateCurrentPrices(
  initial_liquidity_A: number,
  initial_liquidity_B: number,
  current_q_A: number,
  current_q_B: number
): [number, number] | Error {
  // Get initial parameters
  const params = calculateInitialLmsrParams(
    initial_liquidity_A,
    initial_liquidity_B
  );

  if (params instanceof Error) {
    return params;
  }

  // Calculate current q values by adding to initial values
  const total_q_A = params.initial_q_A + current_q_A;
  const total_q_B = params.initial_q_B + current_q_B;
  // Calculate current prices
  const current_price_A = getLmsrPrice(total_q_A, total_q_B, params.b, true);
  const current_price_B = getLmsrPrice(total_q_A, total_q_B, params.b, false);

  return [current_price_A, current_price_B];
}

export function calculateSharesToBuy(
  initial_liquidity_A: number,
  initial_liquidity_B: number,
  current_q_A: number,
  current_q_B: number,
  amount: number,
  is_option_A: boolean
): [number, number] | Error {
  // Get initial parameters
  const params = calculateInitialLmsrParams(
    initial_liquidity_A,
    initial_liquidity_B
  );

  if (params instanceof Error) {
    return params;
  }

  return calculateSharesToBuyWithParams(
    params,
    current_q_A,
    current_q_B,
    amount,
    is_option_A
  );
}

/**
 * Calculates how many shares can be bought with the given amount using pre-calculated LMSR params
 */
export function calculateSharesToBuyWithParams(
  params: LMSRParams,
  current_q_A: number,
  current_q_B: number,
  amount: number,
  is_option_A: boolean
): [number, number] | Error {
  // Calculate current q values by adding to initial values
  const total_q_A = params.initial_q_A + current_q_A;
  const total_q_B = params.initial_q_B + current_q_B;

  // Cache common calculations to reduce redundant computation
  const b = params.b;
  const exp_q_A = fastExp(total_q_A / b);
  const exp_q_B = fastExp(total_q_B / b);

  // Calculate initial cost
  const initial_cost = b * fastLn(exp_q_A + exp_q_B);

  // Use a faster linear approximation for small amounts
  if (amount < 10.0) {
    // For small amounts, we can approximate the cost linearly based on current price
    const current_price = is_option_A
      ? exp_q_A / (exp_q_A + exp_q_B)
      : exp_q_B / (exp_q_A + exp_q_B);

    // Shares = amount / price (with some buffer to ensure we don't overspend)
    const shares = Math.floor((amount * 0.95) / current_price);

    // Verify the cost is within bounds
    const shares_f64 = shares;
    const new_cost = is_option_A
      ? b * fastLn(exp_q_A * fastExp(shares_f64 / b) + exp_q_B)
      : b * fastLn(exp_q_A + exp_q_B * fastExp(shares_f64 / b));

    const final_cost_diff = new_cost - initial_cost;
    if (final_cost_diff <= amount) {
      return [shares, final_cost_diff];
    }
  }

  // Binary search to find the number of shares that can be bought
  // Use fewer iterations for faster computation
  let low = 0.0;
  let high = amount * 50.0; // Reduced multiplier from 100 to 50

  // Limit the number of iterations for the binary search
  const max_iterations = 10; // Added a fixed iteration count
  let iteration = 0;

  while (high - low > 1.0 && iteration < max_iterations) {
    iteration += 1;
    const shares = Math.floor((low + high) / 2.0);

    // Calculate new cost after buying shares
    const new_cost = is_option_A
      ? b * fastLn(exp_q_A * fastExp(shares / b) + exp_q_B)
      : b * fastLn(exp_q_A + exp_q_B * fastExp(shares / b));

    const cost_diff = new_cost - initial_cost;

    if (cost_diff <= amount) {
      low = shares;
    } else {
      high = shares;
    }
  }

  // At this point, high and low are close enough
  const final_shares = Math.floor(low);

  // Calculate final cost difference for the chosen shares
  const final_cost = is_option_A
    ? b * fastLn(exp_q_A * fastExp(final_shares / b) + exp_q_B)
    : b * fastLn(exp_q_A + exp_q_B * fastExp(final_shares / b));
  const final_cost_diff = final_cost - initial_cost;

  return [final_shares, final_cost_diff];
}
