import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Exam from '@/lib/models/Exam';
import Submission from '@/lib/models/Submission';
import { getTokenFromRequest } from '@/lib/utils/authMiddleware';
import { verifyToken } from '@/lib/utils/jwt';

function authGuard(request, requiredRole) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  if (requiredRole && decoded.role !== requiredRole) return null;
  return decoded;
}

// GET /api/exams – list exams
// employer: their own exams | candidate: all published exams
export async function GET(request) {
  try {
    const user = authGuard(request, null);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    let exams;
    if (user.role === 'employer') {
      exams = await Exam.find({ createdBy: user.id })
        .select('-questions')
        .sort({ createdAt: -1 });
    } else {
      // Candidates see published exams. The exam start API still enforces the active window.
      exams = await Exam.find({
        status: 'published',
      })
        .sort({ startTime: 1 });
    }

    let submissionMap = new Map();
    if (user.role === 'candidate' && exams.length > 0) {
      const submissions = await Submission.find({
        candidate: user.id,
        exam: { $in: exams.map((exam) => exam._id) },
      }).select('exam status autoSubmitted submittedAt');

      submissionMap = new Map(
        submissions.map((submission) => [submission.exam.toString(), submission])
      );
    }

    // Add computed status
    const examsWithStatus = exams.map((exam) => {
      const obj = exam.toObject();
      const now = new Date();
      const normalizedNegativeMark =
        typeof obj.negativeMark === 'number'
          ? obj.negativeMark
          : typeof obj.negativeMark === 'string' && obj.negativeMark.trim() !== ''
          ? Number(obj.negativeMark) || 0
          : Array.isArray(obj.questions) && obj.questions.length > 0
          ? Number(obj.questions[0]?.negativeMark) || 0
          : 0;

      if (now > exam.endTime) obj.computedStatus = 'ended';
      else if (now >= exam.startTime) obj.computedStatus = 'active';
      else obj.computedStatus = 'upcoming';
      obj.negativeMark = normalizedNegativeMark;
      obj.negativeMarking = normalizedNegativeMark > 0;

      if (user.role === 'candidate') {
        const submission = submissionMap.get(exam._id.toString());
        obj.hasCompleted = submission?.status === 'submitted';
        obj.submissionStatus = submission?.status || null;
        obj.autoSubmitted = submission?.autoSubmitted || false;
        obj.submittedAt = submission?.submittedAt || null;
      }

      if (Array.isArray(obj.questions)) {
        obj.questionCount = obj.questions.length;
        delete obj.questions;
      }
      return obj;
    });

    return NextResponse.json({ success: true, exams: examsWithStatus });
  } catch (error) {
    console.error('GET exams error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/exams – create exam (employer only)
export async function POST(request) {
  try {
    const user = authGuard(request, 'employer');
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { title, totalCandidates, totalSlots, questionSets, questionType, startTime, endTime, duration, questions, negativeMark, negativeMarking } = body;

    if (!title || !totalCandidates || !totalSlots || !startTime || !endTime || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (new Date(endTime) <= new Date(startTime)) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    const normalizedNegativeMark = Math.max(0, Number(negativeMark) || 0);

    const exam = await Exam.create({
      title,
      totalCandidates,
      totalSlots,
      questionSets: questionSets || 1,
      questionType: questionType || 'radio',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      questions: questions || [],
      negativeMark: normalizedNegativeMark,
      negativeMarking: normalizedNegativeMark > 0 || negativeMarking || false,
      createdBy: user.id,
      status: 'draft',
    });

    return NextResponse.json({ success: true, exam }, { status: 201 });
  } catch (error) {
    console.error('POST exam error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
