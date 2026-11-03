# SyllabiSync

### AI-Powered Academic Information Management

SyllabiSync is a student-focused application that transforms course syllabus information into an organized academic planning system. Instead of manually extracting assignments, deadlines, grading information, and course schedules from multiple syllabi, users can upload their course materials and organize the information within one platform.

## Problem

Students often receive important academic information in unstructured syllabus documents. Extracting deadlines, assignment weights, lecture schedules, and other course information manually can be time-consuming and makes it easy to miss important information.

SyllabiSync was designed to reduce this information-management burden by transforming syllabus documents into structured academic information that students can organize and use throughout the semester.

## How It Works

```text
Course Syllabus
       ↓
Document Upload
       ↓
Information Extraction
       ↓
Structured Academic Data
       ↓
Course / Assignment / Lecture Organization
       ↓
Calendar & Academic Planning
```

## Key Features

- Upload and process syllabus documents
- Extract information from PDF, DOCX, and TXT files
- Organize courses and course information
- Manage assignments and deadlines
- Store assignment weights, categories, priorities, and estimated workload
- Organize lecture schedules and locations
- Support academic planning through structured course information
- Generate and manage course-related data through a local database

## Information System Design

SyllabiSync was designed around the idea of converting **unstructured academic information into structured, actionable information**.

The system separates information into entities such as:

- **Classes**
- **Assignments**
- **Lectures**
- **Settings**

Relationships between these entities allow information extracted from course materials to be organized and connected within the application.

## System Architecture

```text
┌─────────────────────────┐
│       React Client      │
│     Vite + UI Layer     │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│      Express Server     │
│        API Layer        │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│   Document Processing   │
│ PDF / DOCX / TXT Input  │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│      SQLite Database    │
│ Classes / Assignments   │
│ Lectures / Settings     │
└─────────────────────────┘

        ↘ Google GenAI ↙
       AI-assisted processing
```

## Technology Stack

**Frontend**
- React
- Vite
- Tailwind CSS

**Backend**
- Node.js
- Express
- TypeScript

**AI**
- Google GenAI

**Data**
- SQLite
- better-sqlite3

**Document Processing**
- PDF parsing
- DOCX extraction
- TXT processing

## Why I Built It

SyllabiSync was developed as part of **DH301: Advanced Generative AI**. The project allowed me to explore how generative AI can be applied to a practical information-management problem rather than using AI only as a conversational tool.

The project also introduced me to designing the flow between **unstructured documents, information extraction, structured data, and user-facing organization**.

## Future Development

Potential future improvements include:

- More robust syllabus information extraction
- Improved validation of extracted dates and assignment information
- Additional calendar integrations
- User accounts and cloud-based synchronization
- Improved handling of conflicting or ambiguous syllabus information
- Usability testing with students
- Expanded academic planning and recommendation features

## Project Status

This project is a functional academic project and prototype demonstrating the application of generative AI and information management to student planning.
