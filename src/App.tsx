import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Check, Calendar, Clock, Lightbulb, RefreshCw, LogOut, User } from 'lucide-react';
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
      
      // Создаем начальные данные для нового пользователя
      const initialData = {
        tasksByDate: {},
        noDeadlineTasks: [],
        ideas: [],
        dailyTasks: [],
        completedRegularTasks: {},
        regularTasksOrder: {}
      };
      
      console.log('🆕 Создаем нового пользователя:', newUserId);
      console.log('📝 Начальные данные:', initialData);
      
      const success = await saveUserData(initialData);
      if (success) {
        console.log('✅ Пользователь успешно создан');
        onLogin(newUserId);
      } else {
        throw new Error('Не удалось сохранить данные пользователя');
      }
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      alert('Ошибка регистрации. Попробуйте еще раз.');
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
          {/* Основная кнопка для новых пользователей */}
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

// Хук для авторизации - ИСПРАВЛЕН
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
  }, []); // ИСПРАВЛЕНО: убрал loadUserData из dependencies

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

// Хук для работы с Supabase - ИСПРАВЛЕН
const useSupabaseStorage = (key: string, defaultValue: any) => {
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await loadUserData();
        console.log('🔍 Загруженные данные:', userData);
        if (userData && userData[key] !== undefined) {
          setValue(userData[key]);
          console.log(`✅ Загружен ${key}:`, userData[key]);
        } else {
          console.log(`ℹ️ Нет данных для ${key}, используем значение по умолчанию`);
          setValue(defaultValue);
        }
      } catch (error) {
        console.error(`❌ Ошибка загрузки ${key}:`, error);
        setValue(defaultValue);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadData();
  }, [key]);

  const setStoredValue = useCallback(async (newValue: any) => {
    setValue((currentValue: any) => {
      const valueToStore = typeof newValue === 'function' ? newValue(currentValue) : newValue;
      
      // Сохраняем немедленно
      const saveData = async () => {
        try {
          const userData = await loadUserData() || {};
          userData[key] = valueToStore;
          const success = await saveUserData(userData);
          if (success) {
            console.log(`✅ ${key} сохранен в облаке:`, valueToStore);
          } else {
            console.error(`❌ Не удалось сохранить ${key}`);
          }
        } catch (error) {
          console.error(`❌ Ошибка сохранения ${key}:`, error);
        }
      };
      
      saveData();
      return valueToStore;
    });
  }, [key]);

  return [value, setStoredValue, isLoaded];
};

// Компоненты форм и списков
const AddTaskForm = React.memo(({ category, onAddTask, newTaskText, setNewTaskText, newTaskDate, setNewTaskDate, newTaskFrequency, setNewTaskFrequency, newTaskDays, setNewTaskDays }: any) => {
  const handleKeyDown = useCallback((e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddTask();
    }
  }, [onAddTask]);

  const toggleDay = useCallback((dayIndex: number) => {
    setNewTaskDays((prev: number[]) => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  }, [setNewTaskDays]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
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
    </div>
  );
});

const TaskList = React.memo(({ tasks, canToggle = true, onToggleTask, onDeleteTask }: any) => {
  return (
    <div className="space-y-2">
      {tasks.map((task: any) => (
        <div
          key={task.id}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
            task.completed 
              ? 'bg-green-50 border-green-200' 
              : task.isRegular 
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200 hover:shadow-sm'
          }`}
        >
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
            <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {task.text}
            </span>
            {task.isRegular && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                регулярная
              </span>
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
  );
});

// Главный компонент
export default function App() {
  const { isLoggedIn, currentUserId, isLoading, login, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Хуки данных - используются только когда пользователь авторизован
  const [tasksByDate, setTasksByDate] = useSupabaseStorage('tasksByDate', {});
  const [noDeadlineTasks, setNoDeadlineTasks] = useSupabaseStorage('noDeadlineTasks', []);
  const [ideas, setIdeas] = useSupabaseStorage('ideas', []);
  const [dailyTasks, setDailyTasks] = useSupabaseStorage('dailyTasks', []);
  const [completedRegularTasks, setCompletedRegularTasks] = useSupabaseStorage('completedRegularTasks', {});

  console.log('🔄 Текущие данные:', { tasksByDate, noDeadlineTasks, ideas, dailyTasks, completedRegularTasks });

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskFrequency, setNewTaskFrequency] = useState('daily');
  const [newTaskDays, setNewTaskDays] = useState<number[]>([]);

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

  // Вычисляемые значения
  const getCurrentDateTasks = () => {
    const normalTasks = tasksByDate[selectedDate] || [];
    const regularTasks = dailyTasks
      .filter((task: any) => {
        const date = new Date(selectedDate);
        const dayOfWeek = date.getDay();
        if (task.frequency === 'daily') return true;
        if (task.frequency === 'weekly') return task.days.includes(dayOfWeek);
        return false;
      })
      .map((task: any) => ({
        ...task,
        completed: completedRegularTasks[selectedDate]?.includes(task.id) || false,
        isRegular: true
      }));
    
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

  // Функции
  const getAutoEmoji = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('кардио') || lowerText.includes('спорт')) return '🏃‍♂️';
    if (lowerText.includes('зуб')) return '🦷';
    if (lowerText.includes('работа') || lowerText.includes('проект')) return '💼';
    return '📝';
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Заголовок */}
        <div className="bg-slate-800 text-white p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">📋 Трекер задач</h1>
              <p className="text-slate-300">
                {new Date(selectedDate).toLocaleDateString('ru-RU', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
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
          {activeTab === 'today' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Задачи на сегодня</h2>
              </div>
              
              <TaskList 
                tasks={currentDateTasks} 
                onToggleTask={(id: number) => toggleTask(id, 'today')}
                onDeleteTask={(id: number) => deleteTask(id, 'today')}
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
                onToggleTask={(id: number) => toggleTask(id, 'noDeadline')}
                onDeleteTask={(id: number) => deleteTask(id, 'noDeadline')}
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
                <h2 className="text-xl font-semibold">Идеи</h2>
              </div>
              
              <TaskList 
                tasks={ideas} 
                canToggle={false}
                onToggleTask={(id: number) => toggleTask(id, 'ideas')}
                onDeleteTask={(id: number) => deleteTask(id, 'ideas')}
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

          {activeTab === 'regular' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold">Регулярные задачи</h2>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm">
                  ℹ️ Регулярные задачи автоматически появляются во вкладке "Сегодня" согласно расписанию.
                </p>
              </div>
              
              <TaskList 
                tasks={dailyTasks} 
                canToggle={false}
                onToggleTask={(id: number) => toggleTask(id, 'regular')}
                onDeleteTask={(id: number) => deleteTask(id, 'regular')}
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
        </div>
      </div>
    </div>
  );
}
