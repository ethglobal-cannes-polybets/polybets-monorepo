#!/usr/bin/env python3
"""
Example usage of the optimal betting system.

This script demonstrates how to:
1. Compare two pools representing the same betting market
2. Find the optimal betting strategy
3. Analyze the efficiency differences between pools

Before running:
1. Set your database environment variables:
   export SUPABASE_HOST="your_host"
   export SUPABASE_DB="your_database"
   export SUPABASE_USER="your_user"
   export SUPABASE_PASSWORD="your_password"
   export DB_SCHEMA="your_schema"  # optional

2. Update the pool IDs and schemas below to match your actual pools
"""

from optimal_betting import (
    compare_two_pools, 
    analyze_betting_efficiency, 
    PoolConfig,
    find_best_pool_for_option,
    get_option_name,
    find_optimal_allocation,
    compare_single_vs_split_strategy,
    compare_optimization_methods,
    OptimizationMethod,
    MarketType
)
import os

def main():
    # Check if environment variables are set
    required_vars = ['SUPABASE_HOST', 'SUPABASE_DB', 'SUPABASE_USER', 'SUPABASE_PASSWORD']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"Missing environment variables: {', '.join(missing_vars)}")
        print("Please set these variables before running the script.")
        return
    
    print("=== Optimal Betting Strategy Demo ===")
    print()
    
    # Example configuration - update these with your actual pool IDs and schemas
    pool_1_id = 131
    schema_1 = "canibeton_variant1"
    pool_1_name = "Canibeton 1"
    
    pool_2_id = 125
    schema_2 = "canibeton_variant2"
    pool_2_name = "Canibeton 2"
    
    # Different bet amounts to test
    bet_amounts = [10.0, 50.0, 100.0, 500.0]
    
    print(f"Comparing pools:")
    print(f"  Pool 1: ID {pool_1_id} in schema '{schema_1}'")
    print(f"  Pool 2: ID {pool_2_id} in schema '{schema_2}'")
    print()
    
    for amount in bet_amounts:
        
        # YES bet comparison
        yes_result = compare_two_pools(pool_1_id, schema_1, pool_2_id, schema_2, amount, 0)
        if isinstance(yes_result, Exception):
            print(f"   YES: Error - {yes_result}")
        else:
            print(f"   YES: Pool {yes_result.best_option.pool_config.pool_id} - "
                  f"{yes_result.best_option.shares} shares (${yes_result.best_option.actual_cost:.2f})")
        
        # NO bet comparison
        no_result = compare_two_pools(pool_1_id, schema_1, pool_2_id, schema_2, amount, 1)
        if isinstance(no_result, Exception):
            print(f"   NO:  Error - {no_result}")
        else:
            print(f"   NO:  Pool {no_result.best_option.pool_config.pool_id} - "
                  f"{no_result.best_option.shares} shares (${no_result.best_option.actual_cost:.2f})")
        
        print()

def simple_comparison_example():
    """Simple example for two specific pools."""
    
    # Update these with your actual pool details
    pool_1_id = 25
    schema_1 = "canibeton_variant1"
    
    pool_2_id = 30  
    schema_2 = "canibeton_variant2"
    
    amount_to_bet = 100.0
    
    print("=== Simple Comparison Example ===")
    print(f"Betting ${amount_to_bet} across two pools")
    
    result = compare_two_pools(
        pool_1_id, schema_1,
        pool_2_id, schema_2,
        amount_to_bet,
        0  # option = 0 for YES bet
    )
    
    if isinstance(result, Exception):
        print(f"Error: {result}")
        return
    
    print(f"Best choice: {result}")
    
    # Show detailed analysis
    analysis = analyze_betting_efficiency(
        [PoolConfig(pool_1_id, schema_1, "Pool 1"), 
         PoolConfig(pool_2_id, schema_2, "Pool 2")],
        amount_to_bet,
        0  # option = 0 for YES bet analysis
    )
    
    if isinstance(analysis, dict):
        print(f"\nDetailed Analysis:")
        print(f"Efficiency range: {analysis['comparison']['efficiency_range']['worst']:.4f} - "
              f"{analysis['comparison']['efficiency_range']['best']:.4f} shares/$")
        print(f"Potential savings: ${analysis['comparison']['potential_savings']:.2f}")

