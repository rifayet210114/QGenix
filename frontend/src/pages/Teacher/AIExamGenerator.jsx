import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { 
  BrainCircuit, Settings, Eye, Download, CheckCircle2, FileText, CheckSquare, 
  Plus, Trash2, Edit3, BookOpen, Layers, Sparkles, RefreshCw, X, Check,
  Share2, FileDown, HelpCircle, AlertCircle, Grid, Table, Printer, Sliders,
  Users, Shuffle, Search, ShieldCheck, UserCheck
} from 'lucide-react';
import { 
  downloadEntranceModelQuestionPDF, 
  downloadUniversitySubjectiveExamPDF 
} from '../../utils/entranceModelQuestionPdf';
import { API_BASE } from '../../config';

/**
 * ============================================================================
 * QGENIX TEACHER AI EXAM GENERATOR
 * ============================================================================
 * 
 * Supported Formats:
 *  1. Standard Entrance Model MCQ Question Paper (4 options, 2 columns, A/B/C/D)
 *  2. Daffodil Institute of IT (DIIT) Descriptive Midterm Exam Format:
 *     - Header: Institution, Degree, Midterm Exam details, Course Code & Title
 *     - Set badge [SET: B], Time allowed, Full marks, and instructions notice
 *     - Sequential sub-questions: (a), (b), (c), (d), etc.
 *     - Teacher-selectable sub-questions per set: 3, 4, or 5 sub-questions
 *     - AI Complexity-based marks in the right margin (Easy: 3-4, Mid: 5, Math: 6-8)
 *     - Math matrix / diagram drawing (e.g. 5x5 image intensity grid)
 *     - Full teacher interactive editing for questions, marks, and matrix cells/dimensions
 *  3. Multi-Set Anti-Cheating & Student Allocation Engine:
 *     - Teacher defines number of parallel sets (e.g. 2, 3, 4, 5) & customizable set names (e.g. SET: A, SET: B, SET: C)
 *     - 30% Common Core (anchor question a) / 70% Distinct Non-Similar Variants (parts b, c, d, e & matrices)
 *     - Multi-Set review tabs & independent paper customization
 *     - Round-robin auto distribution & per-student set allocation before publishing
 */

