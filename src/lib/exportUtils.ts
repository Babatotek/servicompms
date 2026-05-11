import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = async (elementId: string, fileName: string) => {
  // Build a structured data PDF instead of screenshotting the DOM,
  // which is unreliable with Tailwind CSS, custom fonts, and SVG charts.
  const doc = new jsPDF();

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('SERVICOM ePMS — Performance Analytics Report', 14, 20);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 32, 196, 32);

  // ── Score Summary ────────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Performance Summary', 14, 42);

  autoTable(doc, {
    startY: 47,
    head: [['Metric', 'Value']],
    body: [
      ['Annual Average Score', '84.2%'],
      ['Score Projection', 'Excellent'],
      ['Growth Rate (YoY)', '+12.4%'],
      ['Competency Gap', '-4.2%'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 9 },
  });

  // ── Score Trajectory ─────────────────────────────────────────────────────
  const afterSummary = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('Quarterly Score Trajectory', 14, afterSummary);

  autoTable(doc, {
    startY: afterSummary + 5,
    head: [['Period', 'Score (%)']],
    body: [
      ['Q1 2025', '72'],
      ['Q2 2025', '78'],
      ['Q3 2025', '75'],
      ['Q4 2025', '85'],
      ['Q1 2026', '88'],
      ['Q2 2026', '89'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 9 },
  });

  // ── KRA Breakdown ────────────────────────────────────────────────────────
  const afterTrajectory = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('KRA Achievement Breakdown', 14, afterTrajectory);

  autoTable(doc, {
    startY: afterTrajectory + 5,
    head: [['Result Area', 'Score (%)', 'Weight (%)']],
    body: [
      ['Governance & Service Delivery', '92', '10'],
      ['Financial Management', '85', '50'],
      ['Service Innovation', '78', '15'],
      ['Automated Service Delivery', '88', '15'],
      ['Capacity Building', '95', '10'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 9 },
  });

  // ── Footer ───────────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `SERVICOM ePMS — Confidential | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  doc.save(`${fileName}.pdf`);
};

export const generateAppraisalPDF = (data: any, fileName: string = 'Appraisal_Report') => {
  const doc = new jsPDF() as any;
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('SERVICOM PERFORMANCE APPRAISAL REPORT', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
  
  // User Info Section
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 35, 196, 35);
  
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Employee Information', 14, 45);
  
  const userInfo = [
    ['Name', data.userName || data.name || 'N/A'],
    ['IPPIS No.', data.ippisNo || data.ippis || 'N/A'],
    ['Department', data.department || 'N/A'],
    ['Designation', data.designation || 'N/A'],
    ['Period', data.period || 'N/A']
  ];
  
  autoTable(doc, {
    startY: 50,
    head: [],
    body: userInfo,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
  });
  
  // Summary Scores
  const lastY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('Performance Summary', 14, lastY);
  
  const scoreSummary = [
    ['Section 4: Key Tasks (70%)', `${data.kpiScore || data.score || 0}%`],
    ['Section 5: Competencies (20%)', `${data.competencyScore || 0}%`],
    ['Section 6: Operations (10%)', `${data.opsScore || 0}%`],
    ['Final Composite Score', `${data.totalScore || data.score || 0}%`],
    ['Projected Grade', data.grade || 'N/A']
  ];
  
  autoTable(doc, {
    startY: lastY + 5,
    head: [['Section', 'Score / 100%']],
    body: scoreSummary,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // indigo-600
    styles: { fontSize: 9 }
  });
  
  doc.save(`${fileName}.pdf`);
};
