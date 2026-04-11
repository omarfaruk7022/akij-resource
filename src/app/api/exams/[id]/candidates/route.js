import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Exam from '@/lib/models/Exam';
import Submission from '@/lib/models/Submission';
import { getTokenFromRequest } from '@/lib/utils/authMiddleware';
import { verifyToken } from '@/lib/utils/jwt';

export async function GET(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'employer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const exam = await Exam.findById(id);
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    if (exam.createdBy.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const submissions = await Submission.find({ exam: id })
      .populate('candidate', 'name email')
      .sort({ submittedAt: -1 });

    return NextResponse.json({ success: true, submissions, exam });
  } catch (error) {
    console.error('GET candidates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
