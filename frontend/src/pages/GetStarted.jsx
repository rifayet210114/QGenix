// ============================================================
// GetStarted.jsx — QGenix Pricing & Free Trial Page
// ------------------------------------------------------------
// Shown when the user clicks "Get Started" from the landing page.
// Features:
//   1. Animated hero banner — 15-day free trial offer
//   2. Three pricing tier cards (Starter / Pro / Enterprise)
//   3. FAQ accordion section
//   4. Full compatibility with dark + light mode design tokens
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit, Check, X, ChevronDown, ChevronUp,
  Zap, Shield, Crown, ArrowRight, Gift, Clock
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';

// ── Pricing tier data ──────────────────────────────────────
const plans = [
  {
    id: 'starter',
    name: 'Starter',
    icon: <Zap size={28} />,
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    iconBorder: 'rgba(16, 185, 129, 0.25)',
    monthlyPrice: 0,
    yearlyPrice: 0,
    tagline: 'Perfect for small institutes',
    accentGlow: 'rgba(16, 185, 129, 0.20)',
    borderHover: '#10B981',
    badge: null,
    features: [
      { text: 'Up to 30 students', included: true },
      { text: '2 Teacher accounts', included: true },
      { text: 'AI Question Generation (50/mo)', included: true },
      { text: 'Basic Analytics Dashboard', included: true },
      { text: 'Attendance Tracking', included: true },
      { text: 'Priority Support', included: false },
      { text: 'Advanced Analytics & Reports', included: false },
      { text: 'Custom Branding', included: false },
    ],
    cta: 'Start Free',
    ctaStyle: 'outline',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: <Shield size={28} />,
    iconColor: '#8B5CF6',
    iconBg: 'rgba(139, 92, 246, 0.12)',
    iconBorder: 'rgba(139, 92, 246, 0.25)',
    monthlyPrice: 29,
    yearlyPrice: 23,
    tagline: 'Best for growing institutions',
    accentGlow: 'rgba(139, 92, 246, 0.30)',
    borderHover: '#8B5CF6',
    badge: 'Most Popular',
    features: [
      { text: 'Up to 200 students', included: true },
      { text: '10 Teacher accounts', included: true },
      { text: 'Unlimited AI Question Generation', included: true },
      { text: 'Advanced Analytics & Radar Charts', included: true },
      { text: 'Attendance + Study Monitoring', included: true },
      { text: 'Priority Support (24h)', included: true },
      { text: 'Result & Grade Management', included: true },
      { text: 'Custom Branding', included: false },
    ],
    cta: 'Start Free Trial',
    ctaStyle: 'primary',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: <Crown size={28} />,
    iconColor: '#F59E0B',
    iconBg: 'rgba(245, 158, 11, 0.12)',
    iconBorder: 'rgba(245, 158, 11, 0.25)',
    monthlyPrice: 79,
    yearlyPrice: 63,
    tagline: 'For large universities & networks',
    accentGlow: 'rgba(245, 158, 11, 0.20)',
    borderHover: '#F59E0B',
    badge: null,
    features: [
      { text: 'Unlimited students', included: true },
      { text: 'Unlimited Teacher accounts', included: true },
      { text: 'Unlimited AI Question Generation', included: true },
      { text: 'Full Analytics Suite + Exports', included: true },
      { text: 'Attendance + Study Monitoring', included: true },
      { text: 'Dedicated Account Manager', included: true },
      { text: 'Result & Grade Management', included: true },
      { text: 'Custom Branding & White-label', included: true },
    ],
    cta: 'Contact Sales',
    ctaStyle: 'gold',
  },
];

// ── FAQ data ───────────────────────────────────────────────
const faqs = [
  {
    q: 'What is included in the 15-day free trial?',
    a: 'Your free trial gives you full access to the Pro plan features — unlimited question generation, advanced analytics, attendance monitoring, and up to 200 students — with no credit card required.',
  },
  {
    q: 'Can I upgrade or downgrade my plan anytime?',
    a: 'Yes! You can switch plans at any time from your Admin Settings. Upgrades take effect immediately; downgrades take effect at the next billing cycle.',
  },
  {
    q: 'Is my institution\'s data secure?',
    a: 'Absolutely. QGenix uses end-to-end encryption for all data at rest and in transit. We are fully compliant with FERPA and GDPR guidelines.',
  },
  {
    q: 'Do you offer discounts for NGOs or government institutions?',
    a: 'Yes — we offer up to 40% discounts for non-profits and government educational bodies. Please reach out via the Contact Sales button to learn more.',
  },
];

