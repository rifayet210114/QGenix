import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import './Login.css';



import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [role, setRole] = useState('student');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [particles, setParticles] = useState([]);
  
  const [isRegistering, setIsRegistering] = useState(false);
  // Student Self-Registration State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regClassId, setRegClassId] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regBatch, setRegBatch] = useState('Batch 2024');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, registerStudent } = useAuth();
  const navigate = useNavigate();

  // Live Generated DIIT Institutional Email preview
  const previewEmail = regFirstName && regClassId
    ? `${regFirstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}_${regClassId.trim()}@diit.edu.bd`
    : 'firstname_classid@diit.edu.bd';

  // Switch default credentials based on selected role tab with DIIT Institutional Format
  // Bengali Note: DIIT ইন্সটিটিউশনাল ইমেইল ফরম্যাট অনুযায়ী টেস্ট ক্রেডেনশিয়াল সেট করা হয়েছে
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setErrorMessage('');
    setSuccessMessage('');
    if (selectedRole !== 'student') {
      setIsRegistering(false); // Only students can self-register
    }
    if (selectedRole === 'admin') {
      setUsernameOrEmail('');
      setPassword('');
    } else if (selectedRole === 'teacher') {
      setUsernameOrEmail('');
      setPassword('');
    } else {
      setUsernameOrEmail('');
      setPassword('');
    }
  };

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
  
  // Handle Student Self-Registration
  // Bengali Note: স্টুডেন্টদের নতুন অ্যাকাউন্ট তৈরি ও সরাসরি ডেটাবেজে সংরক্ষণ
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match! / পাসওয়ার্ড দুটি মেলেনি।');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!regClassId.trim()) {
      setErrorMessage('Please provide your Class ID / Student ID.');
      return;
    }

    setIsSubmitting(true);
    const res = await registerStudent({
      first_name: regFirstName,
      last_name: regLastName,
      class_id: regClassId,
      department: regDepartment,
      batch: regBatch,
      password: regPassword,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(`Registration successful! Your Institutional Email: ${res.user.email}`);
      // Redirect to student portal after brief celebration
      setTimeout(() => {
        navigate('/student');
      }, 1400);
    } else {
      setErrorMessage(res.error || 'Registration failed. Please check inputs.');
    }
  };

  // Handle Login Authentication
  // Bengali Note: ব্যাকএন্ডের সাথে অথেনটিকেশন করে এবং রোলের ভিত্তিতে নির্দিষ্ট ড্যাশবোর্ডে পাঠায়
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await login(usernameOrEmail, password);
    setIsSubmitting(false);

    if (res.success) {
      const userRole = res.user.role;
      if (userRole === 'ADMIN') {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        navigate(redirect || '/admin');
      } else if (userRole === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } else {
      setErrorMessage(res.error || 'Invalid credentials. Please try again.');
    }
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
            <h2>{isRegistering ? 'Student Registration' : 'Welcome Back'}</h2>
            <p>{isRegistering ? 'DIIT Academic Account Enrollment' : 'Sign in to continue to QGenix'}</p>
          </div>

          {/* Role Tabs (disabled during active student registration for focus) */}
          {!isRegistering && (
            <div className="role-selector">
              <div className={`role-slider active-${role}`}></div>
              <button 
                type="button"
                className={role === 'student' ? 'active' : ''} 
                onClick={() => handleRoleChange('student')}
              >
                Student
              </button>
              <button 
                type="button"
                className={role === 'teacher' ? 'active' : ''} 
                onClick={() => handleRoleChange('teacher')}
              >
                Teacher
              </button>
              <button 
                type="button"
                className={role === 'admin' ? 'active' : ''} 
                onClick={() => handleRoleChange('admin')}
              >
                Admin
              </button>
            </div>
          )}

          {/* Success Notification */}
          {successMessage && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#4ade80',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {successMessage}
            </div>
          )}

          {/* Error Message Display */}
          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {errorMessage}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STUDENT SELF-REGISTRATION FORM                                             */}
          {/* ========================================================================= */}
          {isRegistering ? (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <input 
                    type="text" 
                    id="regFirstName" 
                    required 
                    placeholder=" "
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                  />
                  <label htmlFor="regFirstName">First Name</label>
                </div>
                <div className="input-group">
                  <input 
                    type="text" 
                    id="regLastName" 
                    required 
                    placeholder=" "
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                  />
                  <label htmlFor="regLastName">Last Name</label>
                </div>
              </div>

              <div className="input-group">
                <input 
                  type="text" 
                  id="regClassId" 
                  required 
                  placeholder=" "
                  value={regClassId}
                  onChange={(e) => setRegClassId(e.target.value)}
                />
                <label htmlFor="regClassId">Class ID / Roll Number (e.g. 2024101)</label>
              </div>

              {/* Dynamic Live Institutional Email Preview */}
              <div style={{
                background: 'rgba(129, 140, 248, 0.08)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                color: '#c7d2fe',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                <span style={{ color: '#94a3b8' }}>Institutional Email:</span>
                <strong style={{ color: '#818cf8', fontFamily: 'monospace' }}>{previewEmail}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <select 
                    id="regDepartment"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#000000',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="Computer Science & Engineering" style={{ background: '#000000', color: '#ffffff' }}>CSE</option>
                    <option value="Electrical & Electronic Engineering" style={{ background: '#000000', color: '#ffffff' }}>EEE</option>
                    <option value="Business Administration" style={{ background: '#000000', color: '#ffffff' }}>BBA</option>
                    <option value="English Literature" style={{ background: '#000000', color: '#ffffff' }}>English</option>
                    <option value="Textile Engineering" style={{ background: '#000000', color: '#ffffff' }}>Textile</option>
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <select 
                    id="regBatch"
                    value={regBatch}
                    onChange={(e) => setRegBatch(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#000000',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="Batch 2026" style={{ background: '#000000', color: '#ffffff' }}>Batch 2026</option>
                    <option value="Batch 2025" style={{ background: '#000000', color: '#ffffff' }}>Batch 2025</option>
                    <option value="Batch 2024" style={{ background: '#000000', color: '#ffffff' }}>Batch 2024</option>
                    <option value="Batch 2023" style={{ background: '#000000', color: '#ffffff' }}>Batch 2023</option>
                    <option value="Batch 2022" style={{ background: '#000000', color: '#ffffff' }}>Batch 2022</option>
                    <option value="Batch 2021" style={{ background: '#000000', color: '#ffffff' }}>Batch 2021</option>
                    <option value="Batch 2020" style={{ background: '#000000', color: '#ffffff' }}>Batch 2020</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="regPassword" 
                  required 
                  placeholder=" "
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <label htmlFor="regPassword">Password (min. 6 chars)</label>
              </div>

              <div className="input-group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="regConfirmPassword" 
                  required 
                  placeholder=" "
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                />
                <label htmlFor="regConfirmPassword">Confirm Password</label>
              </div>

              <button type="submit" className={`btn-submit ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                <span>{isSubmitting ? 'Registering Account...' : 'Complete Registration & Sign In'}</span>
                {isSubmitting && <div className="spinner"></div>}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#94a3b8' }}>
                Already registered?{' '}
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(false)}
                  style={{ color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  Sign In with Institutional ID
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* STANDARD SIGN-IN FORM                                                     */
            /* ========================================================================= */
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input 
                  type="text" 
                  id="email" 
                  required 
                  placeholder=" "
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                />
                <label htmlFor="email">
                  {role === 'student' ? 'Institutional Email (DIIT)' : 'Username or Email'}
                </label>
              </div>
              
              {role === 'student' && (
                <div style={{
                  fontSize: '11px',
                  color: '#a78bfa',
                  background: 'rgba(167, 139, 250, 0.08)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>Format:</span>
                  <strong style={{ color: '#c4b5fd' }}>firstname_classid@diit.edu.bd</strong>
                </div>
              )}
              
              <div className="input-group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  required 
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
          )}

          {!isRegistering && (
            <div className="auth-footer">
              {role === 'student' ? (
                <p>
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => setIsRegistering(true)}
                    style={{ color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    Register as Student
                  </button>
                </p>
              ) : role === 'teacher' ? (
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Faculty accounts are provisioned exclusively by the Academic Administrator.
                </p>
              ) : (
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Root administrative console. Unauthorized access attempts are monitored.
                </p>
              )}
              <div className="security-badge">
                <ShieldCheck size={16} /> Protected with enterprise-grade security
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}