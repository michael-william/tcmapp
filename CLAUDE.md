# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file HTML application called "Tableau Cloud Migration Prerequisite Questions - Pro". It's a self-contained interactive checklist tool for managing Tableau Cloud migration projects with no build process or external dependencies.

## Architecture

**Single-File Application**: The entire application exists in `tableau-migration-checklist-pro.html` containing:
- Embedded CSS styles (lines 8-988)
- HTML structure (lines 990-1101)
- Inline JavaScript application logic (lines 1103-2095)
- Hardcoded questions array at line 1104 containing all 54 migration questions

**Data Persistence**: Uses browser localStorage with three keys:
- `tableauMigrationQuestionsPro` - stores question completion state and answers
- `tableauMigrationClientInfoPro` - stores client project metadata
- `tableauMigrationAdditionalNotes` - stores free-form notes

**Question Types**: The application supports multiple input types defined by flags in the questions array:
- Standard checkbox questions (default)
- `isTextInput` - multi-line text areas for detailed responses
- `isDateInput` - date picker inputs
- `isDropdown` - dropdown select menus
- `isYesNo` - radio button Yes/No selections (with optional custom options via `yesNoOptions`)
- `hasConditionalInput` - shows text field when main question is completed
- `hasConditionalDate` - shows date field when Yes/No answer is "Yes"
- `isFullWidth` - spans entire grid width

**External Dependencies**:
- jsPDF library (CDN: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js) - for PDF export
- InterWorks logo image reference: `IWstacked-%23ffffff.png` (local file)

## Key Functionality

**Section Management**: Questions are organized into sections (Security, Communications, Stakeholders, Access & Connectivity, Tableau Server, Pre Flight Checks, Tableau Cloud, Tableau Bridge, Cloud Data Sources). Sections are collapsible and track completion progress.

**Search & Filtering** (lines 1199-1219):
- Text search across questions and sections
- Filter by section dropdown
- Filter by status (all/unanswered/answered)

**PDF Export** (lines 1828-2078):
- Generates comprehensive PDF report with client info, progress stats, and all answered questions
- Filename format: `{ClientName}_Tableau_Migration_Checklist_{Date}.pdf`

**Special Logic**:
- Tableau Bridge section: Questions are conditionally hidden if first question ("Do you require the use of Tableau Bridge?") is answered "No" (lines 1270-1276)

## Development Notes

**No Build Process**: This is a static HTML file. Open directly in browser or serve via simple HTTP server. No compilation, transpilation, or bundling required.

**Testing**: Manual testing in browser only. No automated test suite exists.

**State Management**: All question state updates trigger `saveProgress()` function which persists to localStorage. Progress is loaded on page load via `loadQuestions()` (line 2094).

**Modifying Questions**: The questions array starts at line 1104 as a single-line JavaScript array. Each question object can include properties: `section`, `question`, `completed`, `timestamp`, plus any of the question type flags mentioned above.
