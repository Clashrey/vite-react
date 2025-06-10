import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Check, Calendar, Clock, Lightbulb, RefreshCw, ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { saveUserData, loadUserData } from './lib/supabase';

// Компонент авторизации
const AuthForm = ({ onLogin }: { onLogin: (userId: string) => void }) => {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedId = userId.trim();
    if (!trimmedId) {
      alert('Введите User ID');
      return;
    }
    
    setIsLoading(true);
    try {
      localStorage.setItem('userId', trimmedId);
      await loadUserData();
      onLogin(trimmedId);
    } catch (error) {
      alert('Ошибка входа. Проверьте User ID.');
      localStorage.removeItem('userId');
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    const newUserId = 'user_' + Math.random().toString(36).substr(2, 12);
    
    try {
      localStorage.setItem('userId', newUserId);
      await saveUserData({
        tasksByDate: {},
        noDeadlineTasks: [],
        ideas: [],
        dailyTasks: [],
        completedRegularTasks: {},
        regularTasksOrder: {}
      });
      onLogin(newUserId);
    } catch (error) {
      alert('Ошибка регистрации');
      localStorage.removeItem('userId');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Трекер задач</h1>
          <p className="text-slate-600">Вход в систему</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {isLoading ? 'Создание аккаунта...' : '🚀 Создать новый аккаунт'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Уже есть аккаунт?</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              User ID для входа
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="user_example123"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 mt-1">
              Введите ваш User ID с другого устройства
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || !userId.trim()}
            className="w-full py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Вход...' : 'Войти с существующим ID'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Как это работает:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>Новый пользователь?</strong> Нажмите "Создать новый аккаунт" — получите уникальный ID</li>
            <li>• <strong>Есть аккаунт?</strong> Введите ваш User ID и войдите</li>
            <li>• <strong>Синхронизация:</strong> Используйте один ID на всех ваших устройствах</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Хук для авторизации
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        try {
          await loadUserData();
          setCurrentUserId(storedUserId);
          setIsLoggedIn(true);
        } catch (error) {
          localStorage.removeItem('userId');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []); // Убрали loadUserData из dependencies

  const login = useCallback((userId: string) => {
    setCurrentUserId(userId);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setCurrentUserId(null);
    setIsLoggedIn(false);
    window.location.reload();
  }, []);

  return { isLoggedIn, currentUserId, isLoading, login, logout };
};

// Хук для работы с Supabase - ИСПРАВЛЕННЫЙ
const useSupabaseStorage = (key: string, defaultValue: any, isAuthorized: boolean) => {
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthorized) {
      setValue(defaultValue);
      setIsLoaded(true);
      return;
    }

    const loadData = async () => {
      try {
        const userData = await loadUserData();
        if (userData && userData[key]) {
          setValue(userData[key]);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error(`Ошибка загрузки ${key}:`, error);
        setIsLoaded(true);
      }
    };
    
    loadData();
  }, [key, isAuthorized]);

  const setStoredValue = useCallback(async (newValue: any) => {
    if (!isAuthorized) {
      setValue(newValue);
      return;
    }

    try {
      setValue((currentValue: any) => {
        const valueToStore = typeof newValue === 'function' ? newValue(currentValue) : newValue;
        
        setTimeout(async () => {
          try {
            const userData = await loadUserData() || {};
            userData[key] = valueToStore;
            await saveUserData(userData);
            console.log(`✅ ${key} сохранен в облаке`);
          } catch (error) {
            console.error(`Ошибка сохранения ${key}:`, error);
          }
        }, 100);
        
        return valueToStore;
      });
    } catch (error) {
      console.error(`Ошибка установки ${key}:`, error);
    }
  }, [key, isAuthorized]);

  return [value, setStoredValue, isLoaded];
};

