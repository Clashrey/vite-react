import { supabase } from '@/lib/supabase'
import { Task, RecurringTask } from '@/types'

export class DatabaseService {
  // User operations
  static async createUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .insert({ user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Task operations
  static async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Recurring task operations
  static async getRecurringTasks(userId: string): Promise<RecurringTask[]> {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async createRecurringTask(task: Omit<RecurringTask, 'id' | 'created_at' | 'updated_at'>): Promise<RecurringTask> {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert({
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateRecurringTask(id: string, updates: Partial<RecurringTask>): Promise<RecurringTask> {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteRecurringTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Analytics operations
  static async getTasksAnalytics(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw error
    return data || []
  }
}

