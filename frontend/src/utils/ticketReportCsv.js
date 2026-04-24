function safeValue(value) {
  if (value == null) return "";
  return String(value);
}

function formatDateTime(value) {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return safeValue(value);
    return date.toISOString();
  } catch {
    return safeValue(value);
  }
}

function csvCell(value) {
  const raw = safeValue(value);
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

function attachmentCount(ticket) {
  return Array.isArray(ticket?.attachments) ? ticket.attachments.length : 0;
}

export function downloadTicketsCsv(tickets) {
  const rows = Array.isArray(tickets) ? tickets : [];
  const headers = [
    "Ticket ID",
    "Title",
    "Category",
    "Priority",
    "Status",
    "Created By",
    "Assigned To",
    "Location",
    "Contact Email",
    "Contact Phone",
    "Created At",
    "Updated At",
    "Archived",
    "Hidden From Creator",
    "Resolution Note",
    "Rejection Reason",
    "Attachment Count",
  ];

  const lines = [headers.map(csvCell).join(",")];

  rows.forEach((ticket) => {
    const line = [
      ticket?.id,
      ticket?.title,
      ticket?.category,
      ticket?.priority,
      ticket?.status,
      ticket?.createdBy,
      ticket?.assignedTo || "",
      ticket?.location,
      ticket?.contactEmail,
      ticket?.contactPhone,
      formatDateTime(ticket?.createdAt),
      formatDateTime(ticket?.updatedAt),
      ticket?.isArchived ? "Yes" : "No",
      ticket?.deletedByStudent ? "Yes" : "No",
      ticket?.resolutionNote || "",
      ticket?.rejectionReason || "",
      attachmentCount(ticket),
    ];
    lines.push(line.map(csvCell).join(","));
  });

  const csvContent = `\uFEFF${lines.join("\n")}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `unisphere-ticket-register-${timestamp}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
