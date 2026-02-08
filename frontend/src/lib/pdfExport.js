import jsPDF from 'jspdf';

/**
 * PDF Export Configuration
 *
 * CRITICAL FIX: Consistent spacing between ALL questions
 * - Previous implementation: questionSpacing = 3, sectionSpacing = 5 (total: 8 after each section's last question)
 * - New implementation: questionSpacing = 4 uniformly, no extra section spacing
 * - This eliminates visible gaps between questions in sections with few items
 */
const PDF_CONFIG = {
  margin: 15,
  pageHeight: 297, // A4 in mm
  pageWidth: 210,  // A4 in mm

  // Spacing (in mm)
  titleToSubheading: 8,
  subheadingToTimestamp: 8,
  timestampToContent: 10,
  sectionHeaderHeight: 8,
  sectionHeaderToQuestions: 6,

  // CRITICAL FIX: Consistent spacing between ALL questions
  questionSpacing: 4,  // Reduced from 3+5=8 in prototype

  // Line heights
  lineHeight: 5,
  answerLineHeight: 5,
  timestampHeight: 5,

  // Colors
  colors: {
    primary: [102, 51, 255],    // Purple
    gray: [100, 100, 100],
    green: [76, 175, 80],        // Completed indicator
    blue: [33, 150, 243],        // Completed text
    lightGray: [150, 150, 150],  // Not completed
    white: [255, 255, 255]
  },

  // Font sizes
  fonts: {
    title: 18,
    subheading: 14,
    sectionHeader: 12,
    body: 10,
    timestamp: 8,
    conditionalText: 9
  }
};

/**
 * Check if we need a page break and add one if necessary
 * @param {jsPDF} doc - jsPDF instance
 * @param {number} yPos - Current Y position
 * @param {number} heightNeeded - Height needed for next element
 * @param {number} pageHeight - Page height
 * @param {number} margin - Page margin
 * @returns {number} - New Y position (either current or reset to margin if page break added)
 */
function checkPageBreak(doc, yPos, heightNeeded, pageHeight, margin) {
  if (yPos + heightNeeded > pageHeight - margin) {
    doc.addPage();
    return margin;
  }
  return yPos;
}

/**
 * Format timestamp to readable string
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} - Formatted timestamp
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return `${dateStr}, ${timeStr}`;
}

/**
 * Format answer based on question type
 * @param {Object} question - Question object
 * @returns {string} - Formatted answer
 */
function formatAnswer(question) {
  if (!question.completed) {
    return 'Not Completed';
  }

  switch (question.questionType) {
    case 'yesNo':
    case 'dropdown':
      return question.answer || 'Completed';

    case 'textInput':
      return question.answer || 'Completed';

    case 'dateInput':
      if (question.answer) {
        const date = new Date(question.answer);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      return 'Completed';

    case 'numberInput':
      return question.answer?.toString() || 'Completed';

    case 'checkbox':
    default:
      return 'Completed';
  }
}

/**
 * Add title section with client name as subheading
 * @param {jsPDF} doc - jsPDF instance
 * @param {string} clientName - Client name
 * @param {number} yPos - Current Y position
 * @param {number} margin - Page margin
 * @returns {number} - New Y position
 */
function addTitle(doc, clientName, yPos, margin) {
  let yPosition = yPos;

  // Main title: "Tableau Cloud Migration"
  doc.setFontSize(PDF_CONFIG.fonts.title);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...PDF_CONFIG.colors.primary);
  doc.text('Tableau Cloud Migration', margin, yPosition);
  yPosition += PDF_CONFIG.titleToSubheading;

  // Subheading: Client Name
  const clientNameText = clientName || 'Client Name Not Provided';
  doc.setFontSize(PDF_CONFIG.fonts.subheading);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(clientNameText, margin, yPosition);
  yPosition += PDF_CONFIG.subheadingToTimestamp;

  // Timestamp
  doc.setFontSize(PDF_CONFIG.fonts.body);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...PDF_CONFIG.colors.gray);
  const now = new Date();
  const timestamp = `Generated: ${now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })}, ${now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}`;
  doc.text(timestamp, margin, yPosition);
  yPosition += PDF_CONFIG.timestampToContent;

  return yPosition;
}

