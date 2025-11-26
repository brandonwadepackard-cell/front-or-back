import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface ContentItem {
  id: string;
  topic: string;
  platform: string;
  status: string;
  content: string;
  created_at: string;
  scheduled_at?: string;
}

interface AnalyticsData {
  totalContent: number;
  scheduled: number;
  published: number;
  draft: number;
  platformData: Array<{ name: string; value: number }>;
  trendData: Array<{ date: string; content: number }>;
}

/**
 * Export content data to CSV format
 */
export const exportToCSV = (data: ContentItem[], filename: string = "content-export") => {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  // Define CSV headers
  const headers = ["Topic", "Platform", "Status", "Content", "Created At", "Scheduled At"];
  
  // Convert data to CSV rows
  const csvRows = [
    headers.join(","),
    ...data.map((item) =>
      [
        `"${item.topic.replace(/"/g, '""')}"`,
        item.platform,
        item.status,
        `"${item.content.replace(/"/g, '""')}"`,
        format(new Date(item.created_at), "yyyy-MM-dd HH:mm"),
        item.scheduled_at ? format(new Date(item.scheduled_at), "yyyy-MM-dd HH:mm") : "",
      ].join(",")
    ),
  ];

  // Create blob and download
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export content data to PDF format
 */
export const exportContentToPDF = (data: ContentItem[], filename: string = "content-export") => {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("Content Export Report", 14, 20);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated: ${format(new Date(), "MMMM dd, yyyy HH:mm")}`, 14, 28);
  
  // Prepare table data
  const tableData = data.map((item) => [
    item.topic,
    item.platform,
    item.status,
    item.content.substring(0, 50) + (item.content.length > 50 ? "..." : ""),
    format(new Date(item.created_at), "MMM dd, yyyy"),
    item.scheduled_at ? format(new Date(item.scheduled_at), "MMM dd, yyyy") : "-",
  ]);

  // Add table
  autoTable(doc, {
    head: [["Topic", "Platform", "Status", "Content Preview", "Created", "Scheduled"]],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      3: { cellWidth: 50 }, // Content preview column
    },
  });

  // Save the PDF
  doc.save(`${filename}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

/**
 * Export analytics data to PDF format
 */
export const exportAnalyticsToPDF = (
  data: AnalyticsData,
  filename: string = "analytics-export"
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text("Analytics Report", 14, 20);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated: ${format(new Date(), "MMMM dd, yyyy HH:mm")}`, 14, 28);
  
  // Add summary statistics
  doc.setFontSize(14);
  doc.text("Summary Statistics", 14, 40);
  doc.setFontSize(11);
  doc.text(`Total Content: ${data.totalContent}`, 20, 48);
  doc.text(`Scheduled: ${data.scheduled}`, 20, 55);
  doc.text(`Published: ${data.published}`, 20, 62);
  doc.text(`Drafts: ${data.draft}`, 20, 69);
  
  // Platform Distribution
  doc.setFontSize(14);
  doc.text("Platform Distribution", 14, 82);
  
  const platformTableData = data.platformData.map((item) => [
    item.name,
    item.value.toString(),
    `${((item.value / data.totalContent) * 100).toFixed(1)}%`,
  ]);

  autoTable(doc, {
    head: [["Platform", "Count", "Percentage"]],
    body: platformTableData,
    startY: 88,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  // Content Trend (last 7 days)
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  doc.setFontSize(14);
  doc.text("7-Day Content Trend", 14, finalY + 12);
  
  const trendTableData = data.trendData.map((item) => [
    item.date,
    item.content.toString(),
  ]);

  autoTable(doc, {
    head: [["Date", "Content Created"]],
    body: trendTableData,
    startY: finalY + 18,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  // Save the PDF
  doc.save(`${filename}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

/**
 * Export analytics data to CSV format
 */
export const exportAnalyticsToCSV = (
  data: AnalyticsData,
  filename: string = "analytics-export"
) => {
  // Summary section
  const summaryRows = [
    ["Analytics Summary"],
    ["Generated", format(new Date(), "yyyy-MM-dd HH:mm")],
    [""],
    ["Metric", "Value"],
    ["Total Content", data.totalContent.toString()],
    ["Scheduled", data.scheduled.toString()],
    ["Published", data.published.toString()],
    ["Drafts", data.draft.toString()],
    [""],
    ["Platform Distribution"],
    ["Platform", "Count", "Percentage"],
    ...data.platformData.map((item) => [
      item.name,
      item.value.toString(),
      `${((item.value / data.totalContent) * 100).toFixed(1)}%`,
    ]),
    [""],
    ["7-Day Content Trend"],
    ["Date", "Content Created"],
    ...data.trendData.map((item) => [item.date, item.content.toString()]),
  ];

  // Convert to CSV
  const csvContent = summaryRows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
