from typing import Union, Tuple, Optional, Dict, Any, List, Callable
from dataclasses import dataclass
from .get_lmsr_data import get_lmsr_data_with_auto_connection, LMSRData
from .lmsr_calculator import calculate_shares_to_buy
import itertools
import numpy as np
from enum import Enum

try:
    from scipy.optimize import minimize, minimize_scalar
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False

class OptimizationMethod(Enum):
    GRID_SEARCH = "grid_search"
    BINARY_SEARCH = "binary_search"
    GRADIENT_DESCENT = "gradient_descent"
    CONVEX_OPTIMIZATION = "convex_optimization"

class MarketType(Enum):
    LMSR = "lmsr"  # Automated Market Maker with LMSR
    ORDER_BOOK = "order_book"  # Traditional order book

@dataclass
class PoolConfig:
    pool_id: int
    schema: str
    name: str = ""  # Optional name for easier identification
    market_type: MarketType = MarketType.LMSR  # Default to LMSR

@dataclass
class BettingOption:
    pool_config: PoolConfig
    is_option_A: bool
    shares: int
    actual_cost: float
    efficiency: float  # shares per dollar
    
    @property
    def option_name(self) -> str:
        return "A (YES)" if self.is_option_A else "B (NO)"

@dataclass
class OptimalBettingResult:
    best_option: BettingOption
    all_options: list[BettingOption]
    amount_requested: float
    savings: float  # How much money saved compared to worst option
    
    def __str__(self) -> str:
        return (f"Best bet: Pool {self.best_option.pool_config.pool_id} "
                f"({self.best_option.pool_config.schema}) - Option {self.best_option.option_name}\n"
                f"Shares: {self.best_option.shares}, Cost: ${self.best_option.actual_cost:.2f}, "
                f"Efficiency: {self.best_option.efficiency:.4f} shares/$\n"
                f"Savings: ${self.savings:.2f}")

@dataclass
class AllocationResult:
    pool_config: PoolConfig
    amount_allocated: float
    shares_received: int
    actual_cost: float
    efficiency: float  # shares per dollar for this allocation

@dataclass
class OptimalAllocation:
    total_shares: int
    total_cost: float
    allocations: List[AllocationResult]
    efficiency: float  # overall shares per dollar
    
    def __str__(self) -> str:
        result = f"Optimal Allocation: {self.total_shares} shares for ${self.total_cost:.2f} ({self.efficiency:.4f} shares/$)\n"
        for i, alloc in enumerate(self.allocations, 1):
            if alloc.amount_allocated > 0:
                result += f"  {i}. Pool {alloc.pool_config.pool_id}: ${alloc.amount_allocated:.2f} → {alloc.shares_received} shares\n"
        return result.strip()

# Market Interface and Implementations
class MarketInterface:
    """Abstract interface for different market types."""
    
    def calculate_shares_and_cost(self, pool_config: PoolConfig, amount: float, option: int) -> Union[Tuple[int, float], Exception]:
        """
        Calculate shares and actual cost for a given amount and option.
        
        Args:
            pool_config: Pool configuration
            amount: Amount to invest
            option: Option to bet on (0 for A/YES, 1 for B/NO)
            
        Returns:
            Tuple of (shares, actual_cost) or Exception if error
        """
        raise NotImplementedError("Subclasses must implement calculate_shares_and_cost")
    
    def get_current_price(self, pool_config: PoolConfig, option: int) -> Union[float, Exception]:
        """
        Get current price for an option.
        
        Args:
            pool_config: Pool configuration
            option: Option to get price for (0 for A/YES, 1 for B/NO)
            
        Returns:
            Current price or Exception if error
        """
        raise NotImplementedError("Subclasses must implement get_current_price")

class LMSRMarket(MarketInterface):
    """LMSR Automated Market Maker implementation."""
    
    def calculate_shares_and_cost(self, pool_config: PoolConfig, amount: float, option: int) -> Union[Tuple[int, float], Exception]:
        """Calculate shares and cost using LMSR algorithm."""
        try:
            if amount <= 0:
                return (0, 0.0)
            
            # Get LMSR data for the pool
            lmsr_data = get_lmsr_data_with_auto_connection(pool_config.pool_id, pool_config.schema)
            
            if isinstance(lmsr_data, Exception):
                return Exception(f"Error getting LMSR data for pool {pool_config.pool_id}: {lmsr_data}")
            
            # Calculate shares for the specific option and amount
            is_option_A = (option == 0)
            shares_result = calculate_shares_to_buy(
                lmsr_data.initial_liquidity_A,
                lmsr_data.initial_liquidity_B,
                lmsr_data.current_q_A,
                lmsr_data.current_q_B,
                amount,
                is_option_A
            )
            
            if isinstance(shares_result, tuple):
                return shares_result  # (shares, actual_cost)
            else:
                return Exception(f"Error calculating shares: {shares_result}")
                
        except Exception as e:
            return Exception(f"Error in LMSRMarket.calculate_shares_and_cost: {str(e)}")
    
    def get_current_price(self, pool_config: PoolConfig, option: int) -> Union[float, Exception]:
        """Get current price using LMSR algorithm."""
        try:
            from get_lmsr_data import get_current_prices_from_db
            
            prices = get_current_prices_from_db(pool_config.pool_id, pool_config.schema)
            
            if isinstance(prices, Exception):
                return prices
            
            return prices[option]  # 0 for A/YES, 1 for B/NO
            
        except Exception as e:
            return Exception(f"Error in LMSRMarket.get_current_price: {str(e)}")

