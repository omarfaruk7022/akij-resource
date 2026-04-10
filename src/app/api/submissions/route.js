// src/app/api/submissions/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Exam from '@/lib/models/Exam';
import Submission from '@/lib/models/Submission';
import { getTokenFromRequest } from '@/lib/utils/authMiddleware';
import { verifyToken } from '@/lib/utils/jwt';

// POST /api/submissions – start exam (candidate)
export async function POST(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'candidate') {
      return NextResponse.json({ error: 'Only candidates can start exams' }, { status: 403 });
    }

    await connectDB();
    const { examId } = await request.json();
    if (!examId) return NextResponse.json({ error: 'examId is required' }, { status: 400 });

    const exam = await Exam.findById(examId);
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    const now = new Date();
    if (now < exam.startTime) {
      return NextResponse.json({ error: 'Exam has not started yet' }, { status: 403 });
    }
    if (now > exam.endTime) {
      return NextResponse.json({ error: 'Exam has ended' }, { status: 403 });
    }

    // Check if already submitted
    const existing = await Submission.findOne({ exam: examId, candidate: user.id });
    if (existing) {
      if (existing.status === 'submitted') {
        return NextResponse.json({ error: 'You have already submitted this exam' }, { status: 409 });
      }
      // Resume in-progress
      return NextResponse.json({ success: true, submission: existing, resumed: true });
    }

    // Check slot availability
    const submissionCount = await Submission.countDocuments({ exam: examId });
    if (submissionCount >= exam.totalSlots) {
      return NextResponse.json({ error: 'No slots available for this exam' }, { status: 409 });
    }

    const submission = await Submission.create({
      exam: examId,
      candidate: user.id,
      answers: [],
      startedAt: now,
      status: 'in_progress',
    });

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error('Start exam error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
