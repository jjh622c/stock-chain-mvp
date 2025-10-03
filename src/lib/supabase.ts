import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

console.log('Environment check:', {
  url: supabaseUrl,
  key: supabaseAnonKey ? 'loaded' : 'missing',
  urlLength: supabaseUrl?.length,
  keyLength: supabaseAnonKey?.length
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables missing:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  })
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})

// Database types (will be auto-generated later)
export type Database = {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          name: string
          address: string
          manager_phone: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          manager_phone: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          manager_phone?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          store_id: string
          total_amount: number
          status: 'completed' | 'cancelled'
          order_date: string
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          total_amount: number
          status?: 'completed' | 'cancelled'
          order_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          total_amount?: number
          status?: 'completed' | 'cancelled'
          order_date?: string
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
    }
  }
}