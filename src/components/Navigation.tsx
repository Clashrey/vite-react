import React from 'react'
import { useAppStore } from '@/store'
import { TaskCategory } from '@/types'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'today' as TaskCategory, label: 'Сегодня', icon: '📅', color: 'text-blue-600' },
  { id: 'tasks' as TaskCategory, label: 'Задачи', icon: '📝', color: 'text-green-600' },
  { id: 'ideas' as TaskCategory, label: 'Идеи', icon: '💡', color: 'text-yellow-600' },
  { id: 'recurring' as TaskCategory, label: 'Регулярные', icon: '🔄', color: 'text-purple-600' },
  { id: 'analytics' as TaskCategory, label: 'Аналитика', icon: '📊', color: 'text-orange-600' },
]

export const Navigation: React.FC = () => {
  const { currentCategory, setCurrentCategory, tasks, recurringTasks } = useAppStore()

  const getTaskCount = (category: TaskCategory) => {
    switch (category) {
      case 'today':
        return tasks.filter(task => {
          const today = new Date().toISOString().split('T')[0]
          return task.category === 'today' && task.date === today
        }).length
      case 'tasks':
        return tasks.filter(task => task.category === 'tasks').length
      case 'ideas':
        return tasks.filter(task => task.category === 'ideas').length
      case 'recurring':
        return recurringTasks.length
      case 'analytics':
        return 0 // Аналитика не показывает счетчик
      default:
        return 0
    }
  }

  return (
    <nav className="w-full">
      {/* Desktop Navigation */}
      <div className="hidden sm:flex space-x-1 bg-card/50 backdrop-blur-sm p-1.5 rounded-xl border shadow-sm">
        {categories.map((category) => {
          const count = getTaskCount(category.id)
          const isActive = currentCategory === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => setCurrentCategory(category.id)}
              className={cn(
                'flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 btn-scale focus-ring',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <span className={cn('text-base', isActive ? '' : category.color)}>{category.icon}</span>
              <span className="hidden lg:inline">{category.label}</span>
              {count > 0 && category.id !== 'analytics' && (
                <span className={cn(
                  'px-2 py-0.5 text-xs rounded-full font-semibold min-w-[20px] text-center',
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden grid grid-cols-3 gap-2">
        {categories.slice(0, 3).map((category) => {
          const count = getTaskCount(category.id)
          const isActive = currentCategory === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => setCurrentCategory(category.id)}
              className={cn(
                'flex flex-col items-center space-y-1 p-3 rounded-xl text-xs font-medium transition-all duration-200 btn-scale focus-ring',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card/80 border'
              )}
            >
              <div className="flex items-center space-x-1">
                <span className={cn('text-lg', isActive ? '' : category.color)}>{category.icon}</span>
                {count > 0 && (
                  <span className={cn(
                    'px-1.5 py-0.5 text-xs rounded-full font-semibold min-w-[18px] text-center',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary text-primary-foreground'
                  )}>
                    {count}
                  </span>
                )}
              </div>
              <span className="leading-tight">{category.label}</span>
            </button>
          )
        })}
        
        {/* Вторая строка для мобильных */}
        <div className="col-span-3 grid grid-cols-2 gap-2 mt-2">
          {categories.slice(3).map((category) => {
            const count = getTaskCount(category.id)
            const isActive = currentCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => setCurrentCategory(category.id)}
                className={cn(
                  'flex flex-col items-center space-y-1 p-3 rounded-xl text-xs font-medium transition-all duration-200 btn-scale focus-ring',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card/80 border'
                )}
              >
                <div className="flex items-center space-x-1">
                  <span className={cn('text-lg', isActive ? '' : category.color)}>{category.icon}</span>
                  {count > 0 && category.id !== 'analytics' && (
                    <span className={cn(
                      'px-1.5 py-0.5 text-xs rounded-full font-semibold min-w-[18px] text-center',
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-primary text-primary-foreground'
                    )}>
                      {count}
                    </span>
                  )}
                </div>
                <span className="leading-tight">{category.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

