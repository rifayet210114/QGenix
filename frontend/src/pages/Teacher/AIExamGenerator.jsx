import React, { useState } from 'react';
import Card from '../../components/Card';
import { BrainCircuit, Settings, Eye, Download, CheckCircle2, FileText, CheckSquare } from 'lucide-react';

/**
 * ============================================================================
 * QGENIX TEACHER AI EXAM GENERATOR COMPONENT
 * ============================================================================
 * 
 * Component: AIExamGenerator
 * Purpose:
 *   A multi-step wizard that enables teachers to dynamically generate
 *   academic exams using AI. The AI can base questions on loaded resources
 *   or general knowledge, parameterized by question types, marks, and difficulty.
 * 
 * Props:
 *   None.
 * 
 * Wizard Workflow States:
 *   1. Step 1: Select Type (Choose between MCQ or subjective questions).
 *   2. Step 2: Parameters (Configure source files, total marks, and difficulty).
 *   3. Step 3: Review Output (Interactively view, edit, and select generated questions).
 *   4. Step 4: Publish (Export options to distribute exam to students).
 */
export default function AIExamGenerator() {
  // State to track the current active step in the multi-step wizard (1 to 4)
  const [step, setStep] = useState(1);
  
  // State to track whether the user wants to generate "MCQ" or "Questions" (Subjective)
  const [generationType, setGenerationType] = useState(null);

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      
      {/* ======= PROGRESS WIZARD HEADER ======= */}
      {/* Visual timeline representing the exam generation steps. Highlights completed and active items. */}
      <div className="flex justify-between" style={{ padding: '0 40px', position: 'relative' }}>
        {/* Background track line connecting step indicators */}
        <div style={{ position: 'absolute', top: '15px', left: '60px', right: '60px', height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
        {['Select Type', 'Parameters', 'Review Output', 'Publish'].map((label, i) => (
          <div 
            key={i} 
            // Allow clicking back to previously completed steps to review or modify parameters
            onClick={() => { if (i + 1 < step) setStep(i + 1); }}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px',
              cursor: i + 1 < step ? 'pointer' : 'default'
            }}
          >
            {/* Circular step badge showing either the step index or a completion checkmark */}
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step > i ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
              border: step > i ? 'none' : '2px solid var(--border-color)',
              fontWeight: 'bold', color: step > i ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}>
              {step > i + 1 ? <CheckCircle2 size={18} /> : i + 1}
            </div>
            {/* Step label text styled conditionally based on active step status */}
            <div style={{ fontSize: '0.8rem', color: step >= i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step >= i + 1 ? '600' : '400' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ======= WIZARD WORKBENCH CARD ======= */}
      <Card>
        
        {/* =======================================
            STEP 1: SELECT TYPE
            ======================================= */}
        {step === 1 && (
          <div className="animate-fade-in">
            {/* Step 1: User selects the type of generation. It sets the 'generationType' state. */}
            <h3 style={{ marginBottom: '24px' }}>Step 1: Choose Generation Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
              
              {/* Option Card A: Multiple Choice Questions (MCQ) */}
              <div 
                onClick={() => setGenerationType('mcq')}
                style={{ 
                  padding: '24px', borderRadius: '12px', border: `2px solid ${generationType === 'mcq' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: generationType === 'mcq' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                }}
              >
                <div style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                   <CheckSquare size={24} />
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>MCQ Generation</h4>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Generate Multiple Choice Questions with 4 options and answers.</p>
              </div>

              {/* Option Card B: Descriptive / Subjective Questions */}
              <div 
                onClick={() => setGenerationType('questions')}
                style={{ 
                  padding: '24px', borderRadius: '12px', border: `2px solid ${generationType === 'questions' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: generationType === 'questions' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                }}
              >
                <div style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                   <FileText size={24} />
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Questions Generation</h4>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Generate descriptive, short answer, and broad questions.</p>
              </div>
            </div>

            {/* Navigation control for Step 1 */}
            <div className="flex justify-end">
              {/* The 'Next Step' button is completely disabled until a generation type is selected */}
              <button 
                className="btn btn-primary" 
                onClick={() => setStep(2)} 
                disabled={!generationType}
                style={{ opacity: (!generationType) ? 0.5 : 1 }}
              >
                Next Step <Settings size={16} style={{ marginLeft: '8px' }} />
              </button>
            </div>
          </div>
        )}

        {/* =======================================
            STEP 2: SOURCE & PARAMETERS
            ======================================= */}
        {step === 2 && (
          <div className="animate-fade-in">
            {/* Step 2: User sets the parameters for the AI generation like marks, difficulty, and source material */}
            <h3 style={{ marginBottom: '24px' }}>Step 2: Source & Parameters</h3>
            
            {/* Field: Source Material drop-down */}
            {/* Links the AI generation to resources uploaded and parsed in the ResourceManager */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Source Material (Optional)</label>
              <select className="input-field">
                <option value="">No Source (Use Prompt / AI Knowledge)</option>
                <option>Chapter_4_Thermodynamics.pdf (AI Ready)</option>
                <option>Physics_101_Syllabus.pdf (AI Ready)</option>
              </select>
            </div>

            {/* Grid of exam parameters: marks scale, complexity scale, and structure checks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
              
              {/* Field: Total Marks */}
              {/* Defines the threshold weight of the generated exam paper */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Total Marks</label>
                <input type="number" className="input-field" defaultValue="50" />
              </div>
              
              {/* Field: Difficulty Level */}
              {/* Steers the AI prompt generation difficulty constraints (Easy/Medium/Hard) */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Difficulty Level</label>
                <select className="input-field" defaultValue="mid">
                  <option value="easy">Easy</option>
                  <option value="mid">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              {/* Field: Question Types checkboxes */}
              {/* Controls structural mix of the output (MCQ options vs. Subjective paragraphs) */}
              <div className="md:col-span-2">
                <label style={{ display: 'block', marginBottom: '8px' }}>Question Types (Select multiple)</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Multiple Choice</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Short Answer</label>
                  <label className="flex items-center gap-2"><input type="checkbox" /> Essay / Long Form</label>
                </div>
              </div>
            </div>
            
            {/* Step 2 Navigation controls */}
            <div className="flex justify-between">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Generate Exam <BrainCircuit size={16} style={{ marginLeft: '8px' }} /></button>
            </div>
          </div>
        )}

        {/* =======================================
            STEP 3: REVIEW OUTPUT
            ======================================= */}
        {step === 3 && (
          <div className="animate-fade-in">
            {/* Step 3: Mockup of the AI generated output. Teachers can review and edit questions here before publishing. */}
            <h3 style={{ marginBottom: '24px' }}>Step 3: Review & Edit AI Output</h3>
            
            {/* Renders list of AI generated questions including source citation referencing page tags */}
            <div className="flex-col gap-4" style={{ display: 'flex', marginBottom: '24px' }}>
              {[
                { q: "What is the First Law of Thermodynamics?", type: "Short Answer", marks: 5, tag: "Page 4, Para 2" },
                { q: "Calculate the work done by an ideal gas during isothermal expansion.", type: "Short Answer", marks: 5, tag: "Page 12, Eq 3.4" },
                { q: "Which of the following is a state function? A) Work B) Heat C) Internal Energy D) Power", type: "Multiple Choice", marks: 2, tag: "Page 6" }
              ].map((item, i) => (
                <div key={i} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  
                  {/* Question header, showing question count index and editable action */}
                  <div className="flex justify-between items-start" style={{ marginBottom: '8px' }}>
                    <div style={{ fontWeight: '500', fontSize: '1.05rem' }}>Q{i+1}. {item.q}</div>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Edit</button>
                    </div>
                  </div>
                  
                  {/* Secondary info tags mapping structure and context of the question */}
                  <div className="flex gap-4" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span className="badge badge-secondary">{item.type}</span>
                    <span>Marks: {item.marks}</span>
                    <span>Source: {item.tag}</span>
                  </div>
                  
                </div>
              ))}
            </div>
            
            {/* Step 3 Navigation controls */}
            <div className="flex justify-between">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>Approve Exam <Eye size={16} style={{ marginLeft: '8px' }} /></button>
            </div>
          </div>
        )}

        {/* =======================================
            STEP 4: PUBLISH
            ======================================= */}
        {step === 4 && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
            {/* Large success green icon representing successfully completed model query */}
            <div style={{ display: 'inline-flex', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--accent-success)', marginBottom: '24px' }}>
              <CheckCircle2 size={48} />
            </div>
            <h2 style={{ marginBottom: '16px' }}>Exam Ready for Deployment!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
              Your AI-generated exam on Thermodynamics has been saved and is ready to be distributed to your students.
            </p>
            
            {/* Deployment methods: Offline PDF export or online deployment to Student ExamCenter */}
            <div className="flex justify-center gap-4">
              <button className="btn btn-secondary"><Download size={18} style={{ marginRight: '8px' }} /> Export as PDF</button>
              <button className="btn btn-primary" onClick={() => alert('Published!')}>Publish Digitally</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}