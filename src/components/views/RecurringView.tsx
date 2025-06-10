import React, { useState } from 'react'
import { useAppStore } from '@/store'
import { RecurringTask } from '@/types'
import { Plus, X, Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const daysOfWeek = [
  { id: 0, label: 'Вс', fullLabel: 'Воскресенье' },
  { id: 1, label: 'Пн', fullLabel: 'Понедельник' },
  { id: 2, label: 'Вт', fullLabel: 'Вторник' },
  { id: 3, label: 'Ср', fullLabel: 'Среда' },
  { id: 4, label: 'Чт', fullLabel: 'Четверг' },
  { id: 5, label: 'Пт', fullLabel: 'Пятница' },
  { id: 6, label: 'Сб', fullLabel: 'Суббота' },
]

export const RecurringView: React.FC = () => {
  const { recurringTasks, addRecurringTask, deleteRecurringTask, userId } = useAppStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    frequency: 'daily' as 'daily' | 'weekly',
    days_of_week: [] as number[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTask.title.trim() || !userId) return

    addRecurringTask({
      user_id: userId,
      title: newTask.title.trim(),
      frequency: newTask.frequency,
      days_of_week: newTask.frequency === 'weekly' ? newTask.days_of_week : undefined,
    })

    setNewTask({
      title: '',
      frequency: 'daily',
      days_of_week: []
    })
    setIsAdding(false)
  }

  const toggleDay = (dayId: number) => {
    setNewTask(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayId)
        ? prev.days_of_week.filter(d => d !== dayId)
        : [...prev.days_of_week, dayId].sort()
    }))
  }

  const getFrequencyText = (task: RecurringTask) => {
    if (task.frequency === 'daily') {
      return 'Ежедневно'
    }
    
    if (task.frequency === 'weekly' && task.days_of_week) {
      const selectedDays = task.days_of_week
        .map(dayId => daysOfWeek.find(d => d.id === dayId)?.label)
        .filter(Boolean)
      return selectedDays.join(', ')
    }
    
    return 'Еженедельно'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🔄 Регулярные задачи</h2>
        <span className="text-sm text-muted-foreground">
          {recurringTasks.length} {recurringTasks.length === 1 ? 'задача' : 'задач'}
        </span>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <div className="text-blue-600 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Как работают регулярные задачи:</p>
            <p>Регулярные задачи автоматически появляются во вкладке "Сегодня" согласно расписанию. Их можно перетаскивать между собой для изменения порядка.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {recurringTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-lg mb-2">Регулярных задач пока нет</p>
            <p className="text-sm">Создайте задачи, которые повторяются каждый день или в определенные дни недели</p>
          </div>
        ) : (
          recurringTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <h3 className="font-medium">{task.title}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{getFrequencyText(task)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => deleteRecurringTask(task.id)}
                className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
          <div>
            <label className="block text-sm font-medium mb-2">Название задачи</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Название регулярной задачи..."
              className="w-full px-3 py-2 border rounded-md bg-background"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Частота</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="daily"
                  checked={newTask.frequency === 'daily'}
                  onChange={(e) => setNewTask(prev => ({ 
                    ...prev, 
                    frequency: e.target.value as 'daily' | 'weekly',
                    days_of_week: []
                  }))}
                  className="text-primary"
                />
                <span>Ежедневно</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="weekly"
                  checked={newTask.frequency === 'weekly'}
                  onChange={(e) => setNewTask(prev => ({ 
                    ...prev, 
                    frequency: e.target.value as 'daily' | 'weekly'
                  }))}
                  className="text-primary"
                />
                <span>По дням недели</span>
              </label>
            </div>
          </div>

          {newTask.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium mb-2">Дни недели</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md border transition-colors',
                      newTask.days_of_week.includes(day.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={!newTask.title.trim() || (newTask.frequency === 'weekly' && newTask.days_of_week.length === 0)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Создать
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setNewTask({ title: '', frequency: 'daily', days_of_week: [] })
              }}
              className="px-4 py-2 border rounded-md hover:bg-muted"
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-muted-foreground/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить регулярную задачу</span>
        </button>
      )}
    </div>
  )
}

