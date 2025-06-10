import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { DatabaseService } from '@/lib/database'

export const useDatabase = () => {
  const { 
    userId, 
    tasks, 
    setTasks, 
    recurringTasks, 
    setRecurringTasks,
    setIsLoading 
  } = useAppStore()

  // Initialize user in database
  const initializeUser = async (userId: string) => {
    try {
      let user = await DatabaseService.getUser(userId)
      if (!user) {
        user = await DatabaseService.createUser(userId)
      }
      return user
    } catch (error) {
      console.error('Error initializing user:', error)
    }
  }

  // Load user data
  const loadUserData = async (userId: string) => {
    try {
      setIsLoading(true)
      
      // Load tasks and recurring tasks in parallel
      const [tasksData, recurringTasksData] = await Promise.all([
        DatabaseService.getTasks(userId),
        DatabaseService.getRecurringTasks(userId)
      ])

      setTasks(tasksData)
      setRecurringTasks(recurringTasksData)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Save task to database
  const saveTask = async (task: Parameters<typeof DatabaseService.createTask>[0]) => {
    try {
      const savedTask = await DatabaseService.createTask(task)
      return savedTask
    } catch (error) {
      console.error('Error saving task:', error)
      throw error
    }
  }

  // Update task in database
  const updateTask = async (id: string, updates: Parameters<typeof DatabaseService.updateTask>[1]) => {
    try {
      const updatedTask = await DatabaseService.updateTask(id, updates)
      return updatedTask
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  // Delete task from database
  const deleteTask = async (id: string) => {
    try {
      await DatabaseService.deleteTask(id)
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  // Save recurring task to database
  const saveRecurringTask = async (task: Parameters<typeof DatabaseService.createRecurringTask>[0]) => {
    try {
      const savedTask = await DatabaseService.createRecurringTask(task)
      return savedTask
    } catch (error) {
      console.error('Error saving recurring task:', error)
      throw error
    }
  }

  // Update recurring task in database
  const updateRecurringTask = async (id: string, updates: Parameters<typeof DatabaseService.updateRecurringTask>[1]) => {
    try {
      const updatedTask = await DatabaseService.updateRecurringTask(id, updates)
      return updatedTask
    } catch (error) {
      console.error('Error updating recurring task:', error)
      throw error
    }
  }

  // Delete recurring task from database
  const deleteRecurringTask = async (id: string) => {
    try {
      await DatabaseService.deleteRecurringTask(id)
    } catch (error) {
      console.error('Error deleting recurring task:', error)
      throw error
    }
  }

  // Initialize user and load data when userId changes
  useEffect(() => {
    if (userId) {
      initializeUser(userId).then(() => {
        loadUserData(userId)
      })
    }
  }, [userId])

  return {
    saveTask,
    updateTask,
    deleteTask,
    saveRecurringTask,
    updateRecurringTask,
    deleteRecurringTask,
    loadUserData,
  }
}

