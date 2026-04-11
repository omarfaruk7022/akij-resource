// src/app/api/submissions/[id]/submit/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Exam from '@/lib/models/Exam';
import Submission from '@/lib/models/Submission';
import { getTokenFromRequest } from '@/lib/utils/authMiddleware';
import { verifyToken } from '@/lib/utils/jwt';

function scoreSubmission(exam, answers) {
  let score = 0;
  let totalMarks = 0;       // auto-gradable only (radio + checkbox)
  let textMarks = 0;        // text questions — excluded from auto score
  const examNegativeMark = Number(exam.negativeMark) || 0;

  const normalizeCorrectAnswers = (question) => {
    const options = question.options || [];
    const correctAnswers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : question.correctAnswer
      ? [question.correctAnswer]
      : [];

    return correctAnswers.map((answer) => {
      const index = Number(answer);
      if (Number.isInteger(index) && index >= 0 && index < options.length) {
        return options[index];
      }
      return answer;
    });
  };

  for (const question of exam.questions) {
    const qMarks = question.marks || 1;
    const qNeg = Number(question.negativeMark ?? examNegativeMark) || 0;

    // Text questions — cannot be auto-graded, track separately
    if (question.type === 'text') {
      textMarks += qMarks;
      continue;
    }

    // Only radio + checkbox count toward auto-graded total
    totalMarks += qMarks;

    const answerEntry = answers.find(
      (a) => a.questionId?.toString() === question._id?.toString()
    );

    // No answer or empty answer — skip
    if (
      !answerEntry ||
      answerEntry.answer === undefined ||
      answerEntry.answer === null ||
      answerEntry.answer === '' ||
      (Array.isArray(answerEntry.answer) && answerEntry.answer.length === 0)
    ) {
      continue;
    }

    if (question.type === 'radio') {
      const [correct] = normalizeCorrectAnswers(question);
      if (answerEntry.answer === correct) {
        score += qMarks;
      } else if (exam.negativeMarking) {
        score -= qNeg;
      }
    }

    if (question.type === 'checkbox') {
      const correct = normalizeCorrectAnswers(question).sort();
      const given = Array.isArray(answerEntry.answer)
        ? [...answerEntry.answer].sort()
        : [];
      const isCorrect = JSON.stringify(correct) === JSON.stringify(given);
      if (isCorrect) {
        score += qMarks;
      } else if (exam.negativeMarking) {
        score -= qNeg;
      }
    }
  }

  return {
    score: Math.max(0, score),
    totalMarks,   // auto-graded marks only
    textMarks,    // pending manual review
  };
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
    const { score, totalMarks, textMarks } = scoreSubmission(exam, finalAnswers);

    // percentage based only on auto-gradable marks
    // null when exam is text-only (no auto-gradable questions)
    const percentage = totalMarks > 0
      ? Math.round((score / totalMarks) * 100)
      : null;

    submission.answers       = finalAnswers;
    submission.status        = 'submitted';
    submission.submittedAt   = new Date();
    submission.autoSubmitted = autoSubmitted || false;
    submission.timeSpent     = timeSpent || 0;
    submission.score         = score;
    submission.totalMarks    = totalMarks;
    submission.percentage    = percentage;

    await submission.save();

    return NextResponse.json({
      success: true,
      submission: {
        _id:            submission._id,
        score,
        totalMarks,
        textMarks,
        percentage,
        submittedAt:    submission.submittedAt,
        autoSubmitted:  submission.autoSubmitted,
        hasTextQuestions: textMarks > 0,
      },
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}