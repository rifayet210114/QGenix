// ============================================================================
// PremiumMembers.jsx — QGenix Admin Premium Member & Subscription Management
// ============================================================================
// Features:
//   1. Overview KPI Cards: Total Revenue, Active Subscriptions, Expiring Soon, Renewal Rate.
//   2. Filtering & Search: Search by name/email/ID, filter by subscription plan & status.
//   3. Premium Members Roster: Glowing Premium badges, purchase date, expiry date,
//      dynamic remaining validity days countdown.
//   4. Interactive Member Details Modal: Clicking any row reveals detailed breakdown:
//      - Kobe subscription kineche (Purchase date & time)
//      - Kon level er subscription (Plan tier, benefits, license key)
//      - Kobe tar meyad sesh hobe (Expiry date, remaining days, progress bar)
//      - Payment method, transaction ID & invoice details
//      - Interactive Renew / Extend (+1 Year) button with state update & toast.
// ============================================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Sparkles, Gem, Search, SlidersHorizontal, CheckCircle2, 
  Clock, Calendar, CreditCard, ShieldCheck, Download, Mail, 
  ExternalLink, UserCheck, AlertCircle, X, ChevronRight, RefreshCw, 
  Award, TrendingUp, Zap, FileText, Check, ArrowUpRight
} from 'lucide-react';
import Card from '../../components/Card';

