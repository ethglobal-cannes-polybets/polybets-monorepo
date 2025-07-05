export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      betting_pools: {
        Row: {
          betting_period: string | null
          betting_pool_idea: string
          category: string | null
          chain_id: string | null
          chain_type: string | null
          closure_criteria: string | null
          closure_instructions: string | null
          created_at: string | null
          earliest_close_date: string
          embedding: string | null
          id: number
          option_a: string
          option_b: string
          topic: string
        }
        Insert: {
          betting_period?: string | null
          betting_pool_idea: string
          category?: string | null
          chain_id?: string | null
          chain_type?: string | null
          closure_criteria?: string | null
          closure_instructions?: string | null
          created_at?: string | null
          earliest_close_date: string
          embedding?: string | null
          id?: number
          option_a: string
          option_b: string
          topic: string
        }
        Update: {
          betting_period?: string | null
          betting_pool_idea?: string
          category?: string | null
          chain_id?: string | null
          chain_type?: string | null
          closure_criteria?: string | null
          closure_instructions?: string | null
          created_at?: string | null
          earliest_close_date?: string
          embedding?: string | null
          id?: number
          option_a?: string
          option_b?: string
          topic?: string
        }
        Relationships: []
      }
      bonding_curve_bets: {
        Row: {
          amount: number
          bc_token_mint: string
          created_at: number
          fee_paid: number
          id: number
          is_paid_out: boolean
          minted_amount: number
          option_index: number
          outcome: Database["public"]["Enums"]["betoutcome"]
          payment_token_type: Database["public"]["Enums"]["tokentype"]
          pool_id: number
          transaction_hash: string
          user_address: string
        }
        Insert: {
          amount: number
          bc_token_mint: string
          created_at: number
          fee_paid: number
          id: number
          is_paid_out: boolean
          minted_amount: number
          option_index: number
          outcome: Database["public"]["Enums"]["betoutcome"]
          payment_token_type: Database["public"]["Enums"]["tokentype"]
          pool_id: number
          transaction_hash: string
          user_address: string
        }
        Update: {
          amount?: number
          bc_token_mint?: string
          created_at?: number
          fee_paid?: number
          id?: number
          is_paid_out?: boolean
          minted_amount?: number
          option_index?: number
          outcome?: Database["public"]["Enums"]["betoutcome"]
          payment_token_type?: Database["public"]["Enums"]["tokentype"]
          pool_id?: number
          transaction_hash?: string
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonding_curve_bets_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_details_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "bonding_curve_bets_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_lmsr_data_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "bonding_curve_bets_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      external_markets: {
        Row: {
          id: number
          marketplace_id: number | null
          parent_market: number | null
          price_lookup_method: string | null
          price_lookup_params: Json | null
          question: string
          url: string | null
        }
        Insert: {
          id?: number
          marketplace_id?: number | null
          parent_market?: number | null
          price_lookup_method?: string | null
          price_lookup_params?: Json | null
          question: string
          url?: string | null
        }
        Update: {
          id?: number
          marketplace_id?: number | null
          parent_market?: number | null
          price_lookup_method?: string | null
          price_lookup_params?: Json | null
          question?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_markets_marketplace_id_fkey"
            columns: ["marketplace_id"]
            isOneToOne: false
            referencedRelation: "marketplaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_markets_parent_market_fkey"
            columns: ["parent_market"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      lmsr_payout_claimed_events: {
        Row: {
          created_at: number
          id: string
          lmsr_token_mint_redeemed: string
          lmsr_tokens_redeemed: number
          payment_token_type: Database["public"]["Enums"]["tokentype"]
          payout_amount: number
          pool_id: number
          transaction_hash: string
          user_address: string
        }
        Insert: {
          created_at: number
          id: string
          lmsr_token_mint_redeemed: string
          lmsr_tokens_redeemed: number
          payment_token_type: Database["public"]["Enums"]["tokentype"]
          payout_amount: number
          pool_id: number
          transaction_hash: string
          user_address: string
        }
        Update: {
          created_at?: number
          id?: string
          lmsr_token_mint_redeemed?: string
          lmsr_tokens_redeemed?: number
          payment_token_type?: Database["public"]["Enums"]["tokentype"]
          payout_amount?: number
          pool_id?: number
          transaction_hash?: string
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "lmsr_payout_claimed_events_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_details_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "lmsr_payout_claimed_events_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_lmsr_data_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "lmsr_payout_claimed_events_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      lmsr_shares_bought_events: {
        Row: {
          created_at: number
          fee_paid: number
          id: string
          lmsr_token_mint: string
          lmsr_tokens_minted: number
          option_index: number
          payment_amount: number
          payment_token_type: Database["public"]["Enums"]["tokentype"]
          pool_id: number
          transaction_hash: string
          user_address: string
        }
        Insert: {
          created_at: number
          fee_paid: number
          id: string
          lmsr_token_mint: string
          lmsr_tokens_minted: number
          option_index: number
          payment_amount: number
          payment_token_type: Database["public"]["Enums"]["tokentype"]
          pool_id: number
          transaction_hash: string
          user_address: string
        }
        Update: {
          created_at?: number
          fee_paid?: number
          id?: string
          lmsr_token_mint?: string
          lmsr_tokens_minted?: number
          option_index?: number
          payment_amount?: number
          payment_token_type?: Database["public"]["Enums"]["tokentype"]
          pool_id?: number
          transaction_hash?: string
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "lmsr_shares_bought_events_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_details_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "lmsr_shares_bought_events_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_lmsr_data_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "lmsr_shares_bought_events_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      lmsr_shares_sold_events: {
        Row: {
          created_at: number
          fee_paid: number
          id: string
          lmsr_token_mint: string
          lmsr_tokens_burned: number
          option_index: number
          payment_amount: number
          payment_token_type: Database["public"]["Enums"]["tokentype"]
          pool_id: number
          transaction_hash: string
          user_address: string
        }
        Insert: {
          created_at: number
          fee_paid: number
          id: string
          lmsr_token_mint: string
          lmsr_tokens_burned: number
          option_index: number
          payment_amount: number
          payment_token_type: Database["public"]["Enums"]["tokentype"]
          pool_id: number
          transaction_hash: string
          user_address: string
        }
        Update: {
          created_at?: number
          fee_paid?: number
          id?: string
          lmsr_token_mint?: string
          lmsr_tokens_burned?: number
          option_index?: number
          payment_amount?: number
          payment_token_type?: Database["public"]["Enums"]["tokentype"]
          pool_id?: number
          transaction_hash?: string
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "lmsr_shares_sold_events_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_details_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "lmsr_shares_sold_events_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_lmsr_data_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "lmsr_shares_sold_events_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplaces: {
        Row: {
          active: boolean | null
          address: string
          chain_family: string | null
          chain_id: number | null
          chain_name: string
          id: number
          marketplace_proxy: string
          name: string
          price_strategy: string | null
          warp_router_id: string | null
        }
        Insert: {
          active?: boolean | null
          address: string
          chain_family?: string | null
          chain_id?: number | null
          chain_name: string
          id?: number
          marketplace_proxy?: string
          name: string
          price_strategy?: string | null
          warp_router_id?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string
          chain_family?: string | null
          chain_id?: number | null
          chain_name?: string
          id?: number
          marketplace_proxy?: string
          name?: string
          price_strategy?: string | null
          warp_router_id?: string | null
        }
        Relationships: []
      }
      markets: {
        Row: {
          common_question: string
          id: number
          options: string[]
          url: string | null
        }
        Insert: {
          common_question: string
          id?: number
          options?: string[]
          url?: string | null
        }
        Update: {
          common_question?: string
          id?: number
          options?: string[]
          url?: string | null
        }
        Relationships: []
      }
      pool_created_events: {
        Row: {
          bets_close_at: number
          category: string
          closure_criteria: string
          closure_instructions: string
          created_at: number
          creator_id: string
          creator_name: string
          id: string
          media_url: string
          no_points_mint: string
          no_usdc_mint: string
          options: string[]
          pool_id: number
          question: string
          tx_hash: string
          yes_points_mint: string
          yes_usdc_mint: string
        }
        Insert: {
          bets_close_at: number
          category: string
          closure_criteria: string
          closure_instructions: string
          created_at: number
          creator_id: string
          creator_name: string
          id: string
          media_url: string
          no_points_mint: string
          no_usdc_mint: string
          options: string[]
          pool_id: number
          question: string
          tx_hash: string
          yes_points_mint: string
          yes_usdc_mint: string
        }
        Update: {
          bets_close_at?: number
          category?: string
          closure_criteria?: string
          closure_instructions?: string
          created_at?: number
          creator_id?: string
          creator_name?: string
          id?: string
          media_url?: string
          no_points_mint?: string
          no_usdc_mint?: string
          options?: string[]
          pool_id?: number
          question?: string
          tx_hash?: string
          yes_points_mint?: string
          yes_usdc_mint?: string
        }
        Relationships: []
      }
      pools: {
        Row: {
          bc_no_points_mint: string
          bc_no_usdc_mint: string
          bc_yes_points_mint: string
          bc_yes_usdc_mint: string
          bets_close_at: number
          category: string
          closure_criteria: string
          closure_instructions: string
          created_at: number
          creation_tx_hash: string
          creator_id: string
          creator_name: string
          decision_time: number
          fee_rate_basis_points: number
          id: number
          is_draw: boolean
          is_lmsr_pool: boolean
          lmsr_migration_timestamp: number
          lmsr_no_points_initial_liquidity: number
          lmsr_no_points_mint: string
          lmsr_no_usdc_initial_liquidity: number
          lmsr_no_usdc_mint: string
          lmsr_pool_pda: string
          lmsr_yes_points_initial_liquidity: number
          lmsr_yes_points_mint: string
          lmsr_yes_usdc_initial_liquidity: number
          lmsr_yes_usdc_mint: string
          media_type: Database["public"]["Enums"]["mediatype"]
          media_url: string
          options: string[]
          question: string
          status: Database["public"]["Enums"]["poolstatus"]
          winning_option: number
        }
        Insert: {
          bc_no_points_mint: string
          bc_no_usdc_mint: string
          bc_yes_points_mint: string
          bc_yes_usdc_mint: string
          bets_close_at: number
          category: string
          closure_criteria: string
          closure_instructions: string
          created_at: number
          creation_tx_hash: string
          creator_id: string
          creator_name: string
          decision_time: number
          fee_rate_basis_points: number
          id: number
          is_draw: boolean
          is_lmsr_pool: boolean
          lmsr_migration_timestamp: number
          lmsr_no_points_initial_liquidity: number
          lmsr_no_points_mint: string
          lmsr_no_usdc_initial_liquidity: number
          lmsr_no_usdc_mint: string
          lmsr_pool_pda: string
          lmsr_yes_points_initial_liquidity: number
          lmsr_yes_points_mint: string
          lmsr_yes_usdc_initial_liquidity: number
          lmsr_yes_usdc_mint: string
          media_type: Database["public"]["Enums"]["mediatype"]
          media_url: string
          options: string[]
          question: string
          status: Database["public"]["Enums"]["poolstatus"]
          winning_option: number
        }
        Update: {
          bc_no_points_mint?: string
          bc_no_usdc_mint?: string
          bc_yes_points_mint?: string
          bc_yes_usdc_mint?: string
          bets_close_at?: number
          category?: string
          closure_criteria?: string
          closure_instructions?: string
          created_at?: number
          creation_tx_hash?: string
          creator_id?: string
          creator_name?: string
          decision_time?: number
          fee_rate_basis_points?: number
          id?: number
          is_draw?: boolean
          is_lmsr_pool?: boolean
          lmsr_migration_timestamp?: number
          lmsr_no_points_initial_liquidity?: number
          lmsr_no_points_mint?: string
          lmsr_no_usdc_initial_liquidity?: number
          lmsr_no_usdc_mint?: string
          lmsr_pool_pda?: string
          lmsr_yes_points_initial_liquidity?: number
          lmsr_yes_points_mint?: string
          lmsr_yes_usdc_initial_liquidity?: number
          lmsr_yes_usdc_mint?: string
          media_type?: Database["public"]["Enums"]["mediatype"]
          media_url?: string
          options?: string[]
          question?: string
          status?: Database["public"]["Enums"]["poolstatus"]
          winning_option?: number
        }
        Relationships: []
      }
      processed_slots_tracker: {
        Row: {
          last_processed_slot: number
          program_id: string
          updated_at: string | null
        }
        Insert: {
          last_processed_slot: number
          program_id: string
          updated_at?: string | null
        }
        Update: {
          last_processed_slot?: number
          program_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      source_tracker: {
        Row: {
          created_at: string
          id: number
          othermarketids: string | null
          polymarketid: string
        }
        Insert: {
          created_at?: string
          id?: number
          othermarketids?: string | null
          polymarketid: string
        }
        Update: {
          created_at?: string
          id?: number
          othermarketids?: string | null
          polymarketid?: string
        }
        Relationships: []
      }
    }
    Views: {
      bought_events_all: {
        Row: {
          created_at: number | null
          fee_paid: number | null
          id: string | null
          lmsr_token_mint: string | null
          lmsr_tokens_minted: number | null
          option_index: number | null
          payment_amount: number | null
          payment_token_type: string | null
          pool_id: number | null
          source_schema: string | null
          transaction_hash: string | null
          user_address: string | null
        }
        Relationships: []
      }
      pool_details_view: {
        Row: {
          bc_fee_paid: number | null
          bc_no_points_mint: string | null
          bc_no_usdc_mint: string | null
          bc_option_token_supply: number | null
          bc_payment_token_amount: number | null
          bc_yes_points_mint: string | null
          bc_yes_usdc_mint: string | null
          bets_close_at: number | null
          category: string | null
          created_at: number | null
          creator_id: string | null
          creator_name: string | null
          decision_time: number | null
          is_draw: boolean | null
          is_lmsr_pool: boolean | null
          lmsr_fee_paid: number | null
          lmsr_no_points_initial_liquidity: number | null
          lmsr_no_points_mint: string | null
          lmsr_no_usdc_initial_liquidity: number | null
          lmsr_no_usdc_mint: string | null
          lmsr_option_token_supply: number | null
          lmsr_payment_token_amount: number | null
          lmsr_pool_pda: string | null
          lmsr_yes_points_initial_liquidity: number | null
          lmsr_yes_points_mint: string | null
          lmsr_yes_usdc_initial_liquidity: number | null
          lmsr_yes_usdc_mint: string | null
          media_type: Database["public"]["Enums"]["mediatype"] | null
          media_url: string | null
          option_index: number | null
          options: string[] | null
          pool_id: number | null
          question: string | null
          status: Database["public"]["Enums"]["poolstatus"] | null
          token_type: Database["public"]["Enums"]["tokentype"] | null
          winning_option: number | null
        }
        Relationships: []
      }
      pool_lmsr_data_view: {
        Row: {
          lmsr_no_token_supply: number | null
          lmsr_no_tokens_burned: number | null
          lmsr_no_tokens_minted: number | null
          lmsr_no_usdc_initial_liquidity: number | null
          lmsr_yes_token_supply: number | null
          lmsr_yes_tokens_burned: number | null
          lmsr_yes_tokens_minted: number | null
          lmsr_yes_usdc_initial_liquidity: number | null
          pool_id: number | null
          status: Database["public"]["Enums"]["poolstatus"] | null
        }
        Relationships: []
      }
      shares_bought_all: {
        Row: {
          created_at: number | null
          fee_paid: number | null
          id: string | null
          lmsr_token_mint: string | null
          lmsr_tokens_minted: number | null
          option_index: number | null
          payment_amount: number | null
          payment_token_type: string | null
          pool_id: number | null
          source_schema: string | null
          transaction_hash: string | null
          user_address: string | null
        }
        Relationships: []
      }
      shares_sold_all: {
        Row: {
          created_at: number | null
          fee_paid: number | null
          id: string | null
          lmsr_token_mint: string | null
          lmsr_tokens_burned: number | null
          option_index: number | null
          payment_amount: number | null
          payment_token_type: string | null
          pool_id: number | null
          source_schema: string | null
          transaction_hash: string | null
          user_address: string | null
        }
        Relationships: []
      }
      sold_events_all: {
        Row: {
          created_at: number | null
          fee_paid: number | null
          id: string | null
          lmsr_token_mint: string | null
          lmsr_tokens_burned: number | null
          option_index: number | null
          payment_amount: number | null
          payment_token_type: string | null
          pool_id: number | null
          source_schema: string | null
          transaction_hash: string | null
          user_address: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_all_pool_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          pool_id: number
          question: string
          options: string[]
          status: string
          media_url: string
          media_type: string
          category: string
          creator_id: string
          creator_name: string
          bets_close_at: number
          decision_time: number
          is_draw: boolean
          winning_option: number
          created_at: number
          is_lmsr_pool: boolean
          yes_lmsr_usdc_mint: string
          no_lmsr_usdc_mint: string
          yes_lmsr_points_mint: string
          no_lmsr_points_mint: string
          token_type: string
          option_index: number
          lmsr_yes_usdc_initial_liquidity: number
          lmsr_no_usdc_initial_liquidity: number
          lmsr_yes_points_initial_liquidity: number
          lmsr_no_points_initial_liquidity: number
          bc_payment_token_amount: number
          bc_option_token_supply: number
          lmsr_option_token_supply: number
          lmsr_payment_token_amount: number
        }[]
      }
      get_pool_details_for_single_pool: {
        Args: { p_pool_id: number }
        Returns: {
          bc_fee_paid: number | null
          bc_no_points_mint: string | null
          bc_no_usdc_mint: string | null
          bc_option_token_supply: number | null
          bc_payment_token_amount: number | null
          bc_yes_points_mint: string | null
          bc_yes_usdc_mint: string | null
          bets_close_at: number | null
          category: string | null
          created_at: number | null
          creator_id: string | null
          creator_name: string | null
          decision_time: number | null
          is_draw: boolean | null
          is_lmsr_pool: boolean | null
          lmsr_fee_paid: number | null
          lmsr_no_points_initial_liquidity: number | null
          lmsr_no_points_mint: string | null
          lmsr_no_usdc_initial_liquidity: number | null
          lmsr_no_usdc_mint: string | null
          lmsr_option_token_supply: number | null
          lmsr_payment_token_amount: number | null
          lmsr_pool_pda: string | null
          lmsr_yes_points_initial_liquidity: number | null
          lmsr_yes_points_mint: string | null
          lmsr_yes_usdc_initial_liquidity: number | null
          lmsr_yes_usdc_mint: string | null
          media_type: Database["public"]["Enums"]["mediatype"] | null
          media_url: string | null
          option_index: number | null
          options: string[] | null
          pool_id: number | null
          question: string | null
          status: Database["public"]["Enums"]["poolstatus"] | null
          token_type: Database["public"]["Enums"]["tokentype"] | null
          winning_option: number | null
        }[]
      }
      get_pool_details_for_user: {
        Args: { target_user_address: string }
        Returns: {
          pool_id: number
          token_type: Database["public"]["Enums"]["tokentype"]
          option_index: number
          bc_payment_token_amount: number
          bc_option_token_supply: number
          lmsr_option_token_supply: number
          lmsr_payment_token_amount: number
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      betoutcome: "NONE" | "WON" | "LOST" | "VOIDED" | "DRAW"
      mediatype:
        | "X"
        | "TIKTOK"
        | "INSTAGRAM"
        | "FACEBOOK"
        | "IMAGE"
        | "VIDEO"
        | "EXTERNAL_LINK"
      poolstatus:
        | "NONE"
        | "PENDING"
        | "GRADED"
        | "REGRADED"
        | "LOCKED"
        | "MIGRATED"
      tokentype: "USDC" | "POINTS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      betoutcome: ["NONE", "WON", "LOST", "VOIDED", "DRAW"],
      mediatype: [
        "X",
        "TIKTOK",
        "INSTAGRAM",
        "FACEBOOK",
        "IMAGE",
        "VIDEO",
        "EXTERNAL_LINK",
      ],
      poolstatus: [
        "NONE",
        "PENDING",
        "GRADED",
        "REGRADED",
        "LOCKED",
        "MIGRATED",
      ],
      tokentype: ["USDC", "POINTS"],
    },
  },
} as const
