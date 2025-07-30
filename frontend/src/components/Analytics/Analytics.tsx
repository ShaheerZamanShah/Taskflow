import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Analytics.css';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AnalyticsProps {
  user: User;
  onLogout: () => void;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  completedToday: number;
  completedThisWeek: number;
  completedThisMonth: number;
  avgEstimatedTime: number;
  avgActualTime: number;
}

interface PriorityStats {
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

interface CategoryStats {
  [category: string]: number;
}

const Analytics: React.FC<AnalyticsProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    completedToday: 0,
    completedThisWeek: 0,
    completedThisMonth: 0,
    avgEstimatedTime: 0,
    avgActualTime: 0
  });
  const [priorityStats, setPriorityStats] = useState<PriorityStats>({
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({});

  // Particles animation
  const particlesRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      dx: number;
      dy: number;
      size: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

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

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ripple effect for buttons
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const [statsResponse, categoryResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks/stats'),
        axios.get('http://localhost:5000/api/tasks/category-stats')
      ]);

      console.log('Analytics data:', { stats: statsResponse.data, category: categoryResponse.data });
      
      setTaskStats(statsResponse.data.data || statsResponse.data);
      setCategoryStats(categoryResponse.data.data || categoryResponse.data);
      
      // Calculate priority stats from tasks if not provided
      const tasksResponse = await axios.get('http://localhost:5000/api/tasks');
      const tasks = tasksResponse.data.data?.tasks || tasksResponse.data.tasks || [];
      
      const priorityCount = tasks.reduce((acc: any, task: any) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {});
      
      setPriorityStats({
        urgent: priorityCount.urgent || 0,
        high: priorityCount.high || 0,
        medium: priorityCount.medium || 0,
        low: priorityCount.low || 0
      });
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    if (taskStats.total === 0) return 0;
    return Math.round((taskStats.completed / taskStats.total) * 100);
  };

  const getProductivityScore = () => {
    const completionRate = getCompletionRate();
    const overdueRate = taskStats.total > 0 ? (taskStats.overdue / taskStats.total) * 100 : 0;
    return Math.max(0, Math.round(completionRate - overdueRate));
  };

  const renderProgressChart = () => {
    const total = taskStats.total;
    if (total === 0) return null;

    const completedPercentage = (taskStats.completed / total) * 100;
    const inProgressPercentage = (taskStats.inProgress / total) * 100;
    const pendingPercentage = (taskStats.pending / total) * 100;
    const overduePercentage = (taskStats.overdue / total) * 100;

    return (
      <div className="progress-chart">
        <div className="chart-bar">
          <div 
            className="bar-segment completed"
            style={{ width: `${completedPercentage}%` }}
            title={`Completed: ${taskStats.completed}`}
          ></div>
          <div 
            className="bar-segment in-progress"
            style={{ width: `${inProgressPercentage}%` }}
            title={`In Progress: ${taskStats.inProgress}`}
          ></div>
          <div 
            className="bar-segment pending"
            style={{ width: `${pendingPercentage}%` }}
            title={`Pending: ${taskStats.pending}`}
          ></div>
          <div 
            className="bar-segment overdue"
            style={{ width: `${overduePercentage}%` }}
            title={`Overdue: ${taskStats.overdue}`}
          ></div>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color completed"></div>
            <span>Completed ({taskStats.completed})</span>
          </div>
          <div className="legend-item">
            <div className="legend-color in-progress"></div>
            <span>In Progress ({taskStats.inProgress})</span>
          </div>
          <div className="legend-item">
            <div className="legend-color pending"></div>
            <span>Pending ({taskStats.pending})</span>
          </div>
          <div className="legend-item">
            <div className="legend-color overdue"></div>
            <span>Overdue ({taskStats.overdue})</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPriorityChart = () => {
    const total = Object.values(priorityStats).reduce((sum, count) => sum + count, 0);
    if (total === 0) return null;

    return (
      <div className="priority-chart">
        {Object.entries(priorityStats).map(([priority, count]) => {
          const percentage = (count / total) * 100;
          const colors = {
            urgent: '#ff4757',
            high: '#ff6b6b',
            medium: '#ffa502',
            low: '#2ed573'
          };
          
          return (
            <div key={priority} className="priority-item">
              <div className="priority-info">
                <span className="priority-label">{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                <span className="priority-count">{count}</span>
              </div>
              <div className="priority-bar">
                <div 
                  className="priority-fill"
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: colors[priority as keyof typeof colors]
                  }}
                ></div>
              </div>
              <span className="priority-percentage">{Math.round(percentage)}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCategoryChart = () => {
    // Handle both object and array formats of category stats
    let categories: [string, number][] = [];
    
    if (Array.isArray(categoryStats)) {
      // If it's an array of objects like [{_id: 'work', count: 5}, ...]
      categories = categoryStats.map(cat => [cat._id || 'Unknown', cat.count || 0]);
    } else if (typeof categoryStats === 'object' && categoryStats !== null) {
      // If it's an object like {work: 5, personal: 3}
      categories = Object.entries(categoryStats).filter(([key, value]) => 
        typeof value === 'number' && !key.startsWith('_')
      );
    }
    
    if (categories.length === 0) return null;

    const total = categories.reduce((sum, [, count]) => sum + count, 0);
    if (total === 0) return null;

    return (
      <div className="category-chart">
        {categories.map(([category, count], index) => {
          const percentage = (count / total) * 100;
          const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffb347'];
          const color = colors[index % colors.length];
          
          return (
            <div key={`${category}-${index}`} className="category-item">
              <div 
                className="category-color"
                style={{ backgroundColor: color }}
              ></div>
              <div className="category-info">
                <span className="category-name">{category || 'Uncategorized'}</span>
                <span className="category-count">{count} tasks</span>
              </div>
              <span className="category-percentage">{Math.round(percentage)}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics">
      <canvas ref={particlesRef} className="particles-canvas" />
      
      <header className="analytics-header glass-card">
        <div className="header-content">
          <div className="header-left">
            <i className="fas fa-tasks logo-icon"></i>
            <h1>TaskFlow</h1>
          </div>
          <nav className="header-nav">
            <button 
              className="nav-btn glass-button" 
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
              className="nav-btn glass-button active" 
              onClick={(e) => { handleButtonClick(e); navigate('/analytics'); }}
            >
              <i className="fas fa-chart-line"></i>
              Analytics
            </button>
          </nav>
          <div className="header-right">
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <button 
                className="logout-btn glass-button" 
                onClick={(e) => { handleButtonClick(e); onLogout(); }}
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="analytics-main">
        <div className="analytics-content">
          <div className="page-header glass-card">{/* Let me compile the current changes to check for any errors */}
            <h2>📊 Task Analytics</h2>
            <p>Insights into your productivity and task management patterns</p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
              <div className="metric-info">
                <h3>{getCompletionRate()}%</h3>
                <p>Completion Rate</p>
              </div>
              <div className="metric-trend positive">
                <i className="fas fa-arrow-up"></i>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="metric-info">
                <h3>{getProductivityScore()}</h3>
                <p>Productivity Score</p>
              </div>
              <div className="metric-trend positive">
                <i className="fas fa-arrow-up"></i>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="metric-info">
                <h3>{taskStats.total}</h3>
                <p>Total Tasks</p>
              </div>
              <div className="metric-trend neutral">
                <i className="fas fa-minus"></i>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="metric-info">
                <h3>{taskStats.overdue}</h3>
                <p>Overdue Tasks</p>
              </div>
              <div className="metric-trend negative">
                <i className="fas fa-arrow-down"></i>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-chart-bar"></i>
                  Task Status Overview
                </h3>
              </div>
              <div className="card-content">
                {renderProgressChart()}
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-exclamation"></i>
                  Priority Distribution
                </h3>
              </div>
              <div className="card-content">
                {renderPriorityChart()}
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-tags"></i>
                  Category Breakdown
                </h3>
              </div>
              <div className="card-content">
                {Object.keys(categoryStats).length > 0 ? (
                  renderCategoryChart()
                ) : (
                  <div className="empty-chart">
                    <i className="fas fa-tags"></i>
                    <p>No categories found</p>
                    <span>Start adding categories to your tasks</span>
                  </div>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-calendar-alt"></i>
                  Quick Stats
                </h3>
              </div>
              <div className="card-content">
                <div className="quick-stats">
                  <div className="stat-item">
                    <div className="stat-icon completed">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div>
                      <h4>{taskStats.completed}</h4>
                      <p>Completed Tasks</p>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon in-progress">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div>
                      <h4>{taskStats.inProgress}</h4>
                      <p>In Progress</p>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon pending">
                      <i className="fas fa-pause-circle"></i>
                    </div>
                    <div>
                      <h4>{taskStats.pending}</h4>
                      <p>Pending Tasks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-calendar-day"></i>
                  Time-Based Analytics
                </h3>
              </div>
              <div className="card-content">
                <div className="time-stats">
                  <div className="time-stat-item">
                    <div className="time-stat-icon today">
                      <i className="fas fa-calendar-day"></i>
                    </div>
                    <div>
                      <h4>{taskStats.completedToday}</h4>
                      <p>Completed Today</p>
                    </div>
                  </div>
                  <div className="time-stat-item">
                    <div className="time-stat-icon week">
                      <i className="fas fa-calendar-week"></i>
                    </div>
                    <div>
                      <h4>{taskStats.completedThisWeek}</h4>
                      <p>This Week</p>
                    </div>
                  </div>
                  <div className="time-stat-item">
                    <div className="time-stat-icon month">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                    <div>
                      <h4>{taskStats.completedThisMonth}</h4>
                      <p>This Month</p>
                    </div>
                  </div>
                  <div className="time-stat-item">
                    <div className="time-stat-icon time">
                      <i className="fas fa-stopwatch"></i>
                    </div>
                    <div>
                      <h4>{Math.round(taskStats.avgEstimatedTime || 0)} min</h4>
                      <p>Avg Estimated Time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="insights-section">
            <h3>📈 Insights & Recommendations</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-icon">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div className="insight-content">
                  <h4>Productivity Tip</h4>
                  <p>
                    {getCompletionRate() >= 80 
                      ? "Excellent work! You're maintaining a high completion rate."
                      : getCompletionRate() >= 60 
                      ? "Good progress! Try to focus on completing pending tasks."
                      : "Consider breaking down large tasks into smaller, manageable ones."
                    }
                  </p>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">
                  <i className="fas fa-target"></i>
                </div>
                <div className="insight-content">
                  <h4>Focus Area</h4>
                  <p>
                    {taskStats.overdue > 0 
                      ? `You have ${taskStats.overdue} overdue tasks. Prioritize these first.`
                      : taskStats.pending > 0 
                      ? `Great! No overdue tasks. Focus on your ${taskStats.pending} pending tasks.`
                      : "Amazing! You're all caught up with your tasks."
                    }
                  </p>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="insight-content">
                  <h4>Performance</h4>
                  <p>
                    Your productivity score is {getProductivityScore()}. 
                    {getProductivityScore() >= 80 
                      ? " Outstanding performance!"
                      : getProductivityScore() >= 60 
                      ? " Good work! Keep it up."
                      : " There's room for improvement."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