def option_specific_examples():
    """Demonstrate option-specific betting strategies."""
    
    # Update these with your actual pool details
    pool_1_id = 25
    schema_1 = "canibeton_variant1"
    
    pool_2_id = 30  
    schema_2 = "canibeton_variant2"
    
    amount_to_bet = 100.0
    
    print("=== Option-Specific Betting Examples ===")
    print(f"Finding best pools for specific bets (${amount_to_bet})")
    print()
    
    # Example 1: YES bet comparison
    print("1. COMPARING POOLS FOR YES BET:")
    yes_result = compare_two_pools(
        pool_1_id, schema_1,
        pool_2_id, schema_2,
        amount_to_bet,
        0,  # option = 0 for YES
        "Pool 1", "Pool 2"
    )
    
    if isinstance(yes_result, Exception):
        print(f"   ❌ Error: {yes_result}")
    else:
        print(f"   ✅ Best YES bet: Pool {yes_result.best_option.pool_config.pool_id}")
        print(f"      Shares: {yes_result.best_option.shares}")
        print(f"      Cost: ${yes_result.best_option.actual_cost:.2f}")
        print(f"      Efficiency: {yes_result.best_option.efficiency:.4f} shares/$")
        if yes_result.savings > 0:
            print(f"      💰 Savings: ${yes_result.savings:.2f}")
    print()
    
    # Example 2: NO bet comparison
    print("2. COMPARING POOLS FOR NO BET:")
    no_result = compare_two_pools(
        pool_1_id, schema_1,
        pool_2_id, schema_2,
        amount_to_bet,
        1,  # option = 1 for NO
        "Pool 1", "Pool 2"
    )
    
    if isinstance(no_result, Exception):
        print(f"   ❌ Error: {no_result}")
    else:
        print(f"   ✅ Best NO bet: Pool {no_result.best_option.pool_config.pool_id}")
        print(f"      Shares: {no_result.best_option.shares}")
        print(f"      Cost: ${no_result.best_option.actual_cost:.2f}")
        print(f"      Efficiency: {no_result.best_option.efficiency:.4f} shares/$")
        if no_result.savings > 0:
            print(f"      💰 Savings: ${no_result.savings:.2f}")
    print()
    
    # Example 3: Using generic function with specific option
    print("3. USING GENERIC FUNCTION FOR SPECIFIC OPTION:")
    for option in [0, 1]:  # 0 = YES, 1 = NO
        option_name = get_option_name(option)
        print(f"   {option_name} bet:")
        
        result = compare_two_pools(
            pool_1_id, schema_1,
            pool_2_id, schema_2,
            amount_to_bet,
            option,  # Specify the option
            "Pool 1", "Pool 2"
        )
        
        if isinstance(result, Exception):
            print(f"      ❌ Error: {result}")
        else:
            print(f"      ✅ Best pool: {result.best_option.pool_config.pool_id}")
            print(f"         {result.best_option.shares} shares for ${result.best_option.actual_cost:.2f}")
            
            # Show ranking of all pools for this option
            print(f"         Pool rankings for {option_name}:")
            for i, opt in enumerate(result.all_options, 1):
                print(f"         {i}. Pool {opt.pool_config.pool_id}: {opt.shares} shares "
                      f"(${opt.actual_cost:.2f}, {opt.efficiency:.4f} shares/$)")
        print()
    
    # Example 4: Multi-pool comparison for specific option
    print("4. MULTI-POOL COMPARISON (if you have more pools):")
    pools = [
        PoolConfig(pool_1_id, schema_1, "Pool 1"),
        PoolConfig(pool_2_id, schema_2, "Pool 2"),
        # Add more pools here if you have them
        # PoolConfig(pool_3_id, schema_3, "Pool 3"),
    ]
    
    option_to_compare = 0  # YES bet
    option_name = get_option_name(option_to_compare)
    
    result = find_best_pool_for_option(pools, amount_to_bet, option_to_compare)
    
    if isinstance(result, Exception):
        print(f"   ❌ Error: {result}")
    else:
        print(f"   ✅ Best pool for {option_name} bet: Pool {result.best_option.pool_config.pool_id}")
        print(f"      {result.best_option.shares} shares for ${result.best_option.actual_cost:.2f}")
        print(f"      ({result.best_option.efficiency:.4f} shares/$)")
    
    print()
    print("💡 TIP: Use compare_two_pools() with specific options:")
    print("   - compare_two_pools(pool_id_1, schema_1, pool_id_2, schema_2, amount, 0) for YES bets")
    print("   - compare_two_pools(pool_id_1, schema_1, pool_id_2, schema_2, amount, 1) for NO bets")
    print("   - This gives you cleaner, more focused results")

