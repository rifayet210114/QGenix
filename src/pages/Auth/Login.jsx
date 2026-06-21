import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import './Login.css';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

export default function Login() {
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  // Generate random particles for the background
  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1 + 'px',
      opacity: Math.random() * 0.5 + 0.1,
      duration: Math.random() * 20 + 15 + 's',
      delay: Math.random() * 10 + 's',
      drift: (Math.random() - 0.5) * 100 + 'px',
      color: Math.random() > 0.5 ? '#a78bfa' : '#818cf8'
    }));
    setParticles(newParticles);
  }, []);
  
  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate authentication API call delay
    setTimeout(() => {
      if (role === 'admin') navigate('/admin');
      if (role === 'teacher') navigate('/teacher');
      if (role === 'student') navigate('/student');
    }, 1200);
  };

  return (
    <div className="auth-container">
      {/* Back to Home Button */}
      <button 
        className="back-button" 
        onClick={() => navigate('/')}
        aria-label="Back to home"
      >
        <ArrowLeft size={18} />
        <span className="back-text">Back to Home</span>
      </button>

      {/* =========================================
          ADVANCED BACKGROUND LAYER SYSTEM
          ========================================= */}
      <div className="bg-system">
        <div className="mesh-gradient"></div>
        <div className="neural-network"></div>
        <div className="grid-overlay"></div>
        <div className="light-beams"></div>
        <div className="particles-container">
          {particles.map(p => (
            <div 
              key={p.id} 
              className="particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 8px 1px ${p.color}`,
                animationDuration: p.duration,
                animationDelay: p.delay,
                '--p-opacity': p.opacity,
                '--p-drift': p.drift
              }}
            />
          ))}
        </div>
      </div>

      {/* =========================================
          LEFT SIDE - BRANDING & ILLUSTRATION
          ========================================= */}
      <div className="auth-branding">
        <div className="text-glow-bg"></div>
        
        <div className="branding-content">
          <div className="logo-container">
            <BrainCircuit className="logo-icon" />
            <span className="logo-text">QGenix</span>
          </div>
          
          <h1 className="branding-tagline">
            Smart Academic Management<br/>Powered by AI
          </h1>
          
          <div className="feature-list">
            <div className="feature-item" style={{ animationDelay: '0.1s' }}>
              <CheckCircle2 size={22} /> AI Result Processing
            </div>
            <div className="feature-item" style={{ animationDelay: '0.2s' }}>
              <CheckCircle2 size={22} /> Attendance Tracking
            </div>
            <div className="feature-item" style={{ animationDelay: '0.3s' }}>
              <CheckCircle2 size={22} /> Student & Teacher Portal
            </div>
            <div className="feature-item" style={{ animationDelay: '0.4s' }}>
              <CheckCircle2 size={22} /> Secure Cloud Access
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          RIGHT SIDE - AUTHENTICATION FORM
          ========================================= */}
      <div className="auth-form-wrapper">
        {/* Soft Spotlight behind card */}
        <div className="card-spotlight"></div>
        
        <div className="auth-card">
          <div className="auth-header">
            <div className="mobile-logo">
              <BrainCircuit size={32} />
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to continue to QGenix</p>
          </div>

          {/* Role Tabs */}
          <div className="role-selector">
            <div className={`role-slider active-${role}`}></div>
            <button 
              type="button"
              className={role === 'student' ? 'active' : ''} 
              onClick={() => setRole('student')}
            >
              Student
            </button>
            <button 
              type="button"
              className={role === 'teacher' ? 'active' : ''} 
              onClick={() => setRole('teacher')}
            >
              Teacher
            </button>
            <button 
              type="button"
              className={role === 'admin' ? 'active' : ''} 
              onClick={() => setRole('admin')}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input 
                type="email" 
                id="email" 
                required 
                placeholder=" "
                defaultValue="demo@qgenix.ai"
              />
              <label htmlFor="email">Email Address</label>
            </div>
            
            <div className="input-group">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                required 
                placeholder=" "
                defaultValue="password123"
              />
              <label htmlFor="password">Password</label>
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="form-actions">
              <label className="remember-me">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className={`btn-submit ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
              <span>{isSubmitting ? 'Authenticating...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}</span>
              {isSubmitting && <div className="spinner"></div>}
            </button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-login">
            <button type="button" className="social-btn">
              <GoogleIcon /> <span className="social-text">Google</span>
            </button>
            <button type="button" className="social-btn">
              <GithubIcon /> <span className="social-text">GitHub</span>
            </button>
            <button type="button" className="social-btn">
              <MicrosoftIcon /> <span className="social-text">Microsoft</span>
            </button>
          </div>

          <div className="auth-footer">
            <p>Don't have an account? <a href="#">Sign up</a></p>
            <div className="security-badge">
              <ShieldCheck size={16} /> Protected with enterprise-grade security
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}