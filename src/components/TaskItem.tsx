import React, { useState } from 'react'
import { Task } from '@/types'
import { useAppStore } from '@/store'
import { Check, X, GripVertical, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  isRecurring?: boolean
  onToggleComplete?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isRecurring = false,
  onToggleComplete,
  onDelete,
  className
}) => {
  const { updateTask, deleteTask } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(task.id)
    } else {
      updateTask(task.id, { completed: !task.completed })
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id)
    } else {
      deleteTask(task.id)
    }
  }

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateTask(task.id, { title: editTitle.trim() })
      setIsEditing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      setEditTitle(task.title)
      setIsEditing(false)
    }
  }

  return (
    <div
      className={cn(
        'group flex items-center space-x-3 p-4 rounded-xl border bg-card transition-all duration-200 card-hover',
        task.completed && 'opacity-60',
        isRecurring && 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-transparent',
        className
      )}
    >
      {/* Drag Handle */}
      <div className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity touch-none">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 btn-scale focus-ring',
          task.completed
            ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20'
            : 'border-muted-foreground/30 hover:border-primary hover:bg-primary/5'
        )}
      >
        {task.completed && <Check className="w-3.5 h-3.5" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyPress}
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base focus-ring rounded px-1 -mx-1"
            autoFocus
          />
        ) : (
          <div className="space-y-1">
            <span
              className={cn(
                'text-sm sm:text-base cursor-pointer block',
                task.completed && 'line-through text-muted-foreground'
              )}
              onClick={() => setIsEditing(true)}
            >
              {task.title}
            </span>
            
            {isRecurring && (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                  🔄 регулярная
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors btn-scale focus-ring"
        >
          <Edit3 className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors btn-scale focus-ring"
        >
          <X className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </div>
  )
}

