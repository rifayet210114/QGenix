// =========================================================================================
// AIEngine.jsx — AI Engine & Infrastructure Management (AI ইঞ্জিন কনফিগারেশন)
// -----------------------------------------------------------------------------------------
// Bengali Note:
// এই পেজটি QGenix-এর মূল পাওয়ারহাউস (AI Engine) কনফিগার করে।
// প্রধান বৈশিষ্ট্যসমূহ:
// ১. LLM Provider Setup: Google Gemini API বা OpenAI API কী সেটআপ ও মডেল সিলেকশন (Gemini 1.5 Pro, Flash, GPT-4o)।
// ২. কোটা ও রেট লিমিটিং: প্রতিদিন একজন শিক্ষক সর্বোচ্চ কয়টি প্রশ্নপত্র বা টোকেন তৈরি করতে পারবেন তা নির্ধারণ।
// ৩. প্ল্যাজিয়ারিজম ও সেফটি গার্ডরেইল: ডিফিকাল্টি ক্যালিগ্রেশন, হ্যালুসিনেশন ফিল্টার ও সিমিলারিটি থ্রেশহোল্ড স্লাইডার।
// ৪. লাইভ টোকেন ট্র্যাকার ও জেনারেশন মেট্রিক্স: প্রোভাইডার অনুযায়ী টোকেন খরচের রিয়েল-টাইম কাউন্ট।
// সমস্ত কোডে বিস্তারিত বাংলা ও ইংরেজি কমেন্ট রয়েছে এবং সম্পূর্ণ রেসপনসিভ ডিজাইন।
// =========================================================================================

import React, { useState } from 'react';
import Card from '../../components/Card';
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
  Database
} from 'lucide-react';

export default function AIEngine() {
  const [toastMessage, setToastMessage] = useState('');
  
  // API Keys state with visibility toggles
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD-981x2084792384791827491283');
  const [openAiApiKey, setOpenAiApiKey] = useState('sk-proj-48197491274918274918274912');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);

  // Model & Quota Configurations
  const [primaryModel, setPrimaryModel] = useState('gemini-1.5-pro');
  const [dailyQuotaPerTeacher, setDailyQuotaPerTeacher] = useState(50);
  const [similarityThreshold, setSimilarityThreshold] = useState(15); // %
  const [enableSafetyGuard, setEnableSafetyGuard] = useState(true);
  const [temperature, setTemperature] = useState(0.4);

  // Feedback Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    showToast('AI Infrastructure & Quota configurations saved successfully!');
  };

  return (
    <div className="flex-col gap-6" style={{ display: 'flex', width: '100%' }}>
      
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
          </div>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>
            AI Engine & Infrastructure Console
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage Large Language Model (LLM) providers, configure generation token budgets, and fine-tune plagiarism guardrails.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleSaveConfig}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={16} />
          <span>Commit Changes</span>
        </button>
      </div>

      {/* ==================== 1. AI METRICS TELEMETRY ==================== */}
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
            Gemini 1.5 Pro
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', marginTop: '4px' }}>
            ● Gateway Operational (410ms)
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tokens Consumed (Today)</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px' }}>
            842,500 Tokens
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            $1.42 Estimated Daily Cost
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI Questions Generated</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px' }}>
            5,710 Items
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', marginTop: '4px' }}>
            0 API Throttle Violations
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Originality Verification</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-success)' }}>
            98.9%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Similarity &lt; 5% Average
          </div>
        </Card>
      </div>

      {/* ==================== 2. LLM CONFIGURATION PANELS ==================== */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '20px' 
        }}
      >
        {/* Panel 1: API Keys & Model Routing */}
        <Card title="LLM Provider Keys & Model Architecture">
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            
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
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Recommended for Complex Questions)</option>
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra High Speed)</option>
                <option value="gpt-4o">OpenAI GPT-4o (Omni Reasoning)</option>
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
              </select>
            </div>

            {/* Google Gemini API Key */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Google Gemini API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showGeminiKey ? 'text' : 'password'}
                  className="input-field" 
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  style={{ width: '100%', paddingRight: '40px', fontFamily: 'monospace' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showGeminiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* OpenAI API Key */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                OpenAI API Key (Secondary Fallback)
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showOpenAiKey ? 'text' : 'password'}
                  className="input-field" 
                  value={openAiApiKey}
                  onChange={(e) => setOpenAiApiKey(e.target.value)}
                  style={{ width: '100%', paddingRight: '40px', fontFamily: 'monospace' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                  style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showOpenAiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                Questions with similarity scores above {similarityThreshold}% are automatically quarantined for Exam Controller review.
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
                  Cross-checks mathematical equations and scientific formulas against reference schemas before rendering.
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
                style={{ width: '100%', padding: '10px' }}
              >
                Save AI Infrastructure Settings
              </button>
            </div>

          </form>
        </Card>
      </div>

    </div>
  );
}
