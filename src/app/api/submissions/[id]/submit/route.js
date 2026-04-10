// src/app/api/submissions/[id]/submit/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Exam from '@/lib/models/Exam';
import Submission from '@/lib/models/Submission';
import { getTokenFromRequest } from '@/lib/utils/authMiddleware';
import { verifyToken } from '@/lib/utils/jwt';

function scoreSubmission(exam, answers) {
  let score = 0;
  let totalMarks = 0;

  for (const question of exam.questions) {
    const qMarks = question.marks || 1;
    const qNeg = question.negativeMark || 0;
    totalMarks += qMarks;

    const answerEntry = answers.find((a) => a.questionId?.toString() === question._id?.toString());
    if (!answerEntry || answerEntry.answer === undefined || answerEntry.answer === null || answerEntry.answer === '') continue;

    if (question.type === 'text') {
      // Text questions require manual grading – give 0 for now
      continue;
    }

    if (question.type === 'radio') {
      if (answerEntry.answer === question.correctAnswer) {
        score += qMarks;
      } else if (exam.negativeMarking) {
        score -= qNeg;
      }
    }

    if (question.type === 'checkbox') {
      const correct = Array.isArray(question.correctAnswer) ? [...question.correctAnswer].sort() : [];
      const given = Array.isArray(answerEntry.answer) ? [...answerEntry.answer].sort() : [];
      const isCorrect = JSON.stringify(correct) === JSON.stringify(given);
      if (isCorrect) {
        score += qMarks;
      } else if (exam.negativeMarking) {
        score -= qNeg;
      }
    }
  }

  return { score: Math.max(0, score), totalMarks };
}

// POST /api/submissions/[id]/submit
export async function POST(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'candidate') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { answers, autoSubmitted, timeSpent } = body;

    const submission = await Submission.findById(id).populate('exam');
    if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    if (submission.candidate.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (submission.status === 'submitted') {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 });
    }

    const exam = await Exam.findById(submission.exam._id || submission.exam);
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    const finalAnswers = answers || submission.answers;
    const { score, totalMarks } = scoreSubmission(exam, finalAnswers);
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    submission.answers = finalAnswers;
    submission.status = 'submitted';
    submission.submittedAt = new Date();
    submission.autoSubmitted = autoSubmitted || false;
    submission.timeSpent = timeSpent || 0;
    submission.score = score;
    submission.totalMarks = totalMarks;
    submission.percentage = percentage;

    await submission.save();

    return NextResponse.json({
      success: true,
      submission: {
        _id: submission._id,
        score,
        totalMarks,
        percentage,
        submittedAt: submission.submittedAt,
        autoSubmitted: submission.autoSubmitted,
      },
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
