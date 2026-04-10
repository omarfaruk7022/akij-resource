'use client';
// src/app/employer/exams/page.jsx
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';

export default function ExamsPage() {
  // Just redirect to dashboard which has the exams list
  if (typeof window !== 'undefined') {
    window.location.replace('/employer/dashboard');
  }
  return null;
}