// Initial Demo Data: Premium Members who purchased QGenix Premium Subscription Pack
const initialMembers = [
  {
    id: 'MEM-001',
    name: 'Dr. Sarah Ahmed',
    email: 'sarah.ahmed@diit.edu.bd',
    userRole: 'Associate Professor, CSE',
    avatarInitials: 'SA',
    avatarGradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    planTier: 'Faculty Pro Suite',
    planLevel: 'Faculty Pro',
    planTag: '👑 Premium • Faculty Pro',
    price: '৳12,000 / Year',
    amountPaid: '৳12,000 BDT ($110 USD)',
    purchaseDate: '2026-01-15',
    purchaseDateTime: 'January 15, 2026 • 02:45 PM',
    expiryDate: '2027-01-15',
    expiryDateTime: 'January 15, 2027 • 11:59 PM',
    billingCycle: 'Annual (12 Months)',
    paymentMethod: 'bKash Merchant Gateway',
    trxId: 'BK-9X8K72M1',
    invoiceNo: 'INV-2026-0089',
    status: 'Active',
    licenseKey: 'QGX-FAC-88921-VIP',
    unlockedPerks: [
      'Unlimited AI Exam Question Generation (GPT-4o & Claude 3.5)',
      'Automated Question Bank Moderation & Plagiarism Audit',
      'One-Click Central Tabulation Sheet Sync & PDF Routine Export',
      'Dedicated Faculty Cloud Storage (50 GB)',
      'Direct Turnstile Biometric Integration'
    ]
  },
  {
    id: 'MEM-002',
    name: 'Rafiul Islam',
    email: 'rafiul.islam@diit.edu.bd',
    userRole: 'Student (CSE 5th Sem, Batch 21)',
    avatarInitials: 'RI',
    avatarGradient: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
    planTier: 'Student Scholar Pass',
    planLevel: 'Student Scholar',
    planTag: '👑 Premium • Student Scholar',
    price: '৳2,500 / Year',
    amountPaid: '৳2,500 BDT ($23 USD)',
    purchaseDate: '2026-03-01',
    purchaseDateTime: 'March 01, 2026 • 11:20 AM',
    expiryDate: '2027-03-01',
    expiryDateTime: 'March 01, 2027 • 11:59 PM',
    billingCycle: 'Annual (12 Months)',
    paymentMethod: 'Nagad Online Payment',
    trxId: 'NG-8N2K55B0',
    invoiceNo: 'INV-2026-0142',
    status: 'Active',
    licenseKey: 'QGX-STU-33012-PRO',
    unlockedPerks: [
      '24/7 AI Academic Tutor for instant homework and algorithm help',
      'Unlimited Model Exam Questions and Mock Tests with instant solutions',
      'Past 5 Years University Exam Archive with official answer keys',
      'Zero Ads and high-speed PDF syllabus downloads'
    ]
  },
  {
    id: 'MEM-003',
    name: 'Dhaka International Institute of Technology (DIIT)',
    email: 'admin@diit.edu.bd',
    userRole: 'Institutional Campus Partner',
    avatarInitials: 'DI',
    avatarGradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    planTier: 'Campus Enterprise Pack',
    planLevel: 'Campus Enterprise',
    planTag: '⭐ VIP • Campus Enterprise',
    price: '৳1,50,000 / 2 Years',
    amountPaid: '৳1,50,000 BDT ($1,380 USD)',
    purchaseDate: '2025-11-10',
    purchaseDateTime: 'November 10, 2025 • 10:00 AM',
    expiryDate: '2027-11-10',
    expiryDateTime: 'November 10, 2027 • 11:59 PM',
    billingCycle: 'Biennial (24 Months)',
    paymentMethod: 'Eastern Bank Ltd (Corporate Wire Transfer)',
    trxId: 'EBL-CORP-887410',
    invoiceNo: 'INV-2025-0012',
    status: 'Active',
    licenseKey: 'QGX-INST-0001-ENTERPRISE',
    unlockedPerks: [
      'Central Academic Control Terminal for all university departments',
      'Unlimited Faculty & Student User Accounts with RBAC security',
      'Real-Time Turnstile Biometric Integration & Duty Timesheet',
      'Automated Routine Clash Detection & Central Exam Controller',
      'Custom Institution Branding, White-Label Portal & 99.9% Dedicated SLA'
    ]
  },
  {
    id: 'MEM-004',
    name: 'Noshin Tasnim',
    email: 'noshin.tasnim@diit.edu.bd',
    userRole: 'Student (CSE 5th Sem, Batch 21)',
    avatarInitials: 'NT',
    avatarGradient: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
    planTier: 'Student Semester Pass',
    planLevel: 'Student Semester',
    planTag: '👑 Premium • Student Plus',
    price: '৳1,500 / 6 Months',
    amountPaid: '৳1,500 BDT ($14 USD)',
    purchaseDate: '2026-05-10',
    purchaseDateTime: 'May 10, 2026 • 04:15 PM',
    expiryDate: '2026-11-10',
    expiryDateTime: 'November 10, 2026 • 11:59 PM',
    billingCycle: 'Half-Yearly (6 Months)',
    paymentMethod: 'bKash Personal Payment',
    trxId: 'BK-7M3Q99L4',
    invoiceNo: 'INV-2026-0275',
    status: 'Expiring Soon',
    licenseKey: 'QGX-STU-77291-SEM',
    unlockedPerks: [
      'Full access to 5th Semester Question Bank and Model Exam Papers',
      'AI Question Generator with customized difficulty settings',
      'Interactive Student Result & Transcript Downloader'
    ]
  },
  {
    id: 'MEM-005',
    name: 'Prof. Mahmudur Rahman',
    email: 'm.rahman@diit.edu.bd',
    userRole: 'Head of Department, BBA',
    avatarInitials: 'MR',
    avatarGradient: 'linear-gradient(135deg, #10B981, #3B82F6)',
    planTier: 'Faculty Pro Suite',
    planLevel: 'Faculty Pro',
    planTag: '👑 Premium • Faculty Pro',
    price: '৳12,000 / Year',
    amountPaid: '৳12,000 BDT ($110 USD)',
    purchaseDate: '2025-12-05',
    purchaseDateTime: 'December 05, 2025 • 09:30 AM',
    expiryDate: '2026-12-05',
    expiryDateTime: 'December 05, 2026 • 11:59 PM',
    billingCycle: 'Annual (12 Months)',
    paymentMethod: 'Credit Card (Visa ending in 4242)',
    trxId: 'STRIPE-CH_3M981A7Q',
    invoiceNo: 'INV-2025-0104',
    status: 'Active',
    licenseKey: 'QGX-FAC-99120-VIP',
    unlockedPerks: [
      'Unlimited AI Exam Question Generation & Syllabus Curriculum Mapping',
      'Central Tabulation Sheet & Batch Publishing Approval Pipeline',
      'Departmental Attendance Defaulter Alerts & PDF Exporters',
      '24/7 Dedicated Priority Technical Support'
    ]
  },
  {
    id: 'MEM-006',
    name: 'Sadia Rahman',
    email: 'sadia.rahman@diit.edu.bd',
    userRole: 'Student (CSE 6th Sem, Batch 20)',
    avatarInitials: 'SR',
    avatarGradient: 'linear-gradient(135deg, #F59E0B, #10B981)',
    planTier: 'Lifetime Alumni Pass',
    planLevel: 'Lifetime VIP',
    planTag: '💎 Premium • Lifetime VIP',
    price: '৳10,000 / Lifetime',
    amountPaid: '৳10,000 BDT ($92 USD)',
    purchaseDate: '2026-02-14',
    purchaseDateTime: 'February 14, 2026 • 07:10 PM',
    expiryDate: '2099-12-31',
    expiryDateTime: 'Permanent Lifetime Access',
    billingCycle: 'One-Time Lifetime',
    paymentMethod: 'Rocket Mobile Banking',
    trxId: 'RCK-6R89Y22P',
    invoiceNo: 'INV-2026-0091',
    status: 'Active',
    licenseKey: 'QGX-LIFE-00421-PERM',
    unlockedPerks: [
      'Permanent Lifetime Access to QGenix Question Bank & Model Tests',
      'Lifetime University Archive & Historical Academic Records',
      'Early access to beta AI learning tools and career interview prep',
      'Permanent VIP badge across student portal and forums'
    ]
  },
  {
    id: 'MEM-007',
    name: 'Sajjad Karim',
    email: 'sajjad.karim@diit.edu.bd',
    userRole: 'Student (CSE 5th Sem, Batch 21)',
    avatarInitials: 'SK',
    avatarGradient: 'linear-gradient(135deg, #6B7280, #4B5563)',
    planTier: 'Student Monthly Pass',
    planLevel: 'Student Monthly',
    planTag: '👑 Premium • Monthly Pass',
    price: '৳350 / Month',
    amountPaid: '৳350 BDT ($3.20 USD)',
    purchaseDate: '2026-09-20',
    purchaseDateTime: 'September 20, 2026 • 01:05 PM',
    expiryDate: '2026-10-20',
    expiryDateTime: 'October 20, 2026 • 11:59 PM',
    billingCycle: 'Monthly (30 Days)',
    paymentMethod: 'bKash Personal Payment',
    trxId: 'BK-4K91L08W',
    invoiceNo: 'INV-2026-0419',
    status: 'Expired',
    licenseKey: 'QGX-STU-11902-MNT',
    unlockedPerks: [
      'AI Practice Questions & Quiz Generation (Up to 30 tests)',
      'Digital Lecture Notes Downloader'
    ]
  }
];

