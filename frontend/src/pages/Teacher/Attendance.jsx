import React, { useState } from 'react';
import Card from '../../components/Card';
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react';

/**
 * ============================================================================
 * QGENIX TEACHER ATTENDANCE COMPONENT
 * ============================================================================
 * 
 * Component: TeacherAttendance
 * Purpose:
 *   Provides an interactive matrix enabling teachers to select a class roster
 *   and record daily attendance (Present, Absent, Late). Ensures data integrity
 *   by utilizing state management and a confirmation modal before committing.
 * 
 * State Design:
 *   - `selectedClass` (string): Stores the dropdown selection.
 *   - `attendanceData` (Array): Local array representing the active students and 
 *     their present/absent/late status. Mutated by user click events.
 *   - `showModal` (boolean): Controls display of confirmation prompt.
 */

// --- MOCK DATA ---
// A dictionary mapping class names to their respective student rosters.
// In a real application, this data would be fetched from a backend API.
const CLASS_STUDENTS = {
  'Physics 101 (Grade 11-A)': [
    { id: 1, name: 'Alice Johnson', status: 'present' },
    { id: 2, name: 'Bob Smith', status: 'present' },
    { id: 3, name: 'Charlie Brown', status: 'absent' },
    { id: 4, name: 'Diana Prince', status: 'late' },
    { id: 5, name: 'Evan Wright', status: 'present' },
  ],
  'Advanced Mathematics (Grade 12-B)': [
    { id: 6, name: 'Fiona Gallagher', status: 'present' },
    { id: 7, name: 'George Miller', status: 'absent' },
    { id: 8, name: 'Hannah Abbott', status: 'present' },
    { id: 9, name: 'Ian Malcolm', status: 'late' },
  ],
  'Physics Lab (Grade 11-A)': [
    { id: 1, name: 'Alice Johnson', status: 'present' },
    { id: 2, name: 'Bob Smith', status: 'absent' },
    { id: 3, name: 'Charlie Brown', status: 'present' },
  ]
};

export default function TeacherAttendance() {
  // State to track the currently selected class from the dropdown
  const [selectedClass, setSelectedClass] = useState('Physics 101 (Grade 11-A)');
  
  // State to hold the dynamically updated list of students for the selected class.
  // It initializes with the roster of the default selected class.
  const [attendanceData, setAttendanceData] = useState(CLASS_STUDENTS['Physics 101 (Grade 11-A)']);
  
  // State to control the visibility of the confirmation popup modal
  const [showModal, setShowModal] = useState(false);

  // Helper function to update a specific student's attendance status (present/absent/late).
  // It maps over the current data and only updates the student with the matching ID.
  const updateStatus = (id, newStatus) => {
    setAttendanceData(data => 
      data.map(student => student.id === id ? { ...student, status: newStatus } : student)
    );
  };

  // Triggered when the user clicks the initial "Save Attendance" button.
  // Instead of saving immediately, it opens a confirmation wizard.
  const handleSave = () => {
    setShowModal(true);
  };

  // Triggered when the user confirms the action inside the modal.
  // Here you would typically make an API call to save the data to a database.
  const confirmSave = () => {
    setShowModal(false);
    alert(`Attendance for ${selectedClass} saved successfully!`);
  };

  return (
    // Outer column layout wrapper preserving layout structure and design system spacing
    <div className="flex-col gap-6">
      
      {/* ======= PAGE HEADER ======= */}
      {/* Contains page title and primary save button that triggers confirmation flow */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 style={{ margin: 0 }}>Class Attendance</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Record daily attendance for your students</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>Save Attendance</button>
      </div>

      {/* ======= CLASS SELECTOR & STUDENT MATRIX ======= */}
      {/* Main card containing class filtering and table of students */}
      <Card>
        
        {/* Class Selection Dropdown: syncs dropdown state and updates local attendance roster */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-secondary)' }}>Select Class</label>
          <select 
            className="input-field" 
            value={selectedClass} 
            onChange={(e) => {
              const newClass = e.target.value;
              setSelectedClass(newClass);
              // Directly replace active roster dataset in state when class selection changes
              setAttendanceData(CLASS_STUDENTS[newClass]);
            }}
            style={{ maxWidth: '400px' }}
          >
            <option>Physics 101 (Grade 11-A)</option>
            <option>Advanced Mathematics (Grade 12-B)</option>
            <option>Physics Lab (Grade 11-A)</option>
          </select>
        </div>

        {/* Student list table layout wrapped in a responsive horizontal scrollbar container */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
            
            {/* Table headers styling consistent with theme borders */}
            <thead style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
              <tr>
                <th style={{ padding: '16px', fontWeight: '600' }}>Student Name</th>
                <th style={{ padding: '16px', fontWeight: '600', width: '300px' }}>Attendance Status</th>
              </tr>
            </thead>
            
            {/* Renders each student row dynamically */}
            <tbody>
              {attendanceData.map((student, index) => (
                <tr key={student.id} style={{ borderBottom: index !== attendanceData.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  
                  {/* Student profile and name column */}
                  <td style={{ padding: '16px' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={16} />
                      </div>
                      <span style={{ fontWeight: '500' }}>{student.name}</span>
                    </div>
                  </td>
                  
                  {/* Status Selection Buttons Column */}
                  {/* Highlights active state with conditional color mappings corresponding to the status */}
                  <td style={{ padding: '16px' }}>
                    <div className="flex gap-2">
                      
                      {/* Present button: highlights in green when status matches */}
                      <button 
                        onClick={() => updateStatus(student.id, 'present')}
                        style={{ 
                          padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px',
                          background: student.status === 'present' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                          color: student.status === 'present' ? 'var(--accent-success)' : 'var(--text-secondary)',
                          border: `1px solid ${student.status === 'present' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <CheckCircle2 size={16} /> Present
                      </button>
                      
                      {/* Absent button: highlights in red when status matches */}
                      <button 
                        onClick={() => updateStatus(student.id, 'absent')}
                        style={{ 
                          padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px',
                          background: student.status === 'absent' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                          color: student.status === 'absent' ? 'var(--accent-danger)' : 'var(--text-secondary)',
                          border: `1px solid ${student.status === 'absent' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`,
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <XCircle size={16} /> Absent
                      </button>
                      
                      {/* Late button: highlights in warning/yellow when status matches */}
                      <button 
                        onClick={() => updateStatus(student.id, 'late')}
                        style={{ 
                          padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px',
                          background: student.status === 'late' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                          color: student.status === 'late' ? 'var(--accent-warning)' : 'var(--text-secondary)',
                          border: `1px solid ${student.status === 'late' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'}`,
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <Clock size={16} /> Late
                      </button>
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ======= CONFIRMATION OVERLAY MODAL ======= */}
      {/* Rendered conditionally using backdrop-filter to achieve glassmorphism blur */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <Card style={{ maxWidth: '400px', width: '100%', margin: '0 24px', boxShadow: 'var(--glass-shadow)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem' }}>Confirm Save</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              Are you sure you want to save the attendance records for <strong style={{ color: 'var(--text-primary)' }}>{selectedClass}</strong>?
            </p>
            {/* Modal actions enabling either cancellation or final database update simulation */}
            <div className="flex justify-end" style={{ gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '8px 16px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmSave} style={{ padding: '8px 16px' }}>Confirm & Save</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
