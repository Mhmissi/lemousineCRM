 import jsPDF from 'jspdf';

// Company information
const COMPANY_INFO = {
  name: 'LIMOSTAR',
  tagline: 'Just luxury cars',
  address: '65, Avenue Louise, 1050 Brussels, Belgium',
  vat: 'BE0888881670',
  iban: 'BE94363017450B614',
  bic: 'BBRUBEBB',
  phone: '+3225129701',
  email: 'info@limostar.be',
  website: 'www.limostar.be'
};

// Legal terms
const LEGAL_TERMS = [
  'Toutes nos factures sont payables au grand comptant.',
  'Les montants dus devant être virés en euro sur notre compte bancaire de Limostar scs, en mentionnant le numéro de la facture.',
  'En cas de paiement tardif, les sommes dues seront augmentées, de plein droit et sans mise en demeure préalable, d\'un intérêt de retard correspondant au taux légal. En outre, une indemnité forfaitaire égal à 15% du montant de la facture, avec un minimum de 40 euros, sera due.',
  'En cas de non-paiement à l\'échéance, une indemnité égale à 15% du montant dû sera réclamée pour frais administratifs.',
  'Toutes contestation relative à la facture doit parvenir par courrier recommandé à Limostar scs., Avenue LOUISE 65 BE-1050 Bruxelles, dans les 8 jours qui suivent l\'envoi dudit document, faute de quoi la contestation ne pourra en aucun cas être prise en considération. La date de la poste faisant foi.',
  'En cas de contestation persistante, les tribunaux de Bruxelles sont compétents.'
];

