import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mszntxpdgnuvthjypkih.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zem50eHBkZ251dnRoanlwa2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjM4NDIsImV4cCI6MjA2NTEzOTg0Mn0.2zfcQ7qJ3wLlt1e4ONwp5Thd75SYppSoufGEd0wtqnY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getUserId = (): string => {
  let userId = localStorage.getItem('userId')
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 12)
    localStorage.setItem('userId', userId)
    console.log('🔑 User ID:', userId)
  }
  return userId
}

export const saveUserData = async (userData: any): Promise<boolean> => {
  const userId = getUserId()
  console.log('💾 Saving to Supabase...', userId)
  
  const { error } = await supabase
    .from('user_tasks')
    .upsert({ 
      user_id: userId, 
      task_data: userData 
    })
  
  if (error) {
    console.error('❌ Save error:', error)
    return false
  }
  console.log('✅ Saved!')
  return true
}

export const loadUserData = async (): Promise<any> => {
  const userId = getUserId()
  console.log('📥 Loading from Supabase...', userId)
  
  const { data, error } = await supabase
    .from('user_tasks')
    .select('task_data')
    .eq('user_id', userId)
    // БЕЗ .single() !!!
  
  if (error) {
    console.log('ℹ️ Database error:', error.message)
    return null
  }
  
  if (!data || data.length === 0) {
    console.log('ℹ️ No data found for user')
    return null
  }
  
  console.log('✅ Loaded!')
  return data[0]?.task_data || null
}
