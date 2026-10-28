import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a clean, professional PDF report of a faculty member's
 * monthly biometric check-in and check-out logs.
 *
 * @param {Object} params
 * @param {Object} params.faculty - Faculty member profile { name, id, email, dept, designation }
 * @param {Array} params.logs - Array of biometric log items for the month
 * @param {string} params.monthStr - Month in 'YYYY-MM' format (e.g. '2026-10')
 * @param {string} [params.avgCheckIn] - Average check-in time string
 * @param {string} [params.avgCheckOut] - Average check-out time string
 */
export function downloadFacultyAttendancePDF({ faculty, logs = [], monthStr, avgCheckIn = '--:--', avgCheckOut = '--:--' }) {
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

  // 1. Accent Top Stripe
  doc.setFillColor(59, 130, 246); // Royal Blue accent
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text('QGENIX UNIVERSITY', 40, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('OFFICE OF ACADEMIC AFFAIRS & FACULTY HUMAN RESOURCE MANAGEMENT', 40, 50);

  // Document Title on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text('MONTHLY ATTENDANCE DOSSIER', pageWidth - 40, 38, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const printDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  doc.text(`Official Academic Record • Issued: ${printDate}`, pageWidth - 40, 50, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.75);
  doc.line(40, 60, pageWidth - 40, 60);

  // 3. Faculty & Reporting Period Card
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
  doc.text(faculty.name || 'Faculty Member', 55, 103);

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
  doc.setTextColor(37, 99, 235);
  doc.text(formattedMonth, midX, 103);

  // Calculate metrics
  const totalSessions = logs.length;
  const onTimeCount = logs.filter(l => (l.status || '').toLowerCase().includes('on time') || (l.status || '').toLowerCase().includes('present')).length;
  const lateCount = logs.filter(l => (l.status || '').toLowerCase().includes('late') || (l.status || '').toLowerCase().includes('grace')).length;
  const overtimeCount = logs.filter(l => (l.status || '').toLowerCase().includes('overtime')).length;
  const halfDayCount = logs.filter(l => (l.status || '').toLowerCase().includes('half')).length;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Sessions: ${totalSessions}  |  On Time: ${onTimeCount}  |  Late: ${lateCount}  |  OT: ${overtimeCount}  |  Half Day: ${halfDayCount}`, midX, 117);
  doc.text(`Avg Check-In: ${avgCheckIn}  |  Avg Check-Out: ${avgCheckOut}`, midX, 130);

  // 4. Biometric Table
  const tableData = logs.map((log, index) => {
    return [
      (index + 1).toString(),
      log.date || '--',
      log.day || '--',
      log.checkIn || '--',
      log.checkOut || '--',
      log.duration || '--',
      log.status || 'Present'
    ];
  });

  if (tableData.length === 0) {
    tableData.push(['-', 'No records', 'found for', 'selected', 'month', 'period', 'None']);
  }

  autoTable(doc, {
    startY: 155,
    margin: { left: 40, right: 40 },
    head: [['#', 'Date', 'Day', 'Check-In', 'Check-Out', 'Duration', 'Punctuality Status']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 26, halign: 'center' },
      1: { cellWidth: 80, fontStyle: 'bold' },
      2: { cellWidth: 80 },
      3: { cellWidth: 80, textColor: [16, 185, 129], fontStyle: 'bold' },
      4: { cellWidth: 80, textColor: [37, 99, 235], fontStyle: 'bold' },
      5: { cellWidth: 80 },
      6: { cellWidth: 'auto', halign: 'center' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const val = (data.cell.raw || '').toLowerCase();
        if (val.includes('late') || val.includes('grace')) {
          data.cell.styles.textColor = [217, 119, 6]; // Amber-600
          data.cell.styles.fontStyle = 'bold';
        } else if (val.includes('absent')) {
          data.cell.styles.textColor = [220, 38, 38]; // Red-600
          data.cell.styles.fontStyle = 'bold';
        } else if (val.includes('half')) {
          data.cell.styles.textColor = [124, 58, 237]; // Purple-600
          data.cell.styles.fontStyle = 'bold';
        } else if (val.includes('overtime')) {
          data.cell.styles.textColor = [2, 132, 199]; // Sky/Cyan-600
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald-600
        }
      }
    }
  });

  // 5. Verification Footer
  const finalY = doc.lastAutoTable?.finalY || 400;
  const footerY = Math.min(finalY + 50, pageHeight - 70);

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(40, footerY + 25, 180, footerY + 25);
  doc.line(pageWidth - 180, footerY + 25, pageWidth - 40, footerY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Faculty Signature / Verification', 40, footerY + 36);
  doc.text('Director of Academic Affairs & HR', pageWidth - 180, footerY + 36);

  // Bottom Notice
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is an official computer-generated document from QGenix ERP Attendance System. No physical signature is required for electronic validation.', 40, pageHeight - 20);

  // Save PDF
  const cleanName = (faculty.name || 'Faculty').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Attendance_Report_${cleanName}_${monthStr}.pdf`;
  doc.save(fileName);
}
