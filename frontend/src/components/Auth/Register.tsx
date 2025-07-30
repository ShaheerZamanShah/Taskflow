import React, { useState, useEffect, useRef } from 'react';
import './Auth.css';

interface RegisterProps {
  onRegister: (username: string, email: string, password: string, firstName: string, lastName: string) => void;
  onSwitchToLogin: () => void;
  loading: boolean;
  error: string | null;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin, loading, error }) => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false
  });

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

  // Password validation function
  const validatePassword = (password: string) => {
    const requirements = {
      minLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password)
    };
    setPasswordRequirements(requirements);
    return requirements;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const isPasswordValid = () => {
    return Object.values(passwordRequirements).every(req => req);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    if (!isPasswordValid()) {
      setValidationError('Password does not meet the requirements');
      return;
    }

    if (!username.trim() || !firstName.trim() || !lastName.trim()) {
      setValidationError('All fields are required');
      return;
    }
    
    setValidationError('');
    onRegister(username, email, password, firstName, lastName);
  };

  return (
    <div className="auth-container">
      <canvas ref={particlesRef} className="particles-canvas" />
      <div className="auth-card glass-card">
        <div className="auth-header">
          <i className="fas fa-tasks logo-icon"></i>
          <h2>Create Account</h2>
          <p>Join TaskFlow and start managing your tasks</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {(error || validationError) && (
            <div className="error-message">{error || validationError}</div>
          )}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Enter your first name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Enter your last name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
              placeholder="Create a password"
            />
            
            {/* Password Requirements */}
            <div className="password-requirements">
              <p className="requirements-title">Password must contain:</p>
              <ul className="requirements-list">
                <li className={passwordRequirements.minLength ? 'requirement-met' : 'requirement-unmet'}>
                  <i className={`fas ${passwordRequirements.minLength ? 'fa-check' : 'fa-times'}`}></i>
                  At least 6 characters
                </li>
                <li className={passwordRequirements.hasUppercase ? 'requirement-met' : 'requirement-unmet'}>
                  <i className={`fas ${passwordRequirements.hasUppercase ? 'fa-check' : 'fa-times'}`}></i>
                  One uppercase letter (A-Z)
                </li>
                <li className={passwordRequirements.hasLowercase ? 'requirement-met' : 'requirement-unmet'}>
                  <i className={`fas ${passwordRequirements.hasLowercase ? 'fa-check' : 'fa-times'}`}></i>
                  One lowercase letter (a-z)
                </li>
                <li className={passwordRequirements.hasNumber ? 'requirement-met' : 'requirement-unmet'}>
                  <i className={`fas ${passwordRequirements.hasNumber ? 'fa-check' : 'fa-times'}`}></i>
                  One number (0-9)
                </li>
              </ul>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary auth-btn glass-button" 
            disabled={loading}
            onClick={handleButtonClick}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Create Account
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button 
              type="button" 
              className="link-btn glass-button" 
              onClick={(e) => { handleButtonClick(e); onSwitchToLogin(); }}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
