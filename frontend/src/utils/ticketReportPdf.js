import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy:       [10,  25,  70],
  brand:      [30,  64,  175],
  brandMid:   [37,  99,  235],
  brandLight: [59,  130, 246],
  white:      [255, 255, 255],
  nearBlack:  [10,  10,  20],
  rowAlt:     [245, 248, 255],
  border:     [180, 190, 210],
  mutedText:  [80,  90,  110],
  green100: [209, 250, 229], green900: [6,   78,  59],
  red100:   [254, 202, 202], red900:   [127, 29,  29],
  amber100: [254, 243, 199], amber900: [120, 53,  15],
  blue100:  [219, 234, 254], blue900:  [30,  64,  175],
  gray100:  [229, 231, 235], gray700:  [55,  65,  81],
  orange100:[255, 237, 213], orange800:[154, 52,  18],
  indigo100:[224, 231, 255], indigo700:[67,  56,  202],
};

function trunc(value, max) {
  if (value == null || value === "") return "—";
  const s = String(value);
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

function formatDateShort(value) {
  if (value == null) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch { return "—"; }
}

function pageDims(doc) {
  const ps = doc.internal.pageSize;
  return {
    w: typeof ps.getWidth  === "function" ? ps.getWidth()  : ps.width,
    h: typeof ps.getHeight === "function" ? ps.getHeight() : ps.height,
  };
}

function styleStatusCell(styles, status) {
  switch (String(status || "")) {
    case "REJECTED":    styles.fillColor = C.red100;   styles.textColor = C.red900;   break;
    case "RESOLVED":    styles.fillColor = C.green100; styles.textColor = C.green900; break;
    case "CLOSED":      styles.fillColor = C.gray100;  styles.textColor = C.gray700;  break;
    case "OPEN":        styles.fillColor = C.blue100;  styles.textColor = C.blue900;  break;
    case "IN_PROGRESS": styles.fillColor = C.amber100; styles.textColor = C.amber900; break;
    default:            styles.fillColor = C.white;    styles.textColor = C.nearBlack; styles.fontStyle = "normal"; return;
  }
  styles.fontStyle = "bold";
}

function stylePriorityCell(styles, priority) {
  switch (String(priority || "")) {
    case "URGENT": styles.fillColor = C.red100;    styles.textColor = C.red900;    break;
    case "HIGH":   styles.fillColor = C.orange100; styles.textColor = C.orange800; break;
    case "MEDIUM": styles.fillColor = C.amber100;  styles.textColor = C.amber900;  break;
    case "LOW":    styles.fillColor = C.gray100;   styles.textColor = C.gray700;   break;
    default:       styles.fillColor = C.white;     styles.textColor = C.nearBlack;
  }
  styles.fontStyle = "bold";
}

function drawPageHeader(doc, pageW, subtitle) {
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, pageW, 18, "F");
  doc.setFillColor(...C.brandLight);
  doc.rect(0, 18, pageW, 1.5, "F");
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("UniSphere", 10, 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 240);
  doc.text("Ticket & Maintenance Register  ·  " + subtitle, 10, 14.5);
}

function drawPageFooter(doc, pageW, pageH, pageNumber, totalTickets, margin) {
  const footY = pageH - 5;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(margin, footY - 4, pageW - margin, footY - 4);
  doc.setFontSize(7.5);
  doc.setTextColor(...C.mutedText);
  doc.setFont("helvetica", "normal");
  doc.text("UniSphere  ·  SLIIT IT3030  ·  Confidential  ·  " + totalTickets + " ticket(s) total", margin, footY - 1);
  const pageStr = "Page " + pageNumber;
  const tw = doc.getTextWidth(pageStr);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.brand);
  doc.text(pageStr, pageW - margin - tw, footY - 1);
}

