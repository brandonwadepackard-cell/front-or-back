import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ScrapeResult {
  id: string;
  job_id: string;
  url: string;
  title: string | null;
  text_content: string | null;
  screenshot_path: string | null;
  prices: any[];
  contacts: any[];
  ai_summary: string | null;
  ai_sentiment: string | null;
  scraped_at: string;
}

interface ScrapeJob {
  id: string;
  name: string | null;
  query: string;
  status: string;
  sources: string[];
  extract_prices: boolean;
  extract_contacts: boolean;
  created_at: string;
}

export const exportToCSV = (results: ScrapeResult[], job: ScrapeJob) => {
  const csvRows: string[] = [];
  
  // Header
  csvRows.push([
    'Title',
    'URL',
    'Prices Found',
    'Contacts Found',
    'AI Summary',
    'Sentiment',
    'Scraped At'
  ].join(','));

  // Data rows
  results.forEach(result => {
    const row = [
      `"${(result.title || 'Untitled').replace(/"/g, '""')}"`,
      `"${result.url.replace(/"/g, '""')}"`,
      result.prices?.length || 0,
      result.contacts?.length || 0,
      `"${(result.ai_summary || '').replace(/"/g, '""')}"`,
      `"${result.ai_sentiment || ''}"`,
      new Date(result.scraped_at).toLocaleString()
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `scrape-results-${job.name || job.query}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (results: ScrapeResult[], job: ScrapeJob, priceHistory?: any[]) => {
  const exportData = {
    job: {
      name: job.name,
      query: job.query,
      status: job.status,
      sources: job.sources,
      created_at: job.created_at
    },
    results: results.map(result => ({
      title: result.title,
      url: result.url,
      prices: result.prices,
      contacts: result.contacts,
      ai_summary: result.ai_summary,
      ai_sentiment: result.ai_sentiment,
      scraped_at: result.scraped_at,
      text_content_preview: result.text_content?.slice(0, 500)
    })),
    price_history: priceHistory || [],
    exported_at: new Date().toISOString()
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `scrape-results-${job.name || job.query}-${Date.now()}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (results: ScrapeResult[], job: ScrapeJob, priceHistory?: any[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Web Scraper Results', 14, 20);
  
  // Job Info
  doc.setFontSize(12);
  doc.text(`Job: ${job.name || job.query}`, 14, 30);
  doc.setFontSize(10);
  doc.text(`Query: ${job.query}`, 14, 37);
  doc.text(`Status: ${job.status}`, 14, 43);
  doc.text(`Created: ${new Date(job.created_at).toLocaleString()}`, 14, 49);
  doc.text(`Total Results: ${results.length}`, 14, 55);

  let yPosition = 65;

  // Price History Table (if available)
  if (priceHistory && priceHistory.length > 0) {
    doc.setFontSize(14);
    doc.text('Price History', 14, yPosition);
    yPosition += 5;

    const priceData = priceHistory.map(ph => [
      ph.product_name || 'Product',
      `${ph.currency} ${ph.price.toFixed(2)}`,
      new Date(ph.recorded_at).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Product', 'Price', 'Date']],
      body: priceData,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Results Table
  doc.setFontSize(14);
  doc.text('Scrape Results', 14, yPosition);
  yPosition += 5;

  const resultsData = results.map(result => [
    result.title || 'Untitled',
    result.url.length > 40 ? result.url.slice(0, 40) + '...' : result.url,
    result.prices?.length || 0,
    result.contacts?.length || 0,
    result.ai_sentiment || '-'
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Title', 'URL', 'Prices', 'Contacts', 'Sentiment']],
    body: resultsData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    margin: { left: 14, right: 14 },
    columnStyles: {
      1: { cellWidth: 60 }
    }
  });

  // Add details for each result on new pages
  results.forEach((result, index) => {
    doc.addPage();
    doc.setFontSize(16);
    doc.text(`Result ${index + 1}: ${result.title || 'Untitled'}`, 14, 20);
    
    doc.setFontSize(10);
    let detailY = 30;
    
    doc.text('URL:', 14, detailY);
    doc.setFontSize(9);
    const urlLines = doc.splitTextToSize(result.url, 180);
    doc.text(urlLines, 14, detailY + 5);
    detailY += 5 + (urlLines.length * 5);
    
    if (result.ai_summary) {
      doc.setFontSize(10);
      detailY += 5;
      doc.text('AI Summary:', 14, detailY);
      doc.setFontSize(9);
      const summaryLines = doc.splitTextToSize(result.ai_summary, 180);
      doc.text(summaryLines, 14, detailY + 5);
      detailY += 5 + (summaryLines.length * 5);
    }

    // Prices
    if (result.prices && result.prices.length > 0) {
      detailY += 5;
      doc.setFontSize(10);
      doc.text(`Prices Found (${result.prices.length}):`, 14, detailY);
      detailY += 5;
      
      const priceTableData = result.prices.slice(0, 10).map((p: any) => [
        p.label || 'Product',
        `${p.currency} ${p.amount}`
      ]);
      
      autoTable(doc, {
        startY: detailY,
        head: [['Product', 'Price']],
        body: priceTableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] },
        margin: { left: 14, right: 14 }
      });
      
      detailY = (doc as any).lastAutoTable.finalY + 5;
    }

    // Contacts
    if (result.contacts && result.contacts.length > 0) {
      detailY += 5;
      doc.setFontSize(10);
      doc.text(`Contacts Found (${result.contacts.length}):`, 14, detailY);
      detailY += 5;
      
      result.contacts.slice(0, 5).forEach((contact: any) => {
        doc.setFontSize(9);
        if (contact.name) {
          doc.text(`Name: ${contact.name}`, 20, detailY);
          detailY += 5;
        }
        if (contact.email) {
          doc.text(`Email: ${contact.email}`, 20, detailY);
          detailY += 5;
        }
        if (contact.phone) {
          doc.text(`Phone: ${contact.phone}`, 20, detailY);
          detailY += 5;
        }
        detailY += 3;
      });
    }
  });

  // Save
  doc.save(`scrape-results-${job.name || job.query}-${Date.now()}.pdf`);
};
