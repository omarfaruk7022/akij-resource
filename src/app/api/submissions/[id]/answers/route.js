import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Submission from '@/lib/models/Submission';
import { getTokenFromRequest } from '@/lib/utils/authMiddleware';
import { verifyToken } from '@/lib/utils/jwt';

// PUT /api/submissions/[id]/answers – save answers during exam
export async function PUT(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'candidate') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const { answers } = await request.json();

    const submission = await Submission.findById(id);
    if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    if (submission.candidate.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (submission.status === 'submitted') {
      return NextResponse.json({ error: 'Exam already submitted' }, { status: 409 });
    }

    submission.answers = answers;
    await submission.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save answers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
