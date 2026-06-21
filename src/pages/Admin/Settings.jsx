import React from 'react';
import Card from '../../components/Card';

/**
 * Settings Component
 * 
 * Provides configuration interfaces for the QGenix academic and system parameters.
 * Allows administrators to update institutional rules (Academic Year, Grading Scale) 
 * and manage AI-specific behaviors (LLM Model Selection, Plagiarism strictness threshold).
 * Renders in a responsive two-column grid using card layouts.
 */
export default function Settings() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ======= ACADEMIC CONFIGURATION PANEL ======= */}
      {/* Manages standard school-wide academic term details and scoring frameworks */}
      <Card title="Academic Configuration">
        <form className="flex-col gap-4" style={{ display: 'flex', marginTop: '16px' }}>
          {/* Institution's Active Academic Term */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Active Academic Year</label>
            <select className="input-field" defaultValue="2026">
              <option value="2025">2025-2026</option>
              <option value="2026">2026-2027</option>
            </select>
          </div>
          {/* Default Grading Scale format applied system-wide */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Grading Scale Template</label>
            <select className="input-field" defaultValue="standard">
              <option value="standard">Standard (A+, A, B, C, F)</option>
              <option value="percentage">Percentage (0-100)</option>
              <option value="gpa">GPA (0.0 - 4.0)</option>
            </select>
          </div>
          {/* Action button to save the academic configuration details */}
          <button className="btn btn-primary" style={{ width: 'fit-content' }}>Save Configuration</button>
        </form>
      </Card>
      
      {/* ======= AI GENERATOR SETTINGS PANEL ======= */}
      {/* Configures parameters for the AI exam generation engines and similarity checking algorithms */}
      <Card title="AI Generator Settings">
        <form className="flex-col gap-4" style={{ display: 'flex', marginTop: '16px' }}>
          {/* Selection for default model used for content generation */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Default Model Selection</label>
            <select className="input-field" defaultValue="gpt4">
              <option value="gpt4">EduModel Ultra (High Accuracy)</option>
              <option value="gpt3">EduModel Fast (High Speed)</option>
            </select>
          </div>
          {/* Slide selector to set strictness bounds for plagiarism matching algorithms */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Plagiarism Strictness</label>
            <input type="range" style={{ width: '100%' }} />
            <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Lenient</span><span>Strict</span>
            </div>
          </div>
          {/* Action button to commit model and plagiarism configuration modifications */}
          <button className="btn btn-primary" style={{ width: 'fit-content' }}>Update System</button>
        </form>
      </Card>
    </div>
  );
}