class OrderBookMarket(MarketInterface):
    """Order Book market implementation (for future integration)."""
    
    def __init__(self, order_book_data: Dict = None):
        self.order_book_data = order_book_data or {}
    
    def calculate_shares_and_cost(self, pool_config: PoolConfig, amount: float, option: int) -> Union[Tuple[int, float], Exception]:
        """Calculate shares and cost using order book data."""
        try:
            # For order book, we can assume linear pricing: cost = shares * price
            # This is a placeholder implementation for future integration
            
            current_price = self.get_current_price(pool_config, option)
            if isinstance(current_price, Exception):
                return current_price
            
            # Simple calculation: shares = amount / price
            shares = int(amount / current_price)
            actual_cost = shares * current_price
            
            return (shares, actual_cost)
            
        except Exception as e:
            return Exception(f"Error in OrderBookMarket.calculate_shares_and_cost: {str(e)}")
    
    def get_current_price(self, pool_config: PoolConfig, option: int) -> Union[float, Exception]:
        """Get current price from order book data."""
        try:
            # Placeholder implementation - in real use, this would query order book API
            # For now, return a default price
            return 0.5  # 50 cents per share
            
        except Exception as e:
            return Exception(f"Error in OrderBookMarket.get_current_price: {str(e)}")

# Market factory
def get_market_instance(market_type: MarketType) -> MarketInterface:
    """Get market instance based on market type."""
    if market_type == MarketType.LMSR:
        return LMSRMarket()
    elif market_type == MarketType.ORDER_BOOK:
        return OrderBookMarket()
    else:
        raise ValueError(f"Unsupported market type: {market_type}")

def get_betting_options_for_pool(
    pool_config: PoolConfig,
    amount: float,
    option: int
) -> Union[list[BettingOption], Exception]:
    """
    Get betting options for a single pool.
    
    Args:
        pool_config: Pool configuration (pool_id and schema)
        amount: Amount of money to bet
        option: Specific option to bet on (0 for A/YES, 1 for B/NO)
        
    Returns:
        List of BettingOption objects, or Exception if error
    """
    try:
        # Get LMSR data for the pool
        lmsr_data = get_lmsr_data_with_auto_connection(pool_config.pool_id, pool_config.schema)
        
        if isinstance(lmsr_data, Exception):
            return Exception(f"Error getting LMSR data for pool {pool_config.pool_id}: {lmsr_data}")
        
        options = []
        
        if option not in [0, 1]:
            return Exception(f"Invalid option: {option}. Must be 0 (A/YES) or 1 (B/NO)")
        
        is_option_A = (option == 0)
        shares_result = calculate_shares_to_buy(
            lmsr_data.initial_liquidity_A,
            lmsr_data.initial_liquidity_B,
            lmsr_data.current_q_A,
            lmsr_data.current_q_B,
            amount,
            is_option_A
        )
        
        if isinstance(shares_result, tuple):
            shares, cost = shares_result
            efficiency = shares / cost if cost > 0 else 0
            
            options.append(BettingOption(
                pool_config=pool_config,
                is_option_A=is_option_A,
                shares=shares,
                actual_cost=cost,
                efficiency=efficiency
            ))
        else:
            option_name = "A (YES)" if is_option_A else "B (NO)"
            return Exception(f"Error calculating shares for option {option_name} in pool {pool_config.pool_id}: {shares_result}")
        
        
        
        return options
        
    except Exception as e:
        return Exception(f"Error in get_betting_options_for_pool: {str(e)}")

def find_optimal_betting_strategy(
    pool_configs: list[PoolConfig],
    amount: float,
    option: int
) -> Union[OptimalBettingResult, Exception]:
    """
    Find the optimal betting strategy across multiple pools.
    
    Args:
        pool_configs: List of pool configurations to compare
        amount: Amount of money to bet
        option: Specific option to bet on (0 for A/YES, 1 for B/NO)
        
    Returns:
        OptimalBettingResult with the best option and comparison data, or Exception if error
    """
    try:
        all_options = []
        
        # Get betting options for each pool
        for pool_config in pool_configs:
            options = get_betting_options_for_pool(pool_config, amount, option)
            
            if isinstance(options, Exception):
                return options
            
            all_options.extend(options)
        
        if not all_options:
            return Exception("No valid betting options found")
        
        # Sort by efficiency (shares per dollar) in descending order
        all_options.sort(key=lambda x: x.efficiency, reverse=True)
        
        best_option = all_options[0]
        worst_option = all_options[-1]
        
        # Calculate potential savings
        savings = worst_option.actual_cost - best_option.actual_cost
        
        return OptimalBettingResult(
            best_option=best_option,
            all_options=all_options,
            amount_requested=amount,
            savings=max(0, savings)  # Ensure non-negative
        )
        
    except Exception as e:
        return Exception(f"Error in find_optimal_betting_strategy: {str(e)}")

def compare_two_pools(
    pool_id_1: int,
    schema_1: str,
    pool_id_2: int,
    schema_2: str,
    amount: float,
    option: int,
    pool_1_name: str = "Pool 1",
    pool_2_name: str = "Pool 2"
) -> Union[OptimalBettingResult, Exception]:
    """
    Compare betting opportunities between two pools representing the same market.
    
    Args:
        pool_id_1: First pool ID
        schema_1: First pool schema
        pool_id_2: Second pool ID
        schema_2: Second pool schema
        amount: Amount of money to bet
        option: Specific option to bet on (0 for A/YES, 1 for B/NO)
        pool_1_name: Optional name for first pool
        pool_2_name: Optional name for second pool
        
    Returns:
        OptimalBettingResult with the best option, or Exception if error
    """
    pool_configs = [
        PoolConfig(pool_id=pool_id_1, schema=schema_1, name=pool_1_name),
        PoolConfig(pool_id=pool_id_2, schema=schema_2, name=pool_2_name)
    ]
    
    return find_optimal_betting_strategy(pool_configs, amount, option)

