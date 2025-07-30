import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const particlesRef = useRef<HTMLDivElement>(null);

  const handleSignUp = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

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

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  useEffect(() => {
    // Add ripple animation keyframes
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

    // Mouse parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!particlesRef.current) return;
      
      const particles = particlesRef.current.querySelectorAll('.particle');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      particles.forEach((particle, index) => {
        const speed = (index + 1) * 0.5;
        const xPos = (x - 0.5) * speed;
        const yPos = (y - 0.5) * speed;
        (particle as HTMLElement).style.transform += ` translate(${xPos}px, ${yPos}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="landing-container">
      <div className="particles" ref={particlesRef}>
        {[...Array(9)].map((_, index) => (
          <div key={index} className="particle"></div>
        ))}
      </div>

      <header className="landing-header">
        <h1 className="app-name">TaskFlow</h1>
        <p className="app-tagline">Professional Task Management</p>
      </header>

      <main className="landing-main">
        <div className="welcome-content">
          <div className="glass-card">
            <h2>Welcome to TaskFlow</h2>
            <p>Streamline your workflow with our professional task management solution. Experience productivity like never before.</p>
            
            <div className="auth-buttons">
              <button 
                className="btn btn-primary" 
                onClick={(e) => {
                  handleButtonClick(e);
                  handleSignUp();
                }}
              >
                Sign Up
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={(e) => {
                  handleButtonClick(e);
                  handleLogin();
                }}
              >
                Log In
              </button>
            </div>

            <div className="features">
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <h3>Lightning Fast</h3>
                <p>Boost your productivity with our optimized interface</p>
              </div>
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <h3>Secure</h3>
                <p>Your data is protected with enterprise-grade security</p>
              </div>
              <div className="feature">
                <span className="feature-icon">🎯</span>
                <h3>Focused</h3>
                <p>Stay on track with intelligent task prioritization</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2024 TaskFlow. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;