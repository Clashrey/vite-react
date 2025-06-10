import React from 'react'
import { useAppStore } from '@/store'
import { DateNavigation } from '@/components/DateNavigation'
import { TaskItem } from '@/components/TaskItem'
import { AddTaskForm } from '@/components/AddTaskForm'
import { ProgressBar } from '@/components/ProgressBar'
import { format } from 'date-fns'

export const TodayView: React.FC = () => {
  const { tasks, recurringTasks, currentDate } = useAppStore()
  
  const currentDateStr = format(currentDate, 'yyyy-MM-dd')
  
  // Get tasks for current date
  const todayTasks = tasks.filter(task => 
    task.category === 'today' && task.date === currentDateStr
  )
  
  // Get recurring tasks that should appear today
  const todayRecurringTasks = recurringTasks.filter(recurringTask => {
    if (recurringTask.frequency === 'daily') {
      return true
    }
    
    if (recurringTask.frequency === 'weekly' && recurringTask.days_of_week) {
      const dayOfWeek = currentDate.getDay()
      return recurringTask.days_of_week.includes(dayOfWeek)
    }
    
    return false
  })

  // Convert recurring tasks to regular tasks for display
  const recurringTasksAsRegular = todayRecurringTasks.map(rt => ({
    id: `recurring-${rt.id}`,
    user_id: rt.user_id,
    title: rt.title,
    category: 'today' as const,
    completed: false,
    date: currentDateStr,
    order_index: -1, // Put recurring tasks first
    created_at: rt.created_at,
    updated_at: rt.updated_at,
  }))

  const allTasks = [...recurringTasksAsRegular, ...todayTasks]
    .sort((a, b) => a.order_index - b.order_index)

  const completedCount = allTasks.filter(task => task.completed).length
  const totalCount = allTasks.length

  return (
    <div className="space-y-6">
      <DateNavigation />
      
      {totalCount > 0 && (
        <ProgressBar 
          completed={completedCount} 
          total={totalCount}
          label="Прогресс дня"
        />
      )}

      <div className="space-y-3">
        {allTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">🌟</div>
            <p className="text-lg mb-2">Задач на сегодня нет</p>
            <p className="text-sm">Добавьте новую задачу, чтобы начать</p>
          </div>
        ) : (
          allTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isRecurring={task.id.startsWith('recurring-')}
            />
          ))
        )}
      </div>

      <AddTaskForm 
        category="today" 
        date={currentDate}
        placeholder="Добавить задачу на сегодня..."
      />
    </div>
  )
}