export default function PremiumMembers() {
  const [members, setMembers] = useState(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMember, setSelectedMember] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculate days remaining or expired
  const getRemainingDaysInfo = (expiryDateStr) => {
    if (expiryDateStr.startsWith('2099')) {
      return { text: 'Lifetime Access', isLifetime: true, days: 9999, statusType: 'lifetime' };
    }
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Expired ${Math.abs(diffDays)} days ago`, isExpired: true, days: diffDays, statusType: 'expired' };
    }
    if (diffDays <= 30) {
      return { text: `Expires in ${diffDays} days`, isExpiringSoon: true, days: diffDays, statusType: 'soon' };
    }
    return { text: `${diffDays} days remaining`, isNormal: true, days: diffDays, statusType: 'active' };
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.planLevel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPlan = planFilter === 'All' || m.planLevel.toLowerCase().includes(planFilter.toLowerCase());
      const matchStatus = statusFilter === 'All' || m.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchPlan && matchStatus;
    });
  }, [members, searchQuery, planFilter, statusFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalCount = members.length;
    const activeCount = members.filter(m => m.status === 'Active').length;
    const expiringSoonCount = members.filter(m => m.status === 'Expiring Soon').length;
    const totalRevBdt = '৳1,89,350';
    return { totalCount, activeCount, expiringSoonCount, totalRevBdt };
  }, [members]);

  // Handle Renew / Extend Subscription (+1 Year)
  const handleExtendSubscription = (memberId) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        if (m.expiryDate.startsWith('2099')) {
          triggerToast('✨ This member already has a Permanent Lifetime Subscription!');
          return m;
        }
        const currentExp = new Date(m.expiryDate);
        currentExp.setFullYear(currentExp.getFullYear() + 1);
        const newExpStr = currentExp.toISOString().split('T')[0];
        const newExpTime = currentExp.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' • 11:59 PM';
        
        const updated = {
          ...m,
          expiryDate: newExpStr,
          expiryDateTime: newExpTime,
          status: 'Active'
        };
        setSelectedMember(updated);
        triggerToast(`🎉 Subscription renewed! Expiry extended to ${newExpStr}`);
        return updated;
      }
      return m;
    }));
  };

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {/* =======================================================================
         PAGE HEADER
         ======================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '30px', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '10px' }}>
            <Crown size={15} style={{ color: '#F59E0B' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C084FC', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              QGenix Monetization & Licenses
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Premium Members & Subscription Manager
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            List of users who purchased QGenix Premium Subscription packs. View purchase dates, plan tiers, and validity expiry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => triggerToast('📥 Premium Members Report exported as CSV/PDF.')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <Download size={16} />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
         TOP KPI STAT CARDS
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        
        {/* Total Members */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Subscribed</span>
            <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '10px', color: '#8B5CF6' }}>
              <Crown size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {stats.totalCount}
            </div>
            <span style={{ fontSize: '0.74rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 600 }}>
              <TrendingUp size={13} /> Across Faculty, Students & Campus
            </span>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Subscriptions</span>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', color: '#10B981' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-heading)' }}>
              {stats.activeCount}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', fontWeight: 600 }}>
              Currently enjoying full VIP benefits
            </span>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Expiring Soon</span>
            <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '10px', color: '#F59E0B' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: stats.expiringSoonCount > 0 ? '#F59E0B' : 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {stats.expiringSoonCount}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', fontWeight: 600 }}>
              Within next 30 days
            </span>
          </div>
        </div>

        {/* Total Pack Revenue */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pack Revenue (Total)</span>
            <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '10px', color: '#F59E0B' }}>
              <Gem size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {stats.totalRevBdt}
            </div>
            <span style={{ fontSize: '0.74rem', color: '#C084FC', display: 'block', marginTop: '2px', fontWeight: 600 }}>
              bKash, Nagad & Bank Wires
            </span>
          </div>
        </div>

      </div>

      {/* =======================================================================
         ROSTER TABLE & FILTERS
         ======================================================================= */}
      <Card 
        title="Subscribed Premium Members Roster"
        className="premium-card w-full"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Showing {filteredMembers.length} of {members.length} members
            </span>
          </div>
        }
      >
        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by member name, email, or institutional ID..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem'
              }}
            />
          </div>

          {/* Plan Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Subscription Tiers</option>
              <option value="Enterprise">Enterprise / Campus</option>
              <option value="Faculty">Faculty Pro</option>
              <option value="Student">Student Passes</option>
              <option value="Lifetime">Lifetime VIP</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

        </div>

        {/* Member Table */}
        <div className="table-responsive-container" style={{ marginTop: '12px' }}>
          <table className="custom-dashboard-table">
            <thead>
              <tr>
                <th>Member Information</th>
                <th>Subscription Tier & Tag</th>
                <th>Purchase Date</th>
                <th>Expires On (Meyad Sesh)</th>
                <th>Amount Paid</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                    <AlertCircle size={28} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>No premium members found matching your search filters.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const remaining = getRemainingDaysInfo(member.expiryDate);
                  const isExpSoon = member.status === 'Expiring Soon';
                  const isExpired = member.status === 'Expired';

                  return (
                    <tr 
                      key={member.id} 
                      onClick={() => setSelectedMember(member)}
                      className="hover-lift"
                      style={{ cursor: 'pointer', transition: 'background 0.2s ease' }}
                      title="Click to view detailed subscription profile"
                    >
                      {/* Member Info */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: member.avatarGradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            flexShrink: 0,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                          }}>
                            {member.avatarInitials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                              {member.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {member.email} • <span style={{ color: 'var(--text-secondary)' }}>{member.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Premium Tag */}
                      <td>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          background: member.planLevel.includes('Enterprise') 
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.15))'
                            : member.planLevel.includes('Lifetime')
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.15))'
                            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.15))',
                          border: member.planLevel.includes('Enterprise') 
                            ? '1px solid rgba(245, 158, 11, 0.4)'
                            : '1px solid rgba(139, 92, 246, 0.4)',
                          boxShadow: '0 0 10px rgba(139, 92, 246, 0.12)'
                        }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: member.planLevel.includes('Enterprise') ? '#FBBF24' : '#C084FC' }}>
                            {member.planTag}
                          </span>
                        </div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {member.billingCycle}
                        </span>
                      </td>

                      {/* Purchase Date */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          <Calendar size={13} style={{ color: 'var(--accent-secondary)' }} />
                          <span>{member.purchaseDate}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Verified Purchase
                        </span>
                      </td>

                      {/* Expiry Date */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: isExpired ? '#EF4444' : isExpSoon ? '#F59E0B' : 'var(--text-primary)' }}>
                          <Clock size={13} style={{ color: isExpired ? '#EF4444' : isExpSoon ? '#F59E0B' : '#10B981' }} />
                          <span>{member.expiryDate.startsWith('2099') ? 'Lifetime Pass' : member.expiryDate}</span>
                        </div>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          marginTop: '3px',
                          color: isExpired ? '#EF4444' : isExpSoon ? '#F59E0B' : '#10B981',
                          background: isExpired ? 'rgba(239, 68, 68, 0.1)' : isExpSoon ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {remaining.text}
                        </span>
                      </td>

                      {/* Amount Paid */}
                      <td>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {member.price}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {member.paymentMethod.split(' ')[0]}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${
                          member.status === 'Active' ? 'badge-success' :
                          member.status === 'Expiring Soon' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {member.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMember(member);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.74rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>Details</span>
                          <ChevronRight size={13} />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* =======================================================================
         INTERACTIVE MEMBER DETAILS MODAL (ROW CLICK VIEW)
         ======================================================================= */}
      <AnimatePresence>
        {selectedMember && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.82)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '16px'
            }}
            onClick={() => setSelectedMember(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '780px',
                maxHeight: '90vh',
                borderRadius: '24px',
                background: 'linear-gradient(180deg, #131B2E 0%, #0B0F19 100%)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(139, 92, 246, 0.18)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '24px 28px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: selectedMember.avatarGradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
                    flexShrink: 0
                  }}>
                    {selectedMember.avatarInitials}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {selectedMember.name}
                      </h2>
                      <span className={`badge ${
                        selectedMember.status === 'Active' ? 'badge-success' :
                        selectedMember.status === 'Expiring Soon' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {selectedMember.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      {selectedMember.email} • <span style={{ color: 'var(--accent-secondary)' }}>{selectedMember.userRole}</span>
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedMember(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '8px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  className="hover-lift"
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 3 Core Highlight Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
                  
                  {/* Plan Tier */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(139, 92, 246, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.25)'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: '#C084FC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Subscription Level
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', margin: 0 }}>
                      {selectedMember.planTier}
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Key: <code style={{ color: '#FBBF24' }}>{selectedMember.licenseKey}</code>
                    </span>
                  </div>

                  {/* Purchase Date */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.25)'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Kobe Subscription Kineche
                    </span>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', margin: 0 }}>
                      {selectedMember.purchaseDateTime}
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Billing: {selectedMember.billingCycle}
                    </span>
                  </div>

                  {/* Expiry Date */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: selectedMember.status === 'Expired' 
                      ? 'rgba(239, 68, 68, 0.08)' 
                      : selectedMember.status === 'Expiring Soon'
                      ? 'rgba(245, 158, 11, 0.08)'
                      : 'rgba(16, 185, 129, 0.08)',
                    border: selectedMember.status === 'Expired' 
                      ? '1px solid rgba(239, 68, 68, 0.25)'
                      : selectedMember.status === 'Expiring Soon'
                      ? '1px solid rgba(245, 158, 11, 0.25)'
                      : '1px solid rgba(16, 185, 129, 0.25)'
                  }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      color: selectedMember.status === 'Expired' ? '#F87171' : selectedMember.status === 'Expiring Soon' ? '#FBBF24' : '#34D399', 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.04em' 
                    }}>
                      Kobe Meyad Sesh Hobe
                    </span>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', margin: 0 }}>
                      {selectedMember.expiryDateTime}
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: selectedMember.status === 'Expired' ? '#EF4444' : '#10B981', display: 'block', marginTop: '4px', fontWeight: 700 }}>
                      {getRemainingDaysInfo(selectedMember.expiryDate).text}
                    </span>
                  </div>

                </div>

                {/* Payment & Invoice Breakdown */}
                <div style={{
                  padding: '18px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={16} style={{ color: 'var(--accent-secondary)' }} />
                    <span>Transaction & Billing Verification</span>
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Amount Charged:</span>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{selectedMember.amountPaid}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Payment Gateway:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{selectedMember.paymentMethod}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Transaction ID (TrxID):</span>
                      <strong style={{ color: '#C084FC', fontFamily: 'monospace' }}>{selectedMember.trxId}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Official Invoice:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{selectedMember.invoiceNo}</strong>
                    </div>
                  </div>
                </div>

                {/* Unlocked Premium Benefits */}
                <div style={{
                  padding: '18px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={16} style={{ color: '#F59E0B' }} />
                    <span>Active Features & Enterprise Quota Entitlements</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedMember.unlockedPerks.map((perk, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <div style={{ padding: '3px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', marginTop: '2px' }}>
                          <Check size={12} />
                        </div>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div style={{
                padding: '20px 28px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <button
                  type="button"
                  onClick={() => triggerToast(`🧾 Official receipt downloaded for ${selectedMember.name} (${selectedMember.invoiceNo}).`)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <FileText size={15} />
                  <span>Download Invoice Receipt</span>
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleExtendSubscription(selectedMember.id)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', fontWeight: 700 }}
                  >
                    <RefreshCw size={14} />
                    <span>Renew / Extend (+1 Year)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                  >
                    Close
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating toast notification bar */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.88rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(16px)',
              zIndex: 20000
            }}
          >
            <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