def analyze_betting_efficiency(
    pool_configs: list[PoolConfig],
    amount: float,
    option: int
) -> Union[Dict[str, Any], Exception]:
    """
    Provide detailed analysis of betting efficiency across pools.
    
    Args:
        pool_configs: List of pool configurations
        amount: Amount of money to bet
        option: Specific option to bet on (0 for A/YES, 1 for B/NO)
        
    Returns:
        Dictionary with detailed analysis, or Exception if error
    """
    try:
        result = find_optimal_betting_strategy(pool_configs, amount, option)
        
        if isinstance(result, Exception):
            return result
        
        analysis = {
            "optimal_choice": {
                "pool_id": result.best_option.pool_config.pool_id,
                "schema": result.best_option.pool_config.schema,
                "option": result.best_option.option_name,
                "shares": result.best_option.shares,
                "cost": result.best_option.actual_cost,
                "efficiency": result.best_option.efficiency
            },
            "all_options": [],
            "comparison": {
                "amount_requested": amount,
                "potential_savings": result.savings,
                "efficiency_range": {
                    "best": result.all_options[0].efficiency,
                    "worst": result.all_options[-1].efficiency
                },
                "option_filter": option
            }
        }
        
        for option_item in result.all_options:
            analysis["all_options"].append({
                "pool_id": option_item.pool_config.pool_id,
                "schema": option_item.pool_config.schema,
                "pool_name": option_item.pool_config.name,
                "option": option_item.option_name,
                "shares": option_item.shares,
                "cost": option_item.actual_cost,
                "efficiency": option_item.efficiency,
                "rank": result.all_options.index(option_item) + 1
            })
        
        return analysis
        
    except Exception as e:
        return Exception(f"Error in analyze_betting_efficiency: {str(e)}")

def find_best_pool_for_option(
    pool_configs: list[PoolConfig],
    amount: float,
    option: int
) -> Union[OptimalBettingResult, Exception]:
    """
    Find the best pool to bet on a specific option (YES/NO).
    
    This is a focused function for when you know you want to bet on a specific outcome
    and just want to find the optimal pool for that bet.
    
    Args:
        pool_configs: List of pool configurations to compare
        amount: Amount of money to bet
        option: Option to bet on (0 for A/YES, 1 for B/NO)
        
    Returns:
        OptimalBettingResult with the best pool for the specified option, or Exception if error
    """
    if option not in [0, 1]:
        return Exception(f"Invalid option: {option}. Must be 0 (A/YES) or 1 (B/NO)")
    
    return find_optimal_betting_strategy(pool_configs, amount, option)



def get_option_name(option: int) -> str:
    """Helper function to get option name from option number."""
    return "A (YES)" if option == 0 else "B (NO)"

def calculate_shares_for_allocation(
    pool_config: PoolConfig,
    amount: float,
    option: int
) -> Union[Tuple[int, float], Exception]:
    """
    Calculate shares and actual cost for a specific amount in a specific pool.
    
    Args:
        pool_config: Pool configuration
        amount: Amount to allocate to this pool
        option: Option to bet on (0 for A/YES, 1 for B/NO)
        
    Returns:
        Tuple of (shares, actual_cost) or Exception if error
    """
    try:
        if amount <= 0:
            return (0, 0.0)
        
        # Use market interface to calculate shares and cost
        market = get_market_instance(pool_config.market_type)
        return market.calculate_shares_and_cost(pool_config, amount, option)
            
    except Exception as e:
        return Exception(f"Error in calculate_shares_for_allocation: {str(e)}")

def find_optimal_allocation(
    pool_configs: List[PoolConfig],
    total_amount: float,
    option: int,
    optimization_method: OptimizationMethod = OptimizationMethod.GRID_SEARCH,
    precision: int = 3
) -> Union[OptimalAllocation, Exception]:
    """
    Find the optimal allocation of money across pools to maximize total shares.
    
    Args:
        pool_configs: List of pool configurations (any number of pools)
        total_amount: Total amount of money to allocate
        option: Option to bet on (0 for A/YES, 1 for B/NO)
        optimization_method: Optimization method to use (default: GRID_SEARCH)
        precision: Number of allocation steps to try per pool (higher = more precise but slower)
        
    Returns:
        OptimalAllocation with the best allocation strategy, or Exception if error
    """
    try:
        if len(pool_configs) == 0:
            return Exception("No pools provided")
        
        if len(pool_configs) == 1:
            # Only one pool, allocate everything to it
            result = calculate_shares_for_allocation(pool_configs[0], total_amount, option)
            if isinstance(result, Exception):
                return result
            
            shares, cost = result
            efficiency = shares / cost if cost > 0 else 0
            
            return OptimalAllocation(
                total_shares=shares,
                total_cost=cost,
                allocations=[AllocationResult(
                    pool_config=pool_configs[0],
                    amount_allocated=total_amount,
                    shares_received=shares,
                    actual_cost=cost,
                    efficiency=efficiency
                )],
                efficiency=efficiency
            )
        
        # Route to appropriate optimization method
        if optimization_method == OptimizationMethod.GRID_SEARCH:
            return _optimize_with_grid_search(pool_configs, total_amount, option, precision)
        elif optimization_method == OptimizationMethod.BINARY_SEARCH:
            return _optimize_with_binary_search(pool_configs, total_amount, option)
        elif optimization_method == OptimizationMethod.GRADIENT_DESCENT:
            return _optimize_with_gradient_descent(pool_configs, total_amount, option, precision)
        elif optimization_method == OptimizationMethod.CONVEX_OPTIMIZATION:
            return _optimize_with_convex_optimization(pool_configs, total_amount, option)
        else:
            return Exception(f"Unsupported optimization method: {optimization_method}")
            
    except Exception as e:
        return Exception(f"Error in find_optimal_allocation: {str(e)}")

