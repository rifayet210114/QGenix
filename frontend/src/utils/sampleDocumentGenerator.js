import jsPDF from 'jspdf';

/**
 * Generates an authentic academic PDF Blob URL for demo resources
 * when a physical file is not yet uploaded to server media.
 */
export function getSamplePdfBlobUrl(fileName = '', title = '') {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  if (fileName.toLowerCase().includes('thermodynamics')) {
    // Header Banner
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 55, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('QGENIX UNIVERSITY — DEPARTMENT OF PHYSICS', 40, 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('COURSE PHY-101: MECHANICS & THERMODYNAMICS | OFFICIAL LECTURE DOSSIER', 40, 42);

    // Title Section
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Chapter 4: Laws of Thermodynamics & Heat Engines', 40, 85);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Author: Faculty of Science & Engineering • Academic Session 2026-2027 • Standard Reference Text', 40, 100);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(40, 112, pageWidth - 40, 112);

    // Section 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('1. First Law of Thermodynamics: Conservation of Energy', 40, 135);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'The First Law of Thermodynamics affirms that energy cannot be created nor destroyed in an isolated system.\n' +
      'It establishes that the net change in internal energy (dU) of a closed thermodynamic system is equal to the heat\n' +
      'supplied to the system (dQ) minus the work performed by the system against its environment (dW):',
      40,
      152
    );

    // Equation Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(40, 195, pageWidth - 80, 40, 6, 6, 'FD');
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text('Delta U = Q - W   ===>   dQ = dU + P * dV', 60, 220);

    // Section 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('2. The Ideal Carnot Engine & Maximum Thermal Efficiency', 40, 260);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Nicolas Leonard Sadi Carnot formulated the theoretical upper bound on the efficiency of any classical heat engine.\n' +
      'Operating in a frictionless reversible cycle between a high-temperature reservoir (Th) and low-temperature reservoir (Tc),\n' +
      'the maximum theoretical thermal efficiency (eta_max) is solely determined by absolute thermodynamic temperatures:',
      40,
      277
    );

    // Equation Box 2
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(40, 320, pageWidth - 80, 40, 6, 6, 'FD');
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text('eta_Carnot = 1 - (T_cold / T_hot) = (W_net / Q_in)', 60, 345);

    // Section 3
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('3. Second Law of Thermodynamics & Principle of Increasing Entropy', 40, 385);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Rudolf Clausius declared that heat cannot spontaneously flow from a colder body to a hotter body without external work.\n' +
      'Consequently, in any irreversible spontaneous physical transformation, the total entropy (S) of an isolated system increases:\n' +
      '                                         Delta S_universe >= 0',
      40,
      402
    );

    // Section 4: Practice Problems
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('4. Recommended Engineering Examination Practice Problems', 40, 455);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text('• Problem 4.1: An ideal monoatomic gas expands quasi-statically from 2.0 L to 5.0 L at a constant pressure of 3.0 atm.', 45, 473);
    doc.text('   Calculate the mechanical work performed by the gas and the change in internal energy if 1200 J of heat was added.', 55, 485);
    doc.text('• Problem 4.2: A geothermal steam turbine receives saturated vapor at 520 K and discharges into a cooling pond at 300 K.', 45, 503);
    doc.text('   Determine the maximum theoretical Carnot efficiency and compare with an actual measured output of 32%.', 55, 515);
    doc.text('• Problem 4.3: Calculate the entropy change (Delta S) when 500 grams of ice at 0°C melts completely into liquid water.', 45, 533);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('QGenix Academic Study Material • Page 1 of 1 • Approved for Student Curriculum Download', 40, pageHeight - 30);
  } else {
    // General Syllabus / Course Book
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 55, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('QGENIX UNIVERSITY — ACADEMIC CURRICULUM ARCHIVE', 40, 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('COURSE SYLLABUS & INSTRUCTIONAL GUIDELINES', 40, 42);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title || fileName || 'Course Syllabus & Study Guide', 40, 85);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Credit Hours: 3.0 • Contact: 4 hrs/week • Academic Year 2026-2027', 40, 100);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(40, 112, pageWidth - 40, 112);

    // Assessment Breakdown
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Course Assessment & Grading Policy', 40, 135);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text('• Class Attendance & Active Participation: 10%', 45, 155);
    doc.text('• Homework Worksheets, Quizzes & Lab Assignments: 20%', 45, 170);
    doc.text('• Midterm Examination: 30%', 45, 185);
    doc.text('• Final Comprehensive Semester Examination: 40%', 45, 200);

    // 14-Week Schedule
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('2. 14-Week Semester Curriculum Roadmap', 40, 235);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const weeks = [
      'Weeks 1-2: Course Orientation, Fundamental Principles, Vector Analysis & Kinematics',
      'Weeks 3-4: Newton Laws of Motion, Friction Coefficients, Work, Energy & Momentum',
      'Weeks 5-6: Conservation of Energy, Rotational Motion, Torque & Moment of Inertia',
      'Weeks 7: Midterm Examination Period & Comprehensive Mid-Course Assessment',
      'Weeks 8-9: Oscillations, Simple Harmonic Motion (SHM), Wave Equations & Sound',
      'Weeks 10-11: Fluid Mechanics, Hydrostatic Pressure, Bernoulli Principle & Viscosity',
      'Weeks 12-13: Thermodynamics, Heat Transfer, Carnot Cycles & Entropy',
      'Week 14: Final Semester Review, Project Submissions & Examination Prep'
    ];
    weeks.forEach((w, idx) => {
      doc.text(`• ${w}`, 45, 255 + idx * 16);
    });

    // Reference Books
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('3. Recommended Reference Textbooks & Literature', 40, 400);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('1. Halliday, Resnick, & Walker — Fundamentals of Physics (11th Edition, Wiley)', 45, 418);
    doc.text('2. Hugh D. Young & Roger A. Freedman — University Physics with Modern Physics (Pearson)', 45, 434);
    doc.text('3. Raymond A. Serway & John W. Jewett — Physics for Scientists and Engineers (Cengage)', 45, 450);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('QGenix Academic Study Material • Official Institutional Document', 40, pageHeight - 30);
  }

  return doc.output('bloburl');
}
