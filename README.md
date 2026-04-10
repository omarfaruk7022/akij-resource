# AssessHub – Online Assessment Platform

Full-stack online assessment platform built with Next.js 16.1.6, MongoDB, Zustand, React Query, React Hook Form + Zod, and Tailwind CSS.

## Setup

1. Install dependencies: `npm install`
2. Create `.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017/assessment_platform
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```
3. Run: `npm run dev`
4. Visit: http://localhost:3000

## Demo Credentials
- Employer: employer@demo.com / demo123
- Candidate: candidate@demo.com / demo123

## Features
- Employer: Create exams (multi-step), manage questions (radio/checkbox/text), view submissions with behavioral flags
- Candidate: Take timed exams, fullscreen enforcement, tab-switch detection, auto-submit, instant results

## Security
- JWT in httpOnly cookies, bcrypt passwords, role-based guards, exam time-window validation, copy/paste disabled, behavior tracking