# Optimization Method Implementations

def _optimize_with_grid_search(
    pool_configs: List[PoolConfig],
    total_amount: float,
    option: int,
    precision: int = 20
) -> Union[OptimalAllocation, Exception]:
    """Grid search optimization - the original method."""
    try:
        # Multi-pool optimization: try different allocation combinations
        best_allocation = None
        best_total_shares = 0
        
        # Generate allocation percentages that sum to 1.0
        # For N pools, we need N-1 variables (last one is determined)
        num_pools = len(pool_configs)
        step_size = 1.0 / precision
        
        # Generate all possible allocation combinations
        # This is computationally expensive for many pools, but works for any number
        def generate_allocations(remaining_amount: float, pool_index: int, current_allocation: List[float]) -> List[List[float]]:
            if pool_index == num_pools - 1:
                # Last pool gets remaining amount
                return [current_allocation + [remaining_amount]]
            
            allocations = []
            max_steps = min(precision + 1, int(remaining_amount / step_size) + 1)
            
            for step in range(max_steps):
                amount_for_this_pool = step * step_size
                if amount_for_this_pool <= remaining_amount:
                    remaining = remaining_amount - amount_for_this_pool
                    allocations.extend(generate_allocations(
                        remaining, 
                        pool_index + 1, 
                        current_allocation + [amount_for_this_pool]
                    ))
            
            return allocations
        
        # Limit combinations for performance (for large numbers of pools)
        if num_pools <= 3:
            # Full search for small number of pools
            allocation_combinations = generate_allocations(1.0, 0, [])
        else:
            # For many pools, use a heuristic approach
            # Try equal allocation plus some variations
            allocation_combinations = []
            
            # Equal allocation
            equal_pct = 1.0 / num_pools
            allocation_combinations.append([equal_pct] * num_pools)
            
            # Try favoring each pool
            for favor_pool in range(num_pools):
                allocation = [equal_pct * 0.5] * num_pools  # Others get half
                allocation[favor_pool] = 1.0 - sum(allocation) + allocation[favor_pool]  # Favored gets rest
                if all(x >= 0 for x in allocation):  # Valid allocation
                    allocation_combinations.append(allocation)
        
        # print(f"  Allocation combinations: {allocation_combinations}")
        # Test each allocation combination
        for allocation_percentages in allocation_combinations:
            if abs(sum(allocation_percentages) - 1.0) > 0.001:  # Skip invalid allocations
                continue
                
            allocation_amounts = [total_amount * pct for pct in allocation_percentages]
            
            # Calculate shares for each pool with this allocation
            pool_results = []
            total_shares = 0
            total_cost = 0
            valid_allocation = True
            
            for i, (pool_config, amount) in enumerate(zip(pool_configs, allocation_amounts)):
                if amount > 0:
                    result = calculate_shares_for_allocation(pool_config, amount, option)
                    # print(f"  Result: {result} for pool {pool_config} and amount {amount}")
                    if isinstance(result, Exception):
                        valid_allocation = False
                        break
                    
                    shares, cost = result
                    pool_results.append(AllocationResult(
                        pool_config=pool_config,
                        amount_allocated=amount,
                        shares_received=shares,
                        actual_cost=cost,
                        efficiency=shares / cost if cost > 0 else 0
                    ))
                    total_shares += shares
                    total_cost += cost
                else:
                    # Zero allocation to this pool
                    pool_results.append(AllocationResult(
                        pool_config=pool_config,
                        amount_allocated=0.0,
                        shares_received=0,
                        actual_cost=0.0,
                        efficiency=0.0
                    ))
            
            # print(f"  Total shares: {total_shares} for allocation {allocation_percentages}")
            if valid_allocation and total_shares > best_total_shares:
                best_total_shares = total_shares
                overall_efficiency = total_shares / total_cost if total_cost > 0 else 0
                
                best_allocation = OptimalAllocation(
                    total_shares=total_shares,
                    total_cost=total_cost,
                    allocations=pool_results,
                    efficiency=overall_efficiency
                )
        
        if best_allocation is None:
            return Exception("No valid allocation found")
        
        return best_allocation
        
    except Exception as e:
        return Exception(f"Error in _optimize_with_grid_search: {str(e)}")

