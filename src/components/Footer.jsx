// =============================================================================
// Footer.jsx — QGenix Premium Landing Page Footer Component
// =============================================================================
// This is the main footer component for the QGenix AI-powered academic
// management platform. It renders a multi-section footer that appears at the
// bottom of the landing page.
//
// STRUCTURE OVERVIEW (top to bottom):
//   1. CTA Section    — Full-width glassmorphic card prompting users to sign up
//   2. Link Grid      — 5-column grid: Brand + 4 navigation link columns
//   3. Trust Badges   — Horizontal row of security/compliance trust indicators
//   4. Bottom Bar     — Copyright, tagline, and legal links
//
// DESIGN NOTES:
//   - Follows the QGenix dark navy + electric purple glassmorphic aesthetic
//   - All navigation links currently route to /login (placeholder behavior)
//   - Social media icons use inline SVGs for zero-dependency rendering
//   - Icons from the `lucide-react` library match the site-wide icon system
// =============================================================================

import React from 'react';
import { Link } from 'react-router-dom';

// Lucide icon imports — each chosen to represent a specific concept:
// - BrainCircuit: brand logo icon (AI + intelligence)
// - ShieldCheck, KeyRound, Lock: security/trust indicators
// - Cpu: AI automation indicator
// - ArrowRight: CTA button directional arrow
// - Sparkles: accent badge decoration
import { 
  BrainCircuit, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Cpu, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Component-specific styles (glassmorphism, gradients, light/dark mode)
import './Footer.css';

/**
 * Footer Component
 * 
 * Premium, futuristic footer for the QGenix landing page. Renders a full
 * footer experience with a promotional CTA card, organized navigation links
 * across product/solutions/company/support categories, trust badges, and
 * a copyright/legal bottom bar.
 * 
 * This component is stateless — it takes no props and manages no internal state.
 * All links use React Router's <Link> for client-side navigation.
 * 
 * @returns {JSX.Element} The complete footer section
 */
export default function Footer() {
  return (
    <footer className="qgenix-footer-container">
      {/* 
        ==================================================
        SECTION 1: TOP CTA (CALL TO ACTION)
        ==================================================
        A prominent glassmorphic card encouraging users to get started
        with QGenix. Features an animated spotlight glow effect behind
        the text for visual depth, a badge label, headline, subtext,
        and two action buttons (primary + secondary).
      */}
      <div className="footer-cta-wrapper">
        <div className="premium-card footer-cta-card">
          {/* Animated radial gradient spotlight — purely decorative.
              Creates a soft purple glow behind the CTA content using
              CSS animation (pulseSpotlight). pointer-events: none
              ensures it doesn't interfere with clicks. */}
          <div className="footer-cta-spotlight"></div>
          
          {/* CTA content container — sits above the spotlight (z-index: 2) */}
          <div className="footer-cta-content">
            {/* Accent badge — small pill-shaped label at top of CTA */}
            <div className="badge badge-accent mb-4">
              <Sparkles size={12} className="mr-1" />
              <span>Next-Gen Academic Hub</span>
            </div>
            
            {/* Main CTA headline — uses gradient text (white to semi-transparent)
                for a premium fading text effect */}
            <h2 className="footer-cta-title">
              Transform Academic Management with AI
            </h2>
            
            {/* Supporting description text below the headline */}
            <p className="footer-cta-subtext">
              Streamline attendance, result processing, communication, and administration with one intelligent platform.
            </p>
            
            {/* Action buttons row — two CTAs side by side */}
            <div className="footer-cta-actions">
              {/* Primary CTA — solid purple button with arrow icon that
                  slides right on hover for a directional micro-interaction */}
              <Link to="/login" className="btn btn-primary footer-btn-primary">
                Get Started <ArrowRight size={16} className="ml-2 btn-arrow" />
              </Link>
              {/* Secondary CTA — ghost/outline button for lower-priority action */}
              <Link to="/login" className="btn btn-secondary footer-btn-secondary">
                Book Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ==================================================
        SECTION 2: MAIN FOOTER CONTENT (5-Column Link Grid)
        ==================================================
        A responsive CSS Grid layout with 5 columns:
          - Column 1 (1.5fr): Brand identity, description, and social links
          - Columns 2-5 (1fr each): Categorized navigation links
        
        On tablet (≤1024px): collapses to 3 columns with brand spanning full width
        On mobile (≤640px): collapses to 2 columns
      */}
      <div className="footer-main-grid">

        {/* ---- Column 1: Brand Identity & Social Media ---- */}
        <div className="footer-brand-col">
          {/* Logo lockup: AI brain icon + "QGenix AI" text */}
          <div className="footer-logo">
            {/* BrainCircuit icon with a purple glow drop-shadow effect */}
            <BrainCircuit color="var(--accent-primary)" size={28} className="logo-glow-icon" />
            <span className="logo-text">QGenix AI</span>
          </div>

          {/* Brief platform description for SEO and user context */}
          <p className="footer-brand-desc">
            AI-powered academic management platform built for schools, colleges, and universities to modernize educational administration.
          </p>

          {/* Social media icon buttons — each opens in a new tab.
              Icons are inline SVGs (not icon library components) to keep
              the bundle lean and allow precise path control. Each button
              has a purple glow hover effect matching the brand palette. */}
          <div className="footer-social-links">
            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-icon-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            {/* GitHub */}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="social-icon-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-icon-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            {/* X (formerly Twitter) — slightly smaller (16px) to visually
                balance against other icons due to its simpler geometry */}
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="social-icon-btn">
              <svg 
                viewBox="0 0 24 24" 
                width="16" 
                height="16" 
                stroke="currentColor" 
                fill="none" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
              </svg>
            </a>
            {/* YouTube */}
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-icon-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
          </div>
        </div>

        {/* ---- Column 2: Product Links ----
            Core feature pages — highlights what QGenix offers */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Product</h4>
          <ul className="footer-link-list">
            <li><Link to="/login" className="footer-link-item">Features</Link></li>
            <li><Link to="/login" className="footer-link-item">Modules</Link></li>
            <li><Link to="/login" className="footer-link-item">AI Result Processing</Link></li>
            <li><Link to="/login" className="footer-link-item">Attendance Tracking</Link></li>
            <li><Link to="/login" className="footer-link-item">Dashboard</Link></li>
            <li><Link to="/login" className="footer-link-item">Pricing</Link></li>
          </ul>
        </div>

        {/* ---- Column 3: Solutions Links ----
            Audience-specific pages — who QGenix is built for */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Solutions</h4>
          <ul className="footer-link-list">
            <li><Link to="/login" className="footer-link-item">Schools</Link></li>
            <li><Link to="/login" className="footer-link-item">Colleges</Link></li>
            <li><Link to="/login" className="footer-link-item">Universities</Link></li>
            <li><Link to="/login" className="footer-link-item">Teachers</Link></li>
            <li><Link to="/login" className="footer-link-item">Students</Link></li>
            <li><Link to="/login" className="footer-link-item">Administrators</Link></li>
          </ul>
        </div>

        {/* ---- Column 4: Company Links ----
            Organizational / corporate info pages */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Company</h4>
          <ul className="footer-link-list">
            <li><Link to="/login" className="footer-link-item">About Us</Link></li>
            <li><Link to="/login" className="footer-link-item">Careers</Link></li>
            <li><Link to="/login" className="footer-link-item">Blog</Link></li>
            <li><Link to="/login" className="footer-link-item">Contact</Link></li>
            <li><Link to="/login" className="footer-link-item">Roadmap</Link></li>
            <li><Link to="/login" className="footer-link-item">Documentation</Link></li>
          </ul>
        </div>

        {/* ---- Column 5: Support Links ----
            Help, legal, and operational status pages */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Support</h4>
          <ul className="footer-link-list">
            <li><Link to="/login" className="footer-link-item">Help Center</Link></li>
            <li><Link to="/login" className="footer-link-item">FAQ</Link></li>
            <li><Link to="/login" className="footer-link-item">Terms of Service</Link></li>
            <li><Link to="/login" className="footer-link-item">Privacy Policy</Link></li>
            <li><Link to="/login" className="footer-link-item">Security</Link></li>
            <li><Link to="/login" className="footer-link-item">Status</Link></li>
          </ul>
        </div>
      </div>

      {/* 
        ==================================================
        SECTION 3: TRUST BADGES ROW
        ==================================================
        Horizontal strip of security/compliance badges sandwiched between
        two gradient divider lines. These build user confidence by
        highlighting enterprise-grade security features.
        Each badge pairs a Lucide icon with a short descriptor.
      */}
      <div className="footer-trust-row">
        {/* Top divider — gradient fades from transparent at edges to subtle white center */}
        <div className="trust-divider"></div>

        <div className="trust-items-container">
          {/* Trust badge: Cloud security */}
          <div className="trust-item">
            <ShieldCheck size={16} className="trust-icon" />
            <span>Secure Cloud Infrastructure</span>
          </div>
          {/* Trust badge: RBAC (Role-Based Access Control) */}
          <div className="trust-item">
            <KeyRound size={16} className="trust-icon" />
            <span>Role-Based Access Control</span>
          </div>
          {/* Trust badge: Enterprise security */}
          <div className="trust-item">
            <Lock size={16} className="trust-icon" />
            <span>Enterprise-Grade Security</span>
          </div>
          {/* Trust badge: AI automation capabilities */}
          <div className="trust-item">
            <Cpu size={16} className="trust-icon" />
            <span>AI-Powered Automation</span>
          </div>
        </div>

        {/* Bottom divider — mirrors the top divider for visual symmetry */}
        <div className="trust-divider"></div>
      </div>

      {/* 
        ==================================================
        SECTION 4: BOTTOM BAR (Copyright & Legal)
        ==================================================
        Final row of the footer containing three elements laid out
        with space-between alignment:
          - Left: Copyright notice
          - Center: Brand tagline with gradient text effect
          - Right: Legal navigation links separated by dot dividers
        
        Wraps to a centered column layout on mobile (≤640px).
      */}
      <div className="footer-bottom-bar">
        {/* Copyright — dynamically shows the current year (hardcoded 2026) */}
        <div className="footer-copyright">
          © 2026 QGenix. All rights reserved.
        </div>

        {/* Tagline — uses CSS gradient text (white → secondary color) for a
            premium fading effect that adapts to light/dark mode */}
        <div className="footer-tagline">
          <span>Smarter Education Through AI</span>
        </div>

        {/* Legal links — compact inline list with bullet dot separators */}
        <div className="footer-legal-links">
          <Link to="/login" className="legal-link">Privacy</Link>
          <span className="dot-divider">•</span>
          <Link to="/login" className="legal-link">Terms</Link>
          <span className="dot-divider">•</span>
          <Link to="/login" className="legal-link">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
