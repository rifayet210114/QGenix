import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a clean, professional PDF report of a faculty member's
 * monthly timesheet and activity logs.
 *
 * @param {Object} params
 * @param {Object} params.faculty - Faculty member profile { name, id, email, dept, designation }
 * @param {Array} params.entries - Array of timesheet entry items for the month
 * @param {string} params.monthStr - Month in 'YYYY-MM' format (e.g. '2026-10')
 * @param {number} [params.totalHours] - Total hours worked in month
 */
export function downloadFacultyTimesheetPDF({ faculty, entries = [], monthStr, totalHours = 0 }) {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Format month name (e.g., "October 2026")
  let formattedMonth = monthStr;
  try {
    const [y, m] = monthStr.split('-');
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    formattedMonth = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch (e) {
    formattedMonth = monthStr;
  }

  // 1. Accent Top Stripe (Indigo / Royal Blue)
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text('QGENIX UNIVERSITY', 40, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('FACULTY WORKLOAD, ACADEMIC ACTIVITIES & TIMESHEET DOSSIER', 40, 50);

  // Document Title on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text('FACULTY MONTHLY TIMESHEET', pageWidth - 40, 38, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const printDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  doc.text(`Official Log Record • Generated: ${printDate}`, pageWidth - 40, 50, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.75);
  doc.line(40, 60, pageWidth - 40, 60);

  // 3. Faculty & Reporting Period Summary Card
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(40, 70, pageWidth - 80, 75, 6, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 70, pageWidth - 80, 75, 6, 6, 'S');

  // Column 1: Teacher Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('FACULTY MEMBER:', 55, 88);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const teacherName = faculty.name || faculty.username || 'Faculty Member';
  doc.text(teacherName, 55, 103);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const teacherId = faculty.id || faculty.institutional_id || faculty.db_id || 'FAC-N/A';
  const dept = faculty.dept || faculty.department || 'Computer Science & Engineering';
  const email = faculty.email || 'N/A';
  doc.text(`ID: ${teacherId}  |  Dept: ${dept}`, 55, 117);
  doc.text(`Email: ${email}`, 55, 130);

  // Column 2: Reporting Period & Summary
  const midX = pageWidth - 210;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('REPORTING MONTH:', midX, 88);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(79, 70, 229);
  doc.text(formattedMonth, midX, 103);

  // Calculate metrics
  const totalEntries = entries.length;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Days Logged: ${totalEntries} Days`, midX, 117);
  doc.text(`Record Type: Official Daily Work Logs`, midX, 130);

  // 4. Timesheet Table
  const tableData = entries.map((item, index) => {
    return [
      (index + 1).toString(),
      item.date || '--',
      item.day || '--',
      item.description || item.task_title || '--'
    ];
  });

  if (tableData.length === 0) {
    tableData.push(['-', 'No records', 'found', 'No timesheet work descriptions found for this selected month.']);
  }

  autoTable(doc, {
    startY: 155,
    margin: { left: 40, right: 40 },
    head: [['#', 'Date', 'Day', 'Daily Work Activity & Description']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 7,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      valign: 'top'
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 28, halign: 'center' },
      1: { cellWidth: 75, fontStyle: 'bold' },
      2: { cellWidth: 70, textColor: [71, 85, 105] },
      3: { cellWidth: 'auto', lineHeight: 1.4 }
    }
  });

  // 5. Verification Signatures Footer
  const finalY = doc.lastAutoTable?.finalY || 400;
  const footerY = Math.min(finalY + 50, pageHeight - 70);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.75);

  // Signature Line 1: Faculty Member
  doc.line(50, footerY + 25, 200, footerY + 25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('FACULTY MEMBER SIGNATURE', 50, footerY + 37);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('I hereby certify that the tasks above were duly performed.', 50, footerY + 47);

  // Signature Line 2: Head of Department / Dean
  const sigRightX = pageWidth - 200;
  doc.line(sigRightX, footerY + 25, pageWidth - 50, footerY + 25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('HEAD OF DEPARTMENT (HOD) APPROVAL', sigRightX, footerY + 37);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Reviewed & verified against official departmental schedule.', sigRightX, footerY + 47);

  // Save the PDF
  const cleanFacultyName = (faculty.name || 'Faculty').replace(/\s+/g, '_');
  const filename = `Faculty_Timesheet_${cleanFacultyName}_${monthStr}.pdf`;
  doc.save(filename);
}