def _optimize_with_binary_search(
    pool_configs: List[PoolConfig],
    total_amount: float,
    option: int
) -> Union[OptimalAllocation, Exception]:
    """Binary search optimization - good for two pools."""
    try:
        if len(pool_configs) != 2:
            return Exception("Binary search optimization is designed for exactly 2 pools")
        
        def objective_function(allocation_to_pool_1: float) -> int:
            """Objective function: returns negative total shares (for minimization)."""
            if allocation_to_pool_1 < 0 or allocation_to_pool_1 > total_amount:
                return -1  # Invalid allocation
            
            allocation_to_pool_2 = total_amount - allocation_to_pool_1
            
            # Calculate shares for each pool
            result_1 = calculate_shares_for_allocation(pool_configs[0], allocation_to_pool_1, option)
            result_2 = calculate_shares_for_allocation(pool_configs[1], allocation_to_pool_2, option)
            
            if isinstance(result_1, Exception) or isinstance(result_2, Exception):
                return -1  # Invalid allocation
            
            shares_1, _ = result_1
            shares_2, _ = result_2
            
            return shares_1 + shares_2
        
        # Binary search for optimal allocation
        left, right = 0.0, total_amount
        epsilon = total_amount * 0.001  # 0.1% precision
        
        best_allocation_amount = 0.0
        best_total_shares = 0
        
        # Use ternary search for unimodal function
        while right - left > epsilon:
            mid1 = left + (right - left) / 3
            mid2 = right - (right - left) / 3
            
            shares_1 = objective_function(mid1)
            shares_2 = objective_function(mid2)
            
            if shares_1 > best_total_shares:
                best_total_shares = shares_1
                best_allocation_amount = mid1
            
            if shares_2 > best_total_shares:
                best_total_shares = shares_2
                best_allocation_amount = mid2
            
            if shares_1 < shares_2:
                left = mid1
            else:
                right = mid2
        
        # Calculate final allocation
        optimal_allocation_1 = best_allocation_amount
        optimal_allocation_2 = total_amount - optimal_allocation_1
        
        result_1 = calculate_shares_for_allocation(pool_configs[0], optimal_allocation_1, option)
        result_2 = calculate_shares_for_allocation(pool_configs[1], optimal_allocation_2, option)
        
        if isinstance(result_1, Exception) or isinstance(result_2, Exception):
            return Exception("Error in final allocation calculation")
        
        shares_1, cost_1 = result_1
        shares_2, cost_2 = result_2
        
        total_shares = shares_1 + shares_2
        total_cost = cost_1 + cost_2
        overall_efficiency = total_shares / total_cost if total_cost > 0 else 0
        
        return OptimalAllocation(
            total_shares=total_shares,
            total_cost=total_cost,
            allocations=[
                AllocationResult(
                    pool_config=pool_configs[0],
                    amount_allocated=optimal_allocation_1,
                    shares_received=shares_1,
                    actual_cost=cost_1,
                    efficiency=shares_1 / cost_1 if cost_1 > 0 else 0
                ),
                AllocationResult(
                    pool_config=pool_configs[1],
                    amount_allocated=optimal_allocation_2,
                    shares_received=shares_2,
                    actual_cost=cost_2,
                    efficiency=shares_2 / cost_2 if cost_2 > 0 else 0
                )
            ],
            efficiency=overall_efficiency
        )
        
    except Exception as e:
        return Exception(f"Error in _optimize_with_binary_search: {str(e)}")

def _optimize_with_gradient_descent(
    pool_configs: List[PoolConfig],
    total_amount: float,
    option: int,
    max_iterations: int = 100
) -> Union[OptimalAllocation, Exception]:
    """Gradient descent optimization - good for multiple pools."""
    try:
        num_pools = len(pool_configs)
        
        if num_pools < 2:
            return Exception("Gradient descent requires at least 2 pools")
        
        # Initialize with equal allocation
        allocation_percentages = np.array([1.0 / num_pools] * num_pools)
        learning_rate = 0.01
        epsilon = 1e-6
        
        def calculate_objective(percentages: np.ndarray) -> float:
            """Calculate total shares for given allocation percentages."""
            if not np.isclose(np.sum(percentages), 1.0) or np.any(percentages < 0):
                return -1  # Invalid allocation
            
            total_shares = 0
            for i, pct in enumerate(percentages):
                amount = total_amount * pct
                if amount > 0:
                    result = calculate_shares_for_allocation(pool_configs[i], amount, option)
                    if isinstance(result, Exception):
                        return -1
                    shares, _ = result
                    total_shares += shares
            
            return total_shares
        
        def calculate_gradient(percentages: np.ndarray) -> np.ndarray:
            """Calculate gradient using finite differences."""
            gradient = np.zeros(num_pools)
            delta = 1e-6
            
            for i in range(num_pools):
                # Forward difference
                percentages_plus = percentages.copy()
                percentages_plus[i] += delta
                
                # Renormalize
                print("In calculate_gradient, percentages_plus", percentages_plus)
                percentages_plus = percentages_plus / np.sum(percentages_plus)
                
                obj_plus = calculate_objective(percentages_plus)
                obj_current = calculate_objective(percentages)
                
                if obj_plus > 0 and obj_current > 0:
                    gradient[i] = (obj_plus - obj_current) / delta
            
            return gradient
        
        # Gradient descent iterations
        for iteration in range(max_iterations):
            gradient = calculate_gradient(allocation_percentages)
            
            # Update allocation percentages
            allocation_percentages += learning_rate * gradient
            
            # Project to simplex (ensure sum = 1 and all >= 0)
            allocation_percentages = np.maximum(allocation_percentages, 0)
            print("In gradient descent, allocation_percentages", allocation_percentages)
            allocation_percentages = allocation_percentages / np.sum(allocation_percentages)
            
            # Check convergence
            if np.linalg.norm(gradient) < epsilon:
                break
        
        # Calculate final allocation
        allocation_amounts = [total_amount * pct for pct in allocation_percentages]
        
        pool_results = []
        total_shares = 0
        total_cost = 0
        
        for i, (pool_config, amount) in enumerate(zip(pool_configs, allocation_amounts)):
            if amount > 0:
                result = calculate_shares_for_allocation(pool_config, amount, option)
                if isinstance(result, Exception):
                    return Exception(f"Error calculating final allocation for pool {i}")
                
                shares, cost = result
                pool_results.append(AllocationResult(
                    pool_config=pool_config,
                    amount_allocated=amount,
                    shares_received=shares,
                    actual_cost=cost,
                    efficiency=shares / cost if cost > 0 else 0
                ))
                total_shares += shares
                total_cost += cost
            else:
                pool_results.append(AllocationResult(
                    pool_config=pool_config,
                    amount_allocated=0.0,
                    shares_received=0,
                    actual_cost=0.0,
                    efficiency=0.0
                ))
        
        overall_efficiency = total_shares / total_cost if total_cost > 0 else 0
        
        return OptimalAllocation(
            total_shares=total_shares,
            total_cost=total_cost,
            allocations=pool_results,
            efficiency=overall_efficiency
        )
        
    except Exception as e:
        return Exception(f"Error in _optimize_with_gradient_descent: {str(e)}")

