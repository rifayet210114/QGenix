import React from 'react';
import Card from '../../components/Card';
import { UploadCloud, FileText, CheckCircle, Clock } from 'lucide-react';

/**
 * ============================================================================
 * QGENIX TEACHER RESOURCE MANAGER COMPONENT
 * ============================================================================
 * 
 * Component: ResourceManager
 * Purpose:
 *   Enables teachers to upload curriculum files (e.g. PDFs, DOCX, slides) which
 *   are parsed and ingested into the QGenix RAG (Retrieval-Augmented Generation) 
 *   pipeline. This trains the AI to generate class-specific questions based 
 *   solely on approved classroom materials.
 * 
 * Props:
 *   None. (Uses static list of uploaded resources to demonstrate file processing states).
 * 
 * Hooks & Dynamic Updates (Planned):
 *   - `useState` for storing selected files, managing uploading progress percentages,
 *     and storing resource lists fetched from backend database.
 *   - Drag & drop event handlers (`onDragOver`, `onDragLeave`, `onDrop`) to update file queue.
 */
export default function ResourceManager() {
  return (
    // Main vertical flex container representing the upload workbench
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      
      {/* ======= DRAG & DROP UPLOAD AREA ======= */}
      {/* Visual upload zone styled with dashed borders to represent drop capability */}
      <Card>
        <div style={{ 
          border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '60px', 
          textAlign: 'center', background: 'rgba(30, 41, 59, 0.4)', cursor: 'pointer' 
        }}>
          {/* Cloud upload icon styled with the theme's primary accent color */}
          <UploadCloud size={48} color="var(--accent-primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Drag & Drop Study Materials</h3>
          
          {/* Instruction detailing specific document formats supported for text extraction */}
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Upload PDFs, DOCX, or PPTX to train the AI on your specific curriculum.</p>
          
          {/* Action button allowing standard manual file system browsing */}
          <button className="btn btn-primary">Browse Files</button>
        </div>
      </Card>
      
      {/* ======= UPLOADED RESOURCES LIST ======= */}
      {/* Card listing previously uploaded documents with their indexing status */}
      <Card title="Uploaded Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: '16px' }}>
          {[
            { name: 'Chapter_4_Thermodynamics.pdf', status: 'Ready', date: 'Today' },
            { name: 'Kinematics_Worksheet_A.docx', status: 'Processing', date: 'Today' },
            { name: 'Physics_101_Syllabus.pdf', status: 'Ready', date: 'Yesterday' }
          ].map((file, i) => (
            // Individual list item containing file info, metadata, and parsing state
            <div key={i} className="flex items-center justify-between" style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              
              {/* Left section: file icon and filename metadata */}
              <div className="flex items-center gap-4">
                <FileText color="var(--text-muted)" />
                <div>
                  <div style={{ fontWeight: '500' }}>{file.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uploaded {file.date}</div>
                </div>
              </div>
              
              {/* Right section: AI processing status indicators */}
              <div>
                {/* 
                  Conditional rendering check:
                  - 'Ready': The document text has been chunked, embedded, and is queryable by the AI.
                  - 'Processing': The document is currently undergoing OCR, text extraction, or embedding steps.
                */}
                {file.status === 'Ready' 
                  ? <div className="flex items-center gap-1" style={{ color: 'var(--accent-success)', fontSize: '0.85rem' }}>
                      <CheckCircle size={14} /> AI Ready
                    </div>
                  : <div className="flex items-center gap-1" style={{ color: 'var(--accent-warning)', fontSize: '0.85rem' }}>
                      <Clock size={14} /> Processing
                    </div>
                }
              </div>
              
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}