import React from 'react'
import { useAppStore } from '@/store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from 'date-fns'
import { ru } from 'date-fns/locale'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export const AnalyticsView: React.FC = () => {
  const { tasks, currentDate } = useAppStore()

  // Данные за текущую неделю
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const weeklyData = weekDays.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const dayTasks = tasks.filter(task => task.date === dayStr)
    const completed = dayTasks.filter(task => task.completed).length
    const total = dayTasks.length

    return {
      day: format(day, 'EEE', { locale: ru }),
      date: format(day, 'd MMM', { locale: ru }),
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })

  // Статистика по категориям
  const categoryStats = [
    {
      name: 'Сегодня',
      value: tasks.filter(task => task.category === 'today').length,
      color: COLORS[0]
    },
    {
      name: 'Задачи',
      value: tasks.filter(task => task.category === 'tasks').length,
      color: COLORS[1]
    },
    {
      name: 'Идеи',
      value: tasks.filter(task => task.category === 'ideas').length,
      color: COLORS[2]
    }
  ].filter(item => item.value > 0)

  // Общая статистика
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Статистика за последние недели
  const lastWeeksData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(currentDate, 3 - i), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(subWeeks(currentDate, 3 - i), { weekStartsOn: 1 })
    
    const weekTasks = tasks.filter(task => {
      if (!task.date) return false
      const taskDate = new Date(task.date)
      return taskDate >= weekStart && taskDate <= weekEnd
    })

    const completed = weekTasks.filter(task => task.completed).length
    const total = weekTasks.length

    return {
      week: `${format(weekStart, 'd MMM', { locale: ru })} - ${format(weekEnd, 'd MMM', { locale: ru })}`,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          📊 Аналитика
        </h2>
        <p className="text-muted-foreground">
          Анализ вашей продуктивности
        </p>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border shadow-sm text-center">
          <div className="text-3xl font-bold text-primary mb-2">{totalTasks}</div>
          <div className="text-sm text-muted-foreground">Всего задач</div>
        </div>
        
        <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border shadow-sm text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{completedTasks}</div>
          <div className="text-sm text-muted-foreground">Выполнено</div>
        </div>
        
        <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border shadow-sm text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{completionRate}%</div>
          <div className="text-sm text-muted-foreground">Процент выполнения</div>
        </div>
      </div>

      {/* График выполнения за неделю */}
      <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Выполнение задач на этой неделе</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelFormatter={(label, payload) => {
                  const data = payload?.[0]?.payload
                  return data ? `${label}, ${data.date}` : label
                }}
                formatter={(value, name) => [
                  value,
                  name === 'completed' ? 'Выполнено' : name === 'total' ? 'Всего' : name
                ]}
              />
              <Bar dataKey="total" fill="hsl(var(--muted))" name="total" />
              <Bar dataKey="completed" fill="hsl(var(--primary))" name="completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Распределение по категориям */}
      {categoryStats.length > 0 && (
        <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Распределение задач по категориям</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Тренд за последние недели */}
      <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Тренд за последние 4 недели</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lastWeeksData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="week" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  value,
                  name === 'completed' ? 'Выполнено' : name === 'total' ? 'Всего' : name
                ]}
              />
              <Bar dataKey="total" fill="hsl(var(--muted))" name="total" />
              <Bar dataKey="completed" fill="hsl(var(--primary))" name="completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {totalTasks === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-semibold mb-2">Пока нет данных для анализа</h3>
          <p className="text-muted-foreground">
            Добавьте несколько задач, чтобы увидеть статистику
          </p>
        </div>
      )}
    </div>
  )
}