def _optimize_with_convex_optimization(
    pool_configs: List[PoolConfig],
    total_amount: float,
    option: int
) -> Union[OptimalAllocation, Exception]:
    """Convex optimization using scipy.optimize - most efficient for LMSR."""
    try:
        if not SCIPY_AVAILABLE:
            return Exception("Scipy not available. Please install scipy for convex optimization.")
        
        num_pools = len(pool_configs)
        
        if num_pools < 2:
            return Exception("Convex optimization requires at least 2 pools")
        
        def objective_function(allocation_percentages: np.ndarray) -> float:
            """Objective function: returns negative total shares (for minimization)."""
            # Ensure valid allocation
            if not np.isclose(np.sum(allocation_percentages), 1.0, atol=1e-6) or np.any(allocation_percentages < 0):
                return 1e10  # Large penalty for invalid allocation
            
            total_shares = 0
            for i, pct in enumerate(allocation_percentages):
                amount = total_amount * pct
                if amount > 0:
                    result = calculate_shares_for_allocation(pool_configs[i], amount, option)
                    if isinstance(result, Exception):
                        return 1e10  # Large penalty for error
                    shares, _ = result
                    total_shares += shares
            
            return -total_shares  # Negative for minimization
        
        # Constraints: sum of percentages = 1
        constraints = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0}]
        
        # Bounds: each percentage between 0 and 1
        bounds = [(0, 1) for _ in range(num_pools)]
        
        # Initial guess: equal allocation
        initial_guess = np.array([1.0 / num_pools] * num_pools)
        
        # Optimize
        result = minimize(
            objective_function,
            initial_guess,
            method='SLSQP',  # Sequential Least Squares Programming
            bounds=bounds,
            constraints=constraints,
            options={'maxiter': 1000, 'ftol': 1e-9}
        )
        
        if not result.success:
            return Exception(f"Convex optimization failed: {result.message}")
        
        # Calculate final allocation
        optimal_percentages = result.x
        allocation_amounts = [total_amount * pct for pct in optimal_percentages]
        
        pool_results = []
        total_shares = 0
        total_cost = 0
        
        for i, (pool_config, amount) in enumerate(zip(pool_configs, allocation_amounts)):
            if amount > 0:
                calc_result = calculate_shares_for_allocation(pool_config, amount, option)
                if isinstance(calc_result, Exception):
                    return Exception(f"Error calculating final allocation for pool {i}")
                
                shares, cost = calc_result
                pool_results.append(AllocationResult(
                    pool_config=pool_config,
                    amount_allocated=amount,
                    shares_received=shares,
                    actual_cost=cost,
                    efficiency=shares / cost if cost > 0 else 0
                ))
                total_shares += shares
                total_cost += cost
            else:
                pool_results.append(AllocationResult(
                    pool_config=pool_config,
                    amount_allocated=0.0,
                    shares_received=0,
                    actual_cost=0.0,
                    efficiency=0.0
                ))
        
        overall_efficiency = total_shares / total_cost if total_cost > 0 else 0
        
        return OptimalAllocation(
            total_shares=total_shares,
            total_cost=total_cost,
            allocations=pool_results,
            efficiency=overall_efficiency
        )
        
    except Exception as e:
        return Exception(f"Error in _optimize_with_convex_optimization: {str(e)}")

def compare_single_vs_split_strategy(
    pool_configs: List[PoolConfig],
    total_amount: float,
    option: int
) -> Union[Dict, Exception]:
    """
    Compare single-pool strategies vs optimal split strategy.
    
    Args:
        pool_configs: List of pool configurations
        total_amount: Total amount to bet
        option: Option to bet on (0 for A/YES, 1 for B/NO)
        
    Returns:
        Dictionary with comparison results, or Exception if error
    """
    try:
        # Single-pool strategies
        single_pool_results = []
        
        for pool_config in pool_configs:
            result = calculate_shares_for_allocation(pool_config, total_amount, option)
            if isinstance(result, Exception):
                continue
            
            shares, cost = result
            efficiency = shares / cost if cost > 0 else 0
            
            single_pool_results.append({
                "pool_id": pool_config.pool_id,
                "pool_name": pool_config.name,
                "shares": shares,
                "cost": cost,
                "efficiency": efficiency
            })
        
        # Sort by efficiency (best first)
        single_pool_results.sort(key=lambda x: x["efficiency"], reverse=True)
        
        # Optimal split strategy
        optimal_allocation = find_optimal_allocation(pool_configs, total_amount, option)
        
        if isinstance(optimal_allocation, Exception):
            return optimal_allocation
        
        # Compare best single vs split
        best_single = single_pool_results[0] if single_pool_results else None
        
        if best_single:
            improvement = optimal_allocation.total_shares - best_single["shares"]
            improvement_pct = (improvement / best_single["shares"]) * 100 if best_single["shares"] > 0 else 0
        else:
            improvement = 0
            improvement_pct = 0
        
        return {
            "single_pool_strategies": single_pool_results,
            "optimal_split_strategy": {
                "total_shares": optimal_allocation.total_shares,
                "total_cost": optimal_allocation.total_cost,
                "efficiency": optimal_allocation.efficiency,
                "allocations": [
                    {
                        "pool_id": alloc.pool_config.pool_id,
                        "pool_name": alloc.pool_config.name,
                        "amount": alloc.amount_allocated,
                        "shares": alloc.shares_received,
                        "cost": alloc.actual_cost,
                        "efficiency": alloc.efficiency
                    }
                    for alloc in optimal_allocation.allocations if alloc.amount_allocated > 0
                ]
            },
            "comparison": {
                "best_single_shares": best_single["shares"] if best_single else 0,
                "optimal_split_shares": optimal_allocation.total_shares,
                "improvement_shares": improvement,
                "improvement_percentage": improvement_pct,
                "is_split_better": improvement > 0
            }
        }
        
    except Exception as e:
        return Exception(f"Error in compare_single_vs_split_strategy: {str(e)}")

