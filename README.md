# Akij Resource

A full-stack online examination platform built with Next.js, MongoDB, and JWT authentication. Employers can create and publish exams with multiple question types; candidates can take exams in a timed, proctored environment.

---

## Features

**Employer**
- Create multi-step exams with configurable slots, question sets, and duration
- Support for MCQ (radio), multi-select (checkbox), and text-based questions
- Set negative marking, start/end times, and per-question scores
- Publish exams and monitor enrolled candidates with submission results

**Candidate**
- Browse and enroll in published exams
- Timed exam interface with auto-submit on expiry
- Behavior tracking during the exam session
- View submission status and results after completion

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | MongoDB via Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| State | Zustand |
| Data Fetching | TanStack React Query + Axios |
| Forms | React Hook Form + Zod |
| UI | Tailwind CSS v4, Radix UI, shadcn/ui |
| Icons | Lucide React |

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB** database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/omarfaruk7022/akij-resource
cd akij-resource
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run seed     # Seed demo users into the database
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # login, logout, register, me
│   │   ├── exams/         # CRUD exams, publish, candidates
│   │   └── submissions/   # answers, behavior tracking, submit
│   ├── candidate/
│   │   ├── dashboard/     # Browse & enroll in exams
│   │   └── exam/[id]/     # Exam taking interface
│   ├── employer/
│   │   ├── dashboard/     # Manage created exams
│   │   ├── create-exam/   # Multi-step exam builder
│   │   └── candidates/    # View candidate submissions
│   └── login/             # Shared login page
├── components/
│   ├── employer/          # Exam builder step components, QuestionModal
│   ├── candidate/         # Exam UI components
│   ├── shared/            # RichEditor and shared components
│   └── ui/                # Base UI components (Modal, Toast, etc.)
├── lib/
│   ├── db/                # MongoDB connection
│   ├── models/            # Mongoose models (User, Exam, Submission)
│   └── utils/             # Auth middleware, JWT helpers
├── store/                 # Zustand stores (useExamStore, etc.)
└── types/                 # TypeScript type definitions
```

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current authenticated user |

### Exams

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/exams` | Both | Employer: own exams. Candidate: published exams |
| POST | `/api/exams` | Employer | Create a new exam |
| GET | `/api/exams/[id]` | Both | Get exam detail |
| PUT | `/api/exams/[id]` | Employer | Update exam |
| DELETE | `/api/exams/[id]` | Employer | Delete exam |
| POST | `/api/exams/[id]/publish` | Employer | Publish exam |
| GET | `/api/exams/[id]/candidates` | Employer | List enrolled candidates |

### Submissions

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/submissions` | Candidate | Start a submission (enroll) |
| POST | `/api/submissions/[id]/answers` | Candidate | Save answers |
| POST | `/api/submissions/[id]/submit` | Candidate | Final submit |
| POST | `/api/submissions/[id]/behavior` | Candidate | Log behavior events |

---

## Data Models

### User
```
name, email, password (hashed), role (employer | candidate), isActive
```

### Exam
```
title, totalCandidates, totalSlots, questionSets,
questionType ([String] — radio | checkbox | text),
startTime, endTime, duration (minutes),
questions[], negativeMark, negativeMarking,
status (draft | published | ended), createdBy
```

### Submission
```
exam, candidate, answers[], status, autoSubmitted,
behaviorLog[], submittedAt
```

---

## Deployment

### Build for production

```bash
npm run build
npm run start
```

### Environment notes for production

- Set `NODE_ENV=production` in your environment
- Use a strong, unique `JWT_SECRET`
- Ensure your MongoDB Atlas cluster allows connections from your server's IP
- Update `NEXT_PUBLIC_APP_URL` to your production domain

---

## Additional Questions

### MCP (Model Context Protocol) Integration

I have not worked with MCP directly. However, here is how it could meaningfully improve this project:

**Figma MCP** — Connect Figma directly to the development environment so the exam builder UI components (question cards, step indicators, modals) could be generated or updated from design files without manually translating layouts into code. This would keep the UI in sync with design specs automatically.

**Supabase MCP** — If the project were migrated from MongoDB to Supabase, an MCP integration could allow AI assistants to query the database schema, generate typed API calls, and scaffold new routes by reading the actual live schema — eliminating guesswork when building new features.

**Chrome DevTools MCP** — During development, Chrome DevTools MCP could allow an AI assistant to inspect network requests, read console errors, and diagnose runtime issues in the exam-taking interface directly, without manually copying error logs.

---

### AI Tools for Development

The following tools were used or are recommended for speeding up frontend development:

**Claude (claude.ai)** — Used throughout this project for component scaffolding, debugging Mongoose schema issues, writing Zod validation, and generating this README. Particularly effective for reasoning about multi-step form state and API contract design.

**GitHub Copilot** — Useful for inline autocompletion when writing repetitive patterns like form field registration, API route handlers, and Tailwind class combinations.

**ChatGPT** — Helpful for quickly looking up library-specific patterns (e.g. React Hook Form + Zod integration, TanStack Query mutation setup) when documentation is unclear.

**Recommended workflow:**
1. Use Claude for architecture decisions, debugging, and writing larger code blocks
2. Use Copilot for in-editor completion while implementing
3. Use AI to generate seed data, mock responses, and test cases

---

### Offline Mode

If a candidate loses internet during an exam, the following strategy would be applied:

**1. Detect connectivity loss**
Use the browser's `navigator.onLine` and the `online`/`offline` events to detect when the connection drops. Show a visible banner immediately so the candidate knows they are offline.

**2. Save answers locally**
All answer changes are written to `localStorage` in real time as the candidate selects options. The key would be scoped to the submission ID so it survives page reloads.

```
// On every answer change
localStorage.setItem(`exam_answers_${submissionId}`, JSON.stringify(answers));
```

**3. Continue the exam uninterrupted**
The exam timer runs client-side using `Date.now()` against the stored start time, so it keeps counting even without a connection. The candidate can continue answering all questions offline.

**4. Queue API calls and sync on reconnect**
When the connection is restored, all locally saved answers are flushed to the server via `/api/submissions/[id]/answers`. If the exam timer has already expired during the offline period, an auto-submit is triggered immediately on reconnect.

**5. Final submit guard**
If the candidate hits Submit while offline, the action is queued. A `beforeunload` listener warns them not to close the tab. Once online, the queued submit fires automatically.

This approach ensures no answers are lost and the exam experience is not broken by temporary network issues.

---

## Live Demo

> https://akij-resource.muhammadomarfaruk.com/

## Video Recording
> https://www.youtube.com/watch?v=bpAz3ViSncc
> https://drive.google.com/file/d/1ZFGFIyx3H5UNrBsVvzCqXf3klWfVXjXk/view?usp=sharing



