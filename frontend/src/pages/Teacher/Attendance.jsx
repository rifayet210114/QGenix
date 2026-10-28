import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  RotateCcw, 
  Calendar, 
  BookOpen, 
  Layers, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export default function TeacherAttendance() {
  const { user } = useAuth();

  // Current Teacher's display name & identity
  const teacherName = user 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Course Instructor'
    : 'Course Instructor';
  const teacherParam = user?.first_name || user?.name || user?.username || teacherName;
  const defaultDept = user?.department || 'CSE';

  // Get real-time local date string (YYYY-MM-DD), never using UTC toISOString which shifts timezone
  const getLocalTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get real-time weekday name in local timezone (e.g. 'Thursday')
  const getLocalTodayDayName = () => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  };

  // Helper to normalize day string to standard full format
  const normalizeDay = (dayStr) => {
    if (!dayStr) return 'Thursday';
    const d = dayStr.trim().toLowerCase();
    if (d.startsWith('sun')) return 'Sunday';
    if (d.startsWith('mon')) return 'Monday';
    if (d.startsWith('tue')) return 'Tuesday';
    if (d.startsWith('wed')) return 'Wednesday';
    if (d.startsWith('thu')) return 'Thursday';
    if (d.startsWith('fri')) return 'Friday';
    if (d.startsWith('sat')) return 'Saturday';
    return dayStr;
  };

  // Helper to get full weekday name from YYYY-MM-DD string
  const getDayNameFromDateStr = (dateStr) => {
    if (!dateStr) return getLocalTodayDayName();
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(d);
      }
    } catch (_) {}
    return getLocalTodayDayName();
  };

  const todayWeekday = useMemo(() => {
    return getLocalTodayDayName();
  }, []);

  // Selection states
  const [department, setDepartment] = useState(defaultDept);
  const [batch, setBatch] = useState('Batch 2022');
  const [section, setSection] = useState('Sec A');
  const [semester, setSemester] = useState('5th Semester');
  const [course, setCourse] = useState('CSE-301: Database Management Systems');
  const [attendanceDate, setAttendanceDate] = useState(() => {
    return getLocalTodayDate();
  });

  // DB datasets
  const [availableBatches, setAvailableBatches] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [routineSlots, setRoutineSlots] = useState([]);
  const [activeSlotId, setActiveSlotId] = useState(null);
  
  // Default strictly to today's real-time local weekday (Thursday)
  const [selectedDayFilter, setSelectedDayFilter] = useState(() => {
    return getLocalTodayDayName();
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [recentRecords, setRecentRecords] = useState([]);

  // Days that contain routine classes or today's academic day
  const availableRoutineDays = useMemo(() => {
    const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const presentDays = new Set(routineSlots.map(s => normalizeDay(s.day)));
    const todayName = getLocalTodayDayName();
    presentDays.add(todayName); // Ensure today's academic day is always visible
    return daysOrder.filter(d => presentDays.has(d));
  }, [routineSlots]);

  // Strictly filter routine classes ONLY for the selected routine day (no mixed dumping)
  const filteredSlots = useMemo(() => {
    const dayToUse = selectedDayFilter || getLocalTodayDayName();
    return routineSlots
      .filter(s => normalizeDay(s.day).toLowerCase() === dayToUse.toLowerCase())
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [routineSlots, selectedDayFilter]);

  // Toast feedback helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // 1. Initial Load of Teacher's Assigned Routines, Allocations, and Metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const statsRes = await fetch(`${API_BASE}/api/auth/dashboard-stats/`);
        if (statsRes.ok) {
          const stats = await statsRes.json();
          if (Array.isArray(stats.batches) && stats.batches.length > 0) {
            setAvailableBatches(stats.batches);
          }
          if (Array.isArray(stats.courses) && stats.courses.length > 0) {
            setAvailableCourses(stats.courses);
          }
          if (Array.isArray(stats.attendances)) {
            setRecentRecords(stats.attendances.slice(0, 5));
          }
        }

        // Fetch this specific teacher's real assigned routine slots from database
        let teacherSlots = [];
        try {
          const tRes = await fetch(`${API_BASE}/api/auth/routines/?teacher=${encodeURIComponent(teacherParam)}`);
          if (tRes.ok) {
            const tData = await tRes.json();
            if (Array.isArray(tData)) {
              teacherSlots = tData;
            }
          }
        } catch (_) {}

        // Also fetch genuine course allocations assigned to this teacher
        let allocSlots = [];
        try {
          const aRes = await fetch(`${API_BASE}/api/auth/allocations/?teacher=${encodeURIComponent(teacherParam)}`);
          if (aRes.ok) {
            const aData = await aRes.json();
            if (Array.isArray(aData)) {
              allocSlots = aData.map(a => ({
                id: `alloc-${a.id}`,
                day: (a.weekly_days || a.weeklyDays || 'Thursday').split(',')[0].trim(),
                time: '09:00 AM - 10:30 AM',
                course: `${a.course_code || a.courseCode}: ${a.course_name || a.courseName}`,
                batch: `${a.batch} ${a.section || 'Sec A'}`,
                teacher: a.teacher,
                isAlloc: true
              }));
            }
          }
        } catch (_) {}

        // Combine strictly ONLY this teacher's direct slots + allocations
        // Strictly ZERO demo data or master slots from other teachers!
        const combined = [];
        const seen = new Set();
        [...teacherSlots, ...allocSlots].forEach(slot => {
          if (!slot.course || slot.course.toLowerCase().includes('adfda')) return;
          const normDay = normalizeDay(slot.day);
          const cCode = (slot.course || '').split(':')[0].trim().toUpperCase();
          const cleanBatch = (slot.batch || '').trim().toUpperCase();

          const key = `${normDay}-${(slot.time || '').split('-')[0].trim()}-${cCode}-${cleanBatch}`;
          if (!seen.has(key)) {
            seen.add(key);
            combined.push({
              ...slot,
              day: normDay
            });
          }
        });

        setRoutineSlots(combined);

        // Always keep selectedDayFilter on today's real-time local day (Thursday) by default
        const todayDay = getLocalTodayDayName();
        setSelectedDayFilter(todayDay);
      } catch (err) {
        console.warn('Could not fetch metadata from backend:', err);
      }
    };
    fetchMetadata();
  }, [teacherParam]);

  // 2. Fetch Genuine Student Roster from Database for selected Batch and Section
  const fetchRosterForCohort = async (targetBatch, targetSection, targetDept) => {
    setIsLoadingRoster(true);
    try {
      const queryUrl = `${API_BASE}/api/auth/attendances/roster/?batch=${encodeURIComponent(targetBatch)}&section=${encodeURIComponent(targetSection)}&dept=${encodeURIComponent(targetDept)}`;
      const res = await fetch(queryUrl);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.students)) {
          setAttendanceData(data.students);
        } else {
          setAttendanceData([]);
        }
      }
    } catch (err) {
      console.warn('Failed to load roster from API:', err);
      setAttendanceData([]);
    } finally {
      setIsLoadingRoster(false);
    }
  };

  useEffect(() => {
    fetchRosterForCohort(batch, section, department);
  }, [batch, section, department]);

  // Update status for a specific student (present, absent, late)
  const updateStatus = (id, newStatus) => {
    setAttendanceData(prev =>
      prev.map(student => student.id === id ? { ...student, status: newStatus } : student)
    );
  };

  // Mark all students Present with 1 click
  const markAllPresent = () => {
    setAttendanceData(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  // Mark all students Absent
  const markAllAbsent = () => {
    setAttendanceData(prev => prev.map(s => ({ ...s, status: 'absent' })));
  };

  // Calculate live statistics
  const totalStudents = attendanceData.length;
  const presentCount = attendanceData.filter(s => s.status === 'present').length;
  const absentCount = attendanceData.filter(s => s.status === 'absent').length;
  const lateCount = attendanceData.filter(s => s.status === 'late').length;
  const attendedCount = presentCount + lateCount;
  const averageAttendancePct = totalStudents > 0 
    ? ((attendedCount / totalStudents) * 100).toFixed(1)
    : '0.0';

  // Parse course title and code
  const getCourseCodeAndTitle = () => {
    if (course.includes(':')) {
      const parts = course.split(':');
      return { code: parts[0].trim(), title: parts.slice(1).join(':').trim() };
    }
    const match = course.match(/^([A-Za-z0-9-]+)\s+(.*)$/);
    if (match) {
      return { code: match[1], title: match[2] };
    }
    return { code: '', title: course };
  };

  // Trigger Confirmation Modal
  const handleSaveClick = () => {
    if (attendanceData.length === 0) {
      alert('No students loaded for this batch and section. Please select a valid class roster.');
      return;
    }
    setShowModal(true);
  };

  // Commit Attendance to Dedicated Database Table (/api/auth/attendances/)
  const confirmAndSaveToDB = async () => {
    setIsSaving(true);
    const { code, title } = getCourseCodeAndTitle();

    const payload = {
      batch,
      section,
      department,
      semester,
      course_title: title || course,
      course_code: code,
      teacher: teacherName,
      date: attendanceDate,
      total_students: totalStudents,
      present_count: presentCount,
      absent_count: absentCount,
      late_count: lateCount,
      average_attendance: parseFloat(averageAttendancePct),
      student_records: attendanceData
    };

    try {
      const res = await fetch(`${API_BASE}/api/auth/attendances/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setShowModal(false);
        showToast(`✅ Attendance for ${title || course} (${batch} ${section}) submitted to database!`);

        // Real-time synchronization across Admin and Student portals
        try {
          window.dispatchEvent(new CustomEvent('qgenix_attendance_updated', { detail: saved }));
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const academicBc = new BroadcastChannel('qgenix_academic_sync');
            academicBc.postMessage({ type: 'ATTENDANCE_RECORDED', payload: saved, timestamp: Date.now() });
            setTimeout(() => { try { academicBc.close(); } catch (_) {} }, 200);

            const attendBc = new BroadcastChannel('qgenix_attendance_sync');
            attendBc.postMessage({ type: 'ATTENDANCE_RECORDED', payload: saved, timestamp: Date.now() });
            setTimeout(() => { try { attendBc.close(); } catch (_) {} }, 200);
          }
          localStorage.setItem('qgenix_attendances_last_update', Date.now().toString());
        } catch (_) {}
        
        // Refresh recent records
        setRecentRecords(prev => [
          {
            id: saved.id,
            batch: saved.batch,
            section: saved.section,
            department: saved.department,
            courseTitle: saved.course_title,
            course_title: saved.course_title,
            courseCode: saved.course_code,
            teacher: saved.teacher,
            date: saved.date,
            totalStudents: saved.total_students,
            presentCount: saved.present_count,
            attendance: `${saved.present_count} / ${saved.total_students} Students`,
            averageAttendance: `${saved.average_attendance}%`
          },
          ...prev.slice(0, 4)
        ]);
      } else {
        const errData = await res.json();
        alert(`Failed to save attendance: ${JSON.stringify(errData)}`);
      }
    } catch (err) {
      console.error('Error saving attendance to backend:', err);
      alert('Network error while saving attendance. Please check backend connection.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to load settings from a routine slot with 1 click & fetch genuine roster
  const handleQuickLoadRoutine = (slot) => {
    let targetBatch = slot.batch || '';
    let targetSection = 'Sec A';
    
    // Parse batch & section: e.g. "Batch 2022 Sec A", "56 - 57 Sec A", "Batch 2024 Sec A"
    if (targetBatch) {
      const match = targetBatch.match(/^(.*?)(?:\s+(Sec(?:tion)?\s*[A-Z0-9]+))?$/i);
      if (match && match[2]) {
        targetBatch = match[1].trim();
        targetSection = match[2].trim();
      } else {
        const parts = targetBatch.split(' ');
        const secIndex = parts.findIndex(p => p.toLowerCase().includes('sec'));
        if (secIndex !== -1) {
          targetBatch = parts.slice(0, secIndex).join(' ').trim();
          targetSection = parts.slice(secIndex).join(' ').trim();
        }
      }
    }
    if (slot.section) {
      targetSection = slot.section;
    }

    // Infer department from course code or slot
    let targetDept = slot.dept || department || 'CSE';
    const cStr = slot.course || slot.course_name || '';
    if (cStr.startsWith('CSE') || cStr.includes('Computer')) targetDept = 'CSE';
    else if (cStr.startsWith('EEE') || cStr.includes('Electrical')) targetDept = 'EEE';
    else if (cStr.startsWith('BBA') || cStr.includes('Business') || cStr.includes('Accounting')) targetDept = 'BBA';
    else if (cStr.startsWith('CE') || cStr.includes('Civil')) targetDept = 'CE';
    else if (cStr.startsWith('ENG') || cStr.includes('English')) targetDept = 'ENG';

    const courseTitle = slot.course || (slot.course_code ? `${slot.course_code}: ${slot.course_name || ''}` : course);

    setBatch(targetBatch);
    setSection(targetSection);
    setDepartment(targetDept);
    setCourse(courseTitle);

    const slotId = slot.id || `${slot.day}-${slot.time}-${slot.course}-${slot.batch}`;
    setActiveSlotId(slotId);

    // Immediately fetch real roster from DB for this cohort
    fetchRosterForCohort(targetBatch, targetSection, targetDept);

    showToast(`Quick loaded routine: ${courseTitle} (${targetBatch} ${targetSection})`);
  };

  return (
    <div className="flex-col gap-6" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--accent-success)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <Check size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======= PAGE HEADER ======= */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              Instructor Portal
            </span>
            <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
              Teacher: {teacherName}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>Class Attendance</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Select your assigned routine class and record student attendance. Submitted records are directly saved to the database.
          </p>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleSaveClick}
          disabled={isSaving || attendanceData.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving to DB...' : 'Save Attendance'}</span>
        </button>
      </div>

      {/* ======= ROUTINE QUICK-SELECT SHORTCUTS ======= */}
      {routineSlots.length > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '14px 18px', 
            borderRadius: '12px', 
            background: 'rgba(139, 92, 246, 0.05)', 
            border: '1px solid rgba(139, 92, 246, 0.18)',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Calendar size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Routine Classes for:
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.82rem', padding: '3px 12px', fontWeight: 700 }}>
                {selectedDayFilter}
              </span>
              {selectedDayFilter.toLowerCase() === todayWeekday.toLowerCase() && (
                <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Today (Real-time: {attendanceDate})
                </span>
              )}
            </div>

            {/* Routine Day Tabs — Click a day to view ONLY that day's scheduled classes */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {availableRoutineDays.map(dayName => {
                const countForDay = routineSlots.filter(s => normalizeDay(s.day).toLowerCase() === dayName.toLowerCase()).length;
                const isSelected = selectedDayFilter.toLowerCase() === dayName.toLowerCase();
                const isToday = todayWeekday.toLowerCase() === dayName.toLowerCase();
                return (
                  <button
                    key={dayName}
                    type="button"
                    onClick={() => setSelectedDayFilter(dayName)}
                    style={{
                      fontSize: '0.76rem',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                      boxShadow: isSelected ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{dayName}</span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      opacity: isSelected ? 0.95 : 0.65, 
                      background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)',
                      padding: '1px 5px',
                      borderRadius: '10px'
                    }}>
                      {countForDay}
                    </span>
                    {isToday && (
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isSelected ? '#ffffff' : '#10B981' }} title="Today's Academic Day" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots Scheduled ONLY on the active day */}
          {filteredSlots.length > 0 ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {filteredSlots.map((slot, idx) => {
                const slotId = slot.id || `${slot.day}-${slot.time}-${slot.course}-${slot.batch}`;
                const isActive = activeSlotId === slotId;
                const timeStart = slot.time ? slot.time.split('-')[0].trim() : '';
                const courseCode = (slot.course || '').split(':')[0].trim();
                return (
                  <button
                    key={slot.id || idx}
                    type="button"
                    onClick={() => handleQuickLoadRoutine(slot)}
                    className="btn btn-secondary"
                    style={{ 
                      fontSize: '0.8rem', 
                      padding: '8px 14px', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: isActive ? 'rgba(99, 102, 241, 0.22)' : 'var(--bg-secondary)',
                      boxShadow: isActive ? '0 0 14px rgba(99, 102, 241, 0.35)' : 'none',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <Clock size={13} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                    <span style={{ fontWeight: 700 }}>{timeStart}</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                      {courseCode}
                    </span>
                    <span style={{ opacity: 0.8, fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                      ({slot.batch})
                    </span>
                    {isActive && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} title="Active loaded class" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No routine classes scheduled for {selectedDayFilter}. Click another day tab above to select.
            </div>
          )}
        </div>
      )}

      {/* ======= CLASS & COHORT SELECTION CARD ======= */}
      <Card title="Select Class & Routine Parameters">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '8px' }}>
          
          {/* Department */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Department
            </label>
            <select
              className="input-field"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="CSE">CSE (Computer Science)</option>
              <option value="EEE">EEE (Electrical)</option>
              <option value="BBA">BBA (Business)</option>
              <option value="CE">CE (Civil Eng)</option>
              <option value="ENG">ENG (English)</option>
            </select>
          </div>

          {/* Batch */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Batch
            </label>
            <select
              className="input-field"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              style={{ width: '100%' }}
            >
              {availableBatches.length > 0 ? (
                availableBatches.map(b => (
                  <option key={b.id || b.name} value={b.name}>{b.name}</option>
                ))
              ) : (
                <>
                  <option value="Batch 2022 - 2023">Batch 2022 - 2023</option>
                  <option value="Batch 2023 - 2024">Batch 2023 - 2024</option>
                  <option value="Batch 2021 - 2022">Batch 2021 - 2022</option>
                  <option value="Batch 2024 - 2025">Batch 2024 - 2025</option>
                </>
              )}
            </select>
          </div>

          {/* Section */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Section
            </label>
            <select
              className="input-field"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Sec A">Sec A</option>
              <option value="Sec B">Sec B</option>
              <option value="Sec C">Sec C</option>
              <option value="Sec D">Sec D</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Semester
            </label>
            <select
              className="input-field"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="3rd Semester">3rd Semester</option>
              <option value="4th Semester">4th Semester</option>
              <option value="5th Semester">5th Semester</option>
              <option value="6th Semester">6th Semester</option>
              <option value="7th Semester">7th Semester</option>
              <option value="8th Semester">8th Semester</option>
            </select>
          </div>

          {/* Course */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Course Title
            </label>
            <select
              className="input-field"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              style={{ width: '100%' }}
            >
              {availableCourses.length > 0 ? (
                availableCourses.map(c => (
                  <option key={c.id || c.code} value={`${c.code}: ${c.title}`}>
                    {c.code}: {c.title}
                  </option>
                ))
              ) : (
                <>
                  <option value="CSE-301: Database Management Systems">CSE-301: Database Management Systems</option>
                  <option value="CSE-302: Operating Systems & System Programming">CSE-302: Operating Systems</option>
                  <option value="CSE-315: Artificial Intelligence & Machine Learning">CSE-315: AI & Machine Learning</option>
                  <option value="EEE-211: Signals and Linear Systems">EEE-211: Signals & Systems</option>
                  <option value="BBA-205: Financial Accounting & Reporting">BBA-205: Financial Accounting</option>
                </>
              )}
            </select>
          </div>

          {/* Date */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Date
            </label>
            <input
              type="date"
              className="input-field"
              value={attendanceDate}
              onChange={(e) => {
                const newD = e.target.value;
                setAttendanceDate(newD);
                const dayName = getDayNameFromDateStr(newD);
                setSelectedDayFilter(dayName);
              }}
              style={{ width: '100%' }}
            />
          </div>

        </div>
      </Card>

      {/* ======= LIVE ATTENDANCE TELEMETRY STATS ======= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        
        <div className="glass-panel" style={{ padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Enrolled</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '4px' }}>{totalStudents}</div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', borderRadius: '12px', textAlign: 'center', borderBottom: '3px solid var(--accent-success)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-success)', fontWeight: 600 }}>Present</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-success)', marginTop: '4px' }}>{presentCount}</div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', borderRadius: '12px', textAlign: 'center', borderBottom: '3px solid var(--accent-danger)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-danger)', fontWeight: 600 }}>Absent</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-danger)', marginTop: '4px' }}>{absentCount}</div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', borderRadius: '12px', textAlign: 'center', borderBottom: '3px solid var(--accent-warning)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-warning)', fontWeight: 600 }}>Late</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-warning)', marginTop: '4px' }}>{lateCount}</div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', borderRadius: '12px', textAlign: 'center', borderBottom: '3px solid var(--accent-primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Average Rate</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>{averageAttendancePct}%</div>
        </div>

      </div>

      {/* ======= STUDENT MATRIX ROSTER ======= */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
              Class Student Roster: {batch} ({section})
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Mark Present, Absent, or Late for each student
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={markAllPresent}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={14} style={{ color: 'var(--accent-success)' }} />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={markAllAbsent}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <XCircle size={14} style={{ color: 'var(--accent-danger)' }} />
              <span>Reset to Absent</span>
            </button>
          </div>
        </div>

        {isLoadingRoster ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading student roster from database...
          </div>
        ) : attendanceData.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            <Users size={36} style={{ margin: '0 auto 12px auto', opacity: 0.35, color: 'var(--accent-primary)' }} />
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
              No registered students found for {batch} {section} ({department})
            </div>
            <div style={{ fontSize: '0.82rem', marginTop: '6px', color: 'var(--text-muted)' }}>
              Only genuine student profiles created by the Admin in the database are loaded. Zero demo/mock data is displayed.
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                <tr>
                  <th style={{ padding: '14px 16px', fontWeight: '600', width: '120px' }}>ID / Roll</th>
                  <th style={{ padding: '14px 16px', fontWeight: '600' }}>Student Name</th>
                  <th style={{ padding: '14px 16px', fontWeight: '600', width: '280px' }}>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((student, index) => (
                  <tr key={student.id || index} style={{ borderBottom: index !== attendanceData.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    
                    {/* ID / Roll */}
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {student.student_id || student.roll || `STU-${student.id}`}
                    </td>

                    {/* Student Profile & Name */}
                    <td style={{ padding: '14px 16px' }}>
                      <div className="flex items-center gap-3">
                        {student.profile_picture ? (
                          <img 
                            src={student.profile_picture} 
                            alt={student.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={16} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>{student.name}</div>
                          {student.email && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Toggle Buttons */}
                    <td style={{ padding: '14px 16px' }}>
                      <div className="flex gap-2">
                        {/* Present Button */}
                        <button 
                          onClick={() => updateStatus(student.id, 'present')}
                          style={{ 
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px',
                            background: student.status === 'present' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                            color: student.status === 'present' ? 'var(--accent-success)' : 'var(--text-secondary)',
                            border: `1px solid ${student.status === 'present' ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
                            cursor: 'pointer', transition: 'all 0.15s', fontWeight: student.status === 'present' ? 700 : 500
                          }}
                        >
                          <CheckCircle2 size={15} /> Present
                        </button>
                        
                        {/* Absent Button */}
                        <button 
                          onClick={() => updateStatus(student.id, 'absent')}
                          style={{ 
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px',
                            background: student.status === 'absent' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                            color: student.status === 'absent' ? 'var(--accent-danger)' : 'var(--text-secondary)',
                            border: `1px solid ${student.status === 'absent' ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)'}`,
                            cursor: 'pointer', transition: 'all 0.15s', fontWeight: student.status === 'absent' ? 700 : 500
                          }}
                        >
                          <XCircle size={15} /> Absent
                        </button>
                        
                        {/* Late Button */}
                        <button 
                          onClick={() => updateStatus(student.id, 'late')}
                          style={{ 
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px',
                            background: student.status === 'late' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                            color: student.status === 'late' ? 'var(--accent-warning)' : 'var(--text-secondary)',
                            border: `1px solid ${student.status === 'late' ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
                            cursor: 'pointer', transition: 'all 0.15s', fontWeight: student.status === 'late' ? 700 : 500
                          }}
                        >
                          <Clock size={15} /> Late
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ======= RECENT ATTENDANCE SUBMISSIONS HISTORY ======= */}
      {recentRecords.length > 0 && (
        <Card title="Recently Submitted Attendance Records">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Course Title</th>
                  <th style={{ padding: '10px 12px' }}>Batch & Section</th>
                  <th style={{ padding: '10px 12px' }}>Attendance</th>
                  <th style={{ padding: '10px 12px' }}>Average</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((r, idx) => (
                  <tr key={r.id || idx} style={{ borderBottom: '1px solid var(--border-color-light)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{r.date || 'Recent'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.course_title || r.courseTitle}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="badge badge-secondary" style={{ marginRight: '6px' }}>{r.batch}</span>
                      <span className="badge badge-primary">{r.section}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                      {r.attendance || `${r.present_count ?? r.presentCount} / ${r.total_students ?? r.totalStudents} Students`}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--accent-success)' }}>
                      {r.averageAttendance || `${r.average_attendance}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ======= CONFIRMATION SAVE MODAL ======= */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(5px)', padding: '20px' }}>
          <Card style={{ maxWidth: '440px', width: '100%', borderRadius: '16px', boxShadow: 'var(--glass-shadow)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: 700 }}>
              Confirm Attendance Submission
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px 0', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Are you sure you want to commit this class attendance record to the university database?
            </p>

            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Course:</strong> {course}</div>
              <div><strong>Batch & Section:</strong> {batch} ({section})</div>
              <div><strong>Date:</strong> {attendanceDate}</div>
              <div><strong>Instructor:</strong> {teacherName}</div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>Present:</strong> {presentCount} / {totalStudents}</span>
                <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}><strong>Rate:</strong> {averageAttendancePct}%</span>
              </div>
            </div>

            <div className="flex justify-end" style={{ gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowModal(false)} 
                disabled={isSaving}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={confirmAndSaveToDB} 
                disabled={isSaving}
                style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={15} />
                <span>{isSaving ? 'Submitting...' : 'Confirm & Save to DB'}</span>
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
