#!/usr/bin/env python3
"""
Script to export Supabase tables to CSV files
Exports: external_markets, marketplaces, markets
"""

import os
import csv
import sys
from datetime import datetime
from supabase import create_client, Client

def load_env_vars():
    """Load environment variables from .env file"""
    env_vars = {}
    try:
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    # Remove 'export ' prefix if present
                    if line.startswith('export '):
                        line = line[7:]
                    
                    if '=' in line:
                        key, value = line.split('=', 1)
                        # Remove quotes if present
                        value = value.strip('"\'')
                        env_vars[key] = value
    except FileNotFoundError:
        print("Error: .env file not found")
        sys.exit(1)
    
    return env_vars

def create_supabase_client(env_vars):
    """Create and return Supabase client"""
    url = env_vars.get('SUPABASE_URL')
    key = env_vars.get('SUPABASE_SERVICE_KEY')  # Using service key for full access
    
    if not url or not key:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in .env")
        sys.exit(1)
    
    return create_client(url, key)

def export_table_to_csv(supabase: Client, table_name: str, output_dir: str = 'export'):
    """Export a table to CSV file"""
    print(f"Exporting {table_name}...")
    
    try:
        # Fetch all data from the table
        response = supabase.table(table_name).select("*").execute()
        
        if not response.data:
            print(f"No data found in {table_name}")
            return
        
        # Create CSV file
        csv_filename = os.path.join(output_dir, f"{table_name}.csv")
        
        with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
            if response.data:
                fieldnames = response.data[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                # Write header
                writer.writeheader()
                
                # Write data
                writer.writerows(response.data)
                
        print(f"✓ Exported {len(response.data)} rows to {csv_filename}")
        
    except Exception as e:
        print(f"Error exporting {table_name}: {str(e)}")

def main():
    """Main function to export all tables"""
    print("Starting Supabase data export...")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Load environment variables
    env_vars = load_env_vars()
    
    # Create Supabase client
    supabase = create_supabase_client(env_vars)
    
    # Tables to export
    tables = [
        'external_markets',
        'marketplaces',
        'markets'
    ]
    
    # Export each table
    for table in tables:
        export_table_to_csv(supabase, table)
    
    print("\n✓ Export completed successfully!")
    print(f"CSV files saved in 'export/' directory")

if __name__ == "__main__":
    main()