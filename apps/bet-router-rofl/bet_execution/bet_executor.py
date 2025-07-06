#!/usr/bin/env python3
"""
Bet Executor - Execute optimal betting strategies via API endpoints.

This module:
1. Uses optimal betting strategies to determine best allocation
2. Maps schemas to API endpoint names
3. Executes actual bets via HTTP requests
4. Handles responses and errors
"""

import requests
import json
from typing import Dict, List, Union, Optional
from dataclasses import dataclass
from .optimal_betting import (
    PoolConfig, 
    find_optimal_allocation, 
    compare_two_pools,
    OptimizationMethod,
    MarketType,
    OptimalAllocation,
    OptimalBettingResult
)

# Schema to endpoint mapping
SCHEMA_TO_ENDPOINT = {
    "canibeton_variant1": "slaughterhouse-predictions",
    "canibeton_variant2": "terminal-degeneracy-labs",
    "canibeton_variant3": "degen-execution-chamber",
    "canibeton_variant4": "nihilistic-prophet-syndicate",
}

# Marketplace ID to schema mapping
MARKETPLACE_ID_TO_SCHEMA = {
    2: "canibeton_variant1",
    3: "canibeton_variant2",
    4: "canibeton_variant3",
    5: "canibeton_variant4"
}

# Reverse mappings for convenience
ENDPOINT_TO_SCHEMA = {
    "slaughterhouse-predictions": "canibeton_variant1",
    "terminal-degeneracy-labs": "canibeton_variant2",
    "degen-execution-chamber": "canibeton_variant3",
    "nihilistic-prophet-syndicate": "canibeton_variant4"
}

SCHEMA_TO_MARKETPLACE_ID = {
    "canibeton_variant1": 2,
    "canibeton_variant2": 3,
    "canibeton_variant3": 4,
    "canibeton_variant4": 5
}

def get_marketplace_id_from_endpoint(endpoint_name: str) -> int:
    """Get marketplace ID from endpoint name."""
    schema = ENDPOINT_TO_SCHEMA.get(endpoint_name)
    if schema:
        return SCHEMA_TO_MARKETPLACE_ID.get(schema, 0)
    return 0

def get_schema_from_marketplace_id(marketplace_id: int) -> Union[str, Exception]:
    """Map marketplace ID to schema name."""
    if marketplace_id in MARKETPLACE_ID_TO_SCHEMA:
        return MARKETPLACE_ID_TO_SCHEMA[marketplace_id]
    else:
        return Exception(f"Unknown marketplace ID: {marketplace_id}. Supported IDs: {list(MARKETPLACE_ID_TO_SCHEMA.keys())}")

def create_pool_configs_from_market_data(market_ids: List[int], marketplace_ids: List[int]) -> Union[List[PoolConfig], Exception]:
    """
    Create PoolConfig objects from market and marketplace data.
    
    Args:
        market_ids: List of market IDs (pool IDs)
        marketplace_ids: List of marketplace IDs
        
    Returns:
        List of PoolConfig objects, or Exception if error
    """
    if len(market_ids) != len(marketplace_ids):
        return Exception(f"Market IDs length ({len(market_ids)}) must match Marketplace IDs length ({len(marketplace_ids)})")
    
    pool_configs = []
    
    for market_id, marketplace_id in zip(market_ids, marketplace_ids):
        schema = get_schema_from_marketplace_id(marketplace_id)
        if isinstance(schema, Exception):
            return schema
        
        pool_config = PoolConfig(
            pool_id=market_id,
            schema=schema,
            name=f"Market {market_id} ({schema})"
        )
        pool_configs.append(pool_config)
    
    return pool_configs

@dataclass
class BetRequest:
    market_id: int
    option_index: int
    collateral_amount: float
    endpoint_name: str

@dataclass
class BetResponse:
    success: bool
    market_id: int
    option_index: int
    collateral_amount: float
    endpoint_name: str
    response_data: Dict = None
    error_message: str = None
    status_code: int = None

@dataclass
class ExecutionResult:
    total_amount: float
    total_requests: int
    successful_bets: List[BetResponse]
    failed_bets: List[BetResponse]
    strategy_used: str
    
    @property
    def success_rate(self) -> float:
        return len(self.successful_bets) / self.total_requests if self.total_requests > 0 else 0
    
    @property
    def total_executed_amount(self) -> float:
        return sum(bet.collateral_amount for bet in self.successful_bets)
    
    def __str__(self) -> str:
        return (f"Execution Result: {len(self.successful_bets)}/{self.total_requests} successful "
                f"(${self.total_executed_amount:.2f}/${self.total_amount:.2f})")

