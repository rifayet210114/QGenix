// =========================================================================================
// AIEngine.jsx — AI Engine & Infrastructure Management
// -----------------------------------------------------------------------------------------
// Manages AI Engine configurations, Google Gemini API status verification,
// secure server-side credential policies, model routing, quotas, and guardrails.
// =========================================================================================

import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { API_BASE } from '../../config';
import { 
  Sparkles, 
  Cpu, 
  Key, 
  Sliders, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Save, 
  Eye, 
  EyeOff, 
  Zap,
  Layers,
  Database,
  Lock,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';

export default function AIEngine() {
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(false);
  
  // API Keys state with visibility toggles
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [isGeminiConfigured, setIsGeminiConfigured] = useState(false);

  // Live Key Status & Health
  const [geminiKeyStatus, setGeminiKeyStatus] = useState('LOADING'); // 'ACTIVE' | 'EXPIRED' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'MISSING' | 'LOADING'
  const [geminiKeyStatusMessage, setGeminiKeyStatusMessage] = useState('');
  const [geminiKeyCheckedAt, setGeminiKeyCheckedAt] = useState('');

  // Model & Quota Configurations
  const [primaryModel, setPrimaryModel] = useState('gemini-1.5-pro');
  const [dailyQuotaPerTeacher, setDailyQuotaPerTeacher] = useState(50);
  const [similarityThreshold, setSimilarityThreshold] = useState(15); // %
  const [enableSafetyGuard, setEnableSafetyGuard] = useState(true);
  const [temperature, setTemperature] = useState(0.4);

  // 100% Real Live Database Metrics (Zero Hardcoded / Demo Data)
  const [tokensConsumed, setTokensConsumed] = useState(0);
  const [tokensCost, setTokensCost] = useState('$0.00 (Pro Free/Tier Quota)');
  const [aiQuestionsCount, setAiQuestionsCount] = useState(0);
  const [throttleViolations, setThrottleViolations] = useState(0);
  const [originalityPct, setOriginalityPct] = useState(100);
  const [avgSimilarity, setAvgSimilarity] = useState(0);

  // Feedback Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Fetch saved configuration and live key status from backend
  const fetchConfig = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsCheckingKey(true);
    try {
      const url = isManualRefresh 
        ? `${API_BASE}/api/auth/ai-config/?refresh=true` 
        : `${API_BASE}/api/auth/ai-config/`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.primary_model) setPrimaryModel(data.primary_model);
        setGeminiApiKey(data.gemini_api_key || '');
        setOpenAiApiKey(data.openai_api_key || '');
        setIsGeminiConfigured(!!data.is_gemini_configured);
        setGeminiKeyStatus(data.gemini_key_status || (data.is_gemini_configured ? 'ACTIVE' : 'MISSING'));
        setGeminiKeyStatusMessage(data.gemini_key_status_message || '');
        setGeminiKeyCheckedAt(data.gemini_key_checked_at || '');
        if (data.daily_quota_per_teacher) setDailyQuotaPerTeacher(data.daily_quota_per_teacher);
        if (data.similarity_threshold !== undefined) setSimilarityThreshold(data.similarity_threshold);
        if (data.enable_safety_guard !== undefined) setEnableSafetyGuard(data.enable_safety_guard);
        if (data.temperature !== undefined) setTemperature(data.temperature);
        
        // Populate real database metrics
        if (data.tokens_consumed !== undefined) setTokensConsumed(data.tokens_consumed);
        if (data.tokens_cost !== undefined) setTokensCost(data.tokens_cost);
        if (data.ai_questions_count !== undefined) setAiQuestionsCount(data.ai_questions_count);
        if (data.throttle_violations !== undefined) setThrottleViolations(data.throttle_violations);
        if (data.originality_percentage !== undefined) setOriginalityPct(data.originality_percentage);
        if (data.similarity_average !== undefined) setAvgSimilarity(data.similarity_average);

        if (isManualRefresh) {
          showToast('Google Gemini API Key live status verified successfully!');
        }
      }
    } catch (err) {
      console.warn('Could not load AI configuration from backend:', err);
      setGeminiKeyStatus('NETWORK_ERROR');
      setGeminiKeyStatusMessage('Unable to connect to the server.');
    } finally {
      if (isManualRefresh) setIsCheckingKey(false);
    }
  };

  useEffect(() => {
    fetchConfig(false);
  }, []);

  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/ai-config/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_model: primaryModel,
          daily_quota_per_teacher: Number(dailyQuotaPerTeacher),
          similarity_threshold: Number(similarityThreshold),
          enable_safety_guard: enableSafetyGuard,
          temperature: Number(temperature)
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.gemini_key_status) setGeminiKeyStatus(data.gemini_key_status);
        if (data.gemini_key_status_message) setGeminiKeyStatusMessage(data.gemini_key_status_message);
        if (data.tokens_consumed !== undefined) setTokensConsumed(data.tokens_consumed);
        if (data.tokens_cost !== undefined) setTokensCost(data.tokens_cost);
        if (data.ai_questions_count !== undefined) setAiQuestionsCount(data.ai_questions_count);
        if (data.throttle_violations !== undefined) setThrottleViolations(data.throttle_violations);
        if (data.originality_percentage !== undefined) setOriginalityPct(data.originality_percentage);
        if (data.similarity_average !== undefined) setAvgSimilarity(data.similarity_average);
        showToast('AI model and quota parameters saved successfully!');
      } else {
        showToast('Failed to update configuration.');
      }
    } catch (err) {
      console.warn('Error saving AI config to backend:', err);
      showToast('Server connection failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-col gap-6" style={{ display: 'flex', width: '100%' }}>
      
      {/* Inline styles for CSS animations */}
      <style>{`
        @keyframes spinAround {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spinAround 0.9s linear infinite;
        }
      `}</style>

      {/* ==================== TOAST ALERT ==================== */}
      {toastMessage && (
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '14px 22px',
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
          }}
        >
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================== TOP BANNER ==================== */}
      <div 
        className="glass-panel" 
        style={{
          padding: '24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(139, 92, 246, 0.15) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem', background: '#EC4899', color: '#fff' }}>
              QGenix Proprietary Engine
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Lock size={12} /> Server-Side Secured
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>
            AI Engine & Infrastructure Console
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Large Language Model (LLM) routing, secure server-side credentials, and quota guardrails.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchConfig(true)}
            disabled={isCheckingKey}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            title="Verify API key status live from Google AI servers"
          >
            <RefreshCw size={16} className={isCheckingKey ? 'spin-icon' : ''} />
            <span>{isCheckingKey ? 'Verifying...' : 'Check Live Status'}</span>
          </button>

          <button 
            className="btn btn-primary"
            onClick={handleSaveConfig}
            disabled={isSaving}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Commit Changes'}</span>
          </button>
        </div>
      </div>

      {/* ==================== 1. LIVE KEY VALIDITY & EXPIRY ALERT BANNER ==================== */}
      {geminiKeyStatus === 'EXPIRED' && (
        <div 
          style={{
            padding: '20px 24px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(185, 28, 28, 0.32) 100%)',
            border: '2px solid rgba(239, 68, 68, 0.65)',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ 
                padding: '10px', 
                borderRadius: '12px', 
                background: 'rgba(239, 68, 68, 0.35)', 
                color: '#F87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={28} />
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FCA5A5', letterSpacing: '-0.3px' }}>
                  ⚠️ Warning: Google Gemini API Key Expired or Invalid!
                </div>
                <div style={{ fontSize: '0.88rem', color: '#FEE2E2', marginTop: '3px', lineHeight: '1.4' }}>
                  {geminiKeyStatusMessage || 'The Gemini API key configured on the server is invalid or has expired. AI question generation is paused.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchConfig(true)}
              disabled={isCheckingKey}
              style={{
                background: '#EF4444',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
              }}
            >
              <RefreshCw size={16} className={isCheckingKey ? 'spin-icon' : ''} />
              <span>{isCheckingKey ? 'Verifying...' : 'Retry Verification'}</span>
            </button>
          </div>

          <div style={{ 
            fontSize: '0.84rem', 
            color: '#FEE2E2', 
            borderTop: '1px solid rgba(239, 68, 68, 0.3)', 
            paddingTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span>
              💡 <strong>Resolution:</strong> Generate a new API Key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: '#93C5FD', textDecoration: 'underline', fontWeight: 600 }}>Google AI Studio</a> and update <code>GEMINI_API_KEY</code> in your server's <code>backend/.env</code> file.
            </span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(254, 226, 226, 0.75)' }}>
              Last Checked: {geminiKeyCheckedAt || 'Just now'}
            </span>
          </div>
        </div>
      )}

      {geminiKeyStatus === 'QUOTA_EXCEEDED' && (
        <div 
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.25) 100%)',
            border: '1.5px solid rgba(245, 158, 11, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.25)', color: '#F59E0B' }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FDE68A' }}>
                ⚠️ Warning: Google Gemini API Quota Exceeded!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#FEF3C7', marginTop: '2px' }}>
                Your Google AI account daily or per-minute rate limit has been reached. It will automatically reset shortly.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchConfig(true)}
            disabled={isCheckingKey}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isCheckingKey ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {geminiKeyStatus === 'ACTIVE' && (
        <div 
          style={{
            padding: '14px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.16) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: '#10B981', 
              boxShadow: '0 0 10px #10B981' 
            }} />
            <div>
              <span style={{ fontWeight: 700, color: '#6EE7B7', fontSize: '0.92rem' }}>
                Google Gemini API Key Active & Operational
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                • Verified response from Google AI Gateway • Checked: {geminiKeyCheckedAt || 'Just now'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
              ✓ Verified Live
            </span>
          </div>
        </div>
      )}

      {geminiKeyStatus === 'MISSING' && (
        <div 
          style={{
            padding: '14px 20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
            <Info size={20} color="var(--accent-warning)" />
            <span style={{ fontSize: '0.88rem' }}>
              No Gemini API Key configured in server <code>backend/.env</code>. Set <code>GEMINI_API_KEY</code> to enable AI features.
            </span>
          </div>
          <button
            type="button"
            onClick={() => fetchConfig(true)}
            disabled={isCheckingKey}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <RefreshCw size={14} className={isCheckingKey ? 'spin-icon' : ''} />
            <span>Check Status</span>
          </button>
        </div>
      )}

      {/* ==================== 2. AI METRICS TELEMETRY ==================== */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
          gap: '16px' 
        }}
      >
        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active Primary Engine</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-primary)' }}>
            {primaryModel.includes('gemini') ? 'Google Gemini' : 'OpenAI'} ({primaryModel})
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            color: geminiKeyStatus === 'ACTIVE' ? 'var(--accent-success)' : (geminiKeyStatus === 'EXPIRED' ? '#EF4444' : '#F59E0B'), 
            marginTop: '4px',
            fontWeight: 600
          }}>
            {geminiKeyStatus === 'ACTIVE' && '● Gateway Operational (Live)'}
            {geminiKeyStatus === 'EXPIRED' && '▲ Key Expired / Invalid'}
            {geminiKeyStatus === 'QUOTA_EXCEEDED' && '▲ Quota Limit Reached'}
            {geminiKeyStatus === 'MISSING' && '○ No API Key in .env'}
            {geminiKeyStatus === 'LOADING' && '◌ Connecting...'}
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tokens Consumed (Today)</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px' }}>
            {Number(tokensConsumed).toLocaleString()} Tokens
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {tokensCost}
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI Questions Generated</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px' }}>
            {Number(aiQuestionsCount).toLocaleString()} Items
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            color: throttleViolations > 0 ? '#EF4444' : 'var(--accent-success)', 
            marginTop: '4px' 
          }}>
            {throttleViolations} API Throttle Violations
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Originality Verification</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-success)' }}>
            {originalityPct}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Similarity &lt; {avgSimilarity}% Average
          </div>
        </Card>
      </div>

      {/* ==================== 3. LLM CONFIGURATION PANELS ==================== */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '20px' 
        }}
      >
        {/* Panel 1: API Keys & Model Routing */}
        <Card title="LLM Provider Keys & Model Architecture">
          <form style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '12px' }}>
            
            {/* Primary Model Choice */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Default Foundation LLM Provider
              </label>
              <select 
                className="input-field" 
                value={primaryModel}
                onChange={(e) => setPrimaryModel(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Standard / Recommended)</option>
                <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Advanced Reasoning & Deep Logic)</option>
                <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ultra High Speed)</option>
                <option value="gpt-4o">OpenAI GPT-4o (Fallback Engine)</option>
              </select>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Switching models automatically configures optimal token limits and prompt contexts in the backend.
              </div>
            </div>

            {/* Google Gemini API Key - LOCKED / READ-ONLY */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} color="#F59E0B" />
                  <span>Google Gemini API Key (Server Locked / Read-Only)</span>
                </label>
                {isGeminiConfigured ? (
                  <span style={{ 
                    fontSize: '0.72rem', 
                    padding: '3px 8px', 
                    borderRadius: '6px', 
                    background: geminiKeyStatus === 'ACTIVE' 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : (geminiKeyStatus === 'EXPIRED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)'),
                    color: geminiKeyStatus === 'ACTIVE' 
                      ? '#10B981' 
                      : (geminiKeyStatus === 'EXPIRED' ? '#EF4444' : '#F59E0B'),
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontWeight: 600,
                    border: `1px solid ${geminiKeyStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.3)' : (geminiKeyStatus === 'EXPIRED' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)')}`
                  }}>
                    {geminiKeyStatus === 'ACTIVE' && <><ShieldCheck size={13} /> Secured in Server .env</>}
                    {geminiKeyStatus === 'EXPIRED' && <><AlertTriangle size={13} /> Key Expired / Invalid</>}
                    {geminiKeyStatus === 'QUOTA_EXCEEDED' && <><AlertCircle size={13} /> Quota Exceeded</>}
                    {geminiKeyStatus === 'NETWORK_ERROR' && <>Network Error</>}
                    {geminiKeyStatus === 'LOADING' && <>Verifying...</>}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Not Configured in .env
                  </span>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <input 
                  type={showGeminiKey ? 'text' : 'password'}
                  className="input-field" 
                  value={isGeminiConfigured ? geminiApiKey : ''}
                  readOnly={true}
                  placeholder={isGeminiConfigured ? '' : 'No API Key configured in server .env file'}
                  style={{ 
                    width: '100%', 
                    paddingRight: '45px', 
                    paddingLeft: '36px',
                    fontFamily: 'monospace',
                    cursor: 'not-allowed',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: geminiKeyStatus === 'EXPIRED' 
                      ? '1px solid rgba(239, 68, 68, 0.6)' 
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    color: isGeminiConfigured 
                      ? (geminiKeyStatus === 'EXPIRED' ? '#FCA5A5' : 'var(--text-primary)') 
                      : 'var(--text-muted)'
                  }}
                />
                
                {/* Visual Lock Icon */}
                <div style={{ position: 'absolute', left: '12px', top: '10px', color: '#F59E0B' }}>
                  <Lock size={16} />
                </div>

                {/* Show/Hide preview toggle */}
                {isGeminiConfigured && (
                  <button 
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '10px', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--text-muted)', 
                      cursor: 'pointer' 
                    }}
                    title={showGeminiKey ? "Hide key preview" : "Show masked preview"}
                  >
                    {showGeminiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                fontSize: '0.74rem', 
                color: 'var(--text-muted)', 
                marginTop: '6px',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🔒 <span>Direct browser editing is locked for security. Key is securely stored in <code>backend/.env</code>.</span>
                </span>
                {isGeminiConfigured && (
                  <span style={{ 
                    color: geminiKeyStatus === 'ACTIVE' ? '#10B981' : (geminiKeyStatus === 'EXPIRED' ? '#EF4444' : '#F59E0B'), 
                    fontWeight: 600 
                  }}>
                    Live Status: {geminiKeyStatus}
                  </span>
                )}
              </div>
            </div>

            {/* OpenAI API Key - LOCKED / READ-ONLY */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} color="var(--text-muted)" />
                  <span>OpenAI API Key (Secondary Fallback - Locked)</span>
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {openAiApiKey ? 'Secured in .env' : 'Not Configured'}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showOpenAiKey ? 'text' : 'password'}
                  className="input-field" 
                  value={openAiApiKey || ''}
                  readOnly={true}
                  placeholder="No OpenAI key configured (Set OPENAI_API_KEY in server .env)"
                  style={{ 
                    width: '100%', 
                    paddingRight: '45px', 
                    paddingLeft: '36px',
                    fontFamily: 'monospace',
                    cursor: 'not-allowed',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: openAiApiKey ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                />
                <div style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}>
                  <Lock size={16} />
                </div>
                {openAiApiKey && (
                  <button 
                    type="button"
                    onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                    style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showOpenAiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>

            {/* Model Creativity / Temperature Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Model Temperature (Deterministic vs Creative)</span>
                <span style={{ fontWeight: 600 }}>{temperature}</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="1.0" 
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>0.0 (Strict / Factual)</span>
                <span>0.4 (Balanced Academic)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

          </form>
        </Card>

        {/* Panel 2: Quotas, Rate Limits & Plagiarism Guardrails */}
        <Card title="Quotas, Rate Limits & Safety Guardrails">
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            
            {/* Daily Generation Quota per Faculty */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Daily Question Quota per Faculty Member</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{dailyQuotaPerTeacher} Questions / Day</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="200" 
                step="5"
                value={dailyQuotaPerTeacher}
                onChange={(e) => setDailyQuotaPerTeacher(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Specifies the maximum number of exam question papers each faculty member can generate daily.
              </div>
            </div>

            {/* Plagiarism Similarity Threshold */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Plagiarism & Duplication Flag Threshold</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-warning)' }}>Max {similarityThreshold}% Similarity</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="40" 
                step="1"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Questions with more than {similarityThreshold}% similarity to past question papers will be flagged for Controller review.
              </div>
            </div>

            {/* Safety & Hallucination Guardrail Toggle */}
            <div 
              style={{ 
                padding: '14px', 
                borderRadius: '10px', 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--accent-success)" /> Academic Hallucination Guardrail
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Automatically validates mathematical and scientific formulas prior to generating questions.
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={enableSafetyGuard} 
                onChange={(e) => setEnableSafetyGuard(e.target.checked)}
                style={{ cursor: 'pointer', transform: 'scale(1.3)' }}
              />
            </div>

            {/* Save Action */}
            <div style={{ marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSaveConfig}
                disabled={isSaving}
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save AI Infrastructure Settings'}</span>
              </button>
            </div>

          </form>
        </Card>
      </div>

    </div>
  );
}
