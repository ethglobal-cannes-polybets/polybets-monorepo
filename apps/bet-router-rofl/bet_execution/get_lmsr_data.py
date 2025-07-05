import os
import psycopg2
from typing import Optional, Tuple, Union
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

"""
LMSR Data Retrieval Module

This module retrieves LMSR (Logarithmic Market Scoring Rule) data from the database.

Table Structure: <schema>.pool_lmsr_data_view
+--------------------------------+---------+
| Column                         | Example |
+--------------------------------+---------+
| pool_id                        | 125     |
| lmsr_yes_tokens_minted         | 273758787 |
| lmsr_yes_tokens_burned         | 0       |
| lmsr_no_tokens_minted          | 7177734 |
| lmsr_no_tokens_burned          | 4000000 |
| lmsr_yes_usdc_initial_liquidity| 10780000 |
| lmsr_no_usdc_initial_liquidity | 92120000 |
| lmsr_yes_token_supply          | 273758787 |
| lmsr_no_token_supply           | 3177734 |
+--------------------------------+---------+

Mapping to LMSRData:
- initial_liquidity_A = lmsr_yes_usdc_initial_liquidity (option 0 = YES = A)
- initial_liquidity_B = lmsr_no_usdc_initial_liquidity  (option 1 = NO = B)
- current_q_A = lmsr_yes_token_supply                   (option 0 = YES = A)
- current_q_B = lmsr_no_token_supply                    (option 1 = NO = B)
"""

@dataclass
class LMSRData:
    initial_liquidity_A: float
    initial_liquidity_B: float
    current_q_A: float
    current_q_B: float

def get_db_connection():
    """
    Get database connection using environment variables.
    
    Required environment variables:
    - SUPABASE_HOST: Database host
    - SUPABASE_DB: Database name
    - SUPABASE_USER: Database username
    - SUPABASE_PASSWORD: Database password
    - SUPABASE_PORT: Database port (optional, defaults to 5432)
    - SUPABASE_SCHEMA: Database schema (optional, defaults to canibeton_variant1)
    
    Returns:
        Database connection object
    """
    host = os.getenv('SUPABASE_HOST')
    database = os.getenv('SUPABASE_DB')
    user = os.getenv('SUPABASE_USER')
    password = os.getenv('SUPABASE_PASSWORD')
    port = os.getenv('SUPABASE_PORT', '5432')
    
    if not all([host, database, user, password]):
        raise Exception("Missing required environment variables: SUPABASE_HOST, SUPABASE_DB, SUPABASE_USER, SUPABASE_PASSWORD")
    
    try:
        connection = psycopg2.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            port=port
        )
        return connection
    except Exception as e:
        raise Exception(f"Failed to connect to database: {str(e)}")

def get_schema():
    """Get the database schema from environment variable."""
    return os.getenv('SUPABASE_SCHEMA', 'canibeton_variant1')

def get_initial_liquidity_A(connection, pool_id: int, schema: str = None) -> Optional[float]:
    """
    Get initial liquidity for option A (YES) from the database.
    
    Args:
        connection: Database connection object
        pool_id: The pool ID to query
        schema: Database schema (optional, uses SUPABASE_SCHEMA env var if not provided)
        
    Returns:
        Initial liquidity for option A, or None if not found
    """
    if schema is None:
        schema = get_schema()
    
    cursor = connection.cursor()
    query = f"""
    SELECT lmsr_yes_usdc_initial_liquidity
    FROM {schema}.pool_lmsr_data_view
    WHERE pool_id = %s;
    """
    
    cursor.execute(query, (pool_id,))
    result = cursor.fetchone()
    
    if result:
        return float(result[0])
    return None

def get_initial_liquidity_B(connection, pool_id: int, schema: str = None) -> Optional[float]:
    """
    Get initial liquidity for option B (NO) from the database.
    
    Args:
        connection: Database connection object
        pool_id: The pool ID to query
        schema: Database schema (optional, uses SUPABASE_SCHEMA env var if not provided)
        
    Returns:
        Initial liquidity for option B, or None if not found
    """
    if schema is None:
        schema = get_schema()
    
    cursor = connection.cursor()
    query = f"""
    SELECT lmsr_no_usdc_initial_liquidity
    FROM {schema}.pool_lmsr_data_view
    WHERE pool_id = %s;
    """
    
    cursor.execute(query, (pool_id,))
    result = cursor.fetchone()
    
    if result:
        return float(result[0])
    return None

def get_current_q_A(connection, pool_id: int, schema: str = None) -> Optional[float]:
    """
    Get current q value for option A from the database.
    
    Args:
        connection: Database connection object
        pool_id: The pool ID to query
        schema: Database schema (optional, uses SUPABASE_SCHEMA env var if not provided)
        
    Returns:
        Current q value for option A, or None if not found
    """
    if schema is None:
        schema = get_schema()
    
    cursor = connection.cursor()
    query = f"""
    SELECT lmsr_yes_token_supply
    FROM {schema}.pool_lmsr_data_view
    WHERE pool_id = %s;
    """
    
    cursor.execute(query, (pool_id,))
    result = cursor.fetchone()
    
    if result:
        return float(result[0])
    return None