class BetExecutor:
    """Execute optimal betting strategies via API calls."""
    
    def __init__(self, base_url: str = "http://localhost:3000", timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def _get_endpoint_name(self, schema: str) -> Union[str, Exception]:
        """Map schema name to API endpoint name."""
        if schema in SCHEMA_TO_ENDPOINT:
            return SCHEMA_TO_ENDPOINT[schema]
        else:
            return Exception(f"Unknown schema: {schema}. Supported schemas: {list(SCHEMA_TO_ENDPOINT.keys())}")
    
    def _make_bet_request(self, bet_request: BetRequest) -> BetResponse:
        """Make a single bet request to the API."""
        url = f"{self.base_url}/{bet_request.endpoint_name}/buy-shares"
        
        payload = {
            "marketId": bet_request.market_id,
            "optionIndex": bet_request.option_index,
            "collateralAmount": bet_request.collateral_amount
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=self.timeout)
            
            if response.status_code == 200 or response.status_code == 201:
                # Safe JSON parsing with error handling
                try:
                    response_data = response.json() if response.content else {}
                except ValueError:
                    response_data = {"error": "Invalid JSON response", "raw_response": response.text}
                
                return BetResponse(
                    success=True,
                    market_id=bet_request.market_id,
                    option_index=bet_request.option_index,
                    collateral_amount=bet_request.collateral_amount,
                    endpoint_name=bet_request.endpoint_name,
                    response_data=response_data,
                    status_code=response.status_code
                )
            else:
                # Safe JSON parsing with error handling
                try:
                    error_data = response.json() if response.content else {"error": "No response body"}
                except ValueError:
                    error_data = {"error": "Invalid JSON response", "raw_response": response.text}
                return BetResponse(
                    success=False,
                    market_id=bet_request.market_id,
                    option_index=bet_request.option_index,
                    collateral_amount=bet_request.collateral_amount,
                    endpoint_name=bet_request.endpoint_name,
                    error_message=f"HTTP {response.status_code}: {error_data}",
                    status_code=response.status_code
                )
        
        except requests.exceptions.Timeout:
            return BetResponse(
                success=False,
                market_id=bet_request.market_id,
                option_index=bet_request.option_index,
                collateral_amount=bet_request.collateral_amount,
                endpoint_name=bet_request.endpoint_name,
                error_message=f"Request timeout after {self.timeout}s"
            )
        
        except requests.exceptions.RequestException as e:
            return BetResponse(
                success=False,
                market_id=bet_request.market_id,
                option_index=bet_request.option_index,
                collateral_amount=bet_request.collateral_amount,
                endpoint_name=bet_request.endpoint_name,
                error_message=f"Request failed: {str(e)}"
            )
    
    def execute_optimal_allocation(
        self, 
        pool_configs: List[PoolConfig], 
        total_amount: float, 
        option: int,
        optimization_method: OptimizationMethod = OptimizationMethod.GRID_SEARCH,
        min_bet_amount: float = 1.0,
        dry_run: bool = False
    ) -> Union[ExecutionResult, Exception]:
        """
        Execute optimal allocation strategy across multiple pools.
        
        Args:
            pool_configs: List of pool configurations
            total_amount: Total amount to bet
            option: Option to bet on (0 for YES, 1 for NO)
            optimization_method: Optimization method to use
            min_bet_amount: Minimum bet amount per pool (smaller allocations will be skipped)
            dry_run: If True, only simulate the requests without actually making them
            
        Returns:
            ExecutionResult with bet outcomes, or Exception if error
        """
        try:
            # Find optimal allocation
            allocation_result = find_optimal_allocation(
                pool_configs, 
                total_amount, 
                option, 
                optimization_method
            )
            
            if isinstance(allocation_result, Exception):
                return allocation_result
            
            # Convert allocation to bet requests
            bet_requests = []
            
            for alloc in allocation_result.allocations:
                if alloc.amount_allocated < min_bet_amount:
                    continue  # Skip very small allocations
                
                endpoint_name = self._get_endpoint_name(alloc.pool_config.schema)
                if isinstance(endpoint_name, Exception):
                    return endpoint_name
                
                bet_requests.append(BetRequest(
                    market_id=alloc.pool_config.pool_id,
                    option_index=option,
                    collateral_amount=alloc.amount_allocated,
                    endpoint_name=endpoint_name
                ))
            
            if not bet_requests:
                return Exception("No valid bet requests generated (all allocations below minimum)")
            
            # Execute bet requests
            successful_bets = []
            failed_bets = []
            
            for bet_request in bet_requests:
                if dry_run:
                    # Simulate successful bet for dry run
                    response = BetResponse(
                        success=True,
                        market_id=bet_request.market_id,
                        option_index=bet_request.option_index,
                        collateral_amount=bet_request.collateral_amount,
                        endpoint_name=bet_request.endpoint_name,
                        response_data={"simulated": True}
                    )
                    successful_bets.append(response)
                else:
                    response = self._make_bet_request(bet_request)
                    if response.success:
                        successful_bets.append(response)
                    else:
                        failed_bets.append(response)
            
            return ExecutionResult(
                total_amount=total_amount,
                total_requests=len(bet_requests),
                successful_bets=successful_bets,
                failed_bets=failed_bets,
                strategy_used=f"Optimal Allocation ({optimization_method.value})"
            )
            
        except Exception as e:
            return Exception(f"Error in execute_optimal_allocation: {str(e)}")
    
    def execute_two_pool_comparison(
        self,
        pool_id_1: int,
        schema_1: str,
        pool_id_2: int,
        schema_2: str,
        amount: float,
        option: int,
        dry_run: bool = False
    ) -> Union[ExecutionResult, Exception]:
        """
        Execute betting strategy based on two-pool comparison.
        
        Args:
            pool_id_1: First pool ID
            schema_1: First pool schema
            pool_id_2: Second pool ID  
            schema_2: Second pool schema
            amount: Amount to bet
            option: Option to bet on (0 for YES, 1 for NO)
            dry_run: If True, only simulate the requests
            
        Returns:
            ExecutionResult with bet outcome, or Exception if error
        """
        try:
            # Compare pools and find best option
            comparison_result = compare_two_pools(
                pool_id_1, schema_1,
                pool_id_2, schema_2,
                amount, option
            )
            
            if isinstance(comparison_result, Exception):
                return comparison_result
            
            # Get best betting option
            best_option = comparison_result.best_option
            
            # Get endpoint name
            endpoint_name = self._get_endpoint_name(best_option.pool_config.schema)
            if isinstance(endpoint_name, Exception):
                return endpoint_name
            
            # Create and execute bet request
            bet_request = BetRequest(
                market_id=best_option.pool_config.pool_id,
                option_index=option,
                collateral_amount=amount,
                endpoint_name=endpoint_name
            )
            
            if dry_run:
                response = BetResponse(
                    success=True,
                    market_id=bet_request.market_id,
                    option_index=bet_request.option_index,
                    collateral_amount=bet_request.collateral_amount,
                    endpoint_name=bet_request.endpoint_name,
                    response_data={"simulated": True}
                )
                successful_bets = [response]
                failed_bets = []
            else:
                response = self._make_bet_request(bet_request)
                if response.success:
                    successful_bets = [response]
                    failed_bets = []
                else:
                    successful_bets = []
                    failed_bets = [response]
            
            return ExecutionResult(
                total_amount=amount,
                total_requests=1,
                successful_bets=successful_bets,
                failed_bets=failed_bets,
                strategy_used="Two Pool Comparison"
            )
            
        except Exception as e:
            return Exception(f"Error in execute_two_pool_comparison: {str(e)}")
    
    def execute_single_pool_bet(
        self,
        pool_id: int,
        schema: str,
        amount: float,
        option: int,
        dry_run: bool = False
    ) -> Union[ExecutionResult, Exception]:
        """
        Execute a simple single pool bet.
        
        Args:
            pool_id: Pool ID
            schema: Pool schema
            amount: Amount to bet
            option: Option to bet on (0 for YES, 1 for NO)
            dry_run: If True, only simulate the request
            
        Returns:
            ExecutionResult with bet outcome, or Exception if error
        """
        try:
            # Get endpoint name
            endpoint_name = self._get_endpoint_name(schema)
            if isinstance(endpoint_name, Exception):
                return endpoint_name
            
            # Create and execute bet request
            bet_request = BetRequest(
                market_id=pool_id,
                option_index=option,
                collateral_amount=amount,
                endpoint_name=endpoint_name
            )
            
            if dry_run:
                response = BetResponse(
                    success=True,
                    market_id=bet_request.market_id,
                    option_index=bet_request.option_index,
                    collateral_amount=bet_request.collateral_amount,
                    endpoint_name=bet_request.endpoint_name,
                    response_data={"simulated": True}
                )
                successful_bets = [response]
                failed_bets = []
            else:
                response = self._make_bet_request(bet_request)
                if response.success:
                    successful_bets = [response]
                    failed_bets = []
                else:
                    successful_bets = []
                    failed_bets = [response]
            
            return ExecutionResult(
                total_amount=amount,
                total_requests=1,
                successful_bets=successful_bets,
                failed_bets=failed_bets,
                strategy_used="Single Pool Bet"
            )
            
        except Exception as e:
            return Exception(f"Error in execute_single_pool_bet: {str(e)}")

# Convenience functions
def execute_optimal_bet(
    pool_configs: List[PoolConfig], 
    total_amount: float, 
    option: int,
    base_url: str = "http://localhost:3000",
    optimization_method: OptimizationMethod = OptimizationMethod.GRID_SEARCH,
    dry_run: bool = False
) -> Union[ExecutionResult, Exception]:
    """
    Convenience function to execute optimal betting strategy.
    
    Args:
        pool_configs: List of pool configurations
        total_amount: Total amount to bet
        option: Option to bet on (0 for YES, 1 for NO)
        base_url: API base URL
        optimization_method: Optimization method to use
        dry_run: If True, only simulate requests
        
    Returns:
        ExecutionResult with bet outcomes, or Exception if error
    """
    executor = BetExecutor(base_url=base_url)
    return executor.execute_optimal_allocation(
        pool_configs, 
        total_amount, 
        option, 
        optimization_method,
        dry_run=dry_run
    )

def execute_two_pool_bet(
    pool_id_1: int,
    schema_1: str,
    pool_id_2: int,
    schema_2: str,
    amount: float,
    option: int,
    base_url: str = "http://localhost:3000",
    optimization_method: OptimizationMethod = OptimizationMethod.GRID_SEARCH,
    dry_run: bool = False
) -> Union[ExecutionResult, Exception]:
    """
    Convenience function to execute optimal betting strategy across two pools.
    
    This uses the same optimal allocation system as execute_optimal_bet() but with
    a convenient interface for the common case of comparing two specific pools.
    
    Args:
        pool_id_1: First pool ID
        schema_1: First pool schema
        pool_id_2: Second pool ID
        schema_2: Second pool schema
        amount: Amount to bet
        option: Option to bet on (0 for YES, 1 for NO)
        base_url: API base URL
        optimization_method: Optimization method to use
        dry_run: If True, only simulate requests
        
    Returns:
        ExecutionResult with bet outcome, or Exception if error
    """
    pools = [
        PoolConfig(pool_id=pool_id_1, schema=schema_1, name=f"Pool {pool_id_1}"),
        PoolConfig(pool_id=pool_id_2, schema=schema_2, name=f"Pool {pool_id_2}")
    ]
    
    return execute_optimal_bet(
        pools, 
        amount, 
        option, 
        base_url=base_url,
        optimization_method=optimization_method,
        dry_run=dry_run
    )

# Example usage and testing
if __name__ == "__main__":
    print("=== Bet Executor Demo ===")
    print()
    
    # Example 1: Optimal allocation across multiple pools
    print("1. OPTIMAL ALLOCATION STRATEGY:")
    pools = [
        PoolConfig(pool_id=124, schema="canibeton_variant1", name="Slaughterhouse"),
        PoolConfig(pool_id=118, schema="canibeton_variant2", name="Terminal Degeneracy")
    ]
    
    # DRY RUN first to test
    print("   Running dry run simulation...")
    result = execute_optimal_bet(
        pools, 
        total_amount=100.0, 
        option=0,
        dry_run=False
    )
    
    if isinstance(result, Exception):
        print(f"   ❌ Error: {result}")
    else:
        print(f"   ✅ {result}")
        print(f"   Strategy: {result.strategy_used}")
        print(f"   Success rate: {result.success_rate:.1%}")
        
        for i, bet in enumerate(result.successful_bets, 1):
            print(f"   {i}. ${bet.collateral_amount:.2f} → {bet.endpoint_name} (market {bet.market_id})")
    
    print()
    
    # Example 2: Two-pool convenience function
    # print("2. TWO-POOL CONVENIENCE FUNCTION:")
    # print("   Running dry run simulation...")
    # result = execute_two_pool_bet(
    #     pool_id_1=131, schema_1="canibeton_variant1",
    #     pool_id_2=125, schema_2="canibeton_variant2",
    #     amount=50.0,
    #     option=1,  # NO bet
    #     dry_run=True
    # )
    
    # if isinstance(result, Exception):
    #     print(f"   ❌ Error: {result}")
    # else:
    #     print(f"   ✅ {result}")
    #     print(f"   Strategy: {result.strategy_used}")
        
    #     for bet in result.successful_bets:
    #         print(f"   ${bet.collateral_amount:.2f} → {bet.endpoint_name} (market {bet.market_id}, option {bet.option_index})")
    
    # print()
    # print("💡 To execute real bets, set dry_run=False")
    # print("🔧 Endpoint mapping:")
    # for schema, endpoint in SCHEMA_TO_ENDPOINT.items():
    #     print(f"   {schema} → {endpoint}")
    # print()
    # print("📚 Usage examples:")
    # print("   # Optimal allocation")
    # print("   result = execute_optimal_bet(pools, 1000.0, 0)")
    # print("   # Two-pool convenience")  
    # print("   result = execute_two_pool_bet(131, 'canibeton_variant1', 125, 'canibeton_variant2', 100.0, 1)") 
