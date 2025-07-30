import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TaskManager.css';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | { name: string; color?: string; icon?: string };
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskManagerProps {
  user: User;
  onLogout: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const particlesRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    category: '',
    dueDate: ''
  });

  // Ripple effect function
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps

    // Add ripple animation and particle effect
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sortBy]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('sortBy', sortBy.startsWith('-') ? sortBy.substring(1) : sortBy);
      params.append('sortOrder', sortBy.startsWith('-') ? 'desc' : 'asc');
      
      const response = await axios.get(`http://localhost:5000/api/tasks?${params.toString()}`);
      console.log('Fetched tasks:', response.data);
      setTasks(response.data.data?.tasks || response.data.tasks || response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof task.category === 'string' 
        ? task.category.toLowerCase().includes(searchTerm.toLowerCase())
        : task.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    
    try {
      await axios.put(`/tasks/${editingTask._id}`, formData);
      setEditingTask(null);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      category: '',
      dueDate: ''
    });
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: typeof task.category === 'string' ? task.category : task.category.name,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#5f27cd';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#2ed573';
      case 'in-progress': return '#ffa502';
      case 'pending': return '#5f27cd';
      default: return '#747d8c';
    }
  };

  return (
    <div className="task-manager">
      {/* Animated background particles */}
      <div className="particles" ref={particlesRef}>
        {[...Array(9)].map((_, index) => (
          <div key={index} className="particle"></div>
        ))}
      </div>

      <header className="task-header">
        <div className="header-content glass-card">
          <div className="header-left">
            <i className="fas fa-tasks logo-icon"></i>
            <h1>TaskFlow</h1>
          </div>
          <nav className="header-nav">
            <button 
              className="nav-btn" 
              onClick={(e) => {
                handleButtonClick(e);
                navigate('/dashboard');
              }}
            >
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </button>
            <button className="nav-btn active">
              <i className="fas fa-check-circle"></i>
              Tasks
            </button>
            <button 
              className="nav-btn" 
              onClick={(e) => {
                handleButtonClick(e);
                navigate('/analytics');
              }}
            >
              <i className="fas fa-chart-line"></i>
              Analytics
            </button>
          </nav>
          <div className="header-right">
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <button 
                className="logout-btn" 
                onClick={(e) => {
                  handleButtonClick(e);
                  onLogout();
                }}
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="task-main">
        <div className="task-controls glass-card">
          <div className="controls-left">
            <h2 className="tasks-title">
              <i className="fas fa-list-check"></i>
              All Tasks
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
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="createdAt">Latest First</option>
              <option value="-createdAt">Oldest First</option>
              <option value="dueDate">Due Date (Ascending)</option>
              <option value="-dueDate">Due Date (Descending)</option>
              <option value="priority">Priority (Low to High)</option>
              <option value="-priority">Priority (High to Low)</option>
              <option value="title">Title A-Z</option>
              <option value="-title">Title Z-A</option>
            </select>
          </div>
        </div>

        <div className="tasks-container">
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading tasks...</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="tasks-grid">
              {filteredTasks.map((task) => (
                <div key={task._id} className={`task-card glass-card ${task.status}`}>
                  <div className="task-header">
                    <div className="task-priority">
                      <span 
                        className="priority-indicator"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      ></span>
                      <span className="priority-text">{task.priority}</span>
                    </div>
                    <div className="task-actions">
                      <button 
                        onClick={(e) => {
                          handleButtonClick(e);
                          openEditModal(task);
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={(e) => {
                          handleButtonClick(e);
                          handleDeleteTask(task._id);
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="task-content">
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    {task.category && (
                      <span className="task-category">
                        <i className="fas fa-tag"></i>
                        {typeof task.category === 'string' ? task.category : task.category.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className={`task-due-date ${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'overdue' : ''}`}>
                        <i className="fas fa-calendar"></i>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                        {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                          <span className="overdue-badge"> (Overdue)</span>
                        )}
                      </span>
                    )}
                  </div>
                  
                  <div className="task-footer">
                    <div className="task-status-controls">
                      <button
                        onClick={(e) => {
                          handleButtonClick(e);
                          handleStatusChange(task._id, task.status === 'completed' ? 'pending' : 'completed');
                        }}
                        className={`status-toggle-btn ${task.status === 'completed' ? 'completed' : ''}`}
                        title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                      >
                        <i className={task.status === 'completed' ? 'fas fa-undo' : 'fas fa-check'}></i>
                        {task.status === 'completed' ? 'Undo' : 'Complete'}
                      </button>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value as Task['status'])}
                        className="status-select"
                        style={{ borderColor: getStatusColor(task.status) }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <span className="task-date">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-card">
              <i className="fas fa-tasks"></i>
              <h3>No tasks found</h3>
              <p>
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Go to Dashboard to create your first task'
                }
              </p>
              <button 
                className="btn btn-primary"
                onClick={(e) => {
                  handleButtonClick(e);
                  navigate('/dashboard');
                }}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay">
          <div className="modal glass-card">
            <div className="modal-header">
              <h3>
                <i className="fas fa-edit"></i>
                Edit Task
              </h3>
              <button 
                className="close-btn"
                onClick={(e) => {
                  handleButtonClick(e);
                  setEditingTask(null);
                  resetForm();
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleUpdateTask}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Work, Personal, Shopping"
                  />
                </div>
                
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={(e) => {
                    handleButtonClick(e);
                    setEditingTask(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  onClick={handleButtonClick}
                >
                  <i className="fas fa-save"></i>
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
