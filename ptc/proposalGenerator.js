(function (global) {
  'use strict';

  const defaultData = {
    ref_no: 'ADH-PTC-TPI-2025-158/PC/ZC',
    revision: '00',
    date: '',
    company_name: 'ARABIAN INDUSTRIES LLC - GCC',
    branch: 'Branch - Abu Dhabi 1',
    address_block: 'PO Box. 39646, Shining Towers,\nTower 1, Level 21, Unit 2101\nAbu Dhabi, UAE',
    tel: '+971 2 639 6166',
    fax: '+971 2 639 6155',
    direct_no: '050 809 2159',
    person1_name: 'Mr. Santhosh Kale',
    person1_title: 'Purchasing Officer',
    person2_name: 'Mr. Appala Naidu',
    person2_title: 'QA/QC Manager'
  };

  const letterheadPath = 'letterhead.png';
  let letterheadPromise = null;

  function normalizeData(raw = {}) {
    const normalized = { ...defaultData, ...raw };
    if (!normalized.date) {
      const today = new Date();
      normalized.date = today.toISOString().split('T')[0];
    }
    return normalized;
  }

  function formatDate(dateInput) {
    if (!dateInput) {
      const today = new Date();
      dateInput = today.toISOString().split('T')[0];
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '25th October, 2025';

    const day = d.getDate();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();

    const suf = (day === 1 || day === 21 || day === 31) ? 'st'
      : (day === 2 || day === 22) ? 'nd'
        : (day === 3 || day === 23) ? 'rd'
          : 'th';
    return `${day}${suf} ${month}, ${year}`;
  }

  function formatDateShort(dateInput) {
    if (!dateInput) {
      return '25 OCT 25';
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '25 OCT 25';

    const day = d.getDate();
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear().toString().slice(-2);

    return `${day} ${month} ${year}`;
  }

  function loadLetterhead(src = letterheadPath) {
    if (letterheadPromise) return letterheadPromise;

    letterheadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not load letterhead image. Please ensure it is present.'));
    });

    return letterheadPromise;
  }

  async function generatePdf(rawData = {}, options = {}) {
    if (!global.jspdf || !global.jspdf.jsPDF) {
      throw new Error('jsPDF is required before generating the PDF.');
    }

    const data = normalizeData(rawData);
    const { jsPDF } = global.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const img = await loadLetterhead(options.letterheadPath || letterheadPath);
    const pageWidth = 210;
    const pageHeight = 297;

    const refNo = data.ref_no || defaultData.ref_no;
    const revision = data.revision || defaultData.revision;
    const displayDate = formatDate(data.date);
    const shortDate = formatDateShort(data.date);

    drawPage1(
      doc,
      img,
      pageWidth,
      pageHeight,
      refNo,
      revision,
      displayDate,
      data.company_name,
      data.branch,
      data.address_block,
      data.tel,
      data.fax,
      data.direct_no,
      data.person1_name,
      data.person1_title,
      data.person2_name,
      data.person2_title
    );

    doc.addPage();
    drawTableOfContents(doc, img, pageWidth, pageHeight, refNo, revision, shortDate);

    doc.addPage();
    drawPage3(doc, img, pageWidth, pageHeight, refNo, revision, shortDate, displayDate, data.company_name, data.branch);

    doc.addPage();
    drawPage4(doc, img, pageWidth, pageHeight, refNo, revision, shortDate, data.company_name);

    doc.addPage();
    drawPage5(doc, img, pageWidth, pageHeight, refNo, revision, shortDate, data.company_name);

    doc.addPage();
    drawPage6(doc, img, pageWidth, pageHeight, refNo, revision, shortDate, data.company_name, refNo);

    for (let i = 7; i <= 18; i++) {
      doc.addPage();
      drawGeneralTermsPage(doc, img, pageWidth, pageHeight, refNo, revision, shortDate, i);
    }

    if (options.download !== false) {
      const filename = options.filename || `${refNo.replace(/\//g, '-')}_Proposal.pdf`;
      doc.save(filename);
    }

    return doc;
  }

  // ---- Drawing helpers (unchanged logic from original script) ----

  function drawPage1(doc, img, pageWidth, pageHeight, refNo, revision, displayDate, companyName,
    branch, addressBlock, tel, fax, directNo, person1Name, person1Title, person2Name, person2Title) {
    doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

    const left = 10;
    const top = 55;
    const width = pageWidth - 20;
    const height = 100;

    doc.setDrawColor(0);
    doc.rect(left, top, width, height);

    const row1 = top + 12;
    const row2 = top + 24;
    const row3 = top + 40;
    doc.line(left, row1, left + width, row1);
    doc.line(left, row2, left + width, row2);
    doc.line(left, row3, left + width, row3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('PROMINENT TEAM CONSULTANCY LLC – COMMERCIAL / TECHNICAL PROPOSAL',
      pageWidth / 2, top + 8, { align: 'center' });

    doc.setTextColor(180, 0, 0);
    doc.setFontSize(13);
    doc.text('THIRD PARTY INSPECTION SERVICES', pageWidth / 2, row1 + 7, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    const desc = 'WITNESS AND CERTIFICATION OF PQT, WPS, WPQR, VALVE TEST, MATERIAL INSPECTION, 3.2 CERTIFICATION, LAB TESTS, PAINTING INSPECTION AND REVIEW OF DOCUMENTS';
    const descLines = doc.splitTextToSize(desc, width - 8);
    doc.text(descLines, pageWidth / 2, row2 + 10, { align: 'center' });

    const gridTop = row3;
    const gridHeight = top + height - gridTop;
    const col1Width = 50;
    const col3Width = 60;
    const col2Width = width - col1Width - col3Width;

    const x1 = left;
    const x2 = left + col1Width;
    const x3 = left + col1Width + col2Width;

    doc.line(x2, gridTop, x2, gridTop + gridHeight);
    doc.line(x3, gridTop, x3, gridTop + gridHeight);

    const rowRef = gridTop + 15;
    const rowRev = gridTop + 30;
    doc.line(x1, rowRef, x2, rowRef);
    doc.line(x1, rowRev, x2, rowRev);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('Ref. No.', x1 + 2, gridTop + 10);
    doc.text('Revision', x1 + 2, rowRef + 10);
    doc.text('Date', x1 + 2, rowRev + 10);

    doc.setTextColor(180, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const refLines = doc.splitTextToSize(refNo, col1Width - 4);
    doc.text(refLines, x1 + 2, gridTop + 5);
    doc.text(revision, x1 + 2, rowRef + 5);
    const dateLines = doc.splitTextToSize(displayDate, col1Width - 4);
    doc.text(dateLines, x1 + 2, rowRev + 5);

    let middleY = gridTop + 6;
    doc.setFontSize(9);
    const compLines = doc.splitTextToSize(companyName, col2Width - 4);
    compLines.forEach(line => {
      doc.text(line, x2 + 2, middleY);
      middleY += 4.5;
    });

    if (branch) {
      const branchLines = doc.splitTextToSize(branch, col2Width - 4);
      branchLines.forEach(line => {
        doc.text(line, x2 + 2, middleY);
        middleY += 4.5;
      });
    }

    middleY += 1;
    doc.setFontSize(8);
    const addrLines = (addressBlock || '').split(/\r?\n/);
    addrLines.forEach(line => {
      const wrappedLines = doc.splitTextToSize(line, col2Width - 4);
      wrappedLines.forEach(wl => {
        doc.text(wl, x2 + 2, middleY);
        middleY += 4;
      });
    });

    middleY += 2;
    doc.text('T ' + tel, x2 + 2, middleY); middleY += 4.5;
    doc.text('F ' + fax, x2 + 2, middleY); middleY += 4.5;
    doc.text('Direct No: ' + directNo, x2 + 2, middleY);

    let rightY = gridTop + 6;
    doc.setFontSize(9);
    const p1NameLines = doc.splitTextToSize(person1Name, col3Width - 4);
    p1NameLines.forEach(line => {
      doc.text(line, x3 + 2, rightY);
      rightY += 4.5;
    });

    const p1TitleLines = doc.splitTextToSize(person1Title, col3Width - 4);
    p1TitleLines.forEach(line => {
      doc.text(line, x3 + 2, rightY);
      rightY += 4.5;
    });

    rightY += 2;
    doc.text('&', x3 + 2, rightY);
    rightY += 6;

    const p2NameLines = doc.splitTextToSize(person2Name, col3Width - 4);
    p2NameLines.forEach(line => {
      doc.text(line, x3 + 2, rightY);
      rightY += 4.5;
    });

    const p2TitleLines = doc.splitTextToSize(person2Title, col3Width - 4);
    p2TitleLines.forEach(line => {
      doc.text(line, x3 + 2, rightY);
      rightY += 4.5;
    });
  }

  function drawHeader(doc, refNo, revision, shortDate, pageNum, totalPages) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const headers = [
      'Revision\nNo.',
      'Date Issued',
      'Third Party Inspection Services',
      'Ref. No.',
      'Page\nNo.'
    ];

    const values = [
      revision,
      shortDate,
      'WITNESS AND CERTIFICATION OF PQT, WPS,\nWPQR, VALVE TEST, MATERIAL INSPECTION, 3.2\nCERTIFICATION, LAB TESTS, PAINTING INSPECTION\nAND REVIEW OF DOCUMENTS',
      refNo,
      `${pageNum}\nof ${totalPages}`
    ];

    const startX = 15;
    const startY = 60;
    const colWidths = [20, 25, 85, 45, 15];
    const headerRowHeight = 10;
    const valueRowHeight = 10;
    const totalHeight = headerRowHeight + valueRowHeight;

    doc.setDrawColor(0);
    doc.setLineWidth(0.2);

    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    doc.setFillColor(255, 255, 255);
    doc.rect(startX, startY, totalWidth, totalHeight, 'F');
    doc.rect(startX, startY, totalWidth, totalHeight);

    let currentX = startX;
    for (let i = 0; i < colWidths.length - 1; i++) {
      currentX += colWidths[i];
      doc.line(currentX, startY, currentX, startY + totalHeight);
    }

    doc.line(startX, startY + headerRowHeight, startX + totalWidth, startY + headerRowHeight);

    currentX = startX;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    for (let i = 0; i < headers.length; i++) {
      const lines = headers[i].split('\n');
      let y = startY + 4;
      lines.forEach(line => {
        doc.text(line, currentX + colWidths[i] / 2, y, { align: 'center' });
        y += 3.5;
      });
      currentX += colWidths[i];
    }

    doc.setFont('helvetica', 'bold');
    currentX = startX;
    for (let i = 0; i < values.length; i++) {
      if (i === 2) {
        doc.setFontSize(6.5);
      } else {
        doc.setFontSize(8);
      }
      const text = values[i];
      const maxWidth = colWidths[i] - 2;
      const lines = doc.splitTextToSize(text, maxWidth);
      let y = startY + headerRowHeight + 4;
      lines.forEach(line => {
        doc.text(line, currentX + colWidths[i] / 2, y, { align: 'center' });
        y += 3.5;
      });
      currentX += colWidths[i];
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    return startY + totalHeight;
  }

  function drawTableOfContents(doc, img, pageWidth, pageHeight, refNo, revision, shortDate) {
    doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

    const headerBottom = drawHeader(doc, refNo, revision, shortDate, 2, 18);

    let y = headerBottom + 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TABLE OF CONTENTS', pageWidth / 2, y, { align: 'center' });

    y += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const tocItems = [
      ['1', 'INTRODUCTION', '3'],
      ['2', 'SCOPE OF WORK', '3'],
      ['3', 'REPORTING', '4'],
      ['4', 'FEES', '4'],
      ['5', 'TERMS OF PAYMENT', '5'],
      ['6', 'VALIDITY OF THIS PROPOSAL', '5'],
      ['7', 'SPECIAL CONDITIONS', '5'],
      ['8', 'IDENTIFICATION AND SIGNATURE', '6']
    ];

    tocItems.forEach(item => {
      doc.text(item[0], 30, y);
      doc.text(item[1], 45, y);
      doc.text(item[2], 170, y);
      y += 8;
    });
  }

  function drawPage3(doc, img, pageWidth, pageHeight, refNo, revision, shortDate, displayDate, companyName, branch) {
    doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

    const headerBottom = drawHeader(doc, refNo, revision, shortDate, 3, 18);

    let y = headerBottom + 12;
    const leftMargin = 15;
    const rightMargin = 195;
    const contentWidth = rightMargin - leftMargin;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('1. INTRODUCTION', leftMargin, y);

    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const introText = `Prominent Team Consultancy LLC (PTC) has prepared this proposal document (Ref. ${refNo}, dated ${displayDate}) after receiving a request from ${companyName} ${branch}, to carry out Witness and Certification of PQT, WPS, WQT, WPQR, Valve Test, Material Inspection, 3.2 Certification, Lab test, Painting Inspection and Review of Documents in Arabian Industries and Abu Dhabi, UAE.`;

    const introLines = doc.splitTextToSize(introText, contentWidth);
    introLines.forEach(line => {
      doc.text(line, leftMargin, y);
      y += 5;
    });

    y += 3;
    doc.text('Prominent Team Consultancy LLC is an ADNOC Approved Company', leftMargin, y);
    y += 5;
    doc.text('& Accredited to: ISO 17020 by EIAC', leftMargin, y);
    y += 5;
    doc.text('Certifications: ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018', leftMargin, y);

    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. SCOPE OF WORK', leftMargin, y);

    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ref : ${companyName}, mail dated on 24.10.2025`, leftMargin, y);

    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Certification of Welding Procedure Qualification:', leftMargin, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    const scopeText1 = 'PTC LLC Sr. Surveyor / Authorized Inspector will witness the following to certify the welding procedures according to applicable standards.';
    const scope1Lines = doc.splitTextToSize(scopeText1, contentWidth);
    scope1Lines.forEach(line => {
      doc.text(line, leftMargin, y);
      y += 5;
    });

    y += 2;
    const bullets1 = [
      '• Review of proposed Welding Procedure Specification (WPS) before the test.',
      '• Witness of Welding Procedure Qualification Tests (WPQT)',
      '• Review and endorse of NDT Reports',
      '• Witness Mechanical tests at independent Laboratory',
      '• Review and endorse of WPS & WPQR'
    ];

    bullets1.forEach(bullet => {
      const bulletLines = doc.splitTextToSize(bullet, contentWidth - 5);
      bulletLines.forEach(line => {
        doc.text(line, leftMargin + 2, y);
        y += 5;
      });
    });

    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.text('Note:', leftMargin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const noteText = `Non-Destructive Testing (NDT) and Mechanical Tests at independent laboratories shall be arranged by ${companyName}., at No cost to PTC LLC.`;
    const noteLines = doc.splitTextToSize(noteText, contentWidth);
    noteLines.forEach(line => {
      doc.text(line, leftMargin, y);
      y += 5;
    });

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Certification of Welder Performance Qualification', leftMargin, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    const scopeText2 = 'PTC LLC Senior Surveyor / Authorized Inspector shall witness the following to certify the Welders Performance Qualification against approved welding procedures.';
    const scope2Lines = doc.splitTextToSize(scopeText2, contentWidth);
    scope2Lines.forEach(line => {
      doc.text(line, leftMargin, y);
      y += 5;
    });

    y += 2;
    const bullets2 = [
      '• Witness of Welders performance Qualification Tests (WQT)',
      '• Review of RT films and endorse NDT Reports',
      '• Review and endorse of Welders Qualification Certificates.'
    ];

    bullets2.forEach(bullet => {
      doc.text(bullet, leftMargin + 2, y);
      y += 5;
    });
  }

  function drawPage4(doc, img, pageWidth, pageHeight, refNo, revision, shortDate, companyName) {
    doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

    const headerBottom = drawHeader(doc, refNo, revision, shortDate, 4, 18);

    let y = headerBottom + 12;
    const leftMargin = 15;
    const rightMargin = 195;
    const contentWidth = rightMargin - leftMargin;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Reviewing of WPS/PQR and Renewal Welder Performance Qualification', leftMargin, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    const bullets = [
      '• Review of Existing Welding Procedure Qualification and endorsing Welding Procedure Specification.',
      '• Renewal of Welder / Welding Operator Performance Qualification.',
      `• Renewal of Welder / Welding Operator Performance Qualification shall be based on records submitted by ${companyName} LLC QC personnel for that Welder / Welding Operator for that welding process within the past six months.`
    ];

    bullets.forEach(bullet => {
      const bulletLines = doc.splitTextToSize(bullet, contentWidth - 5);
      bulletLines.forEach(line => {
        doc.text(line, leftMargin + 2, y);
        y += 5;
      });
    });

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Witness Valve Test, Material Inspection, 3.2 Certification, Lab test Witness and Painting', leftMargin, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    const valveIntro = 'PTC LLC Senior Surveyor / Authorized Inspector will witness tests / inspections and review documents related to the following activities as per applicable codes, standards and approved procedures:';
    const valveIntroLines = doc.splitTextToSize(valveIntro, contentWidth);
    valveIntroLines.forEach(line => {
      doc.text(line, leftMargin, y);
      y += 5;
    });

    y += 2;
    const valveBullets = [
      '• Witness valve pressure / functional tests, visual and dimensional inspection as per approved procedures / standards.',
      '• Material identification and review of Material Test Certificates (MTC).',
      '• Review and endorsement of EN 10204 3.2 certification and associated documentation.',
      '• Witness laboratory tests as required and review of test reports.',
      '• Witness and review of painting / coating inspection and related reports.',
      '• Review and endorse related QA/QC documentation as applicable.'
    ];

    valveBullets.forEach(bullet => {
      const bulletLines = doc.splitTextToSize(bullet, contentWidth - 5);
      bulletLines.forEach(line => {
        doc.text(line, leftMargin + 2, y);
        y += 5;
      });
    });

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. REPORTING', leftMargin, y);

    y += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const reportText1 = `PTC LLC will bring to the notice of ${companyName} any irregularity, non-conformance or deviation noticed during the execution of the above scope of work.`;
    const reportText2 = 'A detailed inspection / certification report shall be issued after completion of each activity, summarizing the observations, results and conclusions of PTC LLC based on the approved codes, standards and procedures.';

    [reportText1, reportText2].forEach(par => {
      const lines = doc.splitTextToSize(par, contentWidth);
      lines.forEach(line => {
        doc.text(line, leftMargin, y);
        y += 5;
      });
      y += 2;
    });
  }

  function drawPage5(doc, img, pageWidth, pageHeight, refNo, revision, shortDate, companyName) {
    doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

    const headerBottom = drawHeader(doc, refNo, revision, shortDate, 5, 18);

    let y = headerBottom + 12;
    const leftMargin = 15;
    const rightMargin = 195;
    const contentWidth = rightMargin - leftMargin;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('4. FEES', leftMargin, y);

    y += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const feesIntro = 'Our fees for the above scope of work are based on the following indicative rates. These may be adjusted to match the final agreed scope, duration and site conditions:';
    const feesIntroLines = doc.splitTextToSize(feesIntro, contentWidth);
    feesIntroLines.forEach(line => {
      doc.text(line, leftMargin, y);
      y += 5;
    });

    y += 3;

    const feeLines = [
      '• Senior Surveyor / Authorized Inspector day rate (within Abu Dhabi): AED ______ per day.',
      '• Day rate for work outside Abu Dhabi Emirate: AED ______ per day plus travel & accommodation at cost.',
      '• Standby rate (if Inspector is mobilized but work is not ready): 50% of the applicable day rate.',
      '• Travel, visa, accommodation and local transportation (if any) will be charged at actuals against supporting documents.',
      '• Any additional scope requested by ' + companyName + ' beyond the items listed in Section 2 will be charged based on mutually agreed rates.'
    ];

    feeLines.forEach(item => {
      const lines = doc.splitTextToSize(item, contentWidth - 5);
      lines.forEach(line => {
        doc.text(line, leftMargin + 2, y);
        y += 5;
      });
    });

    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('5. TERMS OF PAYMENT', leftMargin, y);

    y += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const payText1 = 'Invoices shall be raised upon completion of the services or at agreed milestones. All invoices will be supported with timesheets and, where applicable, copies of third-party invoices for reimbursable expenses.';
    const payText2 = 'Payment terms are thirty (30) days from the date of invoice, unless otherwise agreed in writing between PTC LLC and ' + companyName + '. All payments shall be made in AED by bank transfer to the bank account indicated on the invoice.';

    [payText1, payText2].forEach(par => {
      const lines = doc.splitTextToSize(par, contentWidth);
      lines.forEach(line => {
        doc.text(line, leftMargin, y);
        y += 5;
      });
      y += 2;
    });

    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('6. VALIDITY OF THIS PROPOSAL', leftMargin, y);

    y += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const validityText = 'This proposal, including the fees and commercial conditions stated herein, is valid for thirty (30) calendar days from the date of issue. After this period, PTC LLC reserves the right to review and revise the proposal if required.';
    const validityLines = doc.splitTextToSize(validityText, contentWidth);
    validityLines.forEach(line => {
      doc.text(line, leftMargin, y);
      y += 5;
    });

    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('7. SPECIAL CONDITIONS', leftMargin, y);

    y += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const specialLines = [
      '• This proposal is based on the understanding that all required facilities, access, utilities and safety arrangements are provided by ' + companyName + ' at no cost to PTC LLC.',
      '• All work will be carried out in accordance with applicable health, safety and environmental regulations and the site HSE requirements.',
      '• Any delays or interruptions not attributable to PTC LLC may be chargeable at the applicable standby rates.',
      '• The services are subject to PTC LLC\'s standard General Terms and Conditions of Service (Appendix A).'
    ];

    specialLines.forEach(item => {
      const lines = doc.splitTextToSize(item, contentWidth);
      lines.forEach(line => {
        doc.text(line, leftMargin, y);
        y += 5;
      });
    });
  }

  function drawPage6(doc, img, pageWidth, pageHeight, refNo, revision, shortDate, companyName, refNoAgain) {
    doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

    const headerBottom = drawHeader(doc, refNo, revision, shortDate, 6, 18);

    let y = headerBottom + 12;
    const leftMargin = 15;
    const rightMargin = 195;
    const contentWidth = rightMargin - leftMargin;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('8. IDENTIFICATION AND SIGNATURE', leftMargin, y);

    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const sigIntro = 'We trust that our proposal meets your requirements. Should you have any queries or require further clarification, please do not hesitate to contact us. We look forward to the opportunity of working with ' + companyName + '.';
    const sigIntroLines = doc.splitTextToSize(sigIntro, contentWidth);
    sigIntroLines.forEach(line => {
      doc.text(line, leftMargin, y);
      y += 5;
    });

    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('For PROMINENT TEAM CONSULTANCY LLC', leftMargin, y);

    y += 10;
    doc.setFont('helvetica', 'normal');

    const signBlockHeight = 50;
    const colWidth = (rightMargin - leftMargin) / 3;

    const roles = ['Prepared By', 'Checked By', 'Approved By'];

    for (let i = 0; i < 3; i++) {
      const x = leftMargin + i * colWidth;
      doc.rect(x, y, colWidth - 3, signBlockHeight);

      let innerY = y + 6;
      doc.setFont('helvetica', 'bold');
      doc.text(roles[i], x + 3, innerY);
      innerY += 8;

      doc.setFont('helvetica', 'normal');
      doc.text('Name : __________________________', x + 3, innerY);
      innerY += 7;
      doc.text('Position : ________________________', x + 3, innerY);
      innerY += 7;
      doc.text('Signature : ______________________', x + 3, innerY);
      innerY += 7;
      doc.text('Date : __________________________', x + 3, innerY);
    }
  }

  function drawGeneralTermsPage(doc, img, pageWidth, pageHeight, refNo, revision, shortDate, pageNum) {
    doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

    const headerBottom = drawHeader(doc, refNo, revision, shortDate, pageNum, 18);

    let y = headerBottom + 15;
    const leftMargin = 15;
    const rightMargin = 195;
    const contentWidth = rightMargin - leftMargin;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);

    if (pageNum === 7) {
      doc.text('APPENDIX A – GENERAL TERMS AND CONDITIONS OF SERVICE', leftMargin, y);
      y += 10;
    } else {
      doc.text('APPENDIX A – GENERAL TERMS AND CONDITIONS OF SERVICE (continued)', leftMargin, y);
      y += 10;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const genericText = [
      'These services are provided subject to PTC LLC\'s standard General Terms and Conditions of Service.',
      'In the event of any conflict between this proposal and the General Terms and Conditions of Service, the latter shall prevail unless specifically agreed otherwise in writing.',
      'The General Terms and Conditions cover, among other things, the definitions, application, obligations of the parties, limitation of liability, insurance, confidentiality, intellectual property, dispute resolution and governing law.',
      'A full copy of the current General Terms and Conditions of Service is deemed to be attached to, and to form an integral part of, this proposal.'
    ];

    genericText.forEach(par => {
      const lines = doc.splitTextToSize(par, contentWidth);
      lines.forEach(line => {
        doc.text(line, leftMargin, y);
        y += 5;
      });
      y += 2;
    });

    y += 5;

    const note = 'Note: In practice, the detailed wording of Appendix A can be reproduced here across pages 7 to 18, maintaining the same header format and page numbering.';
    const noteLines = doc.splitTextToSize(note, contentWidth);
    noteLines.forEach(line => {
      doc.text(line, leftMargin, y);
      y += 5;
    });
  }

  global.ProposalGenerator = {
    generatePdf,
    normalizeData,
    formatDate,
    formatDateShort
  };
})(window);