// ── FAQ Accordion Item ─────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'border-color 0.25s, background 0.25s',
        marginBottom: '12px',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontWeight: 600, fontSize: '0.97rem', color: 'var(--text-primary)' }}>{q}</span>
        {open
          ? <ChevronUp size={18} color="var(--accent-primary)" />
          : <ChevronDown size={18} color="var(--text-muted)" />
        }
      </div>
      {open && (
        <p style={{ marginTop: '14px', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 0 }}>
          {a}
        </p>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function GetStarted() {
  const [yearly, setYearly] = useState(false);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── Navbar ─────────────────────────────────────── */}
        <header style={{
          padding: '20px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          backdropFilter: 'blur(12px)',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(139,92,246,0.4)',
            }}>
              <BrainCircuit size={20} color="white" />
            </div>
            <h2 style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.2rem' }}>QGenix AI</h2>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle />
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 20px' }}>Login</Link>
          </div>
        </header>

        <main style={{ flex: 1, padding: '60px 24px 80px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

            {/* ── 15-Day Free Trial Hero ──────────────────── */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.14) 100%)',
              border: '1px solid rgba(139,92,246,0.35)',
              borderRadius: '24px',
              padding: '48px 40px',
              textAlign: 'center',
              marginBottom: '64px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Glow blob */}
              <div style={{
                position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
                width: '400px', height: '200px',
                background: 'radial-gradient(ellipse, rgba(139,92,246,0.3) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Trial badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.25))',
                border: '1px solid rgba(139,92,246,0.5)',
                borderRadius: '100px', padding: '6px 18px',
                fontSize: '0.82rem', fontWeight: 700, color: '#a78bfa',
                letterSpacing: '0.04em', textTransform: 'uppercase',
                marginBottom: '24px',
              }}>
                <Gift size={14} />
                Limited Offer
              </div>

              <h1 style={{
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                fontWeight: 900,
                marginBottom: '16px',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-heading)',
              }}>
                Start Your{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  15-Day Free Trial
                </span>
              </h1>

              <p style={{
                color: 'var(--text-secondary)', fontSize: '1.1rem',
                maxWidth: '560px', margin: '0 auto 32px',
                lineHeight: 1.7,
              }}>
                Get full access to all <strong style={{ color: 'var(--text-primary)' }}>Pro features</strong> — no credit card required.
                Explore AI question generation, advanced analytics, and more, completely free for 15 days.
              </p>

              {/* Trial perks pills */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px',
                marginBottom: '36px',
              }}>
                {[
                  { icon: <Check size={14} />, label: 'No Credit Card' },
                  { icon: <Check size={14} />, label: 'Full Pro Access' },
                  { icon: <Clock size={14} />, label: '15 Days Free' },
                  { icon: <Check size={14} />, label: 'Cancel Anytime' },
                ].map(p => (
                  <div key={p.label} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '100px', padding: '6px 16px',
                    fontSize: '0.84rem', fontWeight: 500, color: 'var(--text-primary)',
                  }}>
                    <span style={{ color: '#10B981' }}>{p.icon}</span>
                    {p.label}
                  </div>
                ))}
              </div>

              <Link
                to="/login"
                className="btn btn-primary"
                style={{
                  padding: '14px 40px', fontSize: '1.05rem', fontWeight: 700,
                  borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 0 30px rgba(139,92,246,0.45)',
                }}
              >
                Claim Free Trial <ArrowRight size={18} />
              </Link>

              <p style={{ marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Trial automatically converts to Starter (free) plan after 15 days — no surprises.
              </p>
            </div>

            {/* ── Section heading ─────────────────────────── */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '12px',
                fontFamily: 'var(--font-heading)',
              }}>
                Choose Your Plan
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '28px' }}>
                Transparent pricing. Upgrade, downgrade or cancel any time.
              </p>

              {/* Monthly / Yearly toggle */}
              <div style={{
                display: 'inline-flex', background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)', borderRadius: '100px',
                padding: '4px', gap: '4px',
              }}>
                {['Monthly', 'Yearly'].map(label => (
                  <button
                    key={label}
                    onClick={() => setYearly(label === 'Yearly')}
                    style={{
                      padding: '8px 24px', borderRadius: '100px', border: 'none',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
                      transition: 'all 0.2s ease',
                      background: (label === 'Yearly') === yearly
                        ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
                        : 'transparent',
                      color: (label === 'Yearly') === yearly
                        ? '#fff'
                        : 'var(--text-secondary)',
                    }}
                  >
                    {label}
                    {label === 'Yearly' && (
                      <span style={{
                        marginLeft: '6px', fontSize: '0.72rem',
                        background: 'rgba(16,185,129,0.25)',
                        color: '#10B981', padding: '2px 7px',
                        borderRadius: '100px', fontWeight: 700,
                      }}>-20%</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Pricing Cards ───────────────────────────── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '72px',
            }}>
              {plans.map(plan => (
                <PricingCard key={plan.id} plan={plan} yearly={yearly} />
              ))}
            </div>

            {/* ── FAQ ─────────────────────────────────────── */}
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <h2 style={{
                textAlign: 'center',
                fontSize: '1.8rem', fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '32px',
                fontFamily: 'var(--font-heading)',
              }}>
                Frequently Asked Questions
              </h2>
              {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>

          </div>
        </main>

        {/* ── Footer strip ───────────────────────────────── */}
        <footer style={{
          borderTop: '1px solid var(--border-color)',
          padding: '24px 48px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
          color: 'var(--text-muted)', fontSize: '0.84rem',
        }}>
          <span>© 2025 QGenix AI. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</Link>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</Link>
          </div>
        </footer>

      </div>

      {/* ── Inline styles for light-mode & hover effects ── */}
      <style>{`
        body.light-mode .pricing-card {
          background: rgba(255,255,255,0.85) !important;
          border-color: rgba(0,0,0,0.10) !important;
        }
        body.light-mode .pricing-card:hover {
          border-color: var(--accent-primary) !important;
        }
        body.light-mode .pricing-feature-text {
          color: #374151 !important;
        }
        body.light-mode .pricing-feature-muted {
          color: #9CA3AF !important;
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

// ── Pricing Card Sub-component ─────────────────────────────
function PricingCard({ plan, yearly }) {
  const [hovered, setHovered] = useState(false);
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const isPro = plan.id === 'pro';

  return (
    <div
      className="pricing-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: isPro
          ? 'linear-gradient(145deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.10) 100%)'
          : 'var(--glass-bg)',
        border: `1px solid ${hovered ? plan.borderHover : isPro ? 'rgba(139,92,246,0.35)' : 'var(--border-color)'}`,
        borderRadius: '20px',
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered
          ? `0 20px 60px ${plan.accentGlow}, 0 0 0 1px ${plan.borderHover}22`
          : isPro
            ? `0 8px 30px rgba(139,92,246,0.20)`
            : '0 4px 20px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Popular badge */}
      {plan.badge && (
        <div style={{
          position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)',
          color: '#fff', fontWeight: 700, fontSize: '0.75rem',
          padding: '4px 18px', borderRadius: '100px',
          letterSpacing: '0.05em', textTransform: 'uppercase',
          boxShadow: '0 0 20px rgba(139,92,246,0.5)',
          animation: 'floatBadge 3s ease-in-out infinite',
          whiteSpace: 'nowrap',
        }}>
          {plan.badge}
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: '56px', height: '56px', borderRadius: '14px',
        background: plan.iconBg,
        border: `1px solid ${plan.iconBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px', color: plan.iconColor,
      }}>
        {plan.icon}
      </div>

      {/* Name & tagline */}
      <h3 style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--font-heading)' }}>
        {plan.name}
      </h3>
      <p style={{ margin: '0 0 24px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        {plan.tagline}
      </p>

      {/* Price */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
        <span style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1, fontFamily: 'var(--font-heading)', color: plan.iconColor }}>
          {price === 0 ? 'Free' : `$${price}`}
        </span>
        {price !== 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingBottom: '6px' }}>
            /mo{yearly ? ' (billed yearly)' : ''}
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '24px' }} />

      {/* Features */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {plan.features.map(f => (
          <li key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {f.included
              ? <span style={{ color: plan.iconColor, flexShrink: 0 }}><Check size={16} /></span>
              : <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}><X size={16} /></span>
            }
            <span
              className={f.included ? 'pricing-feature-text' : 'pricing-feature-muted'}
              style={{
                fontSize: '0.9rem',
                color: f.included ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <Link
        to="/login"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '13px 24px', borderRadius: '12px',
          fontWeight: 700, fontSize: '0.95rem',
          textDecoration: 'none', transition: 'all 0.2s ease',
          ...(plan.ctaStyle === 'primary' ? {
            background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
            color: '#fff',
            boxShadow: '0 0 25px rgba(139,92,246,0.40)',
          } : plan.ctaStyle === 'gold' ? {
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            color: '#fff',
            boxShadow: '0 0 25px rgba(245,158,11,0.35)',
          } : {
            background: 'transparent',
            color: plan.iconColor,
            border: `1.5px solid ${plan.iconColor}`,
          }),
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.02)'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {plan.cta} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