def compare_optimization_methods(
    pool_configs: List[PoolConfig],
    total_amount: float,
    option: int,
    precision: int = 20
) -> Union[Dict[str, Any], Exception]:
    """
    Compare all available optimization methods.
    
    Args:
        pool_configs: List of pool configurations
        total_amount: Total amount to bet
        option: Option to bet on (0 for A/YES, 1 for B/NO)
        precision: Precision for grid search and gradient descent
        
    Returns:
        Dictionary with results from all methods, or Exception if error
    """
    try:
        results = {}
        
        # Test each optimization method
        methods_to_test = [
            (OptimizationMethod.GRID_SEARCH, "Grid Search"),
            # (OptimizationMethod.GRADIENT_DESCENT, "Gradient Descent"),
            (OptimizationMethod.CONVEX_OPTIMIZATION, "Convex Optimization"),
        ]
        
        # Binary search only works for 2 pools
        if len(pool_configs) == 2:
            methods_to_test.append((OptimizationMethod.BINARY_SEARCH, "Binary Search"))
        
        for method, name in methods_to_test:
            try:
                result = find_optimal_allocation(
                    pool_configs, 
                    total_amount, 
                    option, 
                    method, 
                    precision
                )
                
                if isinstance(result, Exception):
                    results[name] = {
                        "error": str(result),
                        "total_shares": 0,
                        "total_cost": 0,
                        "efficiency": 0,
                        "execution_time": 0
                    }
                else:
                    results[name] = {
                        "total_shares": result.total_shares,
                        "total_cost": result.total_cost,
                        "efficiency": result.efficiency,
                        "allocations": [
                            {
                                "pool_id": alloc.pool_config.pool_id,
                                "amount": alloc.amount_allocated,
                                "shares": alloc.shares_received,
                                "cost": alloc.actual_cost,
                                "efficiency": alloc.efficiency
                            }
                            for alloc in result.allocations if alloc.amount_allocated > 0
                        ]
                    }
            except Exception as e:
                results[name] = {
                    "error": str(e),
                    "total_shares": 0,
                    "total_cost": 0,
                    "efficiency": 0
                }
        
        # Find best method
        best_method = None
        best_shares = 0
        
        for method_name, result in results.items():
            if "error" not in result and result["total_shares"] > best_shares:
                best_shares = result["total_shares"]
                best_method = method_name
        
        return {
            "results": results,
            "best_method": best_method,
            "best_shares": best_shares,
            "comparison": {
                "total_amount": total_amount,
                "option": "YES" if option == 0 else "NO",
                "num_pools": len(pool_configs)
            }
        }
        
    except Exception as e:
        return Exception(f"Error in compare_optimization_methods: {str(e)}")

