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
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || !userId.trim()}
            className="w-full py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Вход...' : 'Войти с существующим ID'}
          </button>
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
  }, []);

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

// Хук для работы с Supabase
const useSupabaseStorage = (key: string, defaultValue: any) => {
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
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
  }, [key]);

  const setStoredValue = useCallback(async (newValue: any) => {
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
  }, [key]);

  return [value, setStoredValue, isLoaded];
};

// Простые компоненты без сложностей
const TaskItem = ({ task, canToggle = true, onToggle, onDelete }: any) => (
  <div className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:shadow-sm transition-all">
    {canToggle && (
      <button
        onClick={() => onToggle(task.id)}
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
      onClick={() => onDelete(task.id)}
      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const AddTaskForm = ({ onAdd, text, setText, date, setDate }: any) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Новая задача..."
        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onKeyDown={(e) => e.key === 'Enter' && onAdd()}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={onAdd}
        disabled={!text.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

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
  });

  const [noDeadlineTasks, setNoDeadlineTasks] = useSupabaseStorage('noDeadlineTasks', [
    { id: 101, text: 'Подготовить к запуску хотя бы один канал-афишу', emoji: '📺' },
    { id: 102, text: 'Разобраться с РКН в Тюмени (или уточнить актуальность)', emoji: '⚙️' },
    { id: 103, text: 'Узнать про починку байка', emoji: '🏍️' },
    { id: 104, text: 'Записаться к стоматологу', emoji: '🦷' },
    { id: 105, text: 'Сдать анализы (ориентир — 4 июня)', emoji: '🧪' },
    { id: 106, text: 'Узнать про работу с самозанятыми', emoji: '💼' },
    { id: 107, text: 'Решить, что делать с Ростовом (если не обдашешь сегодня)', emoji: '🤔' },
    { id: 108, text: 'Запустить рассылку по агентствам (если отложено)', emoji: '📧' }
  ]);

  const [ideas, setIdeas] = useSupabaseStorage('ideas', [
    { id: 201, text: 'Концепция афишного канала — шаблоны для постов', emoji: '💡' },
    { id: 202, text: 'Канал по экономике — запуск (Ростов или Питер?)', emoji: '📊' }
  ]);

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);

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

  // Функции
  const getAutoEmoji = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('кардио') || lowerText.includes('спорт')) return '🏃‍♂️';
    if (lowerText.includes('зуб')) return '🦷';
    if (lowerText.includes('работа') || lowerText.includes('проект')) return '💼';
    if (lowerText.includes('купить')) return '🛒';
    if (lowerText.includes('еда')) return '🍳';
    if (lowerText.includes('байк') || lowerText.includes('машина')) return '🔧';
    if (lowerText.includes('документ')) return '📋';
    if (lowerText.includes('врач') || lowerText.includes('витамин')) return '💊';
    if (lowerText.includes('деньги') || lowerText.includes('бюджет')) return '💰';
    if (lowerText.includes('убор') || lowerText.includes('чист')) return '🧹';
    if (lowerText.includes('звонок')) return '📞';
    if (lowerText.includes('дом')) return '🏠';
    if (lowerText.includes('подъем') || lowerText.includes('утр')) return '🌅';
    if (lowerText.includes('вечер')) return '🌙';
    if (lowerText.includes('идея')) return '💡';
    if (lowerText.includes('учить') || lowerText.includes('книга')) return '📚';
    if (lowerText.includes('компьютер') || lowerText.includes('рся')) return '💻';
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
      setTasksByDate((prev: any) => ({
        ...prev,
        [selectedDate]: (prev[selectedDate] || []).map((task: any) => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      }));
    } else if (category === 'noDeadline') {
      setNoDeadlineTasks((prev: any) => prev.map((task: any) => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
    }
  };

  const deleteTask = (taskId: number, category: string) => {
    if (category === 'today') {
      setTasksByDate((prev: any) => ({
        ...prev,
        [selectedDate]: (prev[selectedDate] || []).filter((task: any) => task.id !== taskId)
      }));
    } else if (category === 'noDeadline') {
      setNoDeadlineTasks((prev: any) => prev.filter((task: any) => task.id !== taskId));
    } else if (category === 'ideas') {
      setIdeas((prev: any) => prev.filter((task: any) => task.id !== taskId));
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
    } else if (category === 'noDeadline') {
      setNoDeadlineTasks((prev: any) => [...prev, newTask]);
    } else if (category === 'ideas') {
      setIdeas((prev: any) => [...prev, newTask]);
    }

    setNewTaskText('');
    setNewTaskDate(new Date().toISOString().split('T')[0]);
  };

  const currentDateTasks = tasksByDate[selectedDate] || [];
  const completedToday = currentDateTasks.filter((t: any) => t.completed).length;
  const totalToday = currentDateTasks.length;

  const tabs = [
    { id: 'today', label: 'Сегодня', icon: Calendar, count: currentDateTasks.filter((t: any) => !t.completed).length },
    { id: 'noDeadline', label: 'Без срока', icon: Clock, count: noDeadlineTasks.length },
    { id: 'ideas', label: 'Идеи', icon: Lightbulb, count: ideas.length }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Заголовок */}
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
          {activeTab === 'today' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Задачи</h2>
                </div>
                
                <div className="flex items-center gap-3">
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
              
              <div className="space-y-2 mb-6">
                {currentDateTasks.map((task: any) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={(id: number) => toggleTask(id, 'today')}
                    onDelete={(id: number) => deleteTask(id, 'today')}
                  />
                ))}
              </div>
              
              <AddTaskForm 
                onAdd={() => addTask('today')}
                text={newTaskText}
                setText={setNewTaskText}
                date={newTaskDate}
                setDate={setNewTaskDate}
              />
            </div>
          )}

          {activeTab === 'noDeadline' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-semibold">Задачи без срока</h2>
              </div>
              
              <div className="space-y-2 mb-6">
                {noDeadlineTasks.map((task: any) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={(id: number) => toggleTask(id, 'noDeadline')}
                    onDelete={(id: number) => deleteTask(id, 'noDeadline')}
                  />
                ))}
              </div>
              
              <AddTaskForm 
                onAdd={() => addTask('noDeadline')}
                text={newTaskText}
                setText={setNewTaskText}
                date={newTaskDate}
                setDate={setNewTaskDate}
              />
            </div>
          )}

          {activeTab === 'ideas' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-semibold">Идеи</h2>
              </div>
              
              <div className="space-y-2 mb-6">
                {ideas.map((task: any) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    canToggle={false}
                    onToggle={() => {}}
                    onDelete={(id: number) => deleteTask(id, 'ideas')}
                  />
                ))}
              </div>
              
              <AddTaskForm 
                onAdd={() => addTask('ideas')}
                text={newTaskText}
                setText={setNewTaskText}
                date={newTaskDate}
                setDate={setNewTaskDate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