function drawCoverPage(doc, list, generatedAt) {
  const { w, h } = pageDims(doc);
  const m = 16;

  doc.setFillColor(248, 250, 253);
  doc.rect(0, 0, w, h, "F");
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, w, 44, "F");
  doc.setFillColor(...C.brandLight);
  doc.rect(0, 44, w, 2, "F");

  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("UniSphere", m, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(180, 205, 245);
  doc.text("Smart Campus Operations Platform", m, 31);
  doc.setFontSize(9);
  doc.setTextColor(140, 170, 215);
  doc.text("SLIIT IT3030", m, 39.5);

  const ty = 56;
  doc.setTextColor(...C.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Ticket & Maintenance Register", m, ty);
  doc.setDrawColor(...C.brandMid);
  doc.setLineWidth(1);
  doc.line(m, ty + 3, w - m, ty + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.mutedText);
  doc.text("Report generated: " + generatedAt, m, ty + 12);
  doc.text("This document is confidential and intended for authorised administrators only.", m, ty + 20);

  const statuses = [
    { label: "Total",       value: list.length,                                         fill: C.brand,    text: C.white    },
    { label: "Open",        value: list.filter(t => t.status === "OPEN").length,        fill: C.blue100,  text: C.blue900  },
    { label: "In Progress", value: list.filter(t => t.status === "IN_PROGRESS").length, fill: C.amber100, text: C.amber900 },
    { label: "Resolved",    value: list.filter(t => t.status === "RESOLVED").length,    fill: C.green100, text: C.green900 },
    { label: "Rejected",    value: list.filter(t => t.status === "REJECTED").length,    fill: C.red100,   text: C.red900   },
    { label: "Closed",      value: list.filter(t => t.status === "CLOSED").length,      fill: C.gray100,  text: C.gray700  },
    { label: "Archived",    value: list.filter(t => t.isArchived).length,               fill: C.orange100,text: C.orange800},
  ];

  const cardY = ty + 30;
  const gutter = 5;
  const cardW = (w - m * 2 - gutter * (statuses.length - 1)) / statuses.length;
  const cardH = 34;

  statuses.forEach(({ label, value, fill, text }, i) => {
    const cx = m + i * (cardW + gutter);
    doc.setFillColor(...fill);
    doc.roundedRect(cx, cardY, cardW, cardH, 2.5, 2.5, "F");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(cx, cardY, cardW, cardH, 2.5, 2.5, "S");
    doc.setTextColor(...text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(String(value), cx + cardW / 2, cardY + 17, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(label.toUpperCase(), cx + cardW / 2, cardY + 25, { align: "center" });
  });

  const priY = cardY + cardH + 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.navy);
  doc.text("Priority Breakdown", m, priY);

  const priorities = [
    { label: "URGENT", fill: C.red100,    text: C.red900    },
    { label: "HIGH",   fill: C.orange100, text: C.orange800 },
    { label: "MEDIUM", fill: C.amber100,  text: C.amber900  },
    { label: "LOW",    fill: C.gray100,   text: C.gray700   },
  ];
  const priCardW = 52, priCardH = 22, priGap = 8;
  let px = m;
  priorities.forEach(({ label, fill, text }) => {
    const cnt = list.filter(t => t.priority === label).length;
    doc.setFillColor(...fill);
    doc.roundedRect(px, priY + 5, priCardW, priCardH, 2, 2, "F");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(px, priY + 5, priCardW, priCardH, 2, 2, "S");
    doc.setTextColor(...text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(String(cnt), px + priCardW / 2, priY + 16, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(label, px + priCardW / 2, priY + 23, { align: "center" });
    px += priCardW + priGap;
  });

  const noteY = priY + priCardH + 22;
  doc.setFillColor(...C.navy);
  doc.roundedRect(m, noteY, w - m * 2, 20, 3, 3, "F");
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Report contains:", m + 10, noteY + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(180, 210, 250);
  doc.text("Ticket ID · Title · Category · Priority · Status · Assigned to · Location · Created date", m + 10, noteY + 16);

  doc.setFontSize(7.5);
  doc.setTextColor(...C.mutedText);
  doc.text("UniSphere  ·  SLIIT IT3030  ·  Confidential  ·  " + list.length + " ticket(s)", w / 2, h - 8, { align: "center" });
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function generateTicketsPdfDownload(tickets) {
  const list = Array.isArray(tickets) ? tickets : [];
  const generatedAt = new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // A4 landscape = 297mm. Margins 10mm each side = 277mm usable.
  // Column widths: 20+80+28+24+26+48+36+15 = 277 exactly.
  const MARGIN = 10;
  const TABLE_WIDTH = 277;

  drawCoverPage(doc, list, generatedAt);

  if (list.length === 0) {
    const { w } = pageDims(doc);
    doc.addPage();
    drawPageHeader(doc, w, "No Data");
    doc.setTextColor(...C.mutedText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("No tickets were returned for this export.", MARGIN, 40);
    const safeDate = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    doc.save("unisphere-ticket-register-" + safeDate + ".pdf");
    return;
  }

  doc.addPage();
  const { w: pageW, h: pageH } = pageDims(doc);
  drawPageHeader(doc, pageW, "Summary Index");

  const cols = [
    { header: "Ticket ID",   dataKey: "id"         },
    { header: "Title",       dataKey: "title"       },
    { header: "Category",    dataKey: "category"    },
    { header: "Priority",    dataKey: "priority"    },
    { header: "Status",      dataKey: "status"      },
    { header: "Assigned to", dataKey: "assignedTo"  },
    { header: "Location",    dataKey: "location"    },
    { header: "Created",     dataKey: "createdAt"   },
  ];

  const body = list.map((t) => ({
    id:         trunc(t.id, 14),
    title:      trunc(t.title      ?? "—", 58),
    category:   trunc(t.category   ?? "—", 16),
    priority:   t.priority ?? "—",
    status:     t.status   ?? "—",
    assignedTo: trunc(t.assignedTo || "—", 34),
    location:   trunc(t.location   ?? "—", 24),
    createdAt:  formatDateShort(t.createdAt),
  }));

  autoTable(doc, {
    startY:     22,
    margin:     { left: MARGIN, right: MARGIN, top: 22, bottom: 16 },
    tableWidth: TABLE_WIDTH,
    columns:    cols,
    body,
    theme:      "grid",

    styles: {
      font:          "helvetica",
      fontSize:      8.5,
      cellPadding:   { top: 3.5, right: 4, bottom: 3.5, left: 4 },
      textColor:     C.nearBlack,
      lineColor:     C.border,
      lineWidth:     0.2,
      overflow:      "ellipsize",
      minCellHeight: 11,
    },

    headStyles: {
      fillColor:   C.brand,
      textColor:   C.white,
      fontStyle:   "bold",
      halign:      "center",
      fontSize:    8.5,
      cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
    },

    alternateRowStyles: { fillColor: C.rowAlt },
    showHead:          "everyPage",
    tableLineColor:    C.border,
    tableLineWidth:    0.15,

    columnStyles: {
      id:         { cellWidth: 20,  halign: "center", fontStyle: "bold" },
      title:      { cellWidth: 80  },
      category:   { cellWidth: 28,  halign: "center" },
      priority:   { cellWidth: 24,  halign: "center" },
      status:     { cellWidth: 26,  halign: "center" },
      assignedTo: { cellWidth: 48  },
      location:   { cellWidth: 36  },
      createdAt:  { cellWidth: 15,  halign: "center" },
    },

    didParseCell: (data) => {
      if (data.section !== "body") return;
      if (data.column.dataKey === "status")   styleStatusCell(data.cell.styles, data.cell.raw);
      if (data.column.dataKey === "priority") stylePriorityCell(data.cell.styles, data.cell.raw);
    },

    didDrawPage: (data) => {
      const { w: pw, h: ph } = pageDims(data.doc);
      if (data.pageNumber > 1) drawPageHeader(data.doc, pw, "Summary Index (cont.)");
      drawPageFooter(data.doc, pw, ph, data.pageNumber, list.length, MARGIN);
    },
  });

  const safeDate = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  doc.save("unisphere-ticket-register-" + safeDate + ".pdf");
}