export default function AIExamGenerator() {
  // Wizard Step (1 to 4)
  const [step, setStep] = useState(1);
  const [generationType, setGenerationType] = useState('mcq'); // 'mcq' | 'descriptive'

  // Teacher Resources loaded from Database
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Common Exam Parameters
  const [examTitle, setExamTitle] = useState('ENTRANCE MODEL QUESTION (A)');
  const [institution, setInstitution] = useState('DAFFODIL INSTITUTE OF IT');
  const [subject, setSubject] = useState('Physics I: Mechanics & Thermodynamics');
  const [courseCode, setCourseCode] = useState('PHY-101');
  const [courseTitle, setCourseTitle] = useState('Physics I: Mechanics & Thermodynamics');
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [sourceFileName, setSourceFileName] = useState('');
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(10);
  const [pageOrVolume, setPageOrVolume] = useState('Pages 1 - 10');
  const [difficulty, setDifficulty] = useState('Mixed'); // 'Easy' | 'Intermediate' | 'Complicated' | 'Mixed'
  const [questionsCount, setQuestionsCount] = useState(15);
  const [timeAllowed, setTimeAllowed] = useState('60 Minutes');
  const [totalMarks, setTotalMarks] = useState(50);
  const [customPrompt, setCustomPrompt] = useState('');

  // Descriptive / University Exam Specific Parameters (DIIT Midterm Format)
  const [degreeProgram, setDegreeProgram] = useState('B.Sc (Hons) in Computer Science & Engineering');
  const [semesterExam, setSemesterExam] = useState('Midterm Examination, CSE 4th Year 8th Semester, 21st Batch, 2026');
  const [setName, setSetName] = useState('SET: B');
  const [instructions, setInstructions] = useState('[N.B. -- The figures in the right margin indicate full marks. Answer any two questions. All parts of the questions must be answered sequentially.]');
  const [subQuestionsPerSet, setSubQuestionsPerSet] = useState(4); // 3, 4, or 5 (Teacher Selectable)
  const [setsCount, setSetsCount] = useState(2); // 1, 2, 3, 4 (Main questions per set)
  const [questionSets, setQuestionSets] = useState([]);

  // Multi-Set Anti-Cheating Parameters
  const [examSetsCount, setExamSetsCount] = useState(3); // 1, 2, 3, 4, 5 parallel sets
  const [examSetNames, setExamSetNames] = useState(['SET: A', 'SET: B', 'SET: C']);
  const [generatedExamSets, setGeneratedExamSets] = useState([]); // [{ set_name, question_sets }]
  const [activeSetIdx, setActiveSetIdx] = useState(0);

  // Student Allocation & Publishing State
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentAllocations, setStudentAllocations] = useState({}); // { [studentId]: setName }
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('ALL');

  // Descriptive Interactive Editing State
  const [editingSubQ, setEditingSubQ] = useState(null); // { setIdx, subIdx, question, marks, complexity, model_answer }
  const [matrixModalData, setMatrixModalData] = useState(null); // { setIdx, subIdx, part, matrix: [][] }
  const [matrixRows, setMatrixRows] = useState(5);
  const [matrixCols, setMatrixCols] = useState(5);

  // Resolve currently active resource and its exact page count
  const selectedResource = useMemo(() => {
    return resources.find(r => String(r.id) === String(selectedResourceId));
  }, [resources, selectedResourceId]);

  const maxPages = useMemo(() => {
    if (!selectedResource) return 1;
    const cnt = Number(selectedResource.page_count);
    return cnt && cnt > 0 ? cnt : 1;
  }, [selectedResource]);

  // Page range handlers clamped strictly to [1, maxPages]
  const handleStartPageChange = (val) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 1;
    const clamped = Math.max(1, Math.min(num, endPage, maxPages));
    setStartPage(clamped);
    setPageOrVolume(`Pages ${clamped} - ${endPage}`);
  };

  const handleEndPageChange = (val) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) num = maxPages;
    const clamped = Math.max(startPage, Math.min(num, maxPages));
    setEndPage(clamped);
    setPageOrVolume(`Pages ${startPage} - ${clamped}`);
  };

  const handleQuickPagePreset = (start, end) => {
    const s = Math.max(1, Math.min(start, maxPages));
    const e = Math.max(s, Math.min(end, maxPages));
    setStartPage(s);
    setEndPage(e);
    setPageOrVolume(`Pages ${s} - ${e}`);
  };

  // Generation & Status State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [generationProvider, setGenerationProvider] = useState('');
  const [hasPdfContext, setHasPdfContext] = useState(false);

  // Generated Questions Array (MCQs or flattened list)
  const [questions, setQuestions] = useState([]);

  // Teacher Review Workbench State
  const [viewMode, setViewMode] = useState('review'); // 'exam' (clean) | 'review' (show answers & notes)
  const [editingQuestion, setEditingQuestion] = useState(null); // MCQ object currently being edited
  const [showAddModal, setShowAddModal] = useState(false); // Add custom question modal

  // New Custom Question Form State
  const [newQuestionForm, setNewQuestionForm] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'a',
    difficulty: 'Intermediate',
    explanation: ''
  });

  // Digital Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(null);

  // Fetch teacher's uploaded course resources on load
  useEffect(() => {
    fetchTeacherResources();
  }, []);

  const fetchTeacherResources = async () => {
    setLoadingResources(true);
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/auth/teacher-resources/`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
        if (data.resources && data.resources.length > 0) {
          const first = data.resources[0];
          setSelectedResourceId(first.id);
          setSourceFileName(first.file_name || first.title);
          if (first.course_code) setCourseCode(first.course_code);
          if (first.course_title) setCourseTitle(first.course_title);
          const pCount = Math.max(1, Number(first.page_count) || 1);
          setStartPage(1);
          setEndPage(pCount);
          setPageOrVolume(`Pages 1 - ${pCount}`);
        }
      }
    } catch (err) {
      console.warn('Could not fetch teacher course resources:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleResourceChange = (e) => {
    const val = e.target.value;
    setSelectedResourceId(val);
    const found = resources.find(r => String(r.id) === String(val));
    if (found) {
      const fName = found.file_name || found.title || '';
      setSourceFileName(fName);
      if (found.course_code) setCourseCode(found.course_code);
      const title = found.course_title || found.title || fName.replace(/\.[^/.]+$/, '');
      if (title) {
        setCourseTitle(title);
        setSubject(title);
      }
      const pCount = Math.max(1, Number(found.page_count) || 1);
      setStartPage(1);
      setEndPage(pCount);
      setPageOrVolume(`Pages 1 - ${pCount}`);
    } else {
      setSourceFileName('');
      setStartPage(1);
      setEndPage(1);
      setPageOrVolume('All');
    }
  };

  // Multi-Set Parameter Handlers
  const handleExamSetsCountChange = (count) => {
    const num = Math.max(1, Math.min(Number(count), 5));
    setExamSetsCount(num);
    setExamSetNames(prev => {
      const next = [...prev];
      while (next.length < num) {
        next.push(`SET: ${String.fromCharCode(65 + next.length)}`);
      }
      return next.slice(0, num);
    });
  };

  const handleExamSetNameChange = (index, value) => {
    setExamSetNames(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Switch between review tabs for generated sets
  const handleSwitchSet = (idx) => {
    setActiveSetIdx(idx);
    if (generatedExamSets && generatedExamSets[idx]) {
      if (generatedExamSets[idx].question_sets) {
        setQuestionSets(generatedExamSets[idx].question_sets);
      }
      if (generatedExamSets[idx].questions) {
        setQuestions(generatedExamSets[idx].questions);
      }
    }
  };

  // Fetch real registered students from DB for Step 4 allocation
  const fetchEnrolledStudents = async () => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/auth/users/?role=STUDENT`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        setEnrolledStudents(list);

        // Pre-populate round-robin student allocations across available sets
        const availableSets = (generatedExamSets.length > 0 
          ? generatedExamSets.map(s => s.set_name) 
          : examSetNames).filter(Boolean);

        if (availableSets.length > 0) {
          setStudentAllocations(prev => {
            const nextAlloc = { ...prev };
            list.forEach((st, idx) => {
              const id = String(st.institutional_id || st.username || st.id);
              if (!nextAlloc[id]) {
                nextAlloc[id] = availableSets[idx % availableSets.length];
              }
            });
            return nextAlloc;
          });
        }
      }
    } catch (err) {
      console.warn('Could not fetch enrolled students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // 1-Click Auto Distribute sets sequentially down student list (Round-Robin)
  const handleAutoDistributeRoundRobin = () => {
    const availableSets = (generatedExamSets.length > 0 
      ? generatedExamSets.map(s => s.set_name) 
      : examSetNames).filter(Boolean);
    if (availableSets.length === 0 || enrolledStudents.length === 0) return;

    const newAlloc = {};
    enrolledStudents.forEach((st, idx) => {
      const id = String(st.institutional_id || st.username || st.id);
      newAlloc[id] = availableSets[idx % availableSets.length];
    });
    setStudentAllocations(newAlloc);
  };

  // Randomize set allocation across students
  const handleRandomizeAllocations = () => {
    const availableSets = (generatedExamSets.length > 0 
      ? generatedExamSets.map(s => s.set_name) 
      : examSetNames).filter(Boolean);
    if (availableSets.length === 0 || enrolledStudents.length === 0) return;

    const newAlloc = {};
    enrolledStudents.forEach(st => {
      const id = String(st.institutional_id || st.username || st.id);
      const randomSet = availableSets[Math.floor(Math.random() * availableSets.length)];
      newAlloc[id] = randomSet;
    });
    setStudentAllocations(newAlloc);
  };

  // Update a single student's allocated set
  const handleStudentSetChange = (studentId, targetSetName) => {
    setStudentAllocations(prev => ({
      ...prev,
      [String(studentId)]: targetSetName
    }));
  };

  // AI Exam Generation Handler
  const handleGenerateExam = async () => {
    setIsGenerating(true);
    setGenerationError('');

    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      const payload = {
        generation_type: generationType,
        exam_title: examTitle,
        subject: subject,
        course_code: courseCode,
        course_title: courseTitle,
        institution: institution,
        degree_program: degreeProgram,
        semester_exam: semesterExam,
        set_name: examSetNames[0] || setName,
        exam_set_names: examSetNames,
        instructions: instructions,
        sub_questions_per_set: Number(subQuestionsPerSet),
        sets_count: Number(examSetsCount),
        source_resource_id: selectedResourceId || null,
        source_file_name: sourceFileName || 'Selected Syllabus PDF',
        page_or_volume: pageOrVolume,
        difficulty: difficulty,
        questions_count: Number(questionsCount),
        full_marks: Number(totalMarks),
        time_allowed: timeAllowed,
        custom_prompt: customPrompt
      };

      const res = await fetch(`${API_BASE}/api/auth/ai-generate-exam/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errMessage = `Server returned HTTP ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && (errData.error || errData.message)) {
            errMessage = errData.error || errData.message;
          }
        } catch (_) {}
        throw new Error(errMessage);
      }

      const data = await res.json();
      if (data.exam_sets && data.exam_sets.length > 0) {
        setGeneratedExamSets(data.exam_sets);
        setActiveSetIdx(0);
        setQuestionSets(data.exam_sets[0].question_sets || []);
        setQuestions(data.exam_sets[0].questions || data.questions || []);
        setGenerationProvider(data.provider || 'gemini');
        setHasPdfContext(Boolean(data.has_pdf_context));
        setStep(3); // Jump to Multi-Set Review Workbench
      } else if (data.question_sets && data.question_sets.length > 0) {
        const wrapped = [{ set_name: examSetNames[0] || setName || 'SET: A', question_sets: data.question_sets }];
        setGeneratedExamSets(wrapped);
        setActiveSetIdx(0);
        setQuestionSets(data.question_sets);
        setQuestions(data.questions || []);
        setGenerationProvider(data.provider || 'gemini');
        setHasPdfContext(Boolean(data.has_pdf_context));
        setStep(3);
      } else if (data.questions && data.questions.length > 0) {
        const wrapped = [{ set_name: examSetNames[0] || setName || 'SET: A', questions: data.questions }];
        setGeneratedExamSets(wrapped);
        setActiveSetIdx(0);
        setQuestions(data.questions);
        setGenerationProvider(data.provider || 'gemini');
        setHasPdfContext(Boolean(data.has_pdf_context));
        setStep(3);
      } else {
        throw new Error('No questions returned by the generator');
      }
    } catch (err) {
      console.error('AI Generation Failed:', err);
      setGenerationError(err.message || 'Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete MCQ Question
  const handleDeleteQuestion = (id) => {
    const filtered = questions.filter(q => q.id !== id);
    const reindexed = filtered.map((q, idx) => ({ ...q, id: idx + 1 }));
    setQuestions(reindexed);
    if (generatedExamSets && generatedExamSets.length > 0) {
      setGeneratedExamSets(prev => {
        const next = [...prev];
        if (next[activeSetIdx]) {
          next[activeSetIdx] = { ...next[activeSetIdx], questions: reindexed };
        }
        return next;
      });
    }
  };

  // Open Edit Modal for MCQ
  const handleOpenEdit = (q) => {
    setEditingQuestion({
      ...q,
      options: { ...q.options }
    });
  };

  // Save Edited MCQ
  const handleSaveEdit = () => {
    if (!editingQuestion) return;
    const updated = questions.map(q => q.id === editingQuestion.id ? editingQuestion : q);
    setQuestions(updated);
    if (generatedExamSets && generatedExamSets.length > 0) {
      setGeneratedExamSets(prev => {
        const next = [...prev];
        if (next[activeSetIdx]) {
          next[activeSetIdx] = { ...next[activeSetIdx], questions: updated };
        }
        return next;
      });
    }
    setEditingQuestion(null);
  };

  // Add Custom MCQ Question
  const handleAddCustomQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionForm.question.trim()) return;

    const newQ = {
      id: questions.length + 1,
      question: newQuestionForm.question.trim(),
      options: {
        a: newQuestionForm.optionA.trim() || 'Option A',
        b: newQuestionForm.optionB.trim() || 'Option B',
        c: newQuestionForm.optionC.trim() || 'Option C',
        d: newQuestionForm.optionD.trim() || 'Option D'
      },
      correct_answer: newQuestionForm.correctAnswer,
      difficulty: newQuestionForm.difficulty,
      explanation: newQuestionForm.explanation.trim() || 'Custom teacher-verified question.'
    };

    const nextQList = [...questions, newQ];
    setQuestions(nextQList);
    if (generatedExamSets && generatedExamSets.length > 0) {
      setGeneratedExamSets(prev => {
        const next = [...prev];
        if (next[activeSetIdx]) {
          next[activeSetIdx] = { ...next[activeSetIdx], questions: nextQList };
        }
        return next;
      });
    }
    setShowAddModal(false);
    setNewQuestionForm({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'a',
      difficulty: 'Intermediate',
      explanation: ''
    });
  };

  // =========================================================================
  // DESCRIPTIVE EXAM INTERACTIVE HANDLERS (DIIT FORMAT)
  // =========================================================================

  // Update marks for a specific sub-question directly
  const handleUpdateSubQuestionMark = (setIdx, subIdx, newMarks) => {
    const parsed = parseInt(newMarks, 10);
    if (isNaN(parsed) || parsed < 0) return;
    setQuestionSets(prev => {
      const cloned = JSON.parse(JSON.stringify(prev));
      if (cloned[setIdx] && cloned[setIdx].sub_questions && cloned[setIdx].sub_questions[subIdx]) {
        cloned[setIdx].sub_questions[subIdx].marks = parsed;
      }
      return cloned;
    });
    setGeneratedExamSets(prevSets => {
      if (!prevSets || prevSets.length <= activeSetIdx) return prevSets;
      const cloned = JSON.parse(JSON.stringify(prevSets));
      const targetQSet = cloned[activeSetIdx]?.question_sets?.[setIdx];
      if (targetQSet && targetQSet.sub_questions && targetQSet.sub_questions[subIdx]) {
        targetQSet.sub_questions[subIdx].marks = parsed;
      }
      return cloned;
    });
  };

  // Open modal to edit a sub-question (stem, marks, complexity, model answer)
  const handleOpenEditSubQ = (setIdx, subIdx) => {
    const qSet = questionSets[setIdx];
    if (!qSet || !qSet.sub_questions || !qSet.sub_questions[subIdx]) return;
    const sq = qSet.sub_questions[subIdx];
    setEditingSubQ({
      setIdx,
      subIdx,
      setNumber: qSet.set_number || (setIdx + 1),
      part: sq.part || String.fromCharCode(97 + subIdx),
      question: sq.question,
      marks: sq.marks,
      complexity: sq.complexity || 'Intermediate',
      model_answer: sq.model_answer || ''
    });
  };

  // Save changes from sub-question edit modal
  const handleSaveEditSubQ = () => {
    if (!editingSubQ) return;
    const { setIdx, subIdx, question, marks, complexity, model_answer } = editingSubQ;
    setQuestionSets(prev => {
      const cloned = JSON.parse(JSON.stringify(prev));
      if (cloned[setIdx] && cloned[setIdx].sub_questions && cloned[setIdx].sub_questions[subIdx]) {
        cloned[setIdx].sub_questions[subIdx].question = question;
        cloned[setIdx].sub_questions[subIdx].marks = Number(marks) || 5;
        cloned[setIdx].sub_questions[subIdx].complexity = complexity;
        cloned[setIdx].sub_questions[subIdx].model_answer = model_answer;
      }
      return cloned;
    });
    setGeneratedExamSets(prevSets => {
      if (!prevSets || prevSets.length <= activeSetIdx) return prevSets;
      const cloned = JSON.parse(JSON.stringify(prevSets));
      const targetQSet = cloned[activeSetIdx]?.question_sets?.[setIdx];
      if (targetQSet && targetQSet.sub_questions && targetQSet.sub_questions[subIdx]) {
        targetQSet.sub_questions[subIdx].question = question;
        targetQSet.sub_questions[subIdx].marks = Number(marks) || 5;
        targetQSet.sub_questions[subIdx].complexity = complexity;
        targetQSet.sub_questions[subIdx].model_answer = model_answer;
      }
      return cloned;
    });
    setEditingSubQ(null);
  };

  // Open Matrix Editor Modal for a specific sub-question
  const handleOpenMatrixEditor = (setIdx, subIdx) => {
    const qSet = questionSets[setIdx];
    if (!qSet || !qSet.sub_questions || !qSet.sub_questions[subIdx]) return;
    const sq = qSet.sub_questions[subIdx];
    const existing = sq.matrix && Array.isArray(sq.matrix) && sq.matrix.length > 0
      ? JSON.parse(JSON.stringify(sq.matrix))
      : [
          [2, 3, 2, 6, 1],
          [6, 2, 3, 6, 2],
          [5, 3, 2, 3, 5],
          [2, 4, 3, 5, 2],
          [4, 5, 6, 3, 5]
        ];

    const rows = existing.length;
    const cols = existing[0] ? existing[0].length : 5;
    setMatrixRows(rows);
    setMatrixCols(cols);
    setMatrixModalData({
      setIdx,
      subIdx,
      setNumber: qSet.set_number || (setIdx + 1),
      part: sq.part || String.fromCharCode(97 + subIdx),
      matrix: existing
    });
  };

  // Handle cell edit in the live matrix grid
  const handleMatrixCellChange = (rIdx, cIdx, val) => {
    if (!matrixModalData) return;
    setMatrixModalData(prev => {
      const cloned = JSON.parse(JSON.stringify(prev.matrix));
      cloned[rIdx][cIdx] = val;
      return { ...prev, matrix: cloned };
    });
  };

  // Resize matrix dimensions (rows x cols) while preserving cell content
  const handleResizeMatrix = (newRows, newCols) => {
    const r = Math.max(1, Math.min(newRows, 8));
    const c = Math.max(1, Math.min(newCols, 8));
    setMatrixRows(r);
    setMatrixCols(c);
    setMatrixModalData(prev => {
      const current = prev.matrix || [];
      const newGrid = [];
      for (let i = 0; i < r; i++) {
        const row = [];
        for (let j = 0; j < c; j++) {
          if (current[i] && current[i][j] !== undefined) {
            row.push(current[i][j]);
          } else {
            row.push(0);
          }
        }
        newGrid.push(row);
      }
      return { ...prev, matrix: newGrid };
    });
  };

  // Apply quick presets to the matrix editor
  const handleApplyMatrixPreset = (presetName) => {
    if (!matrixModalData) return;
    let presetGrid = [];
    if (presetName === 'diit_5x5') {
      presetGrid = [
        [2, 3, 2, 6, 1],
        [6, 2, 3, 6, 2],
        [5, 3, 2, 3, 5],
        [2, 4, 3, 5, 2],
        [4, 5, 6, 3, 5]
      ];
    } else if (presetName === 'kernel_3x3') {
      presetGrid = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ];
    } else if (presetName === 'block_4x4') {
      presetGrid = [
        [10, 15, 20, 25],
        [12, 18, 22, 28],
        [14, 20, 24, 30],
        [16, 22, 26, 32]
      ];
    } else if (presetName === 'sobel_3x3') {
      presetGrid = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
      ];
    } else {
      presetGrid = Array(5).fill(0).map(() => Array(5).fill(0));
    }

    setMatrixRows(presetGrid.length);
    setMatrixCols(presetGrid[0].length);
    setMatrixModalData(prev => ({ ...prev, matrix: presetGrid }));
  };

  // Save matrix to question
  const handleSaveMatrix = () => {
    if (!matrixModalData) return;
    const { setIdx, subIdx, matrix } = matrixModalData;
    setQuestionSets(prev => {
      const cloned = JSON.parse(JSON.stringify(prev));
      if (cloned[setIdx] && cloned[setIdx].sub_questions && cloned[setIdx].sub_questions[subIdx]) {
        cloned[setIdx].sub_questions[subIdx].matrix = matrix;
      }
      return cloned;
    });
    setGeneratedExamSets(prevSets => {
      if (!prevSets || prevSets.length <= activeSetIdx) return prevSets;
      const cloned = JSON.parse(JSON.stringify(prevSets));
      const targetQSet = cloned[activeSetIdx]?.question_sets?.[setIdx];
      if (targetQSet && targetQSet.sub_questions && targetQSet.sub_questions[subIdx]) {
        targetQSet.sub_questions[subIdx].matrix = matrix;
      }
      return cloned;
    });
    setMatrixModalData(null);
  };

  // Remove matrix from question
  const handleRemoveMatrix = (setIdx, subIdx) => {
    setQuestionSets(prev => {
      const cloned = JSON.parse(JSON.stringify(prev));
      if (cloned[setIdx] && cloned[setIdx].sub_questions && cloned[setIdx].sub_questions[subIdx]) {
        cloned[setIdx].sub_questions[subIdx].matrix = null;
      }
      return cloned;
    });
    setGeneratedExamSets(prevSets => {
      if (!prevSets || prevSets.length <= activeSetIdx) return prevSets;
      const cloned = JSON.parse(JSON.stringify(prevSets));
      const targetQSet = cloned[activeSetIdx]?.question_sets?.[setIdx];
      if (targetQSet && targetQSet.sub_questions && targetQSet.sub_questions[subIdx]) {
        targetQSet.sub_questions[subIdx].matrix = null;
      }
      return cloned;
    });
  };

  // Print paper directly
  const handlePrintPaper = () => {
    window.print();
  };

  // Export as Print-Ready PDF (Specific set or active set)
  const handleExportPDF = (specificSetIdx = null) => {
    const targetIdx = specificSetIdx !== null ? specificSetIdx : activeSetIdx;
    const targetSet = (generatedExamSets && generatedExamSets[targetIdx]) ? generatedExamSets[targetIdx] : null;
    const setLabel = targetSet ? targetSet.set_name : (examSetNames[targetIdx] || setName || 'SET: B');
    const setsToPrint = targetSet ? targetSet.question_sets : questionSets;

    if (generationType === 'descriptive') {
      downloadUniversitySubjectiveExamPDF({
        institution: institution || 'DAFFODIL INSTITUTE OF IT',
        degreeProgram: degreeProgram || 'B.Sc (Hons) in Computer Science & Engineering',
        semesterExam: semesterExam || 'Midterm Examination, CSE 4th Year 8th Semester, 21st Batch, 2026',
        courseCode: courseCode || '540229',
        courseTitle: courseTitle || 'Digital Image Processing',
        timeAllowed: timeAllowed || '1 hour 20 minutes',
        fullMarks: totalMarks || 40,
        setName: setLabel,
        instructions: instructions || '[N.B. -- The figures in the right margin indicate full marks. Answer any two questions. All parts of the questions must be answered sequentially.]',
        questionSets: setsToPrint,
        includeModelAnswers: viewMode === 'review'
      });
    } else {
      const activeSet = (generatedExamSets && generatedExamSets[targetSetIdx]) ? generatedExamSets[targetSetIdx] : null;
      const setLabel = activeSet?.set_name || examSetNames[targetSetIdx] || setName || 'SET: A';
      const qListToPrint = (activeSet?.questions && activeSet.questions.length > 0) ? activeSet.questions : questions;

      downloadEntranceModelQuestionPDF({
        examTitle: examTitle,
        subject: subject,
        institution: institution,
        degreeProgram: degreeProgram,
        semesterExam: semesterExam,
        courseCode: courseCode,
        courseTitle: courseTitle,
        setName: setLabel,
        questions: qListToPrint,
        totalMarks: totalMarks,
        timeAllowed: timeAllowed,
        includeAnswerKey: true
      });
    }
  };

  // Export all generated sets as sequential PDFs
  const handleExportAllSetsPDF = () => {
    if (!generatedExamSets || generatedExamSets.length === 0) {
      handleExportPDF();
      return;
    }
    generatedExamSets.forEach((s, idx) => {
      setTimeout(() => {
        handleExportPDF(idx);
      }, idx * 600);
    });
  };

  // Publish Digitally into Database with Multi-Set & Student Allocations
  const handlePublishDigitally = async () => {
    setIsPublishing(true);
    setPublishSuccess(null);
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      const payload = {
        exam_title: examTitle,
        subject: subject,
        course: `${courseCode}: ${courseTitle}`,
        course_code: courseCode,
        course_title: courseTitle,
        institution: institution,
        degree_program: degreeProgram,
        semester_exam: semesterExam,
        time_allowed: timeAllowed,
        full_marks: totalMarks,
        instructions: instructions,
        teacher: localStorage.getItem('user_name') || 'Course Faculty',
        difficulty: difficulty,
        generation_type: generationType,
        exam_sets: generatedExamSets.length > 0 ? generatedExamSets : (
          generationType === 'descriptive'
            ? [{ set_name: setName, question_sets: questionSets }]
            : [{ set_name: setName, questions: questions }]
        ),
        student_allocations: studentAllocations,
        questions: generationType === 'descriptive' ? questionSets : questions
      };

      const res = await fetch(`${API_BASE}/api/auth/ai-publish-exam/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPublishSuccess(data);
    } catch (err) {
      alert('Error publishing exam: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Difficulty counts
  const easyCount = questions.filter(q => q.difficulty === 'Easy').length;
  const intermediateCount = questions.filter(q => q.difficulty === 'Intermediate').length;
  const complicatedCount = questions.filter(q => q.difficulty === 'Complicated').length;

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      
      {/* ======= PROGRESS WIZARD HEADER ======= */}
      <div className="flex justify-between" style={{ padding: '0 40px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '60px', right: '60px', height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
        {['Select Type', 'Parameters & PDF', 'Review & Edit Output', 'Publish'].map((label, i) => (
          <div 
            key={i} 
            onClick={() => { if (i + 1 < step) setStep(i + 1); }}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px',
              cursor: i + 1 < step ? 'pointer' : 'default'
            }}
          >
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step > i ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
              border: step > i ? 'none' : '2px solid var(--border-color)',
              fontWeight: 'bold', color: step > i ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}>
              {step > i + 1 ? <CheckCircle2 size={18} /> : i + 1}
            </div>
            <div style={{ fontSize: '0.8rem', color: step >= i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step >= i + 1 ? '600' : '400' }}>
              {label}
            </div>
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
            <h3 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: '700' }}>Step 1: Choose Generation Format</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Select the examination layout format. Standard entrance test format generates 4-option MCQs formatted in high-academic layout.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
              {/* Option Card A: Standard Entrance Model MCQ */}
              <div 
                onClick={() => {
                  setGenerationType('mcq');
                  setInstitution('DAFFODIL INSTITUTE OF IT');
                  setDegreeProgram('B.Sc (Hons) in Computer Science & Engineering');
                  setSemesterExam('Midterm Examination, CSE 4th Year 8th Semester, 21st Batch, 2026');
                  setExamTitle('ENTRANCE MODEL QUESTION (A)');
                  setCourseCode('PHY-101');
                  setCourseTitle('Physics I: Mechanics & Thermodynamics');
                  setSubject('Physics I: Mechanics & Thermodynamics');
                  setTimeAllowed('60 Minutes');
                  setTotalMarks(50);
                }}
                style={{ 
                  padding: '24px', borderRadius: '12px', 
                  border: `2px solid ${generationType === 'mcq' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: generationType === 'mcq' ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                }}
              >
                {generationType === 'mcq' && (
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} />
                  </span>
                )}
                <div style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <CheckSquare size={24} />
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600' }}>Entrance Model MCQ Question Paper</h4>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>
                  Standard institutional format: 4 options arranged in 2 columns (a, b, c, d), 3 difficulty tiers (Easy, Intermediate, Complicated), and teacher answer key.
                </p>
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    Standard Entrance
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                    Print & PDF Ready
                  </span>
                </div>
              </div>

              {/* Option Card B: DIIT University Descriptive / Subjective Questions */}
              <div 
                onClick={() => {
                  setGenerationType('descriptive');
                  setInstitution('DAFFODIL INSTITUTE OF IT');
                  setDegreeProgram('B.Sc (Hons) in Computer Science & Engineering');
                  setSemesterExam('Midterm Examination, CSE 4th Year 8th Semester, 21st Batch, 2026');
                  setExamTitle('Midterm Examination');
                  setSetName('SET: B');
                  setTimeAllowed('1 hour 20 minutes');
                  setTotalMarks(40);
                  setSubQuestionsPerSet(4);
                  setSetsCount(2);
                  setInstructions('[N.B. -- The figures in the right margin indicate full marks. Answer any two questions. All parts of the questions must be answered sequentially.]');
                  if (selectedResource) {
                    if (selectedResource.course_code) setCourseCode(selectedResource.course_code);
                    const title = selectedResource.course_title || selectedResource.title || (selectedResource.file_name || '').replace(/\.[^/.]+$/, '');
                    if (title) {
                      setCourseTitle(title);
                      setSubject(title);
                    }
                  } else {
                    setCourseCode('540229');
                    setCourseTitle('Digital Image Processing');
                    setSubject('Digital Image Processing');
                  }
                }}
                style={{ 
                  padding: '24px', borderRadius: '12px', 
                  border: `2px solid ${generationType === 'descriptive' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: generationType === 'descriptive' ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                }}
              >
                {generationType === 'descriptive' && (
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} />
                  </span>
                )}
                <div style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <FileText size={24} />
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '600' }}>Descriptive & Subjective Questions</h4>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>
                  Official University Midterm format (DIIT standard): Sequential parts (a), (b), (c), (d), selectable 3/4/5 questions per set, AI complexity-based marks, and drawn math matrices/figures.
                </p>
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: '600' }}>
                    DIIT Exam Standard
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    Math Matrix Drawing
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                    Editable Marks & Grids
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                className="btn btn-primary" 
                onClick={() => setStep(2)} 
                disabled={!generationType}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
              >
                Continue to Parameters <Settings size={16} />
              </button>
            </div>
          </div>
        )}

        {/* =======================================
            STEP 2: SOURCE & PARAMETERS (FRESH & CLEAN MODERN DESIGN)
            ======================================= */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Step Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={22} style={{ color: '#8B5CF6' }} />
                  Step 2: Exam Specifications & Source
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.86rem' }}>
                  Configure header details, question sets, source material, and difficulty parameters.
                </p>
              </div>
            </div>

            {generationError && (
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}>
                <AlertCircle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
                <span>{generationError}</span>
              </div>
            )}

            {/* SECTION 1: EXAMINATION HEADER DETAILS (CLEAN 2x2 GRID) */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <GraduationCap size={18} style={{ color: '#8B5CF6' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>Examination Header Details</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    Institution Name
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={institution} 
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="DAFFODIL INSTITUTE OF IT"
                    style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    Degree Program
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={degreeProgram} 
                    onChange={(e) => setDegreeProgram(e.target.value)}
                    placeholder="B.Sc (Hons) in Computer Science & Engineering"
                    style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    Semester & Exam Line
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={semesterExam} 
                    onChange={(e) => setSemesterExam(e.target.value)}
                    placeholder="Midterm Examination, CSE 4th Year 8th Semester, 21st Batch, 2026"
                    style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    Course Code & Subject Title
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ width: '110px', fontSize: '0.88rem', padding: '10px 12px', fontWeight: 700 }}
                      value={courseCode} 
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="CSE-315"
                    />
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ flex: 1, fontSize: '0.88rem', padding: '10px 14px' }}
                      value={courseTitle} 
                      onChange={(e) => {
                        setCourseTitle(e.target.value);
                        setSubject(e.target.value);
                      }}
                      placeholder="Artificial Intelligence & Machine Learning"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: PARALLEL EXAM SETS & CODES (CLEAN SEGMENTED CONTROL) */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} style={{ color: '#8B5CF6' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>Parallel Exam Sets (Anti-Cheating)</span>
                </div>
                <span style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  Shuffled Parallel Sets
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Clean Segmented Control for Set Count */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  {[
                    { count: 2, label: '2 Sets', desc: 'Set A & Set B' },
                    { count: 3, label: '3 Sets', desc: 'Set A, Set B & Set C' },
                    { count: 4, label: '4 Sets', desc: 'Standard (Set A–D)' },
                    { count: 5, label: '5 Sets', desc: 'Maximum (Set A–E)' }
                  ].map(item => {
                    const isSelected = examSetsCount === item.count;
                    return (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => handleExamSetsCountChange(item.count)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: isSelected ? '1.5px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.08)',
                          background: isSelected ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(99, 102, 241, 0.18) 100%)' : 'rgba(255, 255, 255, 0.02)',
                          boxShadow: isSelected ? '0 4px 15px rgba(139, 92, 246, 0.25)' : 'none',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? '#fff' : '#cbd5e1' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isSelected ? '#c4b5fd' : '#64748b', marginTop: '2px' }}>
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Horizontal Inline Set Code Customizers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Set Codes:</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                    {examSetNames.slice(0, examSetsCount).map((sName, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '5px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <span style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 800 }}>#{idx + 1}</span>
                        <input
                          type="text"
                          value={sName}
                          onChange={(e) => handleExamSetNameChange(idx, e.target.value)}
                          placeholder={`SET: ${String.fromCharCode(65 + idx)}`}
                          style={{
                            width: '80px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Descriptive Format Specific Options */}
            {generationType === 'descriptive' && (
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    Examination Instructions Notice [N.B.]
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={instructions} 
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="[N.B. -- The figures in the right margin indicate full marks. Answer any two questions. All parts of the questions must be answered sequentially.]"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '10px 14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    Number of Sequential Sub-questions per Set
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    {[
                      { count: 3, label: '3 Sub-questions', parts: 'Parts (a), (b), (c)', desc: 'Core theory & basic problems' },
                      { count: 4, label: '4 Sub-questions', parts: 'Parts (a), (b), (c), (d)', desc: 'DIIT Standard (with math matrix)' },
                      { count: 5, label: '5 Sub-questions', parts: 'Parts (a), (b), (c), (d), (e)', desc: 'Comprehensive multi-part set' }
                    ].map(item => {
                      const isSelected = subQuestionsPerSet === item.count;
                      return (
                        <button
                          key={item.count}
                          type="button"
                          onClick={() => setSubQuestionsPerSet(item.count)}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            border: isSelected ? '1.5px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.08)',
                            background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? '#fff' : '#cbd5e1' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#a78bfa', fontWeight: 600, marginTop: '2px' }}>
                            {item.parts}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                            {item.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: SOURCE PDF / STUDY MATERIAL SELECTION */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} style={{ color: '#8B5CF6' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>Source Study Material / Textbook</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  {resources.length} uploaded resources in database
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    Course Document
                  </label>
                  <select 
                    className="input-field" 
                    value={selectedResourceId} 
                    onChange={handleResourceChange}
                    disabled={loadingResources}
                    style={{ width: '100%', fontSize: '0.85rem', padding: '10px 14px' }}
                  >
                    <option value="">-- No Source (AI Core Knowledge) --</option>
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.file_name || r.title} ({r.course_code || 'General'} • {r.page_count || 1} {r.file_type === 'PPTX' ? 'Slides' : 'Pages'})
                      </option>
                    ))}
                    {resources.length === 0 && (
                      <>
                        <option value="preset_1">Digital Image Processing.pdf (10 Pages)</option>
                        <option value="preset_2">Chapter_4_Thermodynamics.pdf (28 Pages)</option>
                        <option value="preset_3">Data_Structures_Algorithms.pdf (15 Pages)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                      Target Pages / Slides Range
                    </label>
                    {selectedResource && (
                      <span style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 700 }}>
                        Max: {maxPages} {selectedResource.file_type === 'PPTX' ? 'Slides' : 'Pages'}
                      </span>
                    )}
                  </div>

                  {selectedResource ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input 
                          type="number" 
                          min={1}
                          max={endPage}
                          value={startPage}
                          onChange={(e) => handleStartPageChange(e.target.value)}
                          className="input-field"
                          style={{ width: '75px', textAlign: 'center', fontWeight: 700, padding: '8px' }}
                        />
                        <span style={{ color: '#64748b', fontWeight: 700 }}>–</span>
                        <input 
                          type="number" 
                          min={startPage}
                          max={maxPages}
                          value={endPage}
                          onChange={(e) => handleEndPageChange(e.target.value)}
                          className="input-field"
                          style={{ width: '75px', textAlign: 'center', fontWeight: 700, padding: '8px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => handleQuickPagePreset(1, maxPages)}
                          style={{
                            fontSize: '0.72rem',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: startPage === 1 && endPage === maxPages ? '#8B5CF6' : 'rgba(255,255,255,0.06)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer'
                          }}
                        >
                          All ({maxPages})
                        </button>
                        {maxPages >= 4 && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleQuickPagePreset(1, Math.ceil(maxPages / 2))}
                              style={{
                                fontSize: '0.72rem',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                background: startPage === 1 && endPage === Math.ceil(maxPages / 2) ? '#8B5CF6' : 'rgba(255,255,255,0.06)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer'
                              }}
                            >
                              1st Half
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickPagePreset(Math.ceil(maxPages / 2) + 1, maxPages)}
                              style={{
                                fontSize: '0.72rem',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                background: startPage === Math.ceil(maxPages / 2) + 1 && endPage === maxPages ? '#8B5CF6' : 'rgba(255,255,255,0.06)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer'
                              }}
                            >
                              2nd Half
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      className="input-field" 
                      value="Full Subject Scope (AI Core Knowledge)" 
                      disabled
                      style={{ width: '100%', opacity: 0.6, fontSize: '0.85rem', padding: '10px 14px' }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 4: QUESTION PARAMETERS (DIFFICULTY, COUNTS, MARKS, DURATION) */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <SlidersHorizontal size={18} style={{ color: '#8B5CF6' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>Question Parameters & Difficulty</span>
              </div>

              {/* Difficulty Segmented Chips */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                  Difficulty Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  {[
                    { key: 'Easy', label: 'Easy', desc: 'Direct recall & basic facts', color: '#10b981' },
                    { key: 'Intermediate', label: 'Intermediate', desc: 'Application & analytical', color: '#f59e0b' },
                    { key: 'Complicated', label: 'Complicated', desc: 'Advanced synthesis & tricky', color: '#ef4444' },
                    { key: 'Mixed', label: 'Mixed Tiers', desc: 'Balanced: 35% E, 40% M, 25% C', color: '#8B5CF6' }
                  ].map(d => {
                    const isSelected = difficulty === d.key;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setDifficulty(d.key)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: isSelected ? `1.5px solid ${d.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                          background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          boxShadow: isSelected ? `0 0 12px ${d.color}25` : 'none',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? d.color : '#cbd5e1' }}>
                          {d.label}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: isSelected ? '#e2e8f0' : '#64748b', marginTop: '2px' }}>
                          {d.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number of Questions (MCQ only) */}
              {generationType === 'mcq' && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    Number of Questions per Set
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[15, 20, 25, 30, 35, 40, 45, 50].map(cnt => {
                      const isSelected = questionsCount === cnt;
                      return (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setQuestionsCount(cnt)}
                          style={{
                            flex: 1,
                            minWidth: '55px',
                            padding: '9px 0',
                            borderRadius: '10px',
                            border: isSelected ? '1.5px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.08)',
                            background: isSelected ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' : 'rgba(255, 255, 255, 0.02)',
                            color: isSelected ? '#fff' : '#cbd5e1',
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 4px 12px rgba(139, 92, 246, 0.35)' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          {cnt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Marks & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    Total Marks
                  </label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={totalMarks} 
                    onChange={(e) => setTotalMarks(e.target.value)}
                    style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    Duration Allowed
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={timeAllowed} 
                    onChange={(e) => setTimeAllowed(e.target.value)}
                    style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px' }}
                  />
                </div>
              </div>

              {/* Teacher Focus Notes */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                  Teacher Custom Focus Notes (Optional)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={customPrompt} 
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Emphasize spatial filtering, histogram equalization, and distance metric calculations"
                  style={{ width: '100%', fontSize: '0.85rem', padding: '10px 14px' }}
                />
              </div>
            </div>

            {/* Step 2 Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setStep(1)}
                style={{ padding: '10px 22px', fontSize: '0.88rem', fontWeight: 700 }}
              >
                Back
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={handleGenerateExam}
                disabled={isGenerating}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 26px', fontSize: '0.88rem', fontWeight: 700, borderRadius: '12px' }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Exam Paper
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* =======================================
            STEP 3: REVIEW & INTERACTIVE EDITING WORKBENCH
            ======================================= */}
        {step === 3 && (
          <div className="animate-fade-in">
            {/* Top Toolbar */}
            <div className="flex justify-between items-center flex-wrap gap-3" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                  {generationType === 'descriptive' ? 'Step 3: Review & Edit University Examination Paper' : 'Step 3: Review & Edit Entrance Model Paper'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.875rem' }}>
                  {generationType === 'descriptive'
                    ? 'DIIT Official Midterm Layout. Edit questions, customize complexity marks in right margin, or adjust matrix cell values.'
                    : 'Standard Entrance Model Format. You can edit any MCQ, delete questions, or add your own custom questions.'}
                </p>
              </div>

              {/* Right Action Buttons */}
              <div className="flex gap-2 items-center flex-wrap">
                {/* View Mode Toggle: Clean Student View vs Teacher Review Key */}
                <div style={{ display: 'inline-flex', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <button 
                    onClick={() => setViewMode('review')}
                    className="btn"
                    style={{ 
                      padding: '6px 12px', fontSize: '0.8rem',
                      background: viewMode === 'review' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: viewMode === 'review' ? 'white' : 'var(--text-secondary)',
                      borderRadius: 0
                    }}
                  >
                    Teacher Key View
                  </button>
                  <button 
                    onClick={() => setViewMode('exam')}
                    className="btn"
                    style={{ 
                      padding: '6px 12px', fontSize: '0.8rem',
                      background: viewMode === 'exam' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: viewMode === 'exam' ? 'white' : 'var(--text-secondary)',
                      borderRadius: 0
                    }}
                  >
                    Student Paper View
                  </button>
                </div>

                {/* Print Paper Button */}
                <button 
                  onClick={handlePrintPaper}
                  className="btn btn-secondary"
                  title="Print paper"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  <Printer size={15} /> Print
                </button>

                {/* MCQ Mode: Add Custom Question Button */}
                {generationType === 'mcq' && (
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                    <Plus size={16} /> Add Custom Question
                  </button>
                )}
              </div>
            </div>

            {/* Status / Breakdown Badges */}
            <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '16px', background: 'var(--bg-secondary)', padding: '10px 16px', borderRadius: '8px' }}>
              <div className="flex gap-3 items-center flex-wrap">
                {generationType === 'descriptive' ? (
                  <>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Question Sets: {questionSets.length}</span>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', fontWeight: '600' }}>
                      {subQuestionsPerSet} Sub-parts per set (a, b, c{subQuestionsPerSet >= 4 ? ', d' : ''}{subQuestionsPerSet >= 5 ? ', e' : ''})
                    </span>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: '600' }}>
                      Total Marks: {questionSets.reduce((acc, s) => acc + (s.sub_questions || []).reduce((a, q) => a + (Number(q.marks) || 0), 0), 0)} / {totalMarks}
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Total Questions: {questions.length}</span>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: '600' }}>
                      Easy: {easyCount}
                    </span>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: '600' }}>
                      Intermediate: {intermediateCount}
                    </span>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: '600' }}>
                      Complicated: {complicatedCount}
                    </span>
                  </>
                )}
              </div>
              <div className="flex gap-2 items-center">
                {hasPdfContext && (
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} /> Generated from PDF ({pageOrVolume})
                  </span>
                )}
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Source: {sourceFileName || 'Syllabus'}
                </span>
              </div>
            </div>

            {/* =========================================================================
                PAPER PREVIEW: DESCRIPTIVE (DIIT STYLE) VS ENTRANCE MODEL MCQ
                ========================================================================= */}
            {generatedExamSets && generatedExamSets.length > 0 && (
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '16px 20px', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '12px', 
                    border: '1.5px solid var(--accent-primary)',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
                          Multi-Set Review Workbench ({generatedExamSets.length} Distinct Sets Available)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Switch between set tabs below to review and edit each set's questions, complexity marks, or math matrices before publishing.
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => handleExportPDF(activeSetIdx)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Download size={14} /> Export {generatedExamSets[activeSetIdx]?.set_name || 'Active Set'} (PDF)
                        </button>
                        {generatedExamSets.length > 1 && (
                          <button 
                            onClick={handleExportAllSetsPDF}
                            className="btn btn-primary"
                            style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <FileDown size={14} /> Export All {generatedExamSets.length} Sets (PDFs)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Interactive Set Tabs */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Select Set to Review:
                      </span>
                      {generatedExamSets.map((s, idx) => {
                        const isActive = activeSetIdx === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSwitchSet(idx)}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.15s ease',
                              border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                              background: isActive ? 'var(--accent-primary)' : 'var(--bg-primary)',
                              color: isActive ? '#ffffff' : 'var(--text-primary)',
                              boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none'
                            }}
                          >
                            <span>{s.set_name || `Set ${idx + 1}`}</span>
                            {isActive ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <span style={{ fontSize: '0.72rem', opacity: 0.75, padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-secondary)' }}>
                                {(generationType === 'descriptive' ? (s.question_sets || []).length : (s.questions || []).length)} {generationType === 'descriptive' ? 'Groups' : 'MCQs'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* 30% / 70% Explanatory Badge for Active Set */}
                    <div style={{ 
                      fontSize: '0.82rem', 
                      color: 'var(--text-secondary)', 
                      padding: '8px 12px', 
                      borderRadius: '6px', 
                      background: 'rgba(99, 102, 241, 0.06)', 
                      border: '1px dashed rgba(99, 102, 241, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <ShieldCheck size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <span>
                        {generationType === 'descriptive' ? (
                          <>Currently displaying <strong>{generatedExamSets[activeSetIdx]?.set_name}</strong>. Sub-question <strong>(a)</strong> is the 30% common anchor across all sets for fair grading. Sub-questions <strong>(b, c, d, e)</strong> and math matrices are 70% unique variations to prevent adjacent cheating.</>
                        ) : (
                          <>Currently displaying <strong>{generatedExamSets[activeSetIdx]?.set_name}</strong>. 30% common anchor MCQs are shared across all sets for fair baseline grading, while 70% are distinct variations and shuffled options to prevent adjacent examinees from copying.</>
                        )}
                      </span>
                    </div>
                  </div>
                )}


            {generationType === 'descriptive' ? (
              <>

                {/* ======= AUTHENTIC DIIT MIDTERM EXAMINATION PAPER PREVIEW ======= */}
                <div 
                  className="diit-exam-paper-container"
                  style={{ 
                    background: '#ffffff', 
                    color: '#000000',
                    padding: '36px 44px', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    marginBottom: '24px',
                    border: '1px solid #cbd5e1',
                    position: 'relative'
                  }}
                >
                  {/* Top Right Set Badge */}
                  <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '2px' }}>
                    [{generatedExamSets[activeSetIdx]?.set_name || setName || 'SET: B'}]
                  </div>

                {/* Institutional Header Centered */}
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    {institution || 'DAFFODIL INSTITUTE OF IT'}
                  </h1>
                  <h2 style={{ margin: '0 0 3px 0', fontSize: '1.15rem', fontWeight: 'bold' }}>
                    {degreeProgram || 'B.Sc (Hons) in Computer Science & Engineering'}
                  </h2>
                  <div style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                    {semesterExam || 'Midterm Examination, CSE 4th Year 8th Semester, 21st Batch, 2026'}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                    {courseCode} ({courseTitle || subject})
                  </div>
                  <div style={{ fontSize: '1rem' }}>
                    Time – {timeAllowed}, Full marks – {totalMarks}
                  </div>
                </div>

                {/* Examination Instructions [N.B.] */}
                <div style={{ fontStyle: 'italic', fontSize: '0.92rem', marginBottom: '14px', lineHeight: '1.45', color: '#1e293b' }}>
                  {instructions || '[N.B. -- The figures in the right margin indicate full marks. Answer any two questions. All parts of the questions must be answered sequentially.]'}
                </div>

                {/* Right Margin Header: Marks */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '8px', paddingRight: '4px' }}>
                  Marks
                </div>

                {/* Divider Line */}
                <div style={{ borderTop: '1px solid #000000', marginBottom: '18px' }}></div>

                {/* Question Sets List */}
                {(!questionSets || questionSets.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    No descriptive question sets available. Please go back to Step 2 to generate questions.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    {questionSets.map((qSet, setIdx) => (
                      <div key={qSet.set_number || setIdx} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        
                        {(qSet.sub_questions || []).map((sq, subIdx) => (
                          <div 
                            key={sq.id || subIdx} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'flex-start',
                              position: 'relative',
                              padding: viewMode === 'review' ? '10px 12px' : '4px 0',
                              borderRadius: '6px',
                              background: viewMode === 'review' ? '#f8fafc' : 'transparent',
                              border: viewMode === 'review' ? '1px dashed #e2e8f0' : 'none'
                            }}
                          >
                            {/* Left Margin Prefix: Set Number & Sub-Question Part */}
                            <div style={{ width: '60px', minWidth: '60px', fontWeight: 'bold', fontSize: '1.05rem', display: 'flex', gap: '6px' }}>
                              {subIdx === 0 ? (
                                <span style={{ minWidth: '18px' }}>{qSet.set_number || (setIdx + 1)}.</span>
                              ) : (
                                <span style={{ minWidth: '18px', visibility: 'hidden' }}>1.</span>
                              )}
                              <span>({sq.part || String.fromCharCode(97 + subIdx)})</span>
                            </div>

                            {/* Middle Column: Question Stem, Drawn Matrix Table, and Teacher Controls */}
                            <div style={{ flex: 1, paddingRight: '20px' }}>
                              <div style={{ fontSize: '1.03rem', lineHeight: '1.45', color: '#000000' }}>
                                {sq.question}
                              </div>

                              {/* DRAWN MATHEMATICAL MATRIX / FIGURE */}
                              {sq.matrix && Array.isArray(sq.matrix) && sq.matrix.length > 0 && (
                                <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <table style={{ borderCollapse: 'collapse', border: '2px solid #000000', margin: '0 auto' }}>
                                    <tbody>
                                      {sq.matrix.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                          {(Array.isArray(row) ? row : [row]).map((val, cIdx) => (
                                            <td 
                                              key={cIdx} 
                                              style={{ 
                                                width: '32px', 
                                                height: '32px', 
                                                minWidth: '32px', 
                                                minHeight: '32px',
                                                border: '1.5px solid #000000',
                                                textAlign: 'center',
                                                verticalAlign: 'middle',
                                                fontWeight: 'bold',
                                                fontSize: '1.05rem',
                                                color: '#000000',
                                                padding: 0
                                              }}
                                            >
                                              {val}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>

                                  {/* Review Mode Matrix Controls */}
                                  {viewMode === 'review' && (
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                      <button 
                                        onClick={() => handleOpenMatrixEditor(setIdx, subIdx)}
                                        style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '4px', background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', cursor: 'pointer', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}
                                      >
                                        <Edit3 size={12} /> Edit Matrix Cells & Dimensions
                                      </button>
                                      <button 
                                        onClick={() => handleRemoveMatrix(setIdx, subIdx)}
                                        style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', cursor: 'pointer', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}
                                      >
                                        <Trash2 size={12} /> Remove Matrix
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* If No Matrix present, offer teacher button to draw / attach one */}
                              {(!sq.matrix || sq.matrix.length === 0) && viewMode === 'review' && (
                                <div style={{ marginTop: '6px' }}>
                                  <button 
                                    onClick={() => handleOpenMatrixEditor(setIdx, subIdx)}
                                    style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', border: '1px dashed #cbd5e1', cursor: 'pointer', fontFamily: 'system-ui, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Table size={12} /> + Draw / Attach Math Matrix
                                  </button>
                                </div>
                              )}

                              {/* Teacher Review Mode: Question Controls & Model Answer Outline */}
                              {viewMode === 'review' && (
                                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'system-ui, sans-serif' }}>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ 
                                      fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '600',
                                      background: sq.complexity === 'Easy' ? '#dcfce7' : sq.complexity === 'Intermediate' ? '#fef3c7' : '#fee2e2',
                                      color: sq.complexity === 'Easy' ? '#166534' : sq.complexity === 'Intermediate' ? '#92400e' : '#991b1b'
                                    }}>
                                      Complexity: {sq.complexity || 'Intermediate'} ({sq.marks} Marks)
                                    </span>

                                    <button 
                                      onClick={() => handleOpenEditSubQ(setIdx, subIdx)}
                                      style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#4338ca', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Edit3 size={11} /> Edit Question Text
                                    </button>
                                  </div>

                                  {sq.model_answer && (
                                    <div style={{ padding: '6px 10px', background: '#f1f5f9', borderLeft: '3px solid var(--accent-primary)', borderRadius: '4px', fontSize: '0.8rem', color: '#334155', lineHeight: '1.4' }}>
                                      <strong style={{ color: 'var(--accent-primary)', marginRight: '4px' }}>Model Solution Outline:</strong>
                                      {sq.model_answer}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right Margin Marks Column (Editable by Teacher) */}
                            <div style={{ width: '50px', minWidth: '50px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                              {viewMode === 'review' ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                  <input 
                                    type="number"
                                    min={1}
                                    max={25}
                                    value={sq.marks}
                                    onChange={(e) => handleUpdateSubQuestionMark(setIdx, subIdx, e.target.value)}
                                    style={{ 
                                      width: '42px', 
                                      textAlign: 'center', 
                                      fontWeight: 'bold', 
                                      fontSize: '1.05rem', 
                                      border: '1px solid #cbd5e1', 
                                      borderRadius: '4px', 
                                      padding: '2px', 
                                      background: '#ffffff',
                                      color: '#000000',
                                      fontFamily: '"Times New Roman", Times, Georgia, serif'
                                    }}
                                    title="Click to edit mark"
                                  />
                                </div>
                              ) : (
                                <span>{sq.marks}</span>
                              )}
                            </div>
                          </div>
                        ))}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
            ) : (

              /* ======= AUTHENTIC ENTRANCE MODEL QUESTION PAPER PREVIEW ======= */
              <div 
                style={{ 
                  background: '#ffffff', 
                  color: '#0f172a',
                  padding: '36px 40px', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                  marginBottom: '24px',
                  border: '1px solid #e2e8f0'
                }}
              >
                {/* Top Right Set Badge */}
                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '2px', color: '#000000' }}>
                  [{generatedExamSets[activeSetIdx]?.set_name || setName || 'SET: A'}]
                </div>

                {/* Paper Top Title */}
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    {institution || 'DAFFODIL INSTITUTE OF IT'}
                  </h1>
                  {degreeProgram && (
                    <h2 style={{ margin: '0 0 3px 0', fontSize: '1.15rem', fontWeight: 'bold' }}>
                      {degreeProgram}
                    </h2>
                  )}
                  {semesterExam && (
                    <div style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                      {semesterExam}
                    </div>
                  )}
                </div>

                {/* Solid Black Subject Badge */}
                <div style={{ textAlign: 'center', margin: '14px 0' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    background: '#000000', 
                    color: '#ffffff', 
                    padding: '4px 24px', 
                    fontSize: '1.15rem', 
                    fontWeight: 'bold', 
                    letterSpacing: '1px' 
                  }}>
                    {courseCode ? `${courseCode}: ${courseTitle || subject}` : (courseTitle || subject)}
                  </span>
                </div>

                {/* Metadata Line */}
                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#475569', marginBottom: '10px' }}>
                  Time: {timeAllowed} • Full Marks: {totalMarks}
                </div>

                {/* Double Horizontal Rule */}
                <div style={{ borderTop: '2px solid #000000', borderBottom: '1px solid #000000', height: '3px', margin: '10px 0 20px 0' }}></div>

                {/* Instructions */}
                <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
                  Instructions: Read each question carefully. Select the most appropriate option from choices (a, b, c, d).
                </div>

                {/* Questions List */}
                {questions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                    No questions currently in this exam. Click "+ Add Custom Question" to insert one.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {questions.map((q, idx) => (
                      <div 
                        key={q.id || idx} 
                        style={{ 
                          position: 'relative',
                          padding: '12px 14px',
                          borderRadius: '6px',
                          background: viewMode === 'review' ? '#f8fafc' : 'transparent',
                          border: viewMode === 'review' ? '1px dashed #cbd5e1' : 'none'
                        }}
                      >
                        {/* Action buttons (Edit & Delete) visible on hover or in review mode */}
                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={() => handleOpenEdit(q)}
                            title="Edit Question"
                            style={{ 
                              background: '#e0e7ff', color: '#4338ca', border: 'none', 
                              borderRadius: '4px', padding: '4px 8px', cursor: 'pointer',
                              fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px',
                              fontFamily: 'system-ui, sans-serif'
                            }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(q.id)}
                            title="Delete Question"
                            style={{ 
                              background: '#fee2e2', color: '#b91c1c', border: 'none', 
                              borderRadius: '4px', padding: '4px 8px', cursor: 'pointer',
                              fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px',
                              fontFamily: 'system-ui, sans-serif'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Question Stem */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', paddingRight: '120px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '1.05rem', minWidth: '22px' }}>
                            {idx + 1}.
                          </span>
                          <div style={{ fontWeight: 'bold', fontSize: '1.05rem', lineHeight: '1.4' }}>
                            {q.question}
                          </div>
                        </div>

                        {/* Options in 2 Columns matching the entrance model format */}
                        <div 
                          style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '6px 24px', 
                            marginTop: '10px',
                            paddingLeft: '32px',
                            fontSize: '0.98rem'
                          }}
                        >
                          {['a', 'b', 'c', 'd'].map(optKey => {
                            const isCorrect = q.correct_answer === optKey;
                            return (
                              <div 
                                key={optKey} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '8px',
                                  color: (viewMode === 'review' && isCorrect) ? '#15803d' : '#1e293b',
                                  fontWeight: (viewMode === 'review' && isCorrect) ? 'bold' : 'normal'
                                }}
                              >
                                <span style={{ minWidth: '18px' }}>{optKey})</span>
                                <span>{q.options ? q.options[optKey] : ''}</span>
                                {viewMode === 'review' && isCorrect && (
                                  <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '3px', marginLeft: '6px', fontFamily: 'system-ui, sans-serif' }}>
                                    ✓ Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Teacher Note & Difficulty Badge in Review Mode */}
                        {viewMode === 'review' && (
                          <div style={{ marginTop: '10px', paddingLeft: '32px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', fontFamily: 'system-ui, sans-serif' }}>
                            <span style={{ 
                              fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '600',
                              background: q.difficulty === 'Easy' ? '#dcfce7' : q.difficulty === 'Intermediate' ? '#fef3c7' : '#fee2e2',
                              color: q.difficulty === 'Easy' ? '#166534' : q.difficulty === 'Intermediate' ? '#92400e' : '#991b1b'
                            }}>
                              {q.difficulty || 'Intermediate'}
                            </span>
                            {q.explanation && (
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                Note: {q.explanation}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3 Navigation Controls */}
            <div className="flex justify-between items-center">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                Back to Parameters
              </button>
              <div className="flex gap-3">
                <button 
                  className="btn btn-secondary" 
                  onClick={handleExportPDF}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={16} /> Export PDF Now
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setStep(4);
                    fetchEnrolledStudents();
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
                >
                  Allocate Students & Proceed to Publish <Users size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =======================================
            STEP 4: STUDENT ALLOCATION & PUBLISHING
            ======================================= */}
        {step === 4 && (
          <div className="animate-fade-in" style={{ padding: '10px 0' }}>
            
            {/* Step Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users className="text-violet-500" size={24} />
                  Step 4: Student Set Allocation & Final Publishing
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
                  Assign which examinee receives which question paper set. Adjacent students receive different sets to prevent copying in the examination hall.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setStep(3)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                >
                  Back to Review Sets
                </button>
              </div>
            </div>

            {/* Published Success Screen */}
            {publishSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '16px', border: '1.5px solid var(--accent-success)', maxWidth: '680px', margin: '20px auto' }}>
                <div style={{ display: 'inline-flex', padding: '18px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', color: 'var(--accent-success)', marginBottom: '16px' }}>
                  <CheckCircle2 size={48} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  Examination Successfully Deployed!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                  The examination paper has been published to the institutional database. Each student will now see strictly their designated question set upon opening the Student Exam Center.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Paper Reference</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--accent-primary)' }}>{publishSuccess.paper_id}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Sets Deployed</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{publishSuccess.sets_count || generatedExamSets.length} Parallel Sets</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Students Assigned</span>
                    <strong style={{ fontSize: '1.05rem', color: '#10b981' }}>{publishSuccess.students_assigned_count || Object.keys(studentAllocations).length} Examinees</strong>
                  </div>
                </div>

                <div className="flex justify-center gap-3 flex-wrap">
                  <button
                    className="btn btn-secondary"
                    onClick={handleExportAllSetsPDF}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.88rem' }}
                  >
                    <Download size={16} /> Download All Sets (Combined PDFs)
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setPublishSuccess(null);
                      setStep(1);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontSize: '0.88rem' }}
                  >
                    <BrainCircuit size={16} /> Create Another Exam
                  </button>
                </div>
              </div>
            ) : (
              /* Pre-Publish Student Allocation Workbench */
              <div>
                
                {/* Anti-Cheating Allocation Toolbar */}
                <div style={{ background: 'var(--bg-secondary)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    
                    {/* Quick Automated Distribution Buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleAutoDistributeRoundRobin}
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', padding: '8px 16px', fontWeight: 700 }}
                      >
                        <Shuffle size={15} /> 1-Click Auto Distribute (Round-Robin)
                      </button>

                      <button
                        onClick={handleRandomizeAllocations}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', padding: '8px 16px' }}
                      >
                        <RefreshCw size={15} /> Randomize Allocation
                      </button>
                    </div>

                    {/* Filter & Search Controls */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Batch Filter */}
                      <select
                        className="input-field"
                        style={{ width: '140px', padding: '7px 10px', fontSize: '0.82rem' }}
                        value={selectedBatchFilter}
                        onChange={(e) => setSelectedBatchFilter(e.target.value)}
                      >
                        <option value="ALL">All Batches</option>
                        <option value="2021">Batch 2021</option>
                        <option value="2022">Batch 2022</option>
                        <option value="2023">Batch 2023</option>
                        <option value="2024">Batch 2024</option>
                        <option value="2026">Batch 2026</option>
                      </select>

                      {/* Search Query */}
                      <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Search student or ID..."
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          style={{ paddingLeft: '32px', width: '200px', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Real-time Set Allocation Metrics Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Distribution Ratio:
                    </span>
                    {(generatedExamSets.length > 0 ? generatedExamSets.map(s => s.set_name) : examSetNames).map(sName => {
                      const count = Object.values(studentAllocations).filter(v => v === sName).length;
                      return (
                        <span 
                          key={sName}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: 'var(--accent-primary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <strong>{sName}:</strong> {count} {count === 1 ? 'Student' : 'Students'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Enrolled Students Table */}
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', marginBottom: '24px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 700 }}>Student ID</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 700 }}>Examinee Name</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 700 }}>Batch & Section</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 700 }}>Program</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 700, minWidth: '180px' }}>Allocated Question Set</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingStudents ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                            <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                            Loading enrolled examinees from database...
                          </td>
                        </tr>
                      ) : enrolledStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                            No registered students found in database.
                          </td>
                        </tr>
                      ) : (
                        enrolledStudents
                          .filter(st => {
                            if (selectedBatchFilter !== 'ALL' && String(st.batch || '') !== selectedBatchFilter) return false;
                            if (studentSearchQuery) {
                              const q = studentSearchQuery.toLowerCase();
                              const name = (st.name || st.username || '').toLowerCase();
                              const id = String(st.institutional_id || st.username || '').toLowerCase();
                              return name.includes(q) || id.includes(q);
                            }
                            return true;
                          })
                          .map((st, idx) => {
                            const studentKey = String(st.institutional_id || st.username || st.id);
                            const assignedSet = studentAllocations[studentKey] || (generatedExamSets[0]?.set_name || 'SET: A');
                            const availableSetList = generatedExamSets.length > 0 
                              ? generatedExamSets.map(s => s.set_name) 
                              : examSetNames;

                            return (
                              <tr key={st.id || idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '0.92rem' }}>
                                  {st.institutional_id || st.username}
                                </td>
                                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {st.name || st.username}
                                </td>
                                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                                  Batch {st.batch || 2022} • Sec {st.section || 'A'}
                                </td>
                                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                  {st.department || 'CSE'}
                                </td>
                                <td style={{ padding: '10px 16px' }}>
                                  <select
                                    className="input-field"
                                    value={assignedSet}
                                    onChange={(e) => handleStudentSetChange(studentKey, e.target.value)}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.85rem',
                                      fontWeight: 700,
                                      borderColor: 'var(--accent-primary)',
                                      background: 'var(--bg-primary)',
                                      color: 'var(--text-primary)'
                                    }}
                                  >
                                    {availableSetList.map(sName => (
                                      <option key={sName} value={sName}>
                                        {sName}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Publish Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Ready to Publish: {Object.keys(studentAllocations).length} Students Assigned
                    </span>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Paper: {courseCode} ({courseTitle}) • {generatedExamSets.length || examSetsCount} Multi-Set Variations
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={handleExportAllSetsPDF}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '10px 18px' }}
                    >
                      <Download size={16} /> Export All Sets (PDFs)
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={handlePublishDigitally}
                      disabled={isPublishing}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 26px', fontSize: '0.9rem', fontWeight: 800 }}
                    >
                      {isPublishing ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" /> Publishing Exam Papers...
                        </>
                      ) : (
                        <>
                          <Share2 size={16} /> Confirm & Publish Digitally to Students
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </Card>

      {/* ==============================================================
          MODAL: EDIT EXISTING QUESTION
          ============================================================== */}
      {editingQuestion && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '620px', width: '100%', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div className="flex justify-between items-center" style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Edit Question #{editingQuestion.id}</h3>
              <button onClick={() => setEditingQuestion(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Question Stem */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Question Stem</label>
                <textarea 
                  className="input-field" 
                  rows={3} 
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                />
              </div>

              {/* Options a, b, c, d */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['a', 'b', 'c', 'd'].map(key => (
                  <div key={key}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                      Option ({key.toUpperCase()})
                    </label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={editingQuestion.options ? editingQuestion.options[key] : ''}
                      onChange={(e) => setEditingQuestion({
                        ...editingQuestion,
                        options: { ...editingQuestion.options, [key]: e.target.value }
                      })}
                    />
                  </div>
                ))}
              </div>

              {/* Correct Answer & Difficulty Tier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                    Correct Option Key
                  </label>
                  <select 
                    className="input-field"
                    value={editingQuestion.correct_answer}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                  >
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                    Difficulty Tier
                  </label>
                  <select 
                    className="input-field"
                    value={editingQuestion.difficulty}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Complicated">Complicated</option>
                  </select>
                </div>
              </div>

              {/* Explanation Note */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                  Answer Explanation / Reference
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3" style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <button className="btn btn-secondary" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: ADD CUSTOM QUESTION ("Nijer mon moto qsn")
          ============================================================== */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '620px', width: '100%', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div className="flex justify-between items-center" style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Add Custom Question</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Create your own question manually to include in this entrance paper.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCustomQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                  Question Stem *
                </label>
                <textarea 
                  className="input-field" 
                  rows={2} 
                  required
                  placeholder="e.g. Choose the sentence with the correct subjunctive mood usage: _____."
                  value={newQuestionForm.question}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: '600' }}>Option (A) *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required
                    value={newQuestionForm.optionA}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionA: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: '600' }}>Option (B) *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required
                    value={newQuestionForm.optionB}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionB: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: '600' }}>Option (C) *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required
                    value={newQuestionForm.optionC}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionC: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: '600' }}>Option (D) *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required
                    value={newQuestionForm.optionD}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionD: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                    Correct Answer *
                  </label>
                  <select 
                    className="input-field"
                    value={newQuestionForm.correctAnswer}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, correctAnswer: e.target.value })}
                  >
                    <option value="a">Option (A)</option>
                    <option value="b">Option (B)</option>
                    <option value="c">Option (C)</option>
                    <option value="d">Option (D)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                    Difficulty Category *
                  </label>
                  <select 
                    className="input-field"
                    value={newQuestionForm.difficulty}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Complicated">Complicated</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                  Answer Explanation / Reference Note
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Mandatory subjunctive mood requires base verb form."
                  value={newQuestionForm.explanation}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Insert into Exam Paper
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: MATHEMATICAL MATRIX / FIGURE EDITOR
          ============================================================== */}
      {matrixModalData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '640px', width: '100%', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div className="flex justify-between items-center" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Table size={20} style={{ color: 'var(--accent-primary)' }} />
                  Mathematical Matrix & Figure Editor
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Question {matrixModalData.setNumber}.({matrixModalData.part}) • Modify dimensions or click any cell to edit pixel / numeric values.
                </p>
              </div>
              <button onClick={() => setMatrixModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Matrix Dimension & Quick Presets */}
            <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Grid Size:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      type="number"
                      min={1}
                      max={8}
                      value={matrixRows}
                      onChange={(e) => handleResizeMatrix(parseInt(e.target.value, 10) || 1, matrixCols)}
                      className="input-field"
                      style={{ width: '56px', textAlign: 'center', padding: '4px 8px' }}
                    />
                    <span style={{ fontWeight: 'bold' }}>×</span>
                    <input 
                      type="number"
                      min={1}
                      max={8}
                      value={matrixCols}
                      onChange={(e) => handleResizeMatrix(matrixRows, parseInt(e.target.value, 10) || 1)}
                      className="input-field"
                      style={{ width: '56px', textAlign: 'center', padding: '4px 8px' }}
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    onClick={() => handleApplyMatrixPreset('diit_5x5')}
                    style={{ fontSize: '0.74rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', fontWeight: '600', cursor: 'pointer' }}
                  >
                    DIIT 5×5 Image
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleApplyMatrixPreset('kernel_3x3')}
                    style={{ fontSize: '0.74rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                  >
                    3×3 Filter
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleApplyMatrixPreset('block_4x4')}
                    style={{ fontSize: '0.74rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                  >
                    4×4 Block
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleApplyMatrixPreset('sobel_3x3')}
                    style={{ fontSize: '0.74rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                  >
                    3×3 Sobel
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE INTERACTIVE EDITABLE GRID TABLE */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', overflowX: 'auto', marginBottom: '18px' }}>
              <table style={{ borderCollapse: 'collapse', border: '2px solid #0f172a' }}>
                <tbody>
                  {(matrixModalData.matrix || []).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {(Array.isArray(row) ? row : [row]).map((cellVal, cIdx) => (
                        <td key={cIdx} style={{ padding: '2px', border: '1px solid #0f172a' }}>
                          <input 
                            type="text" 
                            value={cellVal}
                            onChange={(e) => handleMatrixCellChange(rIdx, cIdx, e.target.value)}
                            style={{ 
                              width: '42px', 
                              height: '42px', 
                              textAlign: 'center', 
                              fontWeight: 'bold', 
                              fontSize: '1.1rem',
                              border: 'none',
                              outline: 'none',
                              background: '#ffffff',
                              color: '#0f172a',
                              fontFamily: '"Times New Roman", Times, Georgia, serif'
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  handleRemoveMatrix(matrixModalData.setIdx, matrixModalData.subIdx);
                  setMatrixModalData(null);
                }}
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={15} /> Remove Matrix
              </button>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setMatrixModalData(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSaveMatrix}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Check size={16} /> Save & Apply to Question
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: EDIT SUB-QUESTION (DESCRIPTIVE DIIT)
          ============================================================== */}
      {editingSubQ && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '640px', width: '100%', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div className="flex justify-between items-center" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
                  Edit Sub-Question {editingSubQ.setNumber}.({editingSubQ.part})
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Update question text, modify cognitive complexity marks, or adjust the model answer outline.
                </p>
              </div>
              <button onClick={() => setEditingSubQ(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Question Text */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                  Question Stem *
                </label>
                <textarea 
                  className="input-field" 
                  rows={4}
                  value={editingSubQ.question}
                  onChange={(e) => setEditingSubQ({ ...editingSubQ, question: e.target.value })}
                  style={{ fontFamily: '"Times New Roman", Times, Georgia, serif', fontSize: '1rem', lineHeight: '1.45' }}
                />
              </div>

              {/* Marks & Complexity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                    Marks Allocated (Right Margin)
                  </label>
                  <input 
                    type="number"
                    min={1}
                    max={25}
                    className="input-field" 
                    value={editingSubQ.marks}
                    onChange={(e) => setEditingSubQ({ ...editingSubQ, marks: parseInt(e.target.value, 10) || 1 })}
                    style={{ fontWeight: 'bold' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                    DIIT standard: 3–4 for definition, 5 for concepts, 6–8 for math/matrix.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                    Cognitive Complexity Tier
                  </label>
                  <select 
                    className="input-field"
                    value={editingSubQ.complexity}
                    onChange={(e) => setEditingSubQ({ ...editingSubQ, complexity: e.target.value })}
                  >
                    <option value="Easy">Easy (Recall & Definition)</option>
                    <option value="Intermediate">Intermediate (Theory & Algorithm)</option>
                    <option value="Complicated">Complicated (Multi-step Math & Matrix)</option>
                  </select>
                </div>
              </div>

              {/* Model Answer Outline */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                  Model Solution / Marking Rubric Outline (Teacher Key)
                </label>
                <textarea 
                  className="input-field" 
                  rows={3}
                  value={editingSubQ.model_answer}
                  onChange={(e) => setEditingSubQ({ ...editingSubQ, model_answer: e.target.value })}
                  placeholder="Key concepts, formula steps, or numerical answer expected from students"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setEditingSubQ(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSaveEditSubQ}
                >
                  Save Question Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}