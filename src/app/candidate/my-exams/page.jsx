'use client';
// src/app/candidate/my-exams/page.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyExamsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/candidate/dashboard'); }, [router]);
  return null;
}