/**
 * Add General Information section (formerly "Client Information")
 * @param {jsPDF} doc - jsPDF instance
 * @param {Object} clientInfo - Client information object
 * @param {number} yPos - Current Y position
 * @param {number} margin - Page margin
 * @param {number} maxWidth - Maximum width for text
 * @returns {number} - New Y position
 */
function addGeneralInfoSection(doc, clientInfo, yPos, margin, maxWidth) {
  let yPosition = yPos;

  // Section header
  yPosition = checkPageBreak(doc, yPosition, 15, PDF_CONFIG.pageHeight, margin);
  doc.setFillColor(...PDF_CONFIG.colors.primary);
  doc.rect(margin, yPosition - 5, maxWidth, PDF_CONFIG.sectionHeaderHeight, 'F');
  doc.setTextColor(...PDF_CONFIG.colors.white);
  doc.setFontSize(PDF_CONFIG.fonts.sectionHeader);
  doc.setFont(undefined, 'bold');
  doc.text('General Information', margin + 2, yPosition);
  yPosition += PDF_CONFIG.sectionHeaderToQuestions + 5;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(PDF_CONFIG.fonts.body);
  doc.setFont(undefined, 'normal');

  // Define fields to display
  const fields = [
    { label: 'Region', value: clientInfo?.region },
    {
      label: 'Go-Live Date',
      value: clientInfo?.goLiveDate ? new Date(clientInfo.goLiveDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : null
    },
    { label: 'Tableau Server URL', value: clientInfo?.serverUrl },
    { label: 'Server Version', value: clientInfo?.serverVersion },
    { label: 'Primary Contact', value: clientInfo?.primaryContact }
  ];

  // Render each field
  fields.forEach(field => {
    if (field.value) {
      yPosition = checkPageBreak(doc, yPosition, 10, PDF_CONFIG.pageHeight, margin);

      doc.setFont(undefined, 'bold');
      doc.text(`${field.label}:`, margin + 2, yPosition);

      doc.setFont(undefined, 'normal');
      const valueLines = doc.splitTextToSize(field.value, maxWidth - 50);
      valueLines.forEach((line, index) => {
        if (index > 0) {
          yPosition = checkPageBreak(doc, yPosition, PDF_CONFIG.lineHeight, PDF_CONFIG.pageHeight, margin);
        }
        doc.text(line, margin + 50, yPosition);
        if (index < valueLines.length - 1) {
          yPosition += PDF_CONFIG.lineHeight;
        }
      });

      yPosition += PDF_CONFIG.lineHeight + 1;
    }
  });

  yPosition += 5; // Extra space after General Information section

  return yPosition;
}

/**
 * Add a question section
 * @param {jsPDF} doc - jsPDF instance
 * @param {string} sectionName - Section name
 * @param {Array} questions - Array of question objects
 * @param {number} yPos - Current Y position
 * @param {number} margin - Page margin
 * @param {number} maxWidth - Maximum width for text
 * @returns {number} - New Y position
 */
function addQuestionSection(doc, sectionName, questions, yPos, margin, maxWidth) {
  let yPosition = yPos;

  // Section header
  yPosition = checkPageBreak(doc, yPosition, 15, PDF_CONFIG.pageHeight, margin);
  doc.setFillColor(...PDF_CONFIG.colors.primary);
  doc.rect(margin, yPosition - 5, maxWidth, PDF_CONFIG.sectionHeaderHeight, 'F');
  doc.setTextColor(...PDF_CONFIG.colors.white);
  doc.setFontSize(PDF_CONFIG.fonts.sectionHeader);
  doc.setFont(undefined, 'bold');
  doc.text(sectionName, margin + 2, yPosition);
  yPosition += PDF_CONFIG.sectionHeaderToQuestions + 5;

  doc.setTextColor(0, 0, 0);

  // Render each question
  questions.forEach((question, index) => {
    yPosition = checkPageBreak(doc, yPosition, 20, PDF_CONFIG.pageHeight, margin);

    // Question number and text
    doc.setFontSize(PDF_CONFIG.fonts.body);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}.`, margin, yPosition);

    const questionLines = doc.splitTextToSize(question.questionText, maxWidth - 10);
    questionLines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        yPosition = checkPageBreak(doc, yPosition, PDF_CONFIG.lineHeight, PDF_CONFIG.pageHeight, margin);
      }
      doc.text(line, margin + 5, yPosition);
      yPosition += PDF_CONFIG.lineHeight;
    });

    // Answer
    const answer = formatAnswer(question);
    doc.setFont(undefined, 'normal');

    // Green circle for completed
    if (question.completed) {
      doc.setFillColor(...PDF_CONFIG.colors.green);
      doc.circle(margin + 5.5, yPosition - 1.5, 1, 'F');
    }

    // Answer text (blue if completed, gray if not)
    doc.setTextColor(
      ...(question.completed ? PDF_CONFIG.colors.blue : PDF_CONFIG.colors.lightGray)
    );

    const answerLines = doc.splitTextToSize(answer, maxWidth - 10);
    answerLines.forEach((line, lineIndex) => {
      yPosition = checkPageBreak(doc, yPosition, PDF_CONFIG.answerLineHeight, PDF_CONFIG.pageHeight, margin);
      const xOffset = lineIndex === 0 && question.completed ? margin + 8 : margin + 5;
      doc.text(line, xOffset, yPosition);
      yPosition += PDF_CONFIG.answerLineHeight;
    });

    doc.setTextColor(0, 0, 0);

    // Conditional text input (if present)
    if (question.metadata?.hasConditionalInput && question.metadata?.conditionalText) {
      yPosition += 2;
      doc.setFontSize(PDF_CONFIG.fonts.conditionalText);
      doc.setTextColor(...PDF_CONFIG.colors.gray);
      const conditionalLines = doc.splitTextToSize(
        `  └─ ${question.metadata.conditionalText}`,
        maxWidth - 15
      );
      conditionalLines.forEach(line => {
        yPosition = checkPageBreak(doc, yPosition, 4, PDF_CONFIG.pageHeight, margin);
        doc.text(line, margin + 10, yPosition);
        yPosition += 4;
      });
      doc.setFontSize(PDF_CONFIG.fonts.body);
      doc.setTextColor(0, 0, 0);
    }

    // Conditional date (if present)
    if (question.metadata?.hasConditionalDate && question.metadata?.conditionalDate) {
      yPosition += 2;
      doc.setFontSize(PDF_CONFIG.fonts.conditionalText);
      doc.setTextColor(...PDF_CONFIG.colors.gray);
      const date = new Date(question.metadata.conditionalDate);
      const dateStr = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      doc.text(`  └─ Date: ${dateStr}`, margin + 10, yPosition);
      yPosition += 4;
      doc.setFontSize(PDF_CONFIG.fonts.body);
      doc.setTextColor(0, 0, 0);
    }

    // Timestamp
    if (question.timestamp) {
      doc.setFontSize(PDF_CONFIG.fonts.timestamp);
      doc.setTextColor(...PDF_CONFIG.colors.gray);
      yPosition = checkPageBreak(doc, yPosition, PDF_CONFIG.timestampHeight, PDF_CONFIG.pageHeight, margin);
      const formattedTimestamp = formatTimestamp(question.timestamp);
      doc.text(`Answered: ${formattedTimestamp}`, margin + 5, yPosition);
      yPosition += PDF_CONFIG.timestampHeight;
      doc.setFontSize(PDF_CONFIG.fonts.body);
      doc.setTextColor(0, 0, 0);
    }

    // CRITICAL FIX: Consistent spacing between questions
    // No conditional spacing - always 4 units
    yPosition += PDF_CONFIG.questionSpacing;
  });

  // CRITICAL FIX: Remove extra spacing after section
  // (prototype had +5 here, causing gaps)

  return yPosition;
}

/**
 * Add additional notes section
 * @param {jsPDF} doc - jsPDF instance
 * @param {string} notes - Additional notes text
 * @param {number} yPos - Current Y position
 * @param {number} margin - Page margin
 * @param {number} maxWidth - Maximum width for text
 * @returns {number} - New Y position
 */
function addAdditionalNotes(doc, notes, yPos, margin, maxWidth) {
  if (!notes || notes.trim() === '') {
    return yPos;
  }

  let yPosition = yPos;

  // Section header
  yPosition = checkPageBreak(doc, yPosition, 15, PDF_CONFIG.pageHeight, margin);
  doc.setFillColor(...PDF_CONFIG.colors.primary);
  doc.rect(margin, yPosition - 5, maxWidth, PDF_CONFIG.sectionHeaderHeight, 'F');
  doc.setTextColor(...PDF_CONFIG.colors.white);
  doc.setFontSize(PDF_CONFIG.fonts.sectionHeader);
  doc.setFont(undefined, 'bold');
  doc.text('Additional Notes', margin + 2, yPosition);
  yPosition += PDF_CONFIG.sectionHeaderToQuestions + 5;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(PDF_CONFIG.fonts.body);
  doc.setFont(undefined, 'normal');

  // Split and render notes
  const noteLines = doc.splitTextToSize(notes, maxWidth - 4);
  noteLines.forEach(line => {
    yPosition = checkPageBreak(doc, yPosition, PDF_CONFIG.lineHeight, PDF_CONFIG.pageHeight, margin);
    doc.text(line, margin + 2, yPosition);
    yPosition += PDF_CONFIG.lineHeight;
  });

  return yPosition;
}

/**
 * Sanitize filename by replacing special characters
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9-_]/g, '_');
}

/**
 * Generate PDF filename
 * @param {string} clientName - Client name
 * @returns {string} - Formatted filename
 */
function generateFilename(clientName) {
  const sanitizedName = sanitizeFilename(clientName || 'Client');
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${sanitizedName}_Tableau_Migration_Checklist_${date}.pdf`;
}

/**
 * Main function to generate and download migration PDF
 * @param {Object} migration - Migration object with clientInfo and questions
 * @throws {Error} - If migration data is invalid
 */
export async function generateMigrationPDF(migration) {
  if (!migration) {
    throw new Error('Migration data is required');
  }

  if (!migration.questions || !Array.isArray(migration.questions)) {
    throw new Error('Migration must have questions array');
  }

  try {
    // Initialize PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const maxWidth = PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2);
    let yPosition = PDF_CONFIG.margin;

    // Add title with client name as subheading
    yPosition = addTitle(
      doc,
      migration.clientInfo?.clientName,
      yPosition,
      PDF_CONFIG.margin
    );

    // Add General Information section
    yPosition = addGeneralInfoSection(
      doc,
      migration.clientInfo,
      yPosition,
      PDF_CONFIG.margin,
      maxWidth
    );

    // Group questions by section
    const questionsBySection = {};
    migration.questions.forEach(question => {
      const section = question.section || 'Other';
      if (!questionsBySection[section]) {
        questionsBySection[section] = [];
      }
      questionsBySection[section].push(question);
    });

    // Sort sections (optional - maintain order from data)
    const sections = Object.keys(questionsBySection);

    // Add each question section
    sections.forEach(sectionName => {
      const sectionQuestions = questionsBySection[sectionName];
      yPosition = addQuestionSection(
        doc,
        sectionName,
        sectionQuestions,
        yPosition,
        PDF_CONFIG.margin,
        maxWidth
      );
    });

    // Add additional notes if present
    if (migration.additionalNotes) {
      yPosition = addAdditionalNotes(
        doc,
        migration.additionalNotes,
        yPosition,
        PDF_CONFIG.margin,
        maxWidth
      );
    }

    // Generate filename and save
    const filename = generateFilename(migration.clientInfo?.clientName);
    doc.save(filename);

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}
