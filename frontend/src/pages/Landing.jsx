import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, BarChart3, Clock } from 'lucide-react';
import Card from '../components/Card';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Background Animated Layer */}
      <AnimatedBackground />

      {/* Page Content Container */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <BrainCircuit color="var(--accent-primary)" size={32} />
            <h2 style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>QGenix</h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login" className="btn btn-secondary hero-cta-secondary">Login</Link>
            <Link to="/get-started" className="btn btn-primary hero-cta-primary">Get Started</Link>
          </div>
        </header>
        
        {/* Hero */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center', position: 'relative' }}>
          {/* Spotlight behind hero */}
          <div className="hero-spotlight"></div>

          {/* <div className="badge badge-primary animate-fade-in" style={{ marginBottom: '24px', padding: '6px 12px' }}>Platform v2.0 Live</div> */}
          
          <h1 className="animate-fade-in" style={{ fontSize: '4rem', marginBottom: '24px', maxWidth: '800px', lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Next-Gen <span className="text-gradient"> Examination</span> <br />&<br /> Analytics Platform
          </h1>
          
          <p className="animate-fade-in" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '40px', animationDelay: '0.1s' }}>
            Automate assessments, generate questions from your materials instantly, and track micro-topic performance with AI precision.
          </p>
          
          <div className="flex gap-6 animate-fade-in" style={{ animationDelay: '0.2s', zIndex: 5 }}>
            <Link to="/get-started" className="btn btn-primary hero-cta-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>Start Free Trial</Link>
            <a href="#features" className="btn btn-secondary hero-cta-secondary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>Explore Features</a>
          </div>
          
          {/* Features Grid */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ marginTop: '100px', width: '100%', maxWidth: '1200px', textAlign: 'left', zIndex: 5 }}>
            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.12)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <BrainCircuit color="var(--accent-primary)" size={24} />
              </div>
              <h3 style={{ marginBottom: '12px', fontWeight: 600 }}>AI Question Generation</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>Upload any PDF or DOCX file and instantly generate comprehensive exams with diverse question types using our advanced AI.</p>
            </Card>
            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.12)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <BarChart3 color="var(--accent-secondary)" size={24} />
              </div>
              <h3 style={{ marginBottom: '12px', fontWeight: 600 }}>Smart Result Analytics</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>Move beyond generic grades. Track student performance at the micro-topic level with detailed radar charts and insights.</p>
            </Card>
            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Clock color="var(--accent-success)" size={24} />
              </div>
              <h3 style={{ marginBottom: '12px', fontWeight: 600 }}>Study Monitoring</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>Track attendance automatically and monitor how long students engage with uploaded study materials to optimize learning.</p>
            </Card>
          </div>
        </main>

        {/* 
          ==================================================
          FOOTER SECTION: Modern AI SaaS Footer Component
          ==================================================
        */}
        <Footer />
      </div>
    </div>
  );
}