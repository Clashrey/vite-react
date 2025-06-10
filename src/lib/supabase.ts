import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          category: 'today' | 'tasks' | 'ideas'
          completed: boolean
          date: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category: 'today' | 'tasks' | 'ideas'
          completed?: boolean
          date?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: 'today' | 'tasks' | 'ideas'
          completed?: boolean
          date?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      recurring_tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          frequency: 'daily' | 'weekly'
          days_of_week: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          frequency: 'daily' | 'weekly'
          days_of_week?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          frequency?: 'daily' | 'weekly'
          days_of_week?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

