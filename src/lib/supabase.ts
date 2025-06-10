import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mszntxpdgnuvthjypk1h.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zem50eHBkZ251dnRoanlwa2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjM4NDIsImV4cCI6MjA2NTEzOTg0Mn0.2zfcQ7qJ3wLlt1e4ONwp5Thd75SYppSoufGEd0wtqnY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Простая авторизация - генерируем уникальный ID пользователя
export const getUserId = (): string => {
  let userId = localStorage.getItem('userId')
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 12)
    localStorage.setItem('userId', userId)
    console.log('🔑 Создан новый ID пользователя:', userId)
  }
  return userId
}

// Функции для работы с задачами
export const saveUserData = async (userData: any) => {
  const userId = getUserId()
  
  const { error } = await supabase
    .from('user_tasks')
    .upsert({ 
      user_id: userId, 
      task_data: userData 
    }, { 
      onConflict: 'user_id' 
    })
  
  if (error) {
    console.error('Ошибка сохранения:', error)
    return false
  }
  return true
}

export const loadUserData = async () => {
  const userId = getUserId()
  
  const { error } = await supabase
    .from('user_tasks')
    .select('task_data')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.log('Данные не найдены, используем пустые:', error.message)
    return null
  }
  
  return data?.task_data || null
}
