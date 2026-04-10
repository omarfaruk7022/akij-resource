// src/app/api/exams/[id]/publish/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Exam from '@/lib/models/Exam';
import { getTokenFromRequest } from '@/lib/utils/authMiddleware';
import { verifyToken } from '@/lib/utils/jwt';

export async function POST(request, { params }) {
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
    if (exam.questions.length === 0) {
      return NextResponse.json({ error: 'Cannot publish exam without questions' }, { status: 400 });
    }

    exam.status = 'published';
    await exam.save();
    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error('Publish exam error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
