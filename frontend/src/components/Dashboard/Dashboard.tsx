import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

interface User {
  id: string;
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: {
    name: string;
    color: string;
    icon: string;
  };
  dueDate: string;
  createdAt: string;
  progress: number;
  isOverdue: boolean;
  estimatedTime?: number;
  actualTime?: number;
  isRecurring?: boolean;
  subtasks?: Array<{
    title: string;
    completed: boolean;
  }>;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  avgEstimatedTime: number;
  avgActualTime: number;
  completedToday: number;
  completedThisWeek: number;
  completedThisMonth: number;
}

interface CategoryStats {
  _id: string;
  count: number;
  completed: number;
  color: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    avgEstimatedTime: 0,
    avgActualTime: 0,
    completedToday: 0,
    completedThisWeek: 0,
    completedThisMonth: 0
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'completed' | 'overdue' | 'in-progress'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created' | 'dueDateDesc' | 'priorityDesc' | 'createdDesc' | 'titleAsc' | 'titleDesc'>('dueDate');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'work',
    dueDate: '',
    estimatedTime: '',
    isRecurring: false,
    recurringPattern: 'daily'
  });

  // Particles animation - optimized for performance
  const particlesRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();

    const particles: Array<{
      x: number;
      y: number;
      dx: number;
      dy: number;
      size: number;
      opacity: number;
    }> = [];

    // Reduced particles for better performance
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 1.5,
        dy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.dx;
        particle.y += particle.dy;

        if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Optimized ripple effect
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      background-color: rgba(255, 255, 255, 0.3);
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;
    ripple.classList.add('ripple');

    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const [tasksRes, statsRes, categoryRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks'),
        axios.get('http://localhost:5000/api/tasks/stats'),
        axios.get('http://localhost:5000/api/tasks/category-stats')
      ]);
      
      console.log('Dashboard data:', { tasks: tasksRes.data, stats: statsRes.data, categories: categoryRes.data });
      
      // Process tasks data with proper error handling
      const tasksArray = tasksRes.data.data?.tasks || tasksRes.data.data || [];
      const tasksData = tasksArray.map((task: Task) => ({
        ...task,
        status: task.status || 'pending',
        category: task.category || { name: 'General', color: '#6366f1', icon: 'fas fa-tasks' },
        priority: task.priority || 'medium'
      }));
      
      setTasks(tasksData);
      setStats(statsRes.data.data || statsRes.data || stats);
      
      // Handle category stats with validation
      const categoryData = categoryRes.data.data || categoryRes.data || [];
      const validCategoryStats = Array.isArray(categoryData) ? categoryData : [];
      setCategoryStats(validCategoryStats);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        category: {
          name: newTask.category,
          color: getCategoryColor(newTask.category),
          icon: getCategoryIcon(newTask.category)
        },
        dueDate: newTask.dueDate || undefined,
        estimatedTime: newTask.estimatedTime ? parseInt(newTask.estimatedTime) : undefined,
        isRecurring: newTask.isRecurring,
        recurringPattern: newTask.isRecurring ? newTask.recurringPattern : undefined
      };

      const response = await axios.post('http://localhost:5000/api/tasks', taskData);
      
      if (response.data.success) {
        const newTaskData = response.data.data.task || response.data.data;
        setTasks([newTaskData, ...tasks]);
        resetForm();
        setShowCreateForm(false);
        fetchDashboardData(); // Refresh stats
        console.log('Task created successfully:', newTaskData);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'work',
      dueDate: '',
      estimatedTime: '',
      isRecurring: false,
      recurringPattern: 'daily'
    });
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, { status });
      
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, status: status as any } : task
        ));
        fetchDashboardData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      
      if (response.data.success) {
        setTasks(tasks.filter(task => task._id !== taskId));
        fetchDashboardData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      work: '#3b82f6',
      health: '#10b981',
      finance: '#f59e0b',
      leisure: '#8b5cf6',
      education: '#06b6d4',
      personal: '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      work: 'fas fa-briefcase',
      health: 'fas fa-heart',
      finance: 'fas fa-dollar-sign',
      leisure: 'fas fa-gamepad',
      education: 'fas fa-graduation-cap',
      personal: 'fas fa-user'
    };
    return icons[category] || 'fas fa-folder';
  };

  const filteredAndSortedTasks = () => {
    let filtered = [...tasks];

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'overdue') {
        filtered = filtered.filter(task => task.isOverdue && task.status !== 'completed');
      } else {
        filtered = filtered.filter(task => task.status === selectedFilter);
      }
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category?.name === selectedCategory);
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'priorityDesc':
          const priorityOrderDesc = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrderDesc[a.priority] - priorityOrderDesc[b.priority];
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'dueDateDesc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'createdDesc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'titleAsc':
          return a.title.localeCompare(b.title);
        case 'titleDesc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return '#90a4ae';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in-progress': return '#2196f3';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#90a4ae';
    }
  };

  const getCompletionRate = () => {
    return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  };

  const uniqueCategories = Array.from(new Set(tasks.map(task => task.category?.name).filter(Boolean)));

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const userName = user.firstName || user.name || 'User';

  return (
    <div className="dashboard">
      <canvas ref={particlesRef} className="particles-canvas" />
      
      {/* Header */}
      <header className="dashboard-header glass-card">
        <div className="header-content">
          <div className="header-left">
            <div className="welcome-section">
              <h1 className="welcome-title">
                {getGreeting()}, {userName}! 👋
              </h1>
              <p className="welcome-subtitle">
                Here's what's happening with your tasks today
              </p>
            </div>
          </div>
          <nav className="header-nav">
            <button 
              className="nav-btn glass-button active" 
              onClick={(e) => { handleButtonClick(e); navigate('/dashboard'); }}
            >
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </button>
            <button 
              className="nav-btn glass-button" 
              onClick={(e) => { handleButtonClick(e); navigate('/tasks'); }}
            >
              <i className="fas fa-check-circle"></i>
              Tasks
            </button>
            <button 
              className="nav-btn glass-button" 
              onClick={(e) => { handleButtonClick(e); navigate('/analytics'); }}
            >
              <i className="fas fa-chart-line"></i>
              Analytics
            </button>
          </nav>
          <div className="header-right">
            <button 
              onClick={(e) => { handleButtonClick(e); onLogout(); }} 
              className="logout-btn glass-button"
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card glass-card total-tasks">
            <div className="stat-icon">
              <i className="fas fa-tasks"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Tasks</p>
            </div>
          </div>
          
          <div className="stat-card glass-card completed-tasks">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.completed}</h3>
              <p>Completed</p>
              <span className="completion-rate">{getCompletionRate()}% completion rate</span>
            </div>
          </div>
          
          <div className="stat-card glass-card pending-tasks">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          
          <div className="stat-card glass-card overdue-tasks">
            <div className="stat-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.overdue}</h3>
              <p>Overdue</p>
            </div>
          </div>

          <div className="stat-card glass-card today-tasks">
            <div className="stat-icon">
              <i className="fas fa-calendar-day"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.completedToday}</h3>
              <p>Completed Today</p>
            </div>
          </div>

          <div className="stat-card glass-card week-tasks">
            <div className="stat-icon">
              <i className="fas fa-calendar-week"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.completedThisWeek}</h3>
              <p>This Week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="controls-section glass-card">
        <div className="task-controls">
          <div className="controls-left">
            <h2 className="tasks-title">
              <i className="fas fa-tachometer-alt"></i>
              Your Tasks ({filteredAndSortedTasks().length})
            </h2>
          </div>
          
          <div className="controls-center">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="controls-right">
            <select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value as any)} 
              className="filter-select"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
            
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)} 
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)} 
              className="sort-select"
            >
              <option value="dueDate">Due Date ↑</option>
              <option value="dueDateDesc">Due Date ↓</option>
              <option value="priority">Priority ↑</option>
              <option value="priorityDesc">Priority ↓</option>
              <option value="created">Latest First</option>
              <option value="createdDesc">Oldest First</option>
              <option value="titleAsc">Title A-Z</option>
              <option value="titleDesc">Title Z-A</option>
            </select>
          </div>
        </div>
      </section>

      {/* Create Task Form */}
      {showCreateForm && (
        <section className="create-task-section">
          <div className="create-task-form glass-card">
            <h3>Create New Task</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                >
                  <option value="work">Work</option>
                  <option value="health">Health</option>
                  <option value="finance">Finance</option>
                  <option value="leisure">Leisure</option>
                  <option value="education">Education</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>Estimated Time (minutes)</label>
                <input
                  type="number"
                  value={newTask.estimatedTime}
                  onChange={(e) => setNewTask({...newTask, estimatedTime: e.target.value})}
                  placeholder="e.g. 60"
                  min="1"
                />
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newTask.isRecurring}
                    onChange={(e) => setNewTask({...newTask, isRecurring: e.target.checked})}
                  />
                  Recurring Task
                </label>
                {newTask.isRecurring && (
                  <select
                    value={newTask.recurringPattern}
                    onChange={(e) => setNewTask({...newTask, recurringPattern: e.target.value})}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={(e) => { 
                  handleButtonClick(e); 
                  resetForm();
                  setShowCreateForm(false); 
                }}
                className="btn-secondary glass-button"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={(e) => { handleButtonClick(e); createTask(); }}
                className="btn-primary glass-button"
                disabled={!newTask.title.trim()}
              >
                Create Task
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Tasks List */}
      <section className="tasks-section">
        <div className="section-header glass-card">
          <button 
            className="create-task-btn glass-button" 
            onClick={(e) => { handleButtonClick(e); setShowCreateForm(true); }}
          >
            <i className="fas fa-plus"></i>
            Create New Task
          </button>
        </div>
        
        <div className="tasks-grid">
          {filteredAndSortedTasks().map(task => (
            <div key={task._id} className={`task-card glass-card ${task.status} ${task.isOverdue ? 'overdue' : ''}`}>
              <div className="task-header">
                <div className="task-category" style={{ backgroundColor: task.category?.color || getCategoryColor('work') }}>
                  <i className={task.category?.icon || getCategoryIcon('work')}></i>
                  <span>{task.category?.name || 'work'}</span>
                </div>
                <div className="task-priority" style={{ color: getPriorityColor(task.priority) }}>
                  <i className="fas fa-flag"></i>
                  {task.priority}
                </div>
              </div>
              
              <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-meta">
                  {task.dueDate && (
                    <div className="due-date">
                      <i className="fas fa-calendar"></i>
                      <span className={task.isOverdue ? 'overdue-text' : ''}>
                        Due {formatDate(task.dueDate)}
                      </span>
                    </div>
                  )}
                  
                  <div className="task-status" style={{ color: getStatusColor(task.status) }}>
                    <i className="fas fa-circle"></i>
                    {task.status ? task.status.replace('-', ' ') : 'pending'}
                  </div>
                </div>
                
                {task.progress !== undefined && task.progress > 0 && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${task.progress}%` }}></div>
                    <span className="progress-text">{task.progress}%</span>
                  </div>
                )}

                {task.isRecurring && (
                  <div className="recurring-badge">
                    <i className="fas fa-repeat"></i>
                    Recurring
                  </div>
                )}
              </div>

              <div className="task-actions">
                <button
                  onClick={(e) => { 
                    handleButtonClick(e); 
                    updateTaskStatus(task._id, task.status === 'completed' ? 'pending' : 'completed');
                  }}
                  className={`status-btn glass-button ${task.status === 'completed' ? 'completed' : ''}`}
                  title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                >
                  <i className={task.status === 'completed' ? 'fas fa-undo' : 'fas fa-check'}></i>
                </button>
                <button
                  onClick={(e) => { 
                    handleButtonClick(e); 
                    deleteTask(task._id);
                  }}
                  className="delete-btn glass-button"
                  title="Delete task"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredAndSortedTasks().length === 0 && (
          <div className="empty-state glass-card">
            <i className="fas fa-inbox"></i>
            <h3>No tasks found</h3>
            <p>
              {selectedFilter !== 'all' || selectedCategory !== 'all' || searchTerm.trim()
                ? 'Try adjusting your filters to see more tasks.' 
                : 'Create your first task to get started!'}
            </p>
            <button 
              className="create-first-task-btn glass-button" 
              onClick={(e) => { handleButtonClick(e); setShowCreateForm(true); }}
            >
              <i className="fas fa-plus"></i>
              Create Your First Task
            </button>
          </div>
        )}
      </section>

      {/* Category Stats */}
      {categoryStats && Array.isArray(categoryStats) && categoryStats.length > 0 && (
        <section className="category-stats-section glass-card">
          <h2>Tasks by Category</h2>
          <div className="category-stats">
            {categoryStats.map((category, index) => (
              <div key={category._id || index} className="category-stat">
                <div className="category-color" style={{ backgroundColor: category.color || '#6366f1' }}></div>
                <div className="category-info">
                  <h4>{category._id || 'Unknown Category'}</h4>
                  <p>{category.count || 0} tasks ({category.completed || 0} completed)</p>
                </div>
                <div className="category-progress">
                  <div 
                    className="category-progress-bar"
                    style={{ 
                      width: `${category.count > 0 ? (category.completed / category.count) * 100 : 0}%`,
                      backgroundColor: category.color || '#6366f1'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;