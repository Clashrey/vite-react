import { useEffect } from 'react'
import { useAppStore } from '@/store'

// Generate a short user ID (8 characters)
const generateUserId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const useAuth = () => {
  const { userId, setUserId } = useAppStore()

  useEffect(() => {
    // Check if user ID exists in localStorage
    let storedUserId = localStorage.getItem('task-tracker-user-id')
    
    if (!storedUserId) {
      // Generate new user ID and store it
      storedUserId = generateUserId()
      localStorage.setItem('task-tracker-user-id', storedUserId)
    }
    
    setUserId(storedUserId)
  }, [setUserId])

  return {
    userId,
    isAuthenticated: !!userId,
  }
}

