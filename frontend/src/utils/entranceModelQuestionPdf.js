import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Downloads a high-quality print-ready Entrance Model Question Paper PDF,
 * formatted to match standard institutional entrance examinations.
 *
 * @param {Object} params
 * @param {string} params.examTitle - e.g. "ENTRANCE MODEL QUESTION (A)"
 * @param {string} params.subject - e.g. "ENGLISH" or "PHYSICS"
 * @param {string} params.institution - e.g. "QGENIX UNIVERSITY"
 * @param {Array} params.questions - Array of question objects
 * @param {number} params.totalMarks - Total marks
 * @param {string} params.timeAllowed - Allowed duration
 * @param {boolean} params.includeAnswerKey - Whether to append an official Answer Key sheet
 */
export function downloadEntranceModelQuestionPDF({
  examTitle = 'ENTRANCE MODEL QUESTION (A)',
  subject = 'ENGLISH',
  institution = 'QGENIX UNIVERSITY',
  courseCode = 'ENG-101',
  questions = [],
  totalMarks = 50,
  timeAllowed = '60 Minutes',
  includeAnswerKey = true
}) {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;

  let y = 45;

  // 1. Top Document Header (Centered, bold standard entrance style)
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(examTitle.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 20;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(51, 65, 85);
  doc.text(institution.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 18;
  // Subject Box: e.g. [ ENGLISH ]
  const subjectText = subject.toUpperCase();
  doc.setFontSize(14);
  const subjWidth = doc.getTextWidth(`  ${subjectText}  `) + 20;
  doc.setFillColor(15, 23, 42);
  doc.rect((pageWidth - subjWidth) / 2, y - 13, subjWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(subjectText, pageWidth / 2, y + 2, { align: 'center' });

  y += 20;
  // Metadata Bar (Course, Time, Marks)
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Course: ${courseCode} • Time: ${timeAllowed} • Full Marks: ${totalMarks}`, pageWidth / 2, y, { align: 'center' });

  y += 8;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(1.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3;
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  y += 18;

  // Instructions
  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Instructions: Read each question carefully. Choose the best answer from the given choices (a, b, c, d).', margin, y);
  y += 16;

  // 2. Render MCQ Questions in standard 2-column options format
  const col1X = margin + 18;
  const col2X = margin + contentWidth / 2 + 10;

  questions.forEach((item, index) => {
    // Check if we need a new page
    if (y > pageHeight - 90) {
      doc.addPage();
      y = 45;
    }

    const qNum = `${index + 1}.`;
    const qText = item.question || '';

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);

    // Render Question Number
    doc.text(qNum, margin, y);

    // Split and render Question Statement
    const splitQuestion = doc.splitTextToSize(qText, contentWidth - 22);
    doc.text(splitQuestion, margin + 18, y);
    y += splitQuestion.length * 13 + 4;

    // Options (a, b, c, d)
    const opts = item.options || {};
    const optA = `a)   ${opts.a || ''}`;
    const optB = `b)   ${opts.b || ''}`;
    const optC = `c)   ${opts.c || ''}`;
    const optD = `d)   ${opts.d || ''}`;

    doc.setFont('times', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);

    const halfWidth = contentWidth / 2 - 20;

    // Row 1: Option A and B
    const splitA = doc.splitTextToSize(optA, halfWidth);
    const splitB = doc.splitTextToSize(optB, halfWidth);
    const row1Height = Math.max(splitA.length, splitB.length) * 12;

    doc.text(splitA, col1X, y);
    doc.text(splitB, col2X, y);
    y += row1Height + 3;

    // Row 2: Option C and D
    const splitC = doc.splitTextToSize(optC, halfWidth);
    const splitD = doc.splitTextToSize(optD, halfWidth);
    const row2Height = Math.max(splitC.length, splitD.length) * 12;

    doc.text(splitC, col1X, y);
    doc.text(splitD, col2X, y);
    y += row2Height + 12;
  });

  // 3. Optional Official Answer Key Section
  if (includeAnswerKey && questions.length > 0) {
    doc.addPage();
    y = 50;

    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('OFFICIAL ANSWER KEY & RATIONALE', pageWidth / 2, y, { align: 'center' });

    y += 14;
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${examTitle} • Confidential Examiner Copy`, pageWidth / 2, y, { align: 'center' });

    y += 15;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    const tableRows = questions.map((q, idx) => {
      const correctKey = (q.correct_answer || 'a').toLowerCase();
      const answerText = q.options ? q.options[correctKey] : '';
      return [
        `Q${idx + 1}`,
        correctKey.toUpperCase(),
        answerText || '—',
        q.difficulty || 'Medium',
        q.explanation || q.page_reference || 'Standard curriculum concept'
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['Q#', 'Key', 'Correct Option', 'Difficulty', 'Explanation / Reference']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        font: 'times',
        fontStyle: 'bold',
        fontSize: 9.5
      },
      styles: {
        font: 'times',
        fontSize: 9,
        cellPadding: 6,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 35, fontStyle: 'bold', halign: 'center' },
        2: { cellWidth: 120 },
        3: { cellWidth: 65 },
        4: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin }
    });
  }

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages} • QGenix AI Examination Engine`, pageWidth / 2, pageHeight - 20, { align: 'center' });
  }

  doc.save(`${examTitle.replace(/\s+/g, '_')}_Paper.pdf`);
}

/**
 * Downloads a DIIT-style university subjective examination paper PDF
 * matching the official institutional midterm layout with sub-questions (a,b,c,d),
 * right-aligned marks, and clean numerical matrices.
 */
export function downloadUniversitySubjectiveExamPDF({
  institution = 'DAFFODIL INSTITUTE OF IT',
  degreeProgram = 'B.Sc (Hons) in Computer Science & Engineering',
  semesterExam = 'Midterm Examination, CSE 4th Year 8th Semester, 21st Batch, 2026',
  courseCode = '540229',
  courseTitle = 'Digital Image Processing',
  timeAllowed = '1 hour 20 minutes',
  fullMarks = 40,
  setName = 'SET: B',
  instructions = '[N.B. -- The figures in the right margin indicate full marks. Answer any two questions. All parts of the questions must be answered sequentially.]',
  questionSets = [],
  includeModelAnswers = false
}) {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const rightMarginX = pageWidth - margin;

  let y = 38;

  // Set badge in top right corner
  if (setName) {
    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`[${setName.replace(/[\[\]]/g, '')}]`, rightMarginX, y, { align: 'right' });
  }

  // Centered Institutional Header
  y += 14;
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text(institution.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 16;
  doc.setFontSize(12);
  doc.text(degreeProgram, pageWidth / 2, y, { align: 'center' });

  y += 15;
  doc.setFontSize(11);
  doc.text(semesterExam, pageWidth / 2, y, { align: 'center' });

  y += 15;
  doc.text(`${courseCode} (${courseTitle})`, pageWidth / 2, y, { align: 'center' });

  y += 14;
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text(`Time \u2013 ${timeAllowed}, Full marks \u2013 ${fullMarks}`, pageWidth / 2, y, { align: 'center' });

  // Instructions Notice
  y += 18;
  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  const splitNotice = doc.splitTextToSize(instructions, contentWidth);
  doc.text(splitNotice, margin, y);
  y += splitNotice.length * 12 + 8;

  // Right Margin "Marks" Header
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text('Marks', rightMarginX, y, { align: 'right' });
  y += 10;

  // Thin dividing line
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, rightMarginX, y);
  y += 14;

  // Render Question Sets
  questionSets.forEach((qSet, setIdx) => {
    // Check if new page needed
    if (y > pageHeight - 90) {
      doc.addPage();
      y = 45;
    }

    const setNum = qSet.set_number || (setIdx + 1);

    (qSet.sub_questions || []).forEach((sq, subIdx) => {
      if (y > pageHeight - 80) {
        doc.addPage();
        y = 45;
      }

      // Question prefix: First sub-question has set number e.g. "1.  (a)", others have "    (b)"
      const isFirst = subIdx === 0;
      doc.setFont('times', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);

      const partLabel = `(${sq.part || String.fromCharCode(97 + subIdx)})`;
      const prefixText = isFirst ? `${setNum}.   ${partLabel}` : `      ${partLabel}`;
      doc.text(prefixText, margin, y);

      // Question Text
      const textX = margin + 42;
      const textWidth = contentWidth - 42 - 35; // Leave 35pt on right for marks
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      const splitQuestion = doc.splitTextToSize(sq.question, textWidth);
      doc.text(splitQuestion, textX, y);

      // Right-aligned marks
      const marksVal = String(sq.marks !== undefined ? sq.marks : 5);
      doc.setFont('times', 'bold');
      doc.setFontSize(10.5);
      doc.text(marksVal, rightMarginX - 4, y, { align: 'right' });

      y += splitQuestion.length * 13 + 4;

      // Render Matrix if present
      if (sq.matrix && Array.isArray(sq.matrix) && sq.matrix.length > 0) {
        if (y > pageHeight - 110) {
          doc.addPage();
          y = 45;
        }

        const matrixBody = sq.matrix.map(row => (Array.isArray(row) ? row.map(cell => String(cell)) : [String(row)]));
        const colCount = sq.matrix[0] ? sq.matrix[0].length : 1;
        const cellDim = 20;
        const totalTableWidth = colCount * cellDim;
        const tableStartX = (pageWidth - totalTableWidth) / 2;

        const colStyles = {};
        for (let c = 0; c < colCount; c++) {
          colStyles[c] = { cellWidth: cellDim, halign: 'center' };
        }

        autoTable(doc, {
          startY: y,
          body: matrixBody,
          theme: 'grid',
          styles: {
            font: 'times',
            fontSize: 9.5,
            fontStyle: 'bold',
            textColor: [15, 23, 42],
            lineColor: [0, 0, 0],
            lineWidth: 0.8,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle'
          },
          columnStyles: colStyles,
          margin: { left: tableStartX },
          tableWidth: totalTableWidth
        });

        y = doc.lastAutoTable.finalY + 12;
      }

      // Model answer for Teacher Key
      if (includeModelAnswers && sq.model_answer) {
        doc.setFont('times', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        const splitAns = doc.splitTextToSize(`[Model Answer / Solution: ${sq.model_answer}]`, textWidth);
        doc.text(splitAns, textX, y);
        y += splitAns.length * 10 + 6;
      } else {
        y += 6;
      }
    });

    y += 10;
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages} \u2022 Daffodil Institute of IT Examination System`, pageWidth / 2, pageHeight - 18, { align: 'center' });
  }

  doc.save(`${courseCode}_${(courseTitle || 'Exam').replace(/\s+/g, '_')}_Paper.pdf`);
}