# Example usage and testing
if __name__ == "__main__":
    try:
        # Define your pools
        pools = [
            PoolConfig(pool_id=25, schema="canibeton_variant1", name="Pool A"),
            PoolConfig(pool_id=30, schema="canibeton_variant2", name="Pool B"),
            # Add more pools here as needed
            # PoolConfig(pool_id=35, schema="canibeton_variant3", name="Pool C"),
        ]
        
        amount_to_bet = 1000.0  # $1000
        option = 0  # YES bet
        
        print("=== Optimal Betting Strategy Analysis ===")
        print(f"Total amount: ${amount_to_bet}")
        print(f"Option: {'YES' if option == 0 else 'NO'}")
        print(f"Number of pools: {len(pools)}")
        print()
        
        # 1. Compare single-pool strategies
        print("1. SINGLE-POOL STRATEGIES:")
        for i, pool in enumerate(pools, 1):
            result = calculate_shares_for_allocation(pool, amount_to_bet, option)
            if isinstance(result, tuple):
                shares, cost = result
                efficiency = shares / cost if cost > 0 else 0
                print(f"   Pool {pool.pool_id} ({pool.name}): {shares} shares (${cost:.2f}, {efficiency:.4f} shares/$)")
        print()
        
        # 2. Compare all optimization methods
        print("2. OPTIMIZATION METHODS COMPARISON:")
        methods_comparison = compare_optimization_methods(pools, amount_to_bet, option)
        
        if isinstance(methods_comparison, Exception):
            print(f"   Error: {methods_comparison}")
        else:
            print(f"   Best method: {methods_comparison['best_method']}")
            print(f"   Best shares: {methods_comparison['best_shares']}")
            print()
            
            for method_name, result in methods_comparison['results'].items():
                if "error" in result:
                    print(f"   {method_name}: ERROR - {result['error']}")
                else:
                    print(f"   {method_name}: {result['total_shares']} shares (${result['total_cost']:.2f}, {result['efficiency']:.4f} shares/$)")
                    for alloc in result['allocations']:
                        pct = (alloc['amount'] / amount_to_bet) * 100
                        print(f"     Pool {alloc['pool_id']}: ${alloc['amount']:.2f} ({pct:.1f}%) → {alloc['shares']} shares")
        print()
        
        # 3. Test specific optimization method
        print("3. TESTING SPECIFIC OPTIMIZATION METHOD:")
        best_method = OptimizationMethod.CONVEX_OPTIMIZATION  # or use best from comparison
        
        specific_result = find_optimal_allocation(
            pools, 
            amount_to_bet, 
            option, 
            best_method
        )
        
        if isinstance(specific_result, Exception):
            print(f"   Error with {best_method.value}: {specific_result}")
        else:
            print(f"   Method: {best_method.value.replace('_', ' ').title()}")
            print(f"   Total shares: {specific_result.total_shares}")
            print(f"   Total cost: ${specific_result.total_cost:.2f}")
            print(f"   Overall efficiency: {specific_result.efficiency:.4f} shares/$")
            print("   Allocation breakdown:")
            for alloc in specific_result.allocations:
                if alloc.amount_allocated > 0:
                    pct = (alloc.amount_allocated / amount_to_bet) * 100
                    print(f"     Pool {alloc.pool_config.pool_id} ({alloc.pool_config.name}): "
                          f"${alloc.amount_allocated:.2f} ({pct:.1f}%) → {alloc.shares_received} shares")
        
        print()
        print("=" * 60)
        print("COMPARISON: Traditional vs Advanced Optimization")
        print("=" * 60)
        
        if len(pools) >= 2:
            # Traditional two-pool comparison
            two_pool_result = compare_two_pools(
                pools[0].pool_id, pools[0].schema,
                pools[1].pool_id, pools[1].schema,
                amount_to_bet, option,
                pools[0].name, pools[1].name
            )
            
            if isinstance(two_pool_result, OptimalBettingResult):
                print(f"Traditional two-pool comparison: Pool {two_pool_result.best_option.pool_config.pool_id} "
                      f"with {two_pool_result.best_option.shares} shares")
            
            if isinstance(specific_result, OptimalAllocation):
                print(f"Advanced optimization: {specific_result.total_shares} shares across all pools")
                
                if specific_result.total_shares > two_pool_result.best_option.shares:
                    diff = specific_result.total_shares - two_pool_result.best_option.shares
                    improvement_pct = (diff / two_pool_result.best_option.shares) * 100
                    print(f"🎯 Advanced optimization gives +{diff} more shares (+{improvement_pct:.2f}%)")
                else:
                    print("📊 Traditional comparison was sufficient")
            
            print()
            print("💡 KEY INSIGHTS:")
            print("• Grid Search: Simple but slow for many pools")
            print("• Binary Search: Fast for 2 pools, assumes unimodal function")
            print("• Gradient Descent: Good for many pools, may find local optima")
            print("• Convex Optimization: Best for LMSR (convex), fastest convergence")
            print("• Order Book Integration: Cost = shares * price (future feature)")
            
    except Exception as e:
        print(f"Error in main: {e}")
    
    print("\n" + "="*50)
    print("HOW TO USE THIS MODULE:")
    print("="*50)
    print("1. Set your database environment variables")
    print("2. Choose your approach:")
    print("   a) compare_two_pools() - Compare specific pools")
    print("   b) find_optimal_allocation() - Split across multiple pools")
    print("   c) compare_single_vs_split_strategy() - Compare both approaches")
    print("3. Specify the amount you want to bet and option (0=YES, 1=NO)")
    print()
    print("Examples:")
    print("# Compare two pools:")
    print("result = compare_two_pools(25, 'schema1', 30, 'schema2', 1000.0, 0)")
    print()
    print("# Optimize allocation across multiple pools:")
    print("pools = [PoolConfig(25, 'schema1'), PoolConfig(30, 'schema2')]")
    print("result = find_optimal_allocation(pools, 1000.0, 0, OptimizationMethod.CONVEX_OPTIMIZATION)")
    print()
    print("# Compare optimization methods:")
    print("result = compare_optimization_methods(pools, 1000.0, 0)")
    print()
    print("Available optimization methods:")
    print("• OptimizationMethod.GRID_SEARCH - Simple grid search (default)")
    print("• OptimizationMethod.BINARY_SEARCH - Fast for 2 pools")
    print("• OptimizationMethod.GRADIENT_DESCENT - Good for many pools")
    print("• OptimizationMethod.CONVEX_OPTIMIZATION - Best for LMSR (requires scipy)")
    print()
    print("Market types supported:")
    print("• MarketType.LMSR - Automated Market Maker with LMSR (current)")
    print("• MarketType.ORDER_BOOK - Traditional order book (future)")
    print()
    print("💡 TIPS:")
    print("• Small bets (< $500): Use compare_two_pools()")
    print("• Large bets (> $1000): Use find_optimal_allocation() with CONVEX_OPTIMIZATION")
    print("• 2 pools: BINARY_SEARCH is fastest")
    print("• Many pools: GRADIENT_DESCENT or CONVEX_OPTIMIZATION")
    print("• LMSR markets: CONVEX_OPTIMIZATION is most efficient")
    print("• Order book integration: Cost = shares * price (future feature)") 