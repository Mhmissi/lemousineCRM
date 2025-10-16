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

// Helper function to load image as base64
const loadImageAsBase64 = async (imagePath) => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
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

export async function generateInvoicePDF(invoiceData) {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const rightMargin = 30;
    let yPosition = margin;

    // Load logo
    const logoBase64 = await loadImageAsBase64('/logo.png');

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
    
    // Add logo image if loaded successfully
    if (logoBase64) {
      try {
        // Add logo - adjust size as needed (width, height)
        doc.addImage(logoBase64, 'PNG', margin, headerY - 5, 40, 20);
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
        // Fallback to text if image fails
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(COMPANY_INFO.name, margin, headerY);
      }
    } else {
      // Fallback to text if logo not loaded
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(COMPANY_INFO.name, margin, headerY);
    }

    // Invoice details box (right side) - Grey background box
    const invoiceBoxWidth = 80;
    const invoiceBoxX = pageWidth - rightMargin - invoiceBoxWidth;
    const invoiceBoxHeight = 28;
    
    // Invoice box with grey background
    addRect(invoiceBoxX, headerY - 5, invoiceBoxWidth, invoiceBoxHeight, { 
      fill: true, 
      fillColor: [180, 180, 180], // Darker grey to match reference
      strokeColor: [0, 0, 0]
    });
    
    // Invoice number - "Facture N°" and number on same line
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black text on grey background
    doc.text(`Facture N° : ${invoiceData.invoiceNumber}`, invoiceBoxX + 4, headerY + 4);
    
    // Invoice details - Three lines as in reference
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    doc.text('PAGE 1', invoiceBoxX + 4, headerY + 9);
    doc.text(`DATE ${invoiceData.date}`, invoiceBoxX + 4, headerY + 13);
    doc.text(`CLIENT ${invoiceData.clientCode || 'CL1595'}`, invoiceBoxX + 4, headerY + 17);

    // Dividing line after logo and invoice number section
    const dividerY = headerY + invoiceBoxHeight;
    drawLine(margin, dividerY, pageWidth - rightMargin, dividerY, { width: 1 });
    
    // ===== COMPANY INFO AND CLIENT INFO ON SAME LINE =====
    const infoSectionY = dividerY + 8;
    
    // Company information (left side)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    let companyInfoY = infoSectionY;
    doc.text('65, Avenue Louise', margin, companyInfoY);
    doc.text('1050 Brussels', margin, companyInfoY + 4);
    doc.text('Belgium', margin, companyInfoY + 8);
    doc.text(`TVA: ${COMPANY_INFO.vat}`, margin, companyInfoY + 12);
    doc.text(`IBAN: ${COMPANY_INFO.iban}`, margin, companyInfoY + 16);
    doc.text(`BIC: ${COMPANY_INFO.bic}`, margin, companyInfoY + 20);
    
    // Client information (right side) - on the same horizontal line as company info
    const clientX = pageWidth / 2 + 20;
    const clientMaxWidth = pageWidth - rightMargin - clientX;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    // Client name - handle long names with text wrapping
    const clientName = invoiceData.clientName || 'Client non spécifié';
    const clientNameLines = doc.splitTextToSize(clientName, clientMaxWidth);
    
    let clientY = infoSectionY;
    clientNameLines.forEach((line, index) => {
      doc.text(line, clientX, clientY);
      clientY += 4;
    });
    
    // Client address (if provided)
    if (invoiceData.clientAddress) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      clientY += 2;
      
      if (Array.isArray(invoiceData.clientAddress)) {
        invoiceData.clientAddress.forEach((line) => {
          doc.text(line, clientX, clientY);
          clientY += 4;
        });
      } else {
        const addressLines = doc.splitTextToSize(invoiceData.clientAddress, clientMaxWidth);
        addressLines.forEach((line) => {
          doc.text(line, clientX, clientY);
          clientY += 4;
        });
      }
    }

    yPosition = Math.max(companyInfoY + 24, clientY) + 8;

    // ===== PAYMENT TERMS SECTION - Three boxes as in model =====
    yPosition += 3;
    
    // Payment information boxes - Three equal boxes with proper spacing
    const boxWidth = 50;
    const boxHeight = 25;
    const boxSpacing = 6;
    const totalBoxWidth = (boxWidth * 3) + (boxSpacing * 2);
    const startX = margin + (pageWidth - margin - rightMargin - totalBoxWidth) / 2; // Center the boxes
    
    // Box 1 - Payment method
    addRect(startX, yPosition, boxWidth, boxHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0], // Black border to match reference
      strokeWidth: 0.5
    });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('MODE DE REGLEMENT', startX + 3, yPosition + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.paymentMethod || 'virement', startX + 3, yPosition + 15);
    
    // Box 2 - Due date
    const box2X = startX + boxWidth + boxSpacing;
    addRect(box2X, yPosition, boxWidth, boxHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0], // Black border to match reference
      strokeWidth: 0.5
    });
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATE D\'ECHEANCE', box2X + 3, yPosition + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.dueDate || '2025-10-15', box2X + 3, yPosition + 15);
    
    // Box 3 - TVA (empty as shown in reference)
    const box3X = box2X + boxWidth + boxSpacing;
    addRect(box3X, yPosition, boxWidth, boxHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0], // Black border to match reference
      strokeWidth: 0.5
    });
    
    doc.setFont('helvetica', 'bold');
    doc.text('TVA', box3X + 3, yPosition + 6);
    // TVA box is intentionally left empty as shown in reference
    
    yPosition += boxHeight + 5;

    // ===== SERVICES TABLE SECTION =====
    const tableY = yPosition;
    
    // Calculate table width - Match exactly the payment boxes width
    const paymentBoxesWidth = (boxWidth * 3) + (boxSpacing * 2);
    const tableWidth = paymentBoxesWidth; // Same width as payment boxes
    const tableStartX = startX; // Same starting position as payment boxes
    
    // Table configuration - Match reference exactly
    const tableConfig = {
      // Positioning
      startX: tableStartX, // Centered table
      width: tableWidth, // Same width as payment boxes
      headerHeight: 20,
      rowHeight: 22,
      
      // Column configuration - Match reference layout
      columns: {
        description: { width: 0.4, label: 'DESIGNATION', align: 'left' },
        htva: { width: 0.2, label: 'H.T.V.A', align: 'right' },
        tva: { width: 0.2, label: 'T.V.A', align: 'right' },
        tvac: { width: 0.2, label: 'T.V.A.C', align: 'right' }
      },
      
      // Spacing
      padding: 4,
      columnSpacing: 2
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
    
    // Table header - Match reference styling
    addRect(tableConfig.startX, tableY, totalTableWidth, tableConfig.headerHeight, { 
      fill: true, 
      fillColor: [220, 220, 220], // Grey background to match reference
      strokeColor: [0, 0, 0]
    });
    
    // Header text - Match reference exactly
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

    // Services Table Content - Match reference exactly
    invoiceData.services.forEach((service, index) => {
      const serviceY = yPosition + (index * tableConfig.rowHeight);
      
      // Set font properties
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Service description - left aligned
      const descCol = columnPositions.description;
      const serviceDescription = service.description || 'Service de transport limousine';
      const descriptionLines = doc.splitTextToSize(serviceDescription, descCol.width - (tableConfig.padding * 2));
      const textY = serviceY + (tableConfig.rowHeight / 2) + 2;
      doc.text(descriptionLines, descCol.start + tableConfig.padding, textY);
      
      // Price information - Match reference format exactly
      const priceData = [
        { key: 'htva', value: `${service.priceExclVat.toFixed(2)}€` },
        { key: 'tva', value: `(${service.vatRate}%) ${service.vatAmount.toFixed(2)}€` },
        { key: 'tvac', value: `${service.priceInclVat.toFixed(2)}€` }
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
        
        // Special handling for T.V.A.C column - bold as in reference
        if (key === 'tvac') {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold'); // Make T.V.A.C values bold
          doc.text(value, textX, textY, { align: col.align });
          doc.setFont('helvetica', 'normal'); // Reset font weight
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
    
    // Left side - Remark
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Remarque : www.locationautocar.be by Limostar', margin, totalsY);
    
    // TVA breakdown table (left side)
    const breakdownY = totalsY + 8;
    const breakdownWidth = 80;
    const breakdownHeight = 18;
    
    addRect(margin, breakdownY, breakdownWidth, breakdownHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0] // Black border to match reference
    });
    
    // Header row
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TVA', margin + 2, breakdownY + 3);
    doc.text('BASE', margin + 35, breakdownY + 3);
    doc.text('TVA', margin + 70, breakdownY + 3);
    
    // Service rows
    let serviceBreakdownY = breakdownY + 9;
    invoiceData.services.forEach((service) => {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${service.priceExclVat.toFixed(2)}€`, margin + 2, serviceBreakdownY);
      doc.text(`${service.vatAmount.toFixed(2)}€`, margin + 35, serviceBreakdownY);
      doc.text(`${service.priceInclVat.toFixed(2)}€`, margin + 70, serviceBreakdownY);
      serviceBreakdownY += 4;
    });
    
    // Right side - Payment summary
    const paymentSummaryX = pageWidth - rightMargin - 70;
    const paymentSummaryWidth = 70;
    const paymentSummaryHeight = 18;
    
    addRect(paymentSummaryX, breakdownY, paymentSummaryWidth, paymentSummaryHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0] // Black border to match reference
    });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    // TOTAL TVAC
    doc.text('TOTAL TVAC', paymentSummaryX + 2, breakdownY + 4);
    doc.text(`${invoiceData.totals.priceInclVat.toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 4, { align: 'right' });
    
    // ACOMPTE
    doc.text('ACOMPTE', paymentSummaryX + 2, breakdownY + 9);
    doc.text(`${(invoiceData.totals.deposit || 5.00).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 9, { align: 'right' });
    
    // RESTE A PAYER
    doc.text('RESTE A PAYER', paymentSummaryX + 2, breakdownY + 14);
    doc.text(`${(invoiceData.totals.priceInclVat - (invoiceData.totals.deposit || 5.00)).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 14, { align: 'right' });

    yPosition = totalsY + Math.max(breakdownHeight + 5, paymentSummaryHeight + 5);

    // ===== LEGAL TERMS SECTION =====
    yPosition += 15; // Increased spacing to match reference
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black text to match reference
    
    const maxTermWidth = pageWidth - margin - rightMargin;
    LEGAL_TERMS.forEach((term, index) => {
      // Split text to fit within page width
      const termText = `${index + 1}. ${term}`;
      const lines = doc.splitTextToSize(termText, maxTermWidth);
      
      // Add each line
      lines.forEach((line, lineIndex) => {
        doc.text(line, margin, yPosition);
        yPosition += 4; // Line spacing
      });
      
      yPosition += 2; // Extra spacing between terms
    });

    yPosition += 5;

    // ===== FOOTER SECTION =====
    const footerY = Math.max(yPosition + 3, pageHeight - 20);
    
    // Footer content - Match reference exactly
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('LIMOSTAR 65, Avenue Louise 1050 Brussels Belgium', margin, footerY + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black text to match reference
    doc.text(`TEL: ${COMPANY_INFO.phone} - E-mail: ${COMPANY_INFO.email} - Site Web: ${COMPANY_INFO.website}`, margin, footerY + 12);

    return doc;
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
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
        description: 'Service de transport limousine',
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
export async function downloadInvoice(invoiceData) {
  try {
    const doc = await generateInvoicePDF(invoiceData);
    const fileName = `Facture_${invoiceData.invoiceNumber}_${invoiceData.date}.pdf`;
    
    // Try the standard save method
    doc.save(fileName);

    // Fallback: Try to open in new tab if download doesn't work
    setTimeout(() => {
      const pdfDataUri = doc.output('datauristring');
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`);
      }
    }, 1000);
    
  } catch (error) {
    console.error('Error downloading invoice:', error);
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

// Generate Devis (Quote) PDF - Similar to invoice but with "DEVIS" label
export async function generateDevisPDF(devisData) {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const rightMargin = 30;
    let yPosition = margin;

    // Load logo
    const logoBase64 = await loadImageAsBase64('/logo.png');

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
    
    // Add logo image if loaded successfully
    if (logoBase64) {
      try {
        // Add logo - adjust size as needed (width, height)
        doc.addImage(logoBase64, 'PNG', margin, headerY - 5, 40, 20);
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
        // Fallback to text if image fails
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(COMPANY_INFO.name, margin, headerY);
      }
    } else {
      // Fallback to text if logo not loaded
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(COMPANY_INFO.name, margin, headerY);
    }

    // Devis details box (right side) - Grey background box
    const devisBoxWidth = 80;
    const devisBoxX = pageWidth - rightMargin - devisBoxWidth;
    const devisBoxHeight = 28;
    
    // Devis box with grey background
    addRect(devisBoxX, headerY - 5, devisBoxWidth, devisBoxHeight, { 
      fill: true, 
      fillColor: [180, 180, 180], // Darker grey to match reference
      strokeColor: [0, 0, 0]
    });
    
    // Devis number - "Devis N°" and number on same line
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black text on grey background
    doc.text(`Devis N° : ${devisData.devisNumber || devisData.number}`, devisBoxX + 4, headerY + 4);
    
    // Devis details - Three lines as in reference
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    doc.text('PAGE 1', devisBoxX + 4, headerY + 9);
    doc.text(`DATE ${devisData.date}`, devisBoxX + 4, headerY + 13);
    doc.text(`CLIENT ${devisData.clientCode || 'CL1595'}`, devisBoxX + 4, headerY + 17);

    // Dividing line after logo and devis number section
    const dividerY = headerY + devisBoxHeight;
    drawLine(margin, dividerY, pageWidth - rightMargin, dividerY, { width: 1 });
    
    // ===== COMPANY INFO AND CLIENT INFO ON SAME LINE =====
    const infoSectionY = dividerY + 8;
    
    // Company information (left side)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    let companyInfoY = infoSectionY;
    doc.text('65, Avenue Louise', margin, companyInfoY);
    doc.text('1050 Brussels', margin, companyInfoY + 4);
    doc.text('Belgium', margin, companyInfoY + 8);
    doc.text(`TVA: ${COMPANY_INFO.vat}`, margin, companyInfoY + 12);
    doc.text(`IBAN: ${COMPANY_INFO.iban}`, margin, companyInfoY + 16);
    doc.text(`BIC: ${COMPANY_INFO.bic}`, margin, companyInfoY + 20);
    
    // Client information (right side) - on the same horizontal line as company info
    const clientX = pageWidth / 2 + 20;
    const clientMaxWidth = pageWidth - rightMargin - clientX;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    // Client name - handle long names with text wrapping
    const clientName = devisData.clientName || 'Client non spécifié';
    const clientNameLines = doc.splitTextToSize(clientName, clientMaxWidth);
    
    let clientY = infoSectionY;
    clientNameLines.forEach((line, index) => {
      doc.text(line, clientX, clientY);
      clientY += 4;
    });
    
    // Client address (if provided)
    if (devisData.clientAddress) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      clientY += 2;
      
      if (Array.isArray(devisData.clientAddress)) {
        devisData.clientAddress.forEach((line) => {
          doc.text(line, clientX, clientY);
          clientY += 4;
        });
      } else {
        const addressLines = doc.splitTextToSize(devisData.clientAddress, clientMaxWidth);
        addressLines.forEach((line) => {
          doc.text(line, clientX, clientY);
          clientY += 4;
        });
      }
    }

    yPosition = Math.max(companyInfoY + 24, clientY) + 8;

    // ===== PAYMENT TERMS SECTION - Three boxes as in model =====
    yPosition += 3;
    
    // Payment information boxes - Three equal boxes with proper spacing
    const boxWidth = 50;
    const boxHeight = 25;
    const boxSpacing = 6;
    const totalBoxWidth = (boxWidth * 3) + (boxSpacing * 2);
    const startX = margin + (pageWidth - margin - rightMargin - totalBoxWidth) / 2; // Center the boxes
    
    // Box 1 - Payment method
    addRect(startX, yPosition, boxWidth, boxHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0],
      strokeWidth: 0.5
    });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('MODE DE REGLEMENT', startX + 3, yPosition + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(devisData.paymentMethod || 'virement', startX + 3, yPosition + 15);
    
    // Box 2 - Due date
    const box2X = startX + boxWidth + boxSpacing;
    addRect(box2X, yPosition, boxWidth, boxHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0],
      strokeWidth: 0.5
    });
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATE D\'ECHEANCE', box2X + 3, yPosition + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(devisData.dueDate || '2025-10-15', box2X + 3, yPosition + 15);
    
    // Box 3 - TVA (empty as shown in reference)
    const box3X = box2X + boxWidth + boxSpacing;
    addRect(box3X, yPosition, boxWidth, boxHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0],
      strokeWidth: 0.5
    });
    
    doc.setFont('helvetica', 'bold');
    doc.text('TVA', box3X + 3, yPosition + 6);
    
    yPosition += boxHeight + 5;

    // ===== SERVICES TABLE SECTION =====
    const tableY = yPosition;
    
    const paymentBoxesWidth = (boxWidth * 3) + (boxSpacing * 2);
    const tableWidth = paymentBoxesWidth;
    const tableStartX = startX;
    
    const tableConfig = {
      startX: tableStartX,
      width: tableWidth,
      headerHeight: 20,
      rowHeight: 22,
      columns: {
        description: { width: 0.4, label: 'DESIGNATION', align: 'left' },
        htva: { width: 0.2, label: 'H.T.V.A', align: 'right' },
        tva: { width: 0.2, label: 'T.V.A', align: 'right' },
        tvac: { width: 0.2, label: 'T.V.A.C', align: 'right' }
      },
      padding: 4,
      columnSpacing: 2
    };
    
    // Calculate column positions
    let currentX = tableConfig.startX;
    const columnPositions = {};
    const columnKeys = Object.keys(tableConfig.columns);
    
    const totalSpacing = (columnKeys.length - 1) * tableConfig.columnSpacing;
    const availableWidth = tableConfig.width - totalSpacing;
    
    columnKeys.forEach((key, index) => {
      const column = tableConfig.columns[key];
      let columnWidth;
      
      if (key === 'htva' || key === 'tva' || key === 'tvac') {
        const descriptionWidth = Math.floor(availableWidth * 0.4);
        const numericColumnsWidth = availableWidth - descriptionWidth;
        columnWidth = Math.floor(numericColumnsWidth / 3);
      } else {
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
      fillColor: [220, 220, 220],
      strokeColor: [0, 0, 0]
    });
    
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
    const services = devisData.services || [];
    services.forEach((service, index) => {
      const serviceY = yPosition + (index * tableConfig.rowHeight);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Service description
      const descCol = columnPositions.description;
      const serviceDescription = service.description || 'Service de transport limousine';
      const descriptionLines = doc.splitTextToSize(serviceDescription, descCol.width - (tableConfig.padding * 2));
      const textY = serviceY + (tableConfig.rowHeight / 2) + 2;
      doc.text(descriptionLines, descCol.start + tableConfig.padding, textY);
      
      // Price information
      const priceData = [
        { key: 'htva', value: `${service.priceExclVat.toFixed(2)}€` },
        { key: 'tva', value: `(${service.vatRate}%) ${service.vatAmount.toFixed(2)}€` },
        { key: 'tvac', value: `${service.priceInclVat.toFixed(2)}€` }
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
        
        if (key === 'tvac') {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(value, textX, textY, { align: col.align });
          doc.setFont('helvetica', 'normal');
        } else {
          doc.text(value, textX, textY, { align: col.align });
        }
      });
    });

    // Draw table lines
    const totalRows = services.length;
    const tableBottom = yPosition + (totalRows * tableConfig.rowHeight);
    
    Object.keys(tableConfig.columns).forEach((key, index) => {
      if (index > 0) {
        const col = columnPositions[key];
        drawLine(col.start - tableConfig.columnSpacing/2, tableY, col.start - tableConfig.columnSpacing/2, tableBottom, { color: [0, 0, 0], width: 0.5 });
      }
    });
    
    drawLine(tableConfig.startX, tableY, tableConfig.startX, tableBottom, { color: [0, 0, 0], width: 0.5 });
    drawLine(tableConfig.startX + totalTableWidth, tableY, tableConfig.startX + totalTableWidth, tableBottom, { color: [0, 0, 0], width: 0.5 });
    
    if (totalRows > 1) {
      for (let i = 2; i <= totalRows; i++) {
        const lineY = tableY + tableConfig.headerHeight + ((i - 1) * tableConfig.rowHeight);
        drawLine(tableConfig.startX, lineY, tableConfig.startX + totalTableWidth, lineY, { color: [0, 0, 0], width: 0.5 });
      }
    }
    
    drawLine(tableConfig.startX, tableBottom, tableConfig.startX + totalTableWidth, tableBottom, { color: [0, 0, 0], width: 0.5 });

    yPosition = yPosition + (services.length * tableConfig.rowHeight) + 10;

    // ===== TOTALS SECTION =====
    const totalsY = yPosition;
    
    // Left side - Remark
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(devisData.remark || 'www.locationautocar.be by Limostar', margin, totalsY);
    
    // TVA breakdown table (left side)
    const breakdownY = totalsY + 8;
    const breakdownWidth = 80;
    const breakdownHeight = 18;
    
    addRect(margin, breakdownY, breakdownWidth, breakdownHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0]
    });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TVA', margin + 2, breakdownY + 3);
    doc.text('BASE', margin + 35, breakdownY + 3);
    doc.text('TVA', margin + 70, breakdownY + 3);
    
    let serviceBreakdownY = breakdownY + 9;
    services.forEach((service) => {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${service.priceExclVat.toFixed(2)}€`, margin + 2, serviceBreakdownY);
      doc.text(`${service.vatAmount.toFixed(2)}€`, margin + 35, serviceBreakdownY);
      doc.text(`${service.priceInclVat.toFixed(2)}€`, margin + 70, serviceBreakdownY);
      serviceBreakdownY += 4;
    });
    
    // Right side - Payment summary
    const paymentSummaryX = pageWidth - rightMargin - 70;
    const paymentSummaryWidth = 70;
    const paymentSummaryHeight = 18;
    
    addRect(paymentSummaryX, breakdownY, paymentSummaryWidth, paymentSummaryHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0]
    });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    const totals = devisData.totals || { priceInclVat: 0, deposit: 0 };
    
    doc.text('TOTAL TVAC', paymentSummaryX + 2, breakdownY + 4);
    doc.text(`${totals.priceInclVat.toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 4, { align: 'right' });
    
    doc.text('ACOMPTE', paymentSummaryX + 2, breakdownY + 9);
    doc.text(`${(totals.deposit || 0).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 9, { align: 'right' });
    
    doc.text('RESTE A PAYER', paymentSummaryX + 2, breakdownY + 14);
    doc.text(`${(totals.priceInclVat - (totals.deposit || 0)).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 14, { align: 'right' });

    yPosition = totalsY + Math.max(breakdownHeight + 5, paymentSummaryHeight + 5);

    // ===== LEGAL TERMS SECTION =====
    yPosition += 15;
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const maxTermWidth = pageWidth - margin - rightMargin;
    LEGAL_TERMS.forEach((term, index) => {
      // Split text to fit within page width
      const termText = `${index + 1}. ${term}`;
      const lines = doc.splitTextToSize(termText, maxTermWidth);
      
      // Add each line
      lines.forEach((line, lineIndex) => {
        doc.text(line, margin, yPosition);
        yPosition += 4; // Line spacing
      });
      
      yPosition += 2; // Extra spacing between terms
    });

    yPosition += 5;

    // ===== FOOTER SECTION =====
    const footerY = Math.max(yPosition + 3, pageHeight - 20);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('LIMOSTAR 65, Avenue Louise 1050 Brussels Belgium', margin, footerY + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`TEL: ${COMPANY_INFO.phone} - E-mail: ${COMPANY_INFO.email} - Site Web: ${COMPANY_INFO.website}`, margin, footerY + 12);

    return doc;
  } catch (error) {
    console.error('Error generating devis PDF:', error);
    throw error;
  }
}

// Helper function to generate and download devis
export async function downloadDevis(devisData) {
  try {
    const doc = await generateDevisPDF(devisData);
    const fileName = `Devis_${devisData.devisNumber || devisData.number}_${devisData.date}.pdf`;
    
    // Try the standard save method
    doc.save(fileName);

    // Fallback: Try to open in new tab if download doesn't work
    setTimeout(() => {
      const pdfDataUri = doc.output('datauristring');
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`);
      }
    }, 1000);
    
  } catch (error) {
    console.error('Error downloading devis:', error);
    throw error;
  }
}

// Generate Proforma Invoice PDF - Similar to invoice but with "PROFORMA" label
export async function generateProformaPDF(proformaData) {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const rightMargin = 30;
    let yPosition = margin;

    // Load logo
    const logoBase64 = await loadImageAsBase64('/logo.png');

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
    
    // Add logo image if loaded successfully
    if (logoBase64) {
      try {
        // Add logo - adjust size as needed (width, height)
        doc.addImage(logoBase64, 'PNG', margin, headerY - 5, 40, 20);
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
        // Fallback to text if image fails
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(COMPANY_INFO.name, margin, headerY);
      }
    } else {
      // Fallback to text if logo not loaded
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(COMPANY_INFO.name, margin, headerY);
    }

    // Proforma details box (right side) - Grey background box
    const proformaBoxWidth = 80;
    const proformaBoxX = pageWidth - rightMargin - proformaBoxWidth;
    const proformaBoxHeight = 28;
    
    // Proforma box with grey background
    addRect(proformaBoxX, headerY - 5, proformaBoxWidth, proformaBoxHeight, { 
      fill: true, 
      fillColor: [180, 180, 180], // Darker grey to match reference
      strokeColor: [0, 0, 0]
    });
    
    // Proforma number - "Proforma N°" and number on same line
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black text on grey background
    doc.text(`Proforma N° : ${proformaData.proformaNumber || proformaData.number}`, proformaBoxX + 4, headerY + 4);
    
    // Proforma details - Three lines as in reference
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    doc.text('PAGE 1', proformaBoxX + 4, headerY + 9);
    doc.text(`DATE ${proformaData.date}`, proformaBoxX + 4, headerY + 13);
    doc.text(`CLIENT ${proformaData.clientCode || 'CL1595'}`, proformaBoxX + 4, headerY + 17);

    // Dividing line after logo and proforma number section
    const dividerY = headerY + proformaBoxHeight;
    drawLine(margin, dividerY, pageWidth - rightMargin, dividerY, { width: 1 });
    
    // ===== COMPANY INFO AND CLIENT INFO ON SAME LINE =====
    const infoSectionY = dividerY + 8;
    
    // Company information (left side)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    let companyInfoY = infoSectionY;
    doc.text('65, Avenue Louise', margin, companyInfoY);
    doc.text('1050 Brussels', margin, companyInfoY + 4);
    doc.text('Belgium', margin, companyInfoY + 8);
    doc.text(`TVA: ${COMPANY_INFO.vat}`, margin, companyInfoY + 12);
    doc.text(`IBAN: ${COMPANY_INFO.iban}`, margin, companyInfoY + 16);
    doc.text(`BIC: ${COMPANY_INFO.bic}`, margin, companyInfoY + 20);
    
    // Client information (right side) - on the same horizontal line as company info
    const clientX = pageWidth / 2 + 20;
    const clientMaxWidth = pageWidth - rightMargin - clientX;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    // Client name - handle long names with text wrapping
    const clientName = proformaData.clientName || 'Client non spécifié';
    const clientNameLines = doc.splitTextToSize(clientName, clientMaxWidth);
    
    let clientY = infoSectionY;
    clientNameLines.forEach((line, index) => {
      doc.text(line, clientX, clientY);
      clientY += 4;
    });
    
    // Client address (if provided)
    if (proformaData.clientAddress) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      clientY += 2;
      
      if (Array.isArray(proformaData.clientAddress)) {
        proformaData.clientAddress.forEach((line) => {
          doc.text(line, clientX, clientY);
          clientY += 4;
        });
      } else {
        const addressLines = doc.splitTextToSize(proformaData.clientAddress, clientMaxWidth);
        addressLines.forEach((line) => {
          doc.text(line, clientX, clientY);
          clientY += 4;
        });
      }
    }

    yPosition = Math.max(companyInfoY + 24, clientY) + 8;

    // ===== PAYMENT TERMS SECTION - Three boxes as in model =====
    yPosition += 3;
    
    // Payment information boxes - Three equal boxes with proper spacing
    const boxWidth = 50;
    const boxHeight = 25;
    const boxSpacing = 6;
    const totalBoxWidth = (boxWidth * 3) + (boxSpacing * 2);
    const startX = margin + (pageWidth - margin - rightMargin - totalBoxWidth) / 2; // Center the boxes
    
    // Box 1 - Payment method
    addRect(startX, yPosition, boxWidth, boxHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0],
      strokeWidth: 0.5
    });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('MODE DE REGLEMENT', startX + 3, yPosition + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(proformaData.paymentMethod || 'virement', startX + 3, yPosition + 15);
    
    // Box 2 - Due date
    const box2X = startX + boxWidth + boxSpacing;
    addRect(box2X, yPosition, boxWidth, boxHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0],
      strokeWidth: 0.5
    });
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATE D\'ECHEANCE', box2X + 3, yPosition + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(proformaData.dueDate || '2025-10-15', box2X + 3, yPosition + 15);
    
    // Box 3 - TVA (empty as shown in reference)
    const box3X = box2X + boxWidth + boxSpacing;
    addRect(box3X, yPosition, boxWidth, boxHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0],
      strokeWidth: 0.5
    });
    
    doc.setFont('helvetica', 'bold');
    doc.text('TVA', box3X + 3, yPosition + 6);
    
    yPosition += boxHeight + 5;

    // ===== SERVICES TABLE SECTION =====
    const tableY = yPosition;
    
    const paymentBoxesWidth = (boxWidth * 3) + (boxSpacing * 2);
    const tableWidth = paymentBoxesWidth;
    const tableStartX = startX;
    
    const tableConfig = {
      startX: tableStartX,
      width: tableWidth,
      headerHeight: 20,
      rowHeight: 22,
      columns: {
        description: { width: 0.4, label: 'DESIGNATION', align: 'left' },
        htva: { width: 0.2, label: 'H.T.V.A', align: 'right' },
        tva: { width: 0.2, label: 'T.V.A', align: 'right' },
        tvac: { width: 0.2, label: 'T.V.A.C', align: 'right' }
      },
      padding: 4,
      columnSpacing: 2
    };
    
    // Calculate column positions
    let currentX = tableConfig.startX;
    const columnPositions = {};
    const columnKeys = Object.keys(tableConfig.columns);
    
    const totalSpacing = (columnKeys.length - 1) * tableConfig.columnSpacing;
    const availableWidth = tableConfig.width - totalSpacing;
    
    columnKeys.forEach((key, index) => {
      const column = tableConfig.columns[key];
      let columnWidth;
      
      if (key === 'htva' || key === 'tva' || key === 'tvac') {
        const descriptionWidth = Math.floor(availableWidth * 0.4);
        const numericColumnsWidth = availableWidth - descriptionWidth;
        columnWidth = Math.floor(numericColumnsWidth / 3);
      } else {
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
      fillColor: [220, 220, 220],
      strokeColor: [0, 0, 0]
    });
    
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
    const services = proformaData.services || [];
    services.forEach((service, index) => {
      const serviceY = yPosition + (index * tableConfig.rowHeight);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Service description
      const descCol = columnPositions.description;
      const serviceDescription = service.description || 'Service de transport limousine';
      const descriptionLines = doc.splitTextToSize(serviceDescription, descCol.width - (tableConfig.padding * 2));
      const textY = serviceY + (tableConfig.rowHeight / 2) + 2;
      doc.text(descriptionLines, descCol.start + tableConfig.padding, textY);
      
      // Price information
      const priceData = [
        { key: 'htva', value: `${service.priceExclVat.toFixed(2)}€` },
        { key: 'tva', value: `(${service.vatRate}%) ${service.vatAmount.toFixed(2)}€` },
        { key: 'tvac', value: `${service.priceInclVat.toFixed(2)}€` }
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
        
        if (key === 'tvac') {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(value, textX, textY, { align: col.align });
          doc.setFont('helvetica', 'normal');
        } else {
          doc.text(value, textX, textY, { align: col.align });
        }
      });
    });

    // Draw table lines
    const totalRows = services.length;
    const tableBottom = yPosition + (totalRows * tableConfig.rowHeight);
    
    Object.keys(tableConfig.columns).forEach((key, index) => {
      if (index > 0) {
        const col = columnPositions[key];
        drawLine(col.start - tableConfig.columnSpacing/2, tableY, col.start - tableConfig.columnSpacing/2, tableBottom, { color: [0, 0, 0], width: 0.5 });
      }
    });
    
    drawLine(tableConfig.startX, tableY, tableConfig.startX, tableBottom, { color: [0, 0, 0], width: 0.5 });
    drawLine(tableConfig.startX + totalTableWidth, tableY, tableConfig.startX + totalTableWidth, tableBottom, { color: [0, 0, 0], width: 0.5 });
    
    if (totalRows > 1) {
      for (let i = 2; i <= totalRows; i++) {
        const lineY = tableY + tableConfig.headerHeight + ((i - 1) * tableConfig.rowHeight);
        drawLine(tableConfig.startX, lineY, tableConfig.startX + totalTableWidth, lineY, { color: [0, 0, 0], width: 0.5 });
      }
    }
    
    drawLine(tableConfig.startX, tableBottom, tableConfig.startX + totalTableWidth, tableBottom, { color: [0, 0, 0], width: 0.5 });

    yPosition = yPosition + (services.length * tableConfig.rowHeight) + 10;

    // ===== TOTALS SECTION =====
    const totalsY = yPosition;
    
    // Left side - Remark
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(proformaData.remark || 'www.locationautocar.be by Limostar', margin, totalsY);
    
    // TVA breakdown table (left side)
    const breakdownY = totalsY + 8;
    const breakdownWidth = 80;
    const breakdownHeight = 18;
    
    addRect(margin, breakdownY, breakdownWidth, breakdownHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0]
    });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TVA', margin + 2, breakdownY + 3);
    doc.text('BASE', margin + 35, breakdownY + 3);
    doc.text('TVA', margin + 70, breakdownY + 3);
    
    let serviceBreakdownY = breakdownY + 9;
    services.forEach((service) => {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${service.priceExclVat.toFixed(2)}€`, margin + 2, serviceBreakdownY);
      doc.text(`${service.vatAmount.toFixed(2)}€`, margin + 35, serviceBreakdownY);
      doc.text(`${service.priceInclVat.toFixed(2)}€`, margin + 70, serviceBreakdownY);
      serviceBreakdownY += 4;
    });
    
    // Right side - Payment summary
    const paymentSummaryX = pageWidth - rightMargin - 70;
    const paymentSummaryWidth = 70;
    const paymentSummaryHeight = 18;
    
    addRect(paymentSummaryX, breakdownY, paymentSummaryWidth, paymentSummaryHeight, { 
      fill: false, 
      strokeColor: [0, 0, 0]
    });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    const totals = proformaData.totals || { priceInclVat: 0, deposit: 0 };
    
    doc.text('TOTAL TVAC', paymentSummaryX + 2, breakdownY + 4);
    doc.text(`${totals.priceInclVat.toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 4, { align: 'right' });
    
    doc.text('ACOMPTE', paymentSummaryX + 2, breakdownY + 9);
    doc.text(`${(totals.deposit || 0).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 9, { align: 'right' });
    
    doc.text('RESTE A PAYER', paymentSummaryX + 2, breakdownY + 14);
    doc.text(`${(totals.priceInclVat - (totals.deposit || 0)).toFixed(2)}€`, paymentSummaryX + paymentSummaryWidth - 15, breakdownY + 14, { align: 'right' });

    yPosition = totalsY + Math.max(breakdownHeight + 5, paymentSummaryHeight + 5);

    // ===== LEGAL TERMS SECTION =====
    yPosition += 15;
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const maxTermWidth = pageWidth - margin - rightMargin;
    LEGAL_TERMS.forEach((term, index) => {
      // Split text to fit within page width
      const termText = `${index + 1}. ${term}`;
      const lines = doc.splitTextToSize(termText, maxTermWidth);
      
      // Add each line
      lines.forEach((line, lineIndex) => {
        doc.text(line, margin, yPosition);
        yPosition += 4; // Line spacing
      });
      
      yPosition += 2; // Extra spacing between terms
    });

    yPosition += 5;

    // ===== FOOTER SECTION =====
    const footerY = Math.max(yPosition + 3, pageHeight - 20);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('LIMOSTAR 65, Avenue Louise 1050 Brussels Belgium', margin, footerY + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`TEL: ${COMPANY_INFO.phone} - E-mail: ${COMPANY_INFO.email} - Site Web: ${COMPANY_INFO.website}`, margin, footerY + 12);

    return doc;
  } catch (error) {
    console.error('Error generating proforma PDF:', error);
    throw error;
  }
}

// Helper function to generate and download proforma
export async function downloadProforma(proformaData) {
  try {
    const doc = await generateProformaPDF(proformaData);
    const fileName = `Proforma_${proformaData.proformaNumber || proformaData.number}_${proformaData.date}.pdf`;
    
    // Try the standard save method
    doc.save(fileName);

    // Fallback: Try to open in new tab if download doesn't work
    setTimeout(() => {
      const pdfDataUri = doc.output('datauristring');
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`);
      }
    }, 1000);
    
  } catch (error) {
    console.error('Error downloading proforma:', error);
    throw error;
  }
}