export function generateInvoicePDF(invoiceData) {
  try {
    console.log('Creating new PDF document...');
  const doc = new jsPDF();
    console.log('PDF document created');
    
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
    const rightMargin = 30; // Increased right margin
  let yPosition = margin;

    console.log('Page dimensions:', { pageWidth, pageHeight, margin, rightMargin });

  // Helper function to add text with formatting
  const addText = (text, x, y, options = {}) => {
    const { 
      fontSize = 10, 
      fontStyle = 'normal', 
      color = [0, 0, 0], 
      maxWidth = pageWidth - margin - rightMargin,
      align = 'left'
    } = options;
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, { align });
    return y + (lines.length * fontSize * 0.4);
  };

  // Helper function to draw line
  const drawLine = (x1, y1, x2, y2, options = {}) => {
    const { color = [0, 0, 0], width = 0.5 } = options;
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
    doc.setLineWidth(0.5);
  };

  // Helper function to add rectangle
  const addRect = (x, y, width, height, options = {}) => {
    const { fill = false, fillColor = [240, 240, 240], stroke = true, strokeColor = [0, 0, 0] } = options;
    
    if (fill) {
      doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    }
    if (stroke) {
      doc.setDrawColor(strokeColor[0], strokeColor[1], strokeColor[2]);
    }
    
    const style = fill ? (stroke ? 'FD' : 'F') : (stroke ? 'D' : '');
    doc.rect(x, y, width, height, style);
  };

  // ===== HEADER SECTION =====
  // Top border line
  drawLine(margin, yPosition - 5, pageWidth - rightMargin, yPosition - 5, { width: 1 });
  
  // Company logo (left side)
  const headerY = yPosition + 5;
  const logoWidth = 35;
  const logoHeight = 17;
  
  try {
    // Add the logo image
    doc.addImage('/logo.png', 'PNG', margin, headerY, logoWidth, logoHeight);
    yPosition = headerY + logoHeight + 5;
  } catch (error) {
    console.log('Logo not found, using text fallback:', error);
    // Fallback to text if logo is not found
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(COMPANY_INFO.name, margin, headerY);
  
  doc.setFontSize(13);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  yPosition = addText(COMPANY_INFO.tagline, margin, headerY + 8, { fontSize: 13 });
  }

  // Invoice details box (right side)
  const invoiceBoxWidth = 80;
  const invoiceBoxX = pageWidth - rightMargin - invoiceBoxWidth;
  const invoiceBoxHeight = 26;
  
  // Invoice box with grey background
  addRect(invoiceBoxX, headerY - 5, invoiceBoxWidth, invoiceBoxHeight, { 
    fill: true, 
    fillColor: [200, 200, 200],
    strokeColor: [150, 150, 150]
  });
  
  // Invoice number - "Facture N°" and number on same line
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`Facture N° : ${invoiceData.invoiceNumber || 'FC-0000'}`, invoiceBoxX + 5, headerY + 5);
  
  // Invoice details table - Three boxes as in model
  const details = [
    ['PAGE', invoiceData.page || '1'],
    ['DATE', invoiceData.date || new Date().toISOString().split('T')[0]],
    ['CLIENT', invoiceData.clientCode || 'CL1595']
  ];
  
  let detailY = headerY + 10;
  details.forEach(([label, value]) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(`${label}`, invoiceBoxX + 5, detailY);
    doc.text(value, invoiceBoxX + 30, detailY);
    detailY += 4;
  });

  yPosition = Math.max(yPosition, headerY + invoiceBoxHeight + 3);

  // ===== COMPANY & CLIENT INFORMATION SECTION =====
  yPosition += 5;
  
  // Section separator line
  drawLine(margin, yPosition - 3, pageWidth - rightMargin, yPosition - 3, { color: [200, 200, 200] });
  
  // Company information (left) - Better formatting
  const companySectionY = yPosition + 3;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(COMPANY_INFO.name, margin, companySectionY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  let companyY = addText('65, Avenue Louise', margin, companySectionY + 5, { fontSize: 10 });
  companyY = addText('1050 Brussels', margin, companyY + 2, { fontSize: 10 });
  companyY = addText('Belgium', margin, companyY + 2, { fontSize: 10 });
  companyY = addText(`TVA: ${COMPANY_INFO.vat}`, margin, companyY + 3, { fontSize: 10 });
  companyY = addText(`IBAN: ${COMPANY_INFO.iban}`, margin, companyY + 2, { fontSize: 10 });
  companyY = addText(`BIC: ${COMPANY_INFO.bic}`, margin, companyY + 2, { fontSize: 10 });

  // Client information (right) - Better positioning
  const clientX = pageWidth / 2 + 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.clientName || 'Client non spécifié', clientX, companySectionY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  let clientY = companySectionY + 5;
  if (Array.isArray(invoiceData.clientAddress)) {
    invoiceData.clientAddress.forEach((line) => {
      clientY = addText(line, clientX, clientY, { fontSize: 10 });
      clientY += 2;
    });
  } else {
    clientY = addText(invoiceData.clientAddress, clientX, clientY, { fontSize: 10 });
  }

  yPosition = Math.max(companyY, clientY) + 5;

  // ===== PAYMENT TERMS SECTION - Three boxes as in model =====
  yPosition += 3;
  
  // Payment information boxes - Three equal boxes with proper spacing
  const boxWidth = 50;
  const boxHeight = 16;
  const boxSpacing = 6;
  const totalBoxWidth = (boxWidth * 3) + (boxSpacing * 2);
  const startX = margin + (pageWidth - margin - rightMargin - totalBoxWidth) / 2; // Center the boxes
  
  // Box 1 - Payment method
  addRect(startX, yPosition, boxWidth, boxHeight, { 
    fill: false, 
    strokeColor: [200, 200, 200],
    strokeWidth: 0.5
  });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('MODE DE REGLEMENT', startX + 3, yPosition + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.paymentMethod || 'Virement', startX + 3, yPosition + 10);
  
  // Box 2 - Due date
  const box2X = startX + boxWidth + boxSpacing;
  addRect(box2X, yPosition, boxWidth, boxHeight, { 
    fill: false, 
    strokeColor: [200, 200, 200],
    strokeWidth: 0.5
  });
  
  doc.setFont('helvetica', 'bold');
  doc.text('DATE D\'ECHEANCE', box2X + 3, yPosition + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.dueDate || '', box2X + 3, yPosition + 10);
  
  // Box 3 - TVA (empty as shown in reference)
  const box3X = box2X + boxWidth + boxSpacing;
  addRect(box3X, yPosition, boxWidth, boxHeight, { 
    fill: false, 
    strokeColor: [200, 200, 200],
    strokeWidth: 0.5
  });
  
  doc.setFont('helvetica', 'bold');
  doc.text('TVA', box3X + 3, yPosition + 4);
  // TVA box is intentionally left empty as shown in reference
  
  yPosition += boxHeight + 5;

  // ===== SERVICES TABLE SECTION =====
  const tableY = yPosition;
  
  // Calculate table width - Match exactly the payment boxes width
  const paymentBoxesWidth = (boxWidth * 3) + (boxSpacing * 2);
  const tableWidth = paymentBoxesWidth; // Same width as payment boxes
  const tableStartX = startX; // Same starting position as payment boxes
  
  // Table configuration - Flexible and well-structured
  const tableConfig = {
    // Positioning
    startX: tableStartX, // Centered table
    width: tableWidth, // Wider table for better content display
    headerHeight: 20,
    rowHeight: 22,
    
    // Column configuration - Equal width for all numeric columns
    columns: {
      description: { width: 0.4, label: 'DESIGNATION', align: 'center' },
      htva: { width: 0.2, label: 'H.T.V.A', align: 'center' },
      tva: { width: 0.2, label: 'T.V.A', align: 'center' },
      tvac: { width: 0.2, label: 'T.V.A.C', align: 'center' }
    },
    
    // Spacing
    padding: 6,
    columnSpacing: 4
  };
  
  // Calculate column positions dynamically with equal width for numeric columns
  let currentX = tableConfig.startX;
  const columnPositions = {};
  const columnKeys = Object.keys(tableConfig.columns);
  
  // Calculate total spacing needed
  const totalSpacing = (columnKeys.length - 1) * tableConfig.columnSpacing;
  const availableWidth = tableConfig.width - totalSpacing;
  
  columnKeys.forEach((key, index) => {
    const column = tableConfig.columns[key];
    let columnWidth;
    
    // Ensure numeric columns get exactly equal width
    if (key === 'htva' || key === 'tva' || key === 'tvac') {
      // Each numeric column gets 1/3 of the remaining space after description
      const descriptionWidth = Math.floor(availableWidth * 0.4);
      const numericColumnsWidth = availableWidth - descriptionWidth;
      columnWidth = Math.floor(numericColumnsWidth / 3);
    } else {
      // Description column gets its configured width
      columnWidth = Math.floor(availableWidth * column.width);
    }
    
    columnPositions[key] = {
      start: currentX,
      width: columnWidth,
      end: currentX + columnWidth,
      label: column.label,
      align: column.align
    };
    
    currentX += columnWidth + (index < columnKeys.length - 1 ? tableConfig.columnSpacing : 0);
  });
  
  const totalTableWidth = tableConfig.width;
  
  // Table header
  addRect(tableConfig.startX, tableY, totalTableWidth, tableConfig.headerHeight, { 
    fill: true, 
    fillColor: [240, 240, 240],
    strokeColor: [0, 0, 0]
  });
  
  // Header text - Dynamic positioning optimized for narrower table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  Object.keys(tableConfig.columns).forEach(key => {
    const col = columnPositions[key];
    let textX;
    if (col.align === 'center') {
      textX = col.start + (col.width / 2);
    } else if (col.align === 'right') {
      textX = col.end - tableConfig.padding;
    } else {
      textX = col.start + tableConfig.padding;
    }
    const textY = tableY + (tableConfig.headerHeight / 2) + 2;
    doc.text(col.label, textX, textY, { align: col.align });
  });

  yPosition = tableY + tableConfig.headerHeight;

  // Services Table Content
  (invoiceData.services || []).forEach((service, index) => {
    const serviceY = yPosition + (index * tableConfig.rowHeight);
    
    // Set font properties - Optimized for narrower table
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Service description
    const descCol = columnPositions.description;
    const descriptionLines = doc.splitTextToSize(service.description || 'Service non spécifié', descCol.width - (tableConfig.padding * 2));
    const textY = serviceY + (tableConfig.rowHeight / 2) + 2; // Adjusted for smaller font
    doc.text(descriptionLines, descCol.start + tableConfig.padding, textY);
    
    // Price information - Dynamic positioning with better scaling
    const priceData = [
      { key: 'htva', value: `${(service.priceExclVat || 0).toFixed(2)}€` },
      { key: 'tva', value: `(${service.vatRate || 21}%) ${(service.vatAmount || 0).toFixed(2)}€` },
      { key: 'tvac', value: `${(service.priceInclVat || 0).toFixed(2)}€` }
    ];
    
    priceData.forEach(({ key, value }) => {
      const col = columnPositions[key];
      let textX;
      if (col.align === 'center') {
        textX = col.start + (col.width / 2);
      } else if (col.align === 'right') {
        textX = col.end - tableConfig.padding;
      } else {
        textX = col.start + tableConfig.padding;
      }
      const textY = serviceY + (tableConfig.rowHeight / 2) + 2;
      
      // Special handling for T.V.A.C column to ensure proper display
      if (key === 'tvac') {
        // Ensure T.V.A.C column has enough space and proper formatting
  doc.setFontSize(10);
        doc.setFont('helvetica', 'bold'); // Make T.V.A.C values bold
        doc.text(value, textX, textY, { align: col.align });
        doc.setFont('helvetica', 'normal'); // Reset font weight
      } else if (key === 'tva') {
        doc.text(value, textX, textY, { align: col.align });
      } else {
        doc.text(value, textX, textY, { align: col.align });
      }
    });
  });

  // Draw all table lines once after content
  const totalRows = invoiceData.services.length;
  const tableBottom = yPosition + (totalRows * tableConfig.rowHeight);
  
  // Draw vertical separators for entire table - Dynamic positioning
  Object.keys(tableConfig.columns).forEach((key, index) => {
    if (index > 0) { // Skip first column (left border)
      const col = columnPositions[key];
      drawLine(col.start - tableConfig.columnSpacing/2, tableY, col.start - tableConfig.columnSpacing/2, tableBottom, { color: [0, 0, 0], width: 0.5 });
    }
  });
  
  // Draw left and right borders to close the table
  drawLine(tableConfig.startX, tableY, tableConfig.startX, tableBottom, { color: [0, 0, 0], width: 0.5 });
  drawLine(tableConfig.startX + totalTableWidth, tableY, tableConfig.startX + totalTableWidth, tableBottom, { color: [0, 0, 0], width: 0.5 });
  
  // Draw horizontal lines between rows only if there are multiple rows
  if (totalRows > 1) {
    for (let i = 2; i <= totalRows; i++) {
      const lineY = tableY + tableConfig.headerHeight + ((i - 1) * tableConfig.rowHeight);
      drawLine(tableConfig.startX, lineY, tableConfig.startX + totalTableWidth, lineY, { color: [0, 0, 0], width: 0.5 });
    }
  }
  
  // Draw bottom border to close the table
  drawLine(tableConfig.startX, tableBottom, tableConfig.startX + totalTableWidth, tableBottom, { color: [0, 0, 0], width: 0.5 });

  yPosition = yPosition + (invoiceData.services.length * tableConfig.rowHeight) + 10;

  // ===== TOTALS SECTION =====
  const totalsY = yPosition;
  
  // Left side - Remark and TVA breakdown
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Remarque : www.locationautocar.be by Limostar', margin, totalsY);
  
  // TVA breakdown table
  const breakdownY = totalsY + 8;
  const breakdownWidth = Math.min(80, pageWidth - margin - rightMargin - 2); // Ultra maximum separation
  const breakdownHeight = 18;
  
  addRect(margin, breakdownY, breakdownWidth, breakdownHeight, { 
    fill: false, 
    strokeColor: [150, 150, 150]
  });
  
  // Header row
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TVA', margin + 2, breakdownY + 3);
  doc.text('BASE', margin + 30, breakdownY + 3);
  doc.text('TVA', margin + 60, breakdownY + 3);
  
  // Draw vertical column separators
  const col1End = margin + 28;
  const col2End = margin + 58;
  
  // Vertical lines to separate columns
  drawLine(col1End, breakdownY, col1End, breakdownY + breakdownHeight, { color: [200, 200, 200], width: 0.5 });
  drawLine(col2End, breakdownY, col2End, breakdownY + breakdownHeight, { color: [200, 200, 200], width: 0.5 });
  
  // Service rows
  let serviceBreakdownY = breakdownY + 9;
  (invoiceData.services || []).forEach((service) => {
    doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`${(service.priceExclVat || 0).toFixed(2)}€`, margin + 2, serviceBreakdownY);
    doc.text(`${(service.vatAmount || 0).toFixed(2)}€`, margin + 30, serviceBreakdownY);
    doc.text(`${(service.priceInclVat || 0).toFixed(2)}€`, margin + 60, serviceBreakdownY);
    serviceBreakdownY += 4;
  });
  
  // Right side - Payment summary
  const paymentSummaryX = pageWidth - rightMargin - 70;
  const paymentSummaryWidth = 70;
  const paymentSummaryHeight = 18;
  
  addRect(paymentSummaryX, breakdownY, paymentSummaryWidth, paymentSummaryHeight, { 
    fill: false, 
    strokeColor: [150, 150, 150]
  });
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  // TOTAL TVAC
  doc.text('TOTAL TVAC', paymentSummaryX + 2, breakdownY + 4);
  doc.text(`${(invoiceData.totals.priceInclVat || 0).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 4, { align: 'right' });
  
  // ACOMPTE
  doc.text('ACOMPTE', paymentSummaryX + 2, breakdownY + 9);
  doc.text(`${(invoiceData.totals.deposit || 0).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 9, { align: 'right' });
  
  // RESTE A PAYER
  doc.text('RESTE A PAYER', paymentSummaryX + 2, breakdownY + 14);
  doc.text(`${((invoiceData.totals.priceInclVat || 0) - (invoiceData.totals.deposit || 0)).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 14, { align: 'right' });
  
  // Draw separators - removed grey lines

  yPosition = totalsY + Math.max(breakdownHeight + 5, paymentSummaryHeight + 5);

  // ===== LEGAL TERMS SECTION =====
  yPosition += 12;
  
  doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
  
  let currentY = yPosition;
  LEGAL_TERMS.forEach((term, index) => {
    const maxWidth = pageWidth - margin - rightMargin;
    const lines = doc.splitTextToSize(`${index + 1}. ${term}`, maxWidth);
    lines.forEach((line, lineIndex) => {
      doc.text(line, margin, currentY);
      currentY += 4;
    });
    // No extra spacing between terms for maximum compactness
  });

  yPosition = currentY;

  // ===== FOOTER SECTION =====
  const footerY = Math.max(yPosition + 3, pageHeight - 20);
  
  // Footer separator line - removed grey line
  
  // Footer content
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('LIMOSTAR 65, Avenue Louise 1050 Brussels Belgium', pageWidth / 2, footerY + 5, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`TEL: ${COMPANY_INFO.phone} - E-mail: ${COMPANY_INFO.email} - Site Web: ${COMPANY_INFO.website}`, pageWidth / 2, footerY + 12, { align: 'center' });
  
  console.log('PDF generation completed successfully');
  return doc;
  } catch (error) {
    console.error('Error in generateInvoicePDF:', error);
    throw error;
  }
}

// Helper function to create invoice data from trip
export function createInvoiceFromTrip(trip, client, invoiceNumber) {
  const invoiceDate = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 days from now
  
  // Calculate VAT (6% for transportation services in Belgium)
  const vatRate = 6;
  const priceExclVat = trip.revenue || 0;
  const vatAmount = (priceExclVat * vatRate) / 100;
  const priceInclVat = priceExclVat + vatAmount;

  return {
    invoiceNumber: invoiceNumber,
    page: '1',
    date: invoiceDate,
    dueDate: dueDate,
    clientCode: client?.id || 'CL0001',
    clientName: client?.company || trip.client || 'Client Name',
    clientAddress: client?.address ? [client.address] : ['Client Address'],
    paymentMethod: 'Virement',
    services: [
      {
        description: `${trip.pickup} → ${trip.destination} - ${trip.date} ${trip.time || ''} - ${trip.passengers} passengers${trip.notes ? ' - ' + trip.notes : ''}`,
        priceExclVat: priceExclVat,
        vatRate: vatRate,
        vatAmount: vatAmount,
        priceInclVat: priceInclVat
      }
    ],
    totals: {
      priceExclVat: priceExclVat,
      vatAmount: vatAmount,
      priceInclVat: priceInclVat,
      deposit: 0
    }
  };
}

// Helper function to generate and download invoice
export function downloadInvoice(invoiceData) {
  try {
    console.log('Starting PDF generation...', invoiceData);
  const doc = generateInvoicePDF(invoiceData);
    console.log('PDF generated successfully:', doc);
    
  const fileName = `Facture_${invoiceData.invoiceNumber}_${invoiceData.date}.pdf`;
    console.log('Saving PDF with filename:', fileName);
    
    // Try the standard save method
  doc.save(fileName);
    console.log('PDF download initiated');
    
    // Fallback: Try to open in new tab if download doesn't work
    setTimeout(() => {
      console.log('Attempting fallback PDF display...');
      const pdfDataUri = doc.output('datauristring');
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`);
      }
    }, 1000);
    
  } catch (error) {
    console.error('Error in downloadInvoice:', error);
    throw error;
  }
}

// Helper function to generate invoice number
export function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `FC${year}${month}${day}${random}`;
}

// Helper function to generate devis number
export function generateDevisNumber() {
  const now = new Date();
  const year = now.getFullYear().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}${random}`;
}

export function generateDevisPDF(devisData) {
  try {
    console.log('Creating new DEVIS PDF document...');
    const doc = new jsPDF();
    console.log('DEVIS PDF document created');
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const rightMargin = 30; // Increased right margin
    let yPosition = margin;

    console.log('Page dimensions:', { pageWidth, pageHeight, margin, rightMargin });

    // Helper function to add text with formatting
    const addText = (text, x, y, options = {}) => {
      const { 
        fontSize = 10, 
        fontStyle = 'normal', 
        color = [0, 0, 0], 
        maxWidth = pageWidth - margin - rightMargin,
        align = 'left'
      } = options;
      
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y, { align });
      return y + (lines.length * fontSize * 0.4);
    };

    // Helper function to draw line
    const drawLine = (x1, y1, x2, y2, options = {}) => {
      const { color = [0, 0, 0], width = 0.5 } = options;
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(width);
      doc.line(x1, y1, x2, y2);
      doc.setLineWidth(0.5);
    };

    // Helper function to add rectangle
    const addRect = (x, y, width, height, options = {}) => {
      const { fill = false, fillColor = [240, 240, 240], stroke = true, strokeColor = [0, 0, 0] } = options;
      
      if (fill) {
        doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      }
      if (stroke) {
        doc.setDrawColor(strokeColor[0], strokeColor[1], strokeColor[2]);
      }
      
      const style = fill ? (stroke ? 'FD' : 'F') : (stroke ? 'D' : '');
      doc.rect(x, y, width, height, style);
    };

    // ===== HEADER SECTION =====
    // Top border line
    drawLine(margin, yPosition - 5, pageWidth - rightMargin, yPosition - 5, { width: 1 });
    
    // Company logo (left side)
    const headerY = yPosition + 5;
    const logoWidth = 35;
    const logoHeight = 17;
    
    try {
      // Add the logo image
      doc.addImage('/logo.png', 'PNG', margin, headerY, logoWidth, logoHeight);
      yPosition = headerY + logoHeight + 5;
    } catch (error) {
      console.log('Logo not found, using text fallback:', error);
      // Fallback to text if logo is not found
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(COMPANY_INFO.name, margin, headerY);
      
      doc.setFontSize(13);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      yPosition = addText(COMPANY_INFO.tagline, margin, headerY + 8, { fontSize: 13 });
    }

    // DEVIS details box (right side)
    const devisBoxWidth = 80;
    const devisBoxX = pageWidth - rightMargin - devisBoxWidth;
    const devisBoxHeight = 26;
    
    // DEVIS box with grey background
    addRect(devisBoxX, headerY - 5, devisBoxWidth, devisBoxHeight, { 
      fill: true, 
      fillColor: [200, 200, 200],
      strokeColor: [150, 150, 150]
    });
    
    // DEVIS number - "Devis N°" and number on same line
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Devis N° : ${devisData.devisNumber || 'DV-0000'}`, devisBoxX + 5, headerY + 5);
    
    // DEVIS details table - Three boxes as in model
    const details = [
      ['PAGE', devisData.page || '1'],
      ['DATE', devisData.date || new Date().toISOString().split('T')[0]],
      ['CLIENT', devisData.clientCode || 'CL1595']
    ];
    
    let detailY = headerY + 10;
    details.forEach(([label, value]) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text(`${label}`, devisBoxX + 5, detailY);
      doc.text(value, devisBoxX + 30, detailY);
      detailY += 4;
    });

    yPosition = Math.max(yPosition, headerY + devisBoxHeight + 3);

    // ===== COMPANY & CLIENT INFORMATION SECTION =====
    const companySectionY = yPosition;
    
    // Company information (left side)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(COMPANY_INFO.name, margin, companySectionY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    let companyY = companySectionY + 5;
    companyY = addText('65, Avenue Louise', margin, companySectionY + 5, { fontSize: 10 });
    companyY = addText('1050 Brussels', margin, companyY + 2, { fontSize: 10 });
    companyY = addText('Belgium', margin, companyY + 2, { fontSize: 10 });
    companyY = addText(`TVA: ${COMPANY_INFO.vat}`, margin, companyY + 3, { fontSize: 10 });
    companyY = addText(`IBAN: ${COMPANY_INFO.iban}`, margin, companyY + 2, { fontSize: 10 });
    companyY = addText(`BIC: ${COMPANY_INFO.bic}`, margin, companyY + 2, { fontSize: 10 });

    // Client information (right) - Better positioning
    const clientX = pageWidth / 2 + 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(devisData.clientName || 'Client non spécifié', clientX, companySectionY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    let clientY = companySectionY + 5;
    if (Array.isArray(devisData.clientAddress)) {
      devisData.clientAddress.forEach((line) => {
        clientY = addText(line, clientX, clientY, { fontSize: 10 });
        clientY += 2;
      });
    } else {
      clientY = addText(devisData.clientAddress, clientX, clientY, { fontSize: 10 });
    }

    yPosition = Math.max(companyY, clientY) + 5;

    // ===== PAYMENT TERMS SECTION =====
    const paymentBoxesWidth = 50;
    const paymentBoxSpacing = 6;
    const totalPaymentWidth = (paymentBoxesWidth * 3) + (paymentBoxSpacing * 2);
    const startX = margin + (pageWidth - margin - rightMargin - totalPaymentWidth) / 2; // Center the boxes like invoice

    // Three payment boxes
    const box1X = startX;
    const box2X = startX + paymentBoxesWidth + paymentBoxSpacing;
    const box3X = startX + (paymentBoxesWidth + paymentBoxSpacing) * 2;

    // Box 1: MODE DE REGLEMENT
    addRect(box1X, yPosition, paymentBoxesWidth, 16, { 
      fill: true, 
      fillColor: [240, 240, 240],
      strokeColor: [200, 200, 200]
    });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('MODE DE REGLEMENT', box1X + 3, yPosition + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(devisData.paymentMethod || 'Virement', box1X + 3, yPosition + 10);

    // Box 2: DATE D'ECHEANCE
    addRect(box2X, yPosition, paymentBoxesWidth, 16, { 
      fill: true, 
      fillColor: [240, 240, 240],
      strokeColor: [200, 200, 200]
    });
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATE D\'ECHEANCE', box2X + 3, yPosition + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(devisData.dueDate || '', box2X + 3, yPosition + 10);

    // Box 3: TVA
    addRect(box3X, yPosition, paymentBoxesWidth, 16, { 
      fill: true, 
      fillColor: [240, 240, 240],
      strokeColor: [200, 200, 200]
    });
    
    doc.setFont('helvetica', 'bold');
    doc.text('TVA', box3X + 3, yPosition + 4);
    // TVA box is intentionally left empty as shown in reference

    yPosition += 25;

    // ===== SERVICES TABLE SECTION =====
    const tableConfig = {
      startX: startX,
      width: totalPaymentWidth,
      headerHeight: 12,
      rowHeight: 25,
      padding: 5,
      columnSpacing: 3,
      columns: {
        description: { width: 0.5, align: 'left', label: 'DESIGNATION' },
        htva: { width: 0.17, align: 'center', label: 'H.T.V.A' },
        tva: { width: 0.17, align: 'center', label: 'T.V.A' },
        tvac: { width: 0.16, align: 'center', label: 'T.V.A.C' }
      }
    };

    // Calculate column positions
    const columnPositions = {};
    let currentX = tableConfig.startX;
    Object.keys(tableConfig.columns).forEach(key => {
      const col = tableConfig.columns[key];
      columnPositions[key] = {
        start: currentX,
        width: tableConfig.width * col.width
      };
      currentX += columnPositions[key].width;
    });

    // Table header
    const tableY = yPosition;
    addRect(tableConfig.startX, tableY, tableConfig.width, tableConfig.headerHeight, { 
      fill: true, 
      fillColor: [240, 240, 240],
      strokeColor: [200, 200, 200]
    });

    // Header text
    Object.keys(tableConfig.columns).forEach(key => {
      const col = tableConfig.columns[key];
      const pos = columnPositions[key];
      const textX = pos.start + (pos.width / 2);
      const textY = tableY + tableConfig.headerHeight - 2;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(col.label, textX, textY, { align: col.align });
    });

    yPosition = tableY + tableConfig.headerHeight;

    // Services Table Content
    (devisData.services || []).forEach((service, index) => {
      const serviceY = yPosition + (index * tableConfig.rowHeight);
      
      // Set font properties - Optimized for narrower table
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Service description
      const descCol = columnPositions.description;
      const descriptionLines = doc.splitTextToSize(service.description || 'Service non spécifié', descCol.width - (tableConfig.padding * 2));
      const textY = serviceY + (tableConfig.rowHeight / 2) + 2;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(descriptionLines, descCol.start + tableConfig.padding, textY);
      
      // Price information - Dynamic positioning with better scaling
      const priceData = [
        { key: 'htva', value: `${(service.priceExclVat || 0).toFixed(2)}€` },
        { key: 'tva', value: `(${service.vatRate || 21}%) ${(service.vatAmount || 0).toFixed(2)}€` },
        { key: 'tvac', value: `${(service.priceInclVat || 0).toFixed(2)}€` }
      ];
      
      priceData.forEach(({ key, value }) => {
        const col = columnPositions[key];
        let textX;
        if (col.align === 'center') {
          textX = col.start + (col.width / 2);
        } else {
          textX = col.start + tableConfig.padding;
        }
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(value, textX, serviceY + (tableConfig.rowHeight / 2) + 2, { align: col.align });
      });
    });

    // Draw table borders
    const tableHeight = (devisData.services || []).length * tableConfig.rowHeight + tableConfig.headerHeight;
    
    // Horizontal lines
    drawLine(tableConfig.startX, tableY, tableConfig.startX + tableConfig.width, tableY, { color: [200, 200, 200], width: 0.5 });
    drawLine(tableConfig.startX, tableY + tableConfig.headerHeight, tableConfig.startX + tableConfig.width, tableY + tableConfig.headerHeight, { color: [200, 200, 200], width: 0.5 });
    drawLine(tableConfig.startX, tableY + tableHeight, tableConfig.startX + tableConfig.width, tableY + tableHeight, { color: [200, 200, 200], width: 0.5 });
    
    // Vertical lines
    Object.keys(columnPositions).forEach(key => {
      const pos = columnPositions[key];
      drawLine(pos.start, tableY, pos.start, tableY + tableHeight, { color: [200, 200, 200], width: 0.5 });
    });
    
    // Right border
    drawLine(tableConfig.startX + tableConfig.width, tableY, tableConfig.startX + tableConfig.width, tableY + tableHeight, { color: [200, 200, 200], width: 0.5 });

    yPosition = tableY + tableHeight + 10;

    // ===== TOTALS SECTION =====
    const totalsY = yPosition;
    
    // Left side - TVA breakdown
    const breakdownWidth = 80;
    const breakdownHeight = 20;
    const breakdownY = totalsY;
    const breakdownX = margin;
    
    addRect(breakdownX, breakdownY, breakdownWidth, breakdownHeight, { 
      fill: false, 
      strokeColor: [200, 200, 200]
    });
    
    // Header row
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TVA', margin + 2, breakdownY + 3);
    doc.text('BASE', margin + 30, breakdownY + 3);
    doc.text('TVA', margin + 60, breakdownY + 3);
    
    // Draw vertical column separators
    const col1End = margin + 28;
    const col2End = margin + 58;
    
    // Vertical lines to separate columns
    drawLine(col1End, breakdownY, col1End, breakdownY + breakdownHeight, { color: [200, 200, 200], width: 0.5 });
    drawLine(col2End, breakdownY, col2End, breakdownY + breakdownHeight, { color: [200, 200, 200], width: 0.5 });
    
    // Service rows
    let serviceBreakdownY = breakdownY + 9;
    (devisData.services || []).forEach((service) => {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${(service.priceExclVat || 0).toFixed(2)}€`, margin + 2, serviceBreakdownY);
      doc.text(`${(service.vatAmount || 0).toFixed(2)}€`, margin + 30, serviceBreakdownY);
      doc.text(`${(service.priceInclVat || 0).toFixed(2)}€`, margin + 60, serviceBreakdownY);
      serviceBreakdownY += 4;
    });
    
    // Right side - Payment summary
    const paymentSummaryX = pageWidth - rightMargin - 70;
    const paymentSummaryWidth = 70;
    const paymentSummaryHeight = 20;
    
    addRect(paymentSummaryX, breakdownY, paymentSummaryWidth, paymentSummaryHeight, { 
      fill: false, 
      strokeColor: [200, 200, 200]
    });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    // TOTAL TVAC
    doc.text('TOTAL TVAC', paymentSummaryX + 2, breakdownY + 4);
    doc.text(`${(devisData.totals.priceInclVat || 0).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 4, { align: 'right' });
    
    // ACOMPTE
    doc.text('ACOMPTE', paymentSummaryX + 2, breakdownY + 9);
    doc.text(`${(devisData.totals.deposit || 0).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 9, { align: 'right' });
    
    // RESTE A PAYER
    doc.text('RESTE A PAYER', paymentSummaryX + 2, breakdownY + 14);
    doc.text(`${((devisData.totals.priceInclVat || 0) - (devisData.totals.deposit || 0)).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 14, { align: 'right' });

    yPosition = totalsY + Math.max(breakdownHeight + 5, paymentSummaryHeight + 5);

    // ===== REMARK SECTION =====
    if (devisData.remark) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      yPosition = addText(`Remarque : ${devisData.remark}`, margin, yPosition + 5, { fontSize: 10 });
    }

    // ===== LEGAL TERMS SECTION =====
    // Legal terms removed for devis - not needed for quotes

    // ===== FOOTER SECTION =====
    const footerY = pageHeight - 20;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('LIMOSTAR 65, Avenue Louise 1050 Brussels Belgium', pageWidth / 2, footerY + 5, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`TEL: ${COMPANY_INFO.phone} - E-mail: ${COMPANY_INFO.email} - Site Web: ${COMPANY_INFO.website}`, pageWidth / 2, footerY + 12, { align: 'center' });

    console.log('DEVIS PDF generation completed successfully');
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating DEVIS PDF:', error);
    throw error;
  }
}

export function downloadDevis(devisData) {
  try {
    console.log('Starting devis download...');
    const pdfBlob = generateDevisPDF(devisData);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devis-${devisData.devisNumber}-${devisData.date}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('Devis downloaded successfully');
  } catch (error) {
    console.error('Error downloading devis:', error);
    alert('Error downloading devis. Please try again.');
  }
}

// ===== PROFORMA PDF GENERATION =====

export function generateProformaPDF(proformaData) {
  try {
    console.log('Starting proforma PDF generation...', proformaData);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const rightMargin = 15;

    // Helper function to add text with wrapping
    const addText = (text, x, y, options = {}) => {
      const {
        maxWidth = pageWidth - margin - rightMargin,
        fontSize = 10,
        fontStyle = 'normal',
        color = [0, 0, 0],
        align = 'left'
      } = options;

      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      doc.setTextColor(color[0], color[1], color[2]);
      
      if (text && typeof text === 'string') {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y, { align });
        return lines.length * (fontSize * 0.4);
      }
      return 0;
    };

    // Helper function to draw lines
    const drawLine = (x1, y1, x2, y2, color = [0, 0, 0], width = 0.5) => {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(width);
      doc.line(x1, y1, x2, y2);
    };

    let currentY = margin;

    // ===== HEADER SECTION =====
    console.log('Adding header section...');
    
    // Header background
    doc.setFillColor(218, 165, 32);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Logo
    try {
      const logoResponse = fetch('/logo.png');
      logoResponse.then(response => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error('Logo not found');
      }).then(blob => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }).then(logoBase64 => {
        doc.addImage(logoBase64, 'PNG', margin, 9, 25, 17);
      }).catch(() => {
        // Fallback to text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('LIMOSTAR', margin, 20);
      });
    } catch (error) {
      // Fallback to text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('LIMOSTAR', margin, 20);
    }

    // Proforma title and info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`PROFORMA N° ${proformaData.proformaNumber || 'PF-0000'}`, pageWidth - 80, 15);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`PAGE: ${proformaData.page || '1'}`, pageWidth - 80, 22);
    doc.text(`DATE: ${proformaData.date || new Date().toISOString().split('T')[0]}`, pageWidth - 80, 27);
    doc.text(`CLIENT: ${proformaData.clientCode || 'CL0000'}`, pageWidth - 80, 32);

    currentY = 50;

    // ===== COMPANY & CLIENT INFORMATION =====
    console.log('Adding company and client information...');
    
    const companyInfo = [
      'LIMOSTAR',
      'Just luxury cars',
      'Rue de la Limousine 123',
      '1000 Bruxelles, Belgique',
      'TVA: BE0123456789',
      'IBAN: BE68 5390 0754 7034',
      'Tél: +32 2 123 45 67'
    ];

    const clientInfo = [
      proformaData.clientName || 'Client non spécifié',
      ...(Array.isArray(proformaData.clientAddress) ? proformaData.clientAddress : [proformaData.clientAddress || 'Adresse non spécifiée'])
    ];

    // Company info (left)
    currentY += 5;
    companyInfo.forEach((line, index) => {
      addText(line, margin, currentY + (index * 4), { fontSize: 9 });
    });

    // Client info (right)
    let clientY = currentY;
    clientInfo.forEach((line, index) => {
      addText(line, pageWidth - 80, clientY + (index * 4), { fontSize: 9, align: 'right' });
    });

    currentY += Math.max(companyInfo.length, clientInfo.length) * 4 + 10;

    // ===== PAYMENT TERMS SECTION =====
    console.log('Adding payment terms section...');
    
    const paymentBoxWidth = (pageWidth - 2 * margin) / 3;
    const paymentBoxHeight = 20;
    const paymentBoxSpacing = 5;

    const paymentBoxes = [
      { label: 'MODE DE REGLEMENT', value: proformaData.paymentMethod || 'Virement' },
      { label: 'DATE D\'ECHEANCE', value: proformaData.dueDate || new Date().toISOString().split('T')[0] },
      { label: 'TVA', value: '21%' }
    ];

    paymentBoxes.forEach((box, index) => {
      const boxX = margin + index * (paymentBoxWidth + paymentBoxSpacing);
      const boxY = currentY;
      
      // Box background
      doc.setFillColor(245, 245, 245);
      doc.rect(boxX, boxY, paymentBoxWidth, paymentBoxHeight, 'F');
      
      // Box border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(boxX, boxY, paymentBoxWidth, paymentBoxHeight);
      
      // Label
      addText(box.label, boxX + 3, boxY + 7, { fontSize: 8, color: [100, 100, 100] });
      
      // Value
      addText(box.value, boxX + 3, boxY + 14, { fontSize: 9, fontStyle: 'bold' });
    });

    currentY += paymentBoxHeight + 15;

    // ===== SERVICES TABLE SECTION =====
    console.log('Adding services table...');
    
    const totalPaymentWidth = (paymentBoxWidth * 3) + (paymentBoxSpacing * 2);
    const startX = margin + (pageWidth - 2 * margin - totalPaymentWidth) / 2;

    const tableConfig = {
      startX: startX,
      width: totalPaymentWidth,
      headerHeight: 12,
      rowHeight: 25,
      padding: 5,
      columnSpacing: 3,
      columns: {
        description: { width: 0.5, align: 'left', label: 'DESIGNATION' },
        htva: { width: 0.17, align: 'center', label: 'H.T.V.A' },
        tva: { width: 0.17, align: 'center', label: 'T.V.A' },
        tvac: { width: 0.16, align: 'center', label: 'T.V.A.C' }
      }
    };

    // Table header
    let headerX = tableConfig.startX;
    doc.setFillColor(245, 245, 245);
    doc.rect(tableConfig.startX, currentY, tableConfig.width, tableConfig.headerHeight, 'F');
    
    // Header border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(tableConfig.startX, currentY, tableConfig.width, tableConfig.headerHeight);

    // Header text
    Object.entries(tableConfig.columns).forEach(([key, col]) => {
      const colWidth = tableConfig.width * col.width;
      const textX = col.align === 'center' ? headerX + colWidth / 2 : headerX + tableConfig.padding;
      
      addText(col.label, textX, currentY + 8, { 
        fontSize: 10, 
        fontStyle: 'bold', 
        align: col.align,
        maxWidth: colWidth - tableConfig.padding * 2
      });
      
      headerX += colWidth;
    });

    currentY += tableConfig.headerHeight;

    // Table data
    const services = proformaData.services || [
      {
        description: 'Service de transport limousine',
        priceExclVat: proformaData.totals?.priceExclVat || 0,
        vatAmount: proformaData.totals?.vatAmount || 0,
        priceInclVat: proformaData.totals?.priceInclVat || 0,
        vatRate: 21
      }
    ];

    services.forEach((service, rowIndex) => {
      let dataX = tableConfig.startX;
      
      // Data row
      Object.entries(tableConfig.columns).forEach(([key, col]) => {
        const colWidth = tableConfig.width * col.width;
        let text = '';
        
        switch (key) {
          case 'description':
            text = service.description || 'Service non spécifié';
            break;
          case 'htva':
            text = `${(service.priceExclVat || 0).toFixed(2)}€`;
            break;
          case 'tva':
            text = `${(service.vatAmount || 0).toFixed(2)}€`;
            break;
          case 'tvac':
            text = `${(service.priceInclVat || 0).toFixed(2)}€`;
            break;
        }
        
        const textX = col.align === 'center' ? dataX + colWidth / 2 : dataX + tableConfig.padding;
        
        addText(text, textX, currentY + 8, { 
          fontSize: 9, 
          align: col.align,
          maxWidth: colWidth - tableConfig.padding * 2
        });
        
        dataX += colWidth;
      });

      // Draw horizontal line between rows
      drawLine(tableConfig.startX, currentY + tableConfig.rowHeight, 
               tableConfig.startX + tableConfig.width, currentY + tableConfig.rowHeight, [200, 200, 200]);
      
      currentY += tableConfig.rowHeight;
    });

    // Close table with borders
    drawLine(tableConfig.startX, currentY - (services.length * tableConfig.rowHeight), tableConfig.startX, currentY, [200, 200, 200]);
    drawLine(tableConfig.startX + tableConfig.width, currentY - (services.length * tableConfig.rowHeight), tableConfig.startX + tableConfig.width, currentY, [200, 200, 200]);
    drawLine(tableConfig.startX, currentY, tableConfig.startX + tableConfig.width, currentY, [200, 200, 200]);

    currentY += 15;

    // ===== TOTALS SECTION =====
    console.log('Adding totals section...');
    
    // TVA breakdown table
    const tvaTableX = startX;
    const tvaTableWidth = totalPaymentWidth * 0.4;
    const tvaTableHeight = 25;

    // TVA table background and border
    doc.setFillColor(250, 250, 250);
    doc.rect(tvaTableX, currentY, tvaTableWidth, tvaTableHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(tvaTableX, currentY, tvaTableWidth, tvaTableHeight);

    // TVA table content
    addText('H.T.V.A', tvaTableX + 5, currentY + 8, { fontSize: 9 });
    addText(`${(proformaData.totals?.priceExclVat || 0).toFixed(2)}€`, tvaTableX + 5, currentY + 16, { fontSize: 9, fontStyle: 'bold' });
    
    // Vertical line in TVA table
    drawLine(tvaTableX + tvaTableWidth/2, currentY, tvaTableX + tvaTableWidth/2, currentY + tvaTableHeight, [200, 200, 200]);
    
    addText('T.V.A 21%', tvaTableX + tvaTableWidth/2 + 5, currentY + 8, { fontSize: 9 });
    addText(`${(proformaData.totals?.vatAmount || 0).toFixed(2)}€`, tvaTableX + tvaTableWidth/2 + 5, currentY + 16, { fontSize: 9, fontStyle: 'bold' });

    // Payment summary table
    const paymentTableX = startX + tvaTableWidth + 10;
    const paymentTableWidth = totalPaymentWidth * 0.6 - 10;
    const paymentTableHeight = 25;

    // Payment table background and border
    doc.setFillColor(250, 250, 250);
    doc.rect(paymentTableX, currentY, paymentTableWidth, paymentTableHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(paymentTableX, currentY, paymentTableWidth, paymentTableHeight);

    // Payment table content
    addText('TOTAL T.V.A.C', paymentTableX + 5, currentY + 8, { fontSize: 9, fontStyle: 'bold' });
    addText(`${(proformaData.totals?.priceInclVat || 0).toFixed(2)}€`, paymentTableX + 5, currentY + 16, { fontSize: 11, fontStyle: 'bold' });

    if (proformaData.totals?.deposit > 0) {
      addText(`Acompte: ${proformaData.totals.deposit.toFixed(2)}€`, paymentTableX + paymentTableWidth/2 + 5, currentY + 8, { fontSize: 9 });
      addText(`Solde: ${(proformaData.totals.priceInclVat - proformaData.totals.deposit).toFixed(2)}€`, paymentTableX + paymentTableWidth/2 + 5, currentY + 16, { fontSize: 9, fontStyle: 'bold' });
    }

    currentY += paymentTableHeight + 20;

    // ===== REMARK SECTION =====
    console.log('Adding remark section...');
    
    if (proformaData.remark) {
      addText(`Remarque : ${proformaData.remark}`, margin, currentY, { fontSize: 9 });
      currentY += 8;
    }

    currentY += 10;

    // ===== FOOTER SECTION =====
    console.log('Adding footer section...');
    
    const footerY = pageHeight - 15;
    doc.setFillColor(52, 73, 94);
    doc.rect(0, footerY, pageWidth, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('LIMOSTAR - Professional Limousine Services', margin, footerY + 5);
    doc.text('Email: info@limostar.com | Tel: +32 2 123 45 67', margin, footerY + 11);
    
    const currentDate = new Date().toLocaleDateString('fr-FR');
    doc.text(`Généré le ${currentDate}`, pageWidth - 50, footerY + 5);

    console.log('Proforma PDF generation completed successfully');
    return doc;
  } catch (error) {
    console.error('Error generating proforma PDF:', error);
    throw error;
  }
}

export function downloadProforma(proformaData) {
  try {
    console.log('Downloading proforma PDF...', proformaData);
    const doc = generateProformaPDF(proformaData);
    const fileName = `proforma-${proformaData.proformaNumber || 'PF-0000'}-${proformaData.date || new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error downloading proforma PDF:', error);
    // Fallback: try to open in new tab
    try {
      const doc = generateProformaPDF(proformaData);
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  }
}

export function generateProformaNumber() {
  const currentYear = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-4);
  return `PF-${currentYear}${timestamp}`;
}