def get_current_q_B(connection, pool_id: int, schema: str = None) -> Optional[float]:
    """
    Get current q value for option B from the database.
    
    Args:
        connection: Database connection object
        pool_id: The pool ID to query
        schema: Database schema (optional, uses SUPABASE_SCHEMA env var if not provided)
        
    Returns:
        Current q value for option B, or None if not found
    """
    if schema is None:
        schema = get_schema()
    
    cursor = connection.cursor()
    query = f"""
    SELECT lmsr_no_token_supply
    FROM {schema}.pool_lmsr_data_view
    WHERE pool_id = %s;
    """
    
    cursor.execute(query, (pool_id,))
    result = cursor.fetchone()
    
    if result:
        return float(result[0])
    return None

def get_lmsr_data_optimized(connection, pool_id: int, schema: str = None) -> Union[LMSRData, Exception]:
    """
    Get all LMSR data for a given pool ID using the new pool_lmsr_data_view table.
    
    Args:
        connection: Database connection object
        pool_id: The pool ID to query
        schema: Database schema (optional, uses SUPABASE_SCHEMA env var if not provided)
        
    Returns:
        LMSRData object with all the required values, or Exception if any value is missing
    """
    if schema is None:
        schema = get_schema()
    
    cursor = connection.cursor()
    # New simplified query using the pool_lmsr_data_view table where all data is in one row
    query = f"""
    SELECT 
        lmsr_yes_usdc_initial_liquidity as initial_liquidity_A,
        lmsr_no_usdc_initial_liquidity as initial_liquidity_B,
        lmsr_yes_token_supply as current_q_A,
        lmsr_no_token_supply as current_q_B
    FROM {schema}.pool_lmsr_data_view
    WHERE pool_id = %s;
    """
    
    try:
        cursor.execute(query, (pool_id,))
        result = cursor.fetchone()
        
        if not result:
            return Exception(f"No data found for pool_id {pool_id}")
        
        if any(value is None for value in result):
            return Exception(f"Missing data for pool_id {pool_id}")
        
        return LMSRData(
            initial_liquidity_A=float(result[0]),
            initial_liquidity_B=float(result[1]),
            current_q_A=float(result[2]),
            current_q_B=float(result[3])
        )
    
    except Exception as e:
        return Exception(f"Error retrieving LMSR data for pool_id {pool_id}: {str(e)}")

def get_lmsr_data_with_auto_connection(pool_id: int, schema: str = None) -> Union[LMSRData, Exception]:
    """
    Get all LMSR data for a given pool ID with automatic database connection management.
    
    Args:
        pool_id: The pool ID to query
        schema: Database schema (optional, uses SUPABASE_SCHEMA env var if not provided)
        
    Returns:
        LMSRData object with all the required values, or Exception if any value is missing
    """
    try:
        conn = get_db_connection()
        try:
            lmsr_data = get_lmsr_data_optimized(conn, pool_id, schema)
            return lmsr_data
        finally:
            conn.close()
    except Exception as e:
        return Exception(f"Error in get_lmsr_data_with_auto_connection: {str(e)}")

def get_current_prices_from_db(pool_id: int, schema: str = None) -> Union[Tuple[float, float], Exception]:
    """
    Get current prices for a pool directly from the database.
    
    Args:
        pool_id: The pool ID to query
        schema: Database schema (optional, uses SUPABASE_SCHEMA env var if not provided)
        
    Returns:
        Tuple of (price_A, price_B) or Exception if error
    """
    try:
        # Import here to avoid circular import
        from lmsr_calculator import calculate_current_prices
        
        lmsr_data = get_lmsr_data_with_auto_connection(pool_id, schema)
        
        if isinstance(lmsr_data, Exception):
            return lmsr_data
        
        # Calculate current prices using the LMSR calculator
        prices = calculate_current_prices(
            lmsr_data.initial_liquidity_A,
            lmsr_data.initial_liquidity_B,
            lmsr_data.current_q_A,
            lmsr_data.current_q_B
        )
        
        return prices
    
    except Exception as e:
        return Exception(f"Error calculating current prices: {str(e)}")

# Example usage:
if __name__ == "__main__":
    # Set environment variables before running
    # export SUPABASE_HOST="your_host"
    # export SUPABASE_DB="your_database"
    # export SUPABASE_USER="your_user"
    # export SUPABASE_PASSWORD="your_password"
    # export SUPABASE_PORT="5432"  # optional
    # export SUPABASE_SCHEMA="canibeton_variant1"  # optional
    
    try:
        pool_id = 25
        
        # Get LMSR data with auto connection (uses default schema from env)
        lmsr_data = get_lmsr_data_with_auto_connection(pool_id)
        if isinstance(lmsr_data, LMSRData):
            print(f"LMSR Data: {lmsr_data}")
        else:
            print(f"Error getting LMSR data: {lmsr_data}")
        
        # Get current prices (uses default schema from env)
        prices = get_current_prices_from_db(pool_id)
        if isinstance(prices, tuple):
            print(f"Current prices - A: {prices[0]:.6f}, B: {prices[1]:.6f}")
        else:
            print(f"Error getting prices: {prices}")
        
        # You can also specify a custom schema
        # prices = get_current_prices_from_db(pool_id, schema="custom_schema")
            
    except Exception as e:
        print(f"Error: {e}")
    