def allocation_optimization_example():
    """Demonstrate allocation optimization across multiple pools."""
    
    # Example configuration - update with your actual pool IDs and schemas
    pools = [
        PoolConfig(pool_id=25, schema="canibeton_variant1", name="Pool A"),
        PoolConfig(pool_id=30, schema="canibeton_variant2", name="Pool B"),
        # Add more pools here if you have them
        # PoolConfig(pool_id=35, schema="canibeton_variant3", name="Pool C"),
    ]
    
    large_amount = 1000.0  # $1000 - where allocation optimization shows benefits
    option = 0  # YES bet
    
    print("=== Allocation Optimization Example ===")
    print(f"Amount: ${large_amount}")
    print(f"Option: {'YES' if option == 0 else 'NO'}")
    print(f"Pools: {len(pools)}")
    print()
    
    # 1. Find optimal allocation
    print("1. OPTIMAL ALLOCATION:")
    allocation_result = find_optimal_allocation(pools, large_amount, option)
    
    if isinstance(allocation_result, Exception):
        print(f"   ❌ Error: {allocation_result}")
        return
    
    print(f"   Total shares: {allocation_result.total_shares}")
    print(f"   Total cost: ${allocation_result.total_cost:.2f}")
    print(f"   Overall efficiency: {allocation_result.efficiency:.4f} shares/$")
    print("   Allocation breakdown:")
    
    for alloc in allocation_result.allocations:
        if alloc.amount_allocated > 0:
            pct = (alloc.amount_allocated / large_amount) * 100
            print(f"     Pool {alloc.pool_config.pool_id} ({alloc.pool_config.name}): "
                  f"${alloc.amount_allocated:.2f} ({pct:.1f}%) → {alloc.shares_received} shares")
    
    print()
    
    # 2. Compare strategies
    print("2. STRATEGY COMPARISON:")
    comparison = compare_single_vs_split_strategy(pools, large_amount, option)
    
    if isinstance(comparison, Exception):
        print(f"   ❌ Error: {comparison}")
        return
    
    comp = comparison["comparison"]
    print(f"   Best single-pool strategy: {comp['best_single_shares']} shares")
    print(f"   Optimal allocation strategy: {comp['optimal_split_shares']} shares")
    print(f"   Improvement: +{comp['improvement_shares']} shares ({comp['improvement_percentage']:.2f}%)")
    
    if comp['is_split_better']:
        print("   ✅ Allocation optimization provides better results!")
        print("   🎯 This is why you should split large bets across pools")
    else:
        print("   📊 Single-pool strategy is sufficient for this amount")
    
    print()
    
    # 3. Show individual pool performance
    print("3. SINGLE-POOL PERFORMANCE:")
    single_strategies = comparison["single_pool_strategies"]
    
    for i, strategy in enumerate(single_strategies, 1):
        print(f"   {i}. Pool {strategy['pool_id']} ({strategy['pool_name']}): "
              f"{strategy['shares']} shares (${strategy['cost']:.2f}, {strategy['efficiency']:.4f} shares/$)")
    
    print()
    print("💡 KEY INSIGHT: With AMM pools, splitting large bets often gives more shares")
    print("   because you avoid the price impact (slippage) of large single orders.")

def optimization_methods_demo():
    """Demonstrate different optimization methods."""
    
    # Example configuration - update with your actual pool IDs and schemas
    pools = [
        PoolConfig(pool_id=25, schema="canibeton_variant1", name="Pool A"),
        PoolConfig(pool_id=30, schema="canibeton_variant2", name="Pool B"),
    ]
    
    large_amount = 2000.0  # $2000 - where optimization differences show up
    option = 0  # YES bet
    
    print("=== Optimization Methods Demonstration ===")
    print(f"Amount: ${large_amount}")
    print(f"Option: {'YES' if option == 0 else 'NO'}")
    print(f"Pools: {len(pools)}")
    print()
    
    # 1. Compare all optimization methods
    print("1. ALL OPTIMIZATION METHODS:")
    methods_comparison = compare_optimization_methods(pools, large_amount, option)
    
    if isinstance(methods_comparison, Exception):
        print(f"   ❌ Error: {methods_comparison}")
        return
    
    print(f"   🏆 Best method: {methods_comparison['best_method']}")
    print(f"   🎯 Best shares: {methods_comparison['best_shares']}")
    print()
    
    for method_name, result in methods_comparison['results'].items():
        if "error" in result:
            print(f"   ❌ {method_name}: {result['error']}")
        else:
            print(f"   ✅ {method_name}: {result['total_shares']} shares")
            print(f"      Cost: ${result['total_cost']:.2f}")
            print(f"      Efficiency: {result['efficiency']:.4f} shares/$")
            print(f"      Allocation:")
            for alloc in result['allocations']:
                pct = (alloc['amount'] / large_amount) * 100
                print(f"        Pool {alloc['pool_id']}: ${alloc['amount']:.2f} ({pct:.1f}%)")
        print()
    
    # 2. Test specific methods individually
    print("2. INDIVIDUAL METHOD TESTING:")
    
    methods_to_test = [
        (OptimizationMethod.GRID_SEARCH, "Grid Search"),
        (OptimizationMethod.BINARY_SEARCH, "Binary Search"),
        # (OptimizationMethod.GRADIENT_DESCENT, "Gradient Descent"),
        # (OptimizationMethod.CONVEX_OPTIMIZATION, "Convex Optimization"),
    ]
    
    for method, name in methods_to_test:
        print(f"   Testing {name}:")
        
        result = find_optimal_allocation(pools, large_amount, option, method)
        
        if isinstance(result, Exception):
            print(f"      ❌ Error: {result}")
        else:
            print(f"      ✅ {result.total_shares} shares for ${result.total_cost:.2f}")
            print(f"         Efficiency: {result.efficiency:.4f} shares/$")
            
            non_zero_allocations = [a for a in result.allocations if a.amount_allocated > 0]
            if len(non_zero_allocations) > 1:
                print(f"         Split across {len(non_zero_allocations)} pools")
            else:
                print(f"         Single pool allocation")
        print()
    
    print("3. ORDER BOOK INTEGRATION PREVIEW:")
    print("   Future feature: Order book markets where cost = shares * price")
    print(f"   Example: Pool with MarketType.ORDER_BOOK")
    
    # Create a pool with order book market type for demonstration
    order_book_pool = PoolConfig(
        pool_id=99, 
        schema="order_book_demo", 
        name="Order Book Pool",
        market_type=MarketType.ORDER_BOOK
    )
    
    print(f"   Pool config: {order_book_pool}")
    print(f"   Market type: {order_book_pool.market_type}")
    print("   💡 This will enable integration with traditional order book exchanges")
    print()

def quick_test():
    """Quick test to verify the system works."""
    
    # This is a minimal example - update with your actual data
    try:
        from get_lmsr_data import get_lmsr_data_with_auto_connection
        
        # Test getting data from one pool
        pool_id = 25
        schema = "canibeton_variant1"
        
        print("=== Quick Test ===")
        print(f"Testing connection to pool {pool_id} in schema '{schema}'")
        
        lmsr_data = get_lmsr_data_with_auto_connection(pool_id, schema)
        
        if isinstance(lmsr_data, Exception):
            print(f"❌ Error getting data: {lmsr_data}")
            return False
        
        print(f"✅ Successfully retrieved LMSR data:")
        print(f"   Initial Liquidity A: {lmsr_data.initial_liquidity_A}")
        print(f"   Initial Liquidity B: {lmsr_data.initial_liquidity_B}")
        print(f"   Current Q A: {lmsr_data.current_q_A}")
        print(f"   Current Q B: {lmsr_data.current_q_B}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in quick test: {e}")
        return False

if __name__ == "__main__":
    print("Optimal Betting Strategy System")
    print("=" * 40)
    
    # Run quick test first
    if quick_test():
        print("\n" + "=" * 40)
        
        # Run the main comparison
        main()
        
        print("\n" + "=" * 40)
        
        # Run simple example
        simple_comparison_example()
        
        print("\n" + "=" * 40)
        
        # Run option-specific examples
        option_specific_examples()
        
        print("\n" + "=" * 40)
        
        # Run allocation optimization example
        allocation_optimization_example()
        
        print("\n" + "=" * 40)
        
        # Run optimization methods demo
        optimization_methods_demo()
    else:
        print("❌ Quick test failed. Please check your database connection and pool configuration.")
    
    print("\n" + "=" * 40)
    print("Demo complete!")
    print("\nTo use this system in your own code:")
    print()
    print("For pool comparison (small to medium bets):")
    print("1. Import: from optimal_betting import compare_two_pools")
    print("2. For YES: result = compare_two_pools(pool_id_1, schema_1, pool_id_2, schema_2, amount, 0)")
    print("3. For NO:  result = compare_two_pools(pool_id_1, schema_1, pool_id_2, schema_2, amount, 1)")
    print()
    print("For allocation optimization (large bets, multiple pools):")
    print("1. Import: from optimal_betting import find_optimal_allocation, PoolConfig")
    print("2. Create pools: pools = [PoolConfig(id1, schema1), PoolConfig(id2, schema2)]")
    print("3. Call: result = find_optimal_allocation(pools, amount, option)")
    print("   - option=0 for YES, option=1 for NO")
    print()
    print("For strategy comparison:")
    print("1. Import: from optimal_betting import compare_single_vs_split_strategy")
    print("2. Call: result = compare_single_vs_split_strategy(pools, amount, option)")
    print()
    print("💡 TIPS:")
    print("• Small bets (< $500): Use compare_two_pools()")
    print("• Large bets (> $1000): Use find_optimal_allocation()")
    print("• Multiple pools: Always consider allocation optimization")
    print("• Always check: if isinstance(result, Exception) - handle errors") 