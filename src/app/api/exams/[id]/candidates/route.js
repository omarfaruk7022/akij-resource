// src/app/api/exams/[id]/candidates/route.js
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

    console.log('[candidates] exam id:', id);
    console.log('[candidates] user id:', user.id);

    const exam = await Exam.findById(id);
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    const createdById = exam.createdBy?._id
      ? exam.createdBy._id.toString()
      : exam.createdBy?.toString();

    console.log('[candidates] createdById:', createdById, '| user.id:', user.id, '| match:', createdById === user.id);

    if (createdById !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const submissions = await Submission.find({ exam: id })
      .populate('candidate', 'name email')
      .sort({ submittedAt: -1 });

    console.log('[candidates] found submissions:', submissions.length);

    return NextResponse.json({ success: true, submissions, exam });
  } catch (error) {
    // Log full error — visible in Vercel/server function logs
    console.error('[candidates] ERROR name:', error.name);
    console.error('[candidates] ERROR message:', error.message);
    console.error('[candidates] ERROR stack:', error.stack);

    return NextResponse.json(
      {
        error: 'Internal server error',
        // Temporarily expose in response so you can see it without log access
        detail: error.message,
        name: error.name,
      },
      { status: 500 }
    );
  }
}