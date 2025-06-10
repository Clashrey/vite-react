import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAppStore } from '@/store'
import { TaskCategory } from '@/types'
import { format } from 'date-fns'

interface AddTaskFormProps {
  category: TaskCategory
  date?: Date
  placeholder?: string
  className?: string
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({
  category,
  date,
  placeholder = 'Новая задача...',
  className
}) => {
  const { addTask, userId, currentDate } = useAppStore()
  const [title, setTitle] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !userId) return

    const taskDate = date || (category === 'today' ? currentDate : undefined)
    
    addTask({
      user_id: userId,
      title: title.trim(),
      category: category === 'today' ? 'today' : category,
      completed: false,
      date: taskDate ? format(taskDate, 'yyyy-MM-dd') : undefined,
      order_index: 0,
    })

    setTitle('')
    setIsExpanded(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTitle('')
      setIsExpanded(false)
    }
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`w-full flex items-center justify-center space-x-2 p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all duration-200 text-muted-foreground hover:text-primary hover:bg-primary/5 btn-scale focus-ring ${className}`}
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm sm:text-base font-medium">{placeholder}</span>
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div className="flex space-x-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 border rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          autoFocus
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-scale focus-ring shadow-md shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      <button
        type="button"
        onClick={() => {
          setTitle('')
          setIsExpanded(false)
        }}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Нажмите Escape или кликните здесь для отмены
      </button>
    </form>
  )
}