// Компоненты форм и списков - упрощены
const AddTaskForm = React.memo(({ category, onAddTask, newTaskText, setNewTaskText, newTaskDate, setNewTaskDate, newTaskFrequency, setNewTaskFrequency, newTaskDays, setNewTaskDays }: any) => {
  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddTask();
    }
  };

  const handleTextChange = (e: any) => {
    setNewTaskText(e.target.value);
  };

  const toggleDay = (dayIndex: number) => {
    setNewTaskDays((prev: number[]) => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (dateStr === today) return 'Сегодня';
    if (dateStr === tomorrow) return 'Завтра';
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newTaskText}
          onChange={handleTextChange}
          placeholder="Новая задача..."
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {category === 'today' && (
          <input
            type="date"
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        <button
          onClick={onAddTask}
          disabled={!newTaskText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {category === 'regular' && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Частота:</label>
            <select 
              value={newTaskFrequency} 
              onChange={(e) => setNewTaskFrequency(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Ежедневно</option>
              <option value="weekly">По дням недели</option>
            </select>
          </div>
          
          {newTaskFrequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium mb-2">Дни недели:</label>
              <div className="flex gap-1">
                {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      newTaskDays.includes(index)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {category === 'today' && newTaskDate !== new Date().toISOString().split('T')[0] && (
        <p className="text-sm text-blue-600 mt-2">
          ➕ Задача будет добавлена на {formatDateShort(newTaskDate)}
        </p>
      )}
    </div>
  );
});

const TaskList = React.memo(({ tasks, category, showCompleted = true, canToggle = true, onToggleTask, onDeleteTask, onDragStart, onDragOver, onDragLeave, onDrop, dragOverIndex }: any) => {
  const completed = tasks.filter((task: any) => task.completed);
  const active = showCompleted ? tasks : tasks.filter((task: any) => !task.completed);
  const displayTasks = showCompleted ? active : active.filter((task: any) => !task.completed);

  let regularTasks: any[] = [];
  let normalTasks = displayTasks;
  
  if (category === 'today') {
    regularTasks = displayTasks.filter((t: any) => t.isRegular);
    normalTasks = displayTasks.filter((t: any) => !t.isRegular);
  }

  return (
    <div className="space-y-2">
      {category === 'today' && regularTasks.length > 0 && (
        <div className="space-y-2">
          {regularTasks.map((task: any, index: number) => (
            <div
              key={task.id}
              draggable={true}
              onDragStart={(e) => onDragStart(e, task, index, 'regular')}
              onDragOver={(e) => onDragOver(e, index, 'regular')}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, index, 'regular')}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move ${
                task.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              } ${
                dragOverIndex?.index === index && dragOverIndex?.type === 'regular' ? 'border-blue-500 bg-blue-100' : ''
              }`}
            >
              <div className="flex-shrink-0 text-gray-400 cursor-move">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="4" cy="4" r="1"/>
                  <circle cx="4" cy="8" r="1"/>
                  <circle cx="4" cy="12" r="1"/>
                  <circle cx="8" cy="4" r="1"/>
                  <circle cx="8" cy="8" r="1"/>
                  <circle cx="8" cy="12" r="1"/>
                  <circle cx="12" cy="4" r="1"/>
                  <circle cx="12" cy="8" r="1"/>
                  <circle cx="12" cy="12" r="1"/>
                </svg>
              </div>
              
              {canToggle && (
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {task.completed && <Check className="w-4 h-4" />}
                </button>
              )}
              
              <span className="text-lg">{task.emoji}</span>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {task.text}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    регулярная
                  </span>
                </div>
                {task.frequency && (
                  <div className="text-xs text-blue-600 mt-1">
                    {task.frequency === 'daily' ? 'Ежедневно' : 
                     task.frequency === 'weekly' ? `По ${task.days?.map((d: number) => ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d]).join(', ')}` : 
                     task.frequency}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => onDeleteTask(task.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(category !== 'today' ? displayTasks : normalTasks).map((task: any, index: number) => {
        return (
          <div
            key={task.id}
            draggable={true}
            onDragStart={(e) => onDragStart(e, task, index, 'normal')}
            onDragOver={(e) => onDragOver(e, index, 'normal')}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index, 'normal')}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move ${
              task.completed 
                ? 'bg-green-50 border-green-200' 
                : task.isRegular 
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:shadow-sm'
            } ${
              dragOverIndex?.index === index && dragOverIndex?.type === 'normal' ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <div className="flex-shrink-0 text-gray-400 cursor-move">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="4" cy="4" r="1"/>
                <circle cx="4" cy="8" r="1"/>
                <circle cx="4" cy="12" r="1"/>
                <circle cx="8" cy="4" r="1"/>
                <circle cx="8" cy="8" r="1"/>
                <circle cx="8" cy="12" r="1"/>
                <circle cx="12" cy="4" r="1"/>
                <circle cx="12" cy="8" r="1"/>
                <circle cx="12" cy="12" r="1"/>
              </svg>
            </div>
            
            {canToggle && (
              <button
                onClick={() => onToggleTask(task.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                {task.completed && <Check className="w-4 h-4" />}
              </button>
            )}
            
            <span className="text-lg">{task.emoji}</span>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.text}
                </span>
                {task.isRegular && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    регулярная
                  </span>
                )}
              </div>
              {task.frequency && (
                <div className="text-xs text-blue-600 mt-1">
                  {task.frequency === 'daily' ? 'Ежедневно' : 
                   task.frequency === 'weekly' ? `По ${task.days?.map((d: number) => ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d]).join(', ')}` : 
                   task.frequency}
                </div>
              )}
            </div>
            
            <button
              onClick={() => onDeleteTask(task.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      
      {showCompleted && completed.length > 0 && displayTasks.some((t: any) => !t.completed) && (
        <div className="border-t pt-3 mt-4">
          <p className="text-sm text-gray-500 mb-2">✅ Выполнено ({completed.length})</p>
        </div>
      )}
    </div>
  );
});

const MiniCalendar = React.memo(({ selectedDate, tasksByDate, onSelectDate }: any) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayDate = today.getDate();
  const selectedDateObj = new Date(selectedDate);
  const selectedDay = selectedDateObj.getDate();
  const selectedMonth = selectedDateObj.getMonth();
  const selectedYear = selectedDateObj.getFullYear();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-600 py-1">{day}</div>
        ))}
        
        {Array.from({ length: calendarData.firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="py-1"></div>
        ))}
        
        {Array.from({ length: calendarData.daysInMonth }, (_, i) => {
          const day = i + 1;
          const isToday = day === calendarData.todayDate && 
                         calendarData.currentMonth === calendarData.currentMonth && 
                         calendarData.currentYear === calendarData.currentYear;
          const isSelected = day === calendarData.selectedDay && 
                           calendarData.currentMonth === calendarData.selectedMonth && 
                           calendarData.currentYear === calendarData.selectedYear;
          const dateStr = new Date(calendarData.currentYear, calendarData.currentMonth, day).toISOString().split('T')[0];
          const hasTasks = tasksByDate[dateStr] && tasksByDate[dateStr].length > 0;
          
          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className={`py-1 px-1 text-xs rounded transition-colors relative ${
                isSelected 
                  ? 'bg-blue-600 text-white' 
                  : isToday
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'hover:bg-blue-50'
              }`}
            >
              {day}
              {hasTasks && (
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                  isSelected ? 'bg-white' : 'bg-blue-500'
                }`}></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

// Главный компонент
export default function App() {
  const { isLoggedIn, currentUserId, isLoading, login, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [tasksByDate, setTasksByDate] = useSupabaseStorage('tasksByDate', {
    [new Date().toISOString().split('T')[0]]: [
      { id: 1, text: 'Подъем', completed: true, emoji: '🌅' },
      { id: 2, text: 'Утренняя рутина', completed: true, emoji: '☀️' },
      { id: 3, text: 'Кардио + бассейн', completed: true, emoji: '🏊‍♂️' },
      { id: 4, text: 'Ашваганда + витамин D', completed: false, emoji: '💊' },
      { id: 5, text: 'Посты для Севастополя', completed: false, emoji: '🏠' },
      { id: 6, text: 'Посты для Ростова', completed: false, emoji: '🏠' },
      { id: 7, text: 'Проверить РСЯ', completed: false, emoji: '💻' },
      { id: 8, text: 'Заявление — оператор персональных данных', completed: false, emoji: '📋' }
    ]
  }, isLoggedIn);

  const [noDeadlineTasks, setNoDeadlineTasks] = useSupabaseStorage('noDeadlineTasks', [
    { id: 101, text: 'Подготовить к запуску хотя бы один канал-афишу', emoji: '📺' },
    { id: 102, text: 'Разобраться с РКН в Тюмени (или уточнить актуальность)', emoji: '⚙️' },
    { id: 103, text: 'Узнать про починку байка', emoji: '🏍️' },
    { id: 104, text: 'Записаться к стоматологу', emoji: '🦷' },
    { id: 105, text: 'Сдать анализы (ориентир — 4 июня)', emoji: '🧪' },
    { id: 106, text: 'Узнать про работу с самозанятыми', emoji: '💼' },
    { id: 107, text: 'Решить, что делать с Ростовом (если не обдашешь сегодня)', emoji: '🤔' },
    { id: 108, text: 'Запустить рассылку по агентствам (если отложено)', emoji: '📧' }
  ], isLoggedIn);

  const [ideas, setIdeas] = useSupabaseStorage('ideas', [
    { id: 201, text: 'Концепция афишного канала — шаблоны для постов', emoji: '💡' },
    { id: 202, text: 'Канал по экономике — запуск (Ростов или Питер?)', emoji: '📊' }
  ], isLoggedIn);

  const [dailyTasks, setDailyTasks] = useSupabaseStorage('dailyTasks', [
    { id: 301, text: 'Уход за собой — борода, ногти, нос, брови', emoji: '🧔', frequency: 'weekly', days: [0] },
    { id: 302, text: 'Заполнить бюджет', emoji: '📋', frequency: 'weekly', days: [0] },
    { id: 303, text: 'Почистить зубы вечером', emoji: '🦷', frequency: 'daily', days: [] },
    { id: 304, text: 'Магний + урсосан вечером', emoji: '🌙', frequency: 'daily', days: [] }
  ], isLoggedIn);

  const [completedRegularTasks, setCompletedRegularTasks] = useSupabaseStorage('completedRegularTasks', {}, isLoggedIn);
  const [regularTasksOrder, setRegularTasksOrder] = useSupabaseStorage('regularTasksOrder', {}, isLoggedIn);

  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverIndex, setDragOverIndex] = useState<any>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskFrequency, setNewTaskFrequency] = useState('daily');
  const [newTaskDays, setNewTaskDays] = useState<number[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-lg text-slate-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  // Показываем форму авторизации
  if (!isLoggedIn) {
    return <AuthForm onLogin={login} />;
  }

  // Вычисляемые значения - упрощено без useMemo
  const getTodayRegularTasks = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    
    const applicableTasks = dailyTasks
      .filter((task: any) => {
        if (task.frequency === 'daily') return true;
        if (task.frequency === 'weekly') return task.days.includes(dayOfWeek);
        return false;
      })
      .map((task: any) => ({
        ...task,
        completed: completedRegularTasks[dateStr]?.includes(task.id) || false,
        isRegular: true
      }));

    const savedOrder = regularTasksOrder[dateStr];
    if (savedOrder && savedOrder.length > 0) {
      const orderedTasks: any[] = [];
      savedOrder.forEach((taskId: number) => {
        const task = applicableTasks.find((t: any) => t.id === taskId);
        if (task) orderedTasks.push(task);
      });
      applicableTasks.forEach((task: any) => {
        if (!savedOrder.includes(task.id)) {
          orderedTasks.push(task);
        }
      });
      return orderedTasks;
    }
    
    return applicableTasks;
  };

  const getCurrentDateTasks = () => {
    const regularTasks = getTodayRegularTasks(selectedDate);
    const normalTasks = tasksByDate[selectedDate] || [];
    return [...regularTasks, ...normalTasks];
  };

  const currentDateTasks = getCurrentDateTasks();
  
  const tabs = [
    { id: 'today', label: 'Сегодня', icon: Calendar, count: currentDateTasks.filter((t: any) => !t.completed).length },
    { id: 'noDeadline', label: 'Без срока', icon: Clock, count: noDeadlineTasks.length },
    { id: 'ideas', label: 'Идеи', icon: Lightbulb, count: ideas.length },
    { id: 'regular', label: 'Регулярные', icon: RefreshCw, count: dailyTasks.length }
  ];

  const completedToday = currentDateTasks.filter((t: any) => t.completed).length;
  const totalToday = currentDateTasks.length;

  // Функции - упрощены без useCallback
  const getAutoEmoji = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('кардио') || lowerText.includes('спорт') || lowerText.includes('бассейн') || 
        lowerText.includes('зал') || lowerText.includes('тренировка') || lowerText.includes('бег')) {
      return '🏃‍♂️';
    }
    
    if (lowerText.includes('зуб') || lowerText.includes('стоматолог')) {
      return '🦷';
    }
    
    if (lowerText.includes('работа') || lowerText.includes('проект') || lowerText.includes('канал') || 
        lowerText.includes('пост') || lowerText.includes('контент') || lowerText.includes('реклама')) {
      return '💼';
    }
    
    if (lowerText.includes('купить') || lowerText.includes('магазин') || lowerText.includes('покупк')) {
      return '🛒';
    }
    
    if (lowerText.includes('готовить') || lowerText.includes('еда') || lowerText.includes('кухня') || 
        lowerText.includes('завтрак') || lowerText.includes('обед') || lowerText.includes('ужин')) {
      return '🍳';
    }
    
    if (lowerText.includes('машина') || lowerText.includes('байк') || lowerText.includes('ремонт') || 
        lowerText.includes('сервис') || lowerText.includes('починк')) {
      return '🔧';
    }
    
    if (lowerText.includes('документ') || lowerText.includes('заявление') || lowerText.includes('бумаг') || 
        lowerText.includes('справк') || lowerText.includes('оформ')) {
      return '📋';
    }
    
    if (lowerText.includes('врач') || lowerText.includes('анализ') || lowerText.includes('больниц') || 
        lowerText.includes('лечение') || lowerText.includes('таблетк') || lowerText.includes('витамин') || 
        lowerText.includes('магний') || lowerText.includes('ашваганда') || lowerText.includes('урсосан')) {
      return '💊';
    }
    
    if (lowerText.includes('деньги') || lowerText.includes('бюджет') || lowerText.includes('финанс') || 
        lowerText.includes('зарплат') || lowerText.includes('платеж') || lowerText.includes('счет')) {
      return '💰';
    }
    
    if (lowerText.includes('убор') || lowerText.includes('чист') || lowerText.includes('мыть') || 
        lowerText.includes('порядок')) {
      return '🧹';
    }
    
    if (lowerText.includes('звонок') || lowerText.includes('звонить') || lowerText.includes('связать') || 
        lowerText.includes('позвонить') || lowerText.includes('телефон')) {
      return '📞';
    }
    
    if (lowerText.includes('дом') || lowerText.includes('квартир') || lowerText.includes('ремонт дома') || 
        lowerText.includes('интерьер')) {
      return '🏠';
    }
    
    if (lowerText.includes('подъем') || lowerText.includes('встать') || lowerText.includes('утр')) {
      return '🌅';
    }
    
    if (lowerText.includes('вечер') || lowerText.includes('ночь') || lowerText.includes('сон')) {
      return '🌙';
    }
    
    if (lowerText.includes('идея') || lowerText.includes('концепция') || lowerText.includes('план') || 
        lowerText.includes('стратегия') || lowerText.includes('креатив')) {
      return '💡';
    }
    
    if (lowerText.includes('учить') || lowerText.includes('изучать') || lowerText.includes('курс') || 
        lowerText.includes('книга') || lowerText.includes('читать')) {
      return '📚';
    }
    
    if (lowerText.includes('компьютер') || lowerText.includes('сайт') || lowerText.includes('код') || 
        lowerText.includes('программ') || lowerText.includes('рся') || lowerText.includes('реклам')) {
      return '💻';
    }
    
    return '📝';
  };

  const getCurrentDate = () => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (dateStr === today) return 'Сегодня';
    if (dateStr === tomorrow) return 'Завтра';
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const changeDate = (direction: number) => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const toggleTask = (taskId: number, category: string) => {
    if (category === 'today') {
      const task = currentDateTasks.find((t: any) => t.id === taskId);
      
      if (task && task.isRegular) {
        setCompletedRegularTasks((prev: any) => {
          const dateCompleted = prev[selectedDate] || [];
          const isCompleted = dateCompleted.includes(taskId);
          
          return {
            ...prev,
            [selectedDate]: isCompleted 
              ? dateCompleted.filter((id: number) => id !== taskId)
              : [...dateCompleted, taskId]
          };
        });
      } else {
        setTasksByDate((prev: any) => ({
          ...prev,
          [selectedDate]: (prev[selectedDate] || []).map((task: any) => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        }));
      }
    } else if (category === 'noDeadline') {
      setNoDeadlineTasks((prev: any) => prev.map((task: any) => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
    }
  };

  const deleteTask = (taskId: number, category: string) => {
    if (category === 'today') {
      const task = currentDateTasks.find((t: any) => t.id === taskId);
      
      if (task && task.isRegular) {
        alert('Регулярные задачи можно удалить только во вкладке "Регулярные"');
        return;
      } else {
        setTasksByDate((prev: any) => ({
          ...prev,
          [selectedDate]: (prev[selectedDate] || []).filter((task: any) => task.id !== taskId)
        }));
      }
    } else if (category === 'noDeadline') {
      setNoDeadlineTasks((prev: any) => prev.filter((task: any) => task.id !== taskId));
    } else if (category === 'ideas') {
      setIdeas((prev: any) => prev.filter((task: any) => task.id !== taskId));
    } else if (category === 'regular') {
      setDailyTasks((prev: any) => prev.filter((task: any) => task.id !== taskId));
    }
  };

  const addTask = (category: string) => {
    if (!newTaskText.trim()) return;
    
    const newTask: any = {
      id: Date.now(),
      text: newTaskText.trim(),
      emoji: getAutoEmoji(newTaskText.trim()),
      completed: false
    };

    if (category === 'today') {
      const targetDate = newTaskDate;
      setTasksByDate((prev: any) => ({
        ...prev,
        [targetDate]: [...(prev[targetDate] || []), newTask]
      }));
    } else if (category === 'regular') {
      newTask.frequency = newTaskFrequency;
      newTask.days = newTaskDays;
      setDailyTasks((prev: any) => [...prev, newTask]);
    } else if (category === 'noDeadline') {
      setNoDeadlineTasks((prev: any) => [...prev, newTask]);
    } else if (category === 'ideas') {
      setIdeas((prev: any) => [...prev, newTask]);
    }

    setNewTaskText('');
    setNewTaskDate(new Date().toISOString().split('T')[0]);
    setNewTaskFrequency('daily');
    setNewTaskDays([]);
  };

  // Drag and drop
  const handleDragStart = (e: any, task: any, index: number, type: string) => {
    setDraggedItem({ task, index, type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: any, index: number, type: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex({ index, type });
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: any, dropIndex: number, dropType: string) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedItem || draggedItem.type !== dropType) return;
    
    const dragIndex = draggedItem.index;
    if (dragIndex === dropIndex) return;

    const reorderArray = (array: any[]) => {
      const newArray = [...array];
      const [removed] = newArray.splice(dragIndex, 1);
      newArray.splice(dropIndex, 0, removed);
      return newArray;
    };

    if (dropType === 'regular') {
      const regularTasks = getTodayRegularTasks(selectedDate);
      const reorderedRegularTasks = reorderArray(regularTasks);
      const newOrder = reorderedRegularTasks.map((task: any) => task.id);
      
      setRegularTasksOrder((prev: any) => ({
        ...prev,
        [selectedDate]: newOrder
      }));
    } else if (dropType === 'normal') {
      if (activeTab === 'today') {
        const normalTasks = (tasksByDate[selectedDate] || []).filter((t: any) => !t.isRegular);
        const reorderedNormalTasks = reorderArray(normalTasks);
        setTasksByDate((prev: any) => ({
          ...prev,
          [selectedDate]: reorderedNormalTasks
        }));
      } else if (activeTab === 'noDeadline') {
        setNoDeadlineTasks(reorderArray(noDeadlineTasks));
      } else if (activeTab === 'ideas') {
        setIdeas(reorderArray(ideas));
      } else if (activeTab === 'regular') {
        setDailyTasks(reorderArray(dailyTasks));
      }
    }

    setDraggedItem(null);
  };

  // Обработчики для передачи в компоненты
  const handleToggleTask = (category: string) => (taskId: number) => {
    toggleTask(taskId, category);
  };

  const handleDeleteTask = (category: string) => (taskId: number) => {
    deleteTask(taskId, category);
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Заголовок с пользователем */}
        <div className="bg-slate-800 text-white p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">📋 Трекер задач</h1>
              <p className="text-slate-300">{getCurrentDate()}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <User className="w-4 h-4" />
                  <code className="bg-slate-700 px-2 py-1 rounded text-xs">
                    {currentUserId}
                  </code>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {totalToday > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Прогресс дня</span>
                <span>{completedToday}/{totalToday}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalToday > 0 ? (completedToday / totalToday) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Вкладки */}
        <div className="flex border-b">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Контент */}
        <div className="p-6">
          {activeTab === 'regular' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold">Регулярные задачи</h2>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm">
                  ℹ️ Здесь настраиваются регулярные задачи. Они автоматически появляются во вкладке "Сегодня" согласно расписанию.
                </p>
              </div>
              <TaskList 
                tasks={dailyTasks} 
                category="regular" 
                canToggle={false}
                onToggleTask={handleToggleTask('regular')}
                onDeleteTask={handleDeleteTask('regular')}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                dragOverIndex={dragOverIndex}
              />
              <div className="mt-6">
                <AddTaskForm 
                  category="regular"
                  onAddTask={() => addTask('regular')}
                  newTaskText={newTaskText}
                  setNewTaskText={setNewTaskText}
                  newTaskDate={newTaskDate}
                  setNewTaskDate={setNewTaskDate}
                  newTaskFrequency={newTaskFrequency}
                  setNewTaskFrequency={setNewTaskFrequency}
                  newTaskDays={newTaskDays}
                  setNewTaskDays={setNewTaskDays}
                />
              </div>
            </div>
          )}

          {activeTab === 'today' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Задачи</h2>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                      showCalendar 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📅 Календарь
                  </button>
                  
                  <button
                    onClick={() => changeDate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center min-w-[120px]">
                    <div className="font-medium">{formatDateShort(selectedDate)}</div>
                    <div className="text-xs text-gray-500">{getCurrentDate().split(',')[0]}</div>
                  </div>
                  <button
                    onClick={() => changeDate(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {showCalendar && (
                <MiniCalendar 
                  selectedDate={selectedDate}
                  tasksByDate={tasksByDate}
                  onSelectDate={handleSelectDate}
                />
              )}
              
              {currentDateTasks.some((t: any) => t.isRegular) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 text-sm">
                    🔄 Синие задачи — регулярные, подтянулись автоматически. Их можно перетаскивать между собой для изменения порядка. Настроить можно во вкладке "Регулярные".
                  </p>
                </div>
              )}
              
              <TaskList 
                tasks={currentDateTasks} 
                category="today" 
                onToggleTask={handleToggleTask('today')}
                onDeleteTask={handleDeleteTask('today')}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                dragOverIndex={dragOverIndex}
              />
              <div className="mt-6">
                <AddTaskForm 
                  category="today"
                  onAddTask={() => addTask('today')}
                  newTaskText={newTaskText}
                  setNewTaskText={setNewTaskText}
                  newTaskDate={newTaskDate}
                  setNewTaskDate={setNewTaskDate}
                  newTaskFrequency={newTaskFrequency}
                  setNewTaskFrequency={setNewTaskFrequency}
                  newTaskDays={newTaskDays}
                  setNewTaskDays={setNewTaskDays}
                />
              </div>
            </div>
          )}

          {activeTab === 'noDeadline' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-semibold">Задачи без срока</h2>
              </div>
              <TaskList 
                tasks={noDeadlineTasks} 
                category="noDeadline" 
                onToggleTask={handleToggleTask('noDeadline')}
                onDeleteTask={handleDeleteTask('noDeadline')}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                dragOverIndex={dragOverIndex}
              />
              <div className="mt-6">
                <AddTaskForm 
                  category="noDeadline"
                  onAddTask={() => addTask('noDeadline')}
                  newTaskText={newTaskText}
                  setNewTaskText={setNewTaskText}
                  newTaskDate={newTaskDate}
                  setNewTaskDate={setNewTaskDate}
                  newTaskFrequency={newTaskFrequency}
                  setNewTaskFrequency={setNewTaskFrequency}
                  newTaskDays={newTaskDays}
                  setNewTaskDays={setNewTaskDays}
                />
              </div>
            </div>
          )}

          {activeTab === 'ideas' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-semibold">Идеи / В процессе</h2>
              </div>
              <TaskList 
                tasks={ideas} 
                category="ideas" 
                canToggle={false} 
                onToggleTask={handleToggleTask('ideas')}
                onDeleteTask={handleDeleteTask('ideas')}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                dragOverIndex={dragOverIndex}
              />
              <div className="mt-6">
                <AddTaskForm 
                  category="ideas"
                  onAddTask={() => addTask('ideas')}
                  newTaskText={newTaskText}
                  setNewTaskText={setNewTaskText}
                  newTaskDate={newTaskDate}
                  setNewTaskDate={setNewTaskDate}
                  newTaskFrequency={newTaskFrequency}
                  setNewTaskFrequency={setNewTaskFrequency}
                  newTaskDays={newTaskDays}
                  setNewTaskDays={setNewTaskDays}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
