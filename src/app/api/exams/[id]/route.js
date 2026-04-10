// src/app/api/exams/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Exam from '@/lib/models/Exam';
import { getTokenFromRequest } from '@/lib/utils/authMiddleware';
import { verifyToken } from '@/lib/utils/jwt';

function authGuard(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/exams/[id]
export async function GET(request, { params }) {
  try {
    const user = authGuard(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const exam = await Exam.findById(id).populate('createdBy', 'name email');
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    // Candidates can only see questions during active window
    if (user.role === 'candidate') {
      const now = new Date();
      if (now < exam.startTime) {
        return NextResponse.json({ error: 'Exam has not started yet' }, { status: 403 });
      }
      if (now > exam.endTime) {
        return NextResponse.json({ error: 'Exam has ended' }, { status: 403 });
      }
    } else if (user.role === 'employer' && exam.createdBy._id.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error('GET exam error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/exams/[id]
export async function PUT(request, { params }) {
  try {
    const user = authGuard(request);
    if (!user || user.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const exam = await Exam.findById(id);
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    if (exam.createdBy.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ['title', 'totalCandidates', 'totalSlots', 'questionSets', 'questionType', 'startTime', 'endTime', 'duration', 'questions', 'negativeMarking', 'status'];
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) exam[field] = body[field];
    });

    await exam.save();
    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error('PUT exam error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/exams/[id]
export async function DELETE(request, { params }) {
  try {
    const user = authGuard(request);
    if (!user || user.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const exam = await Exam.findById(id);
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    if (exam.createdBy.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await exam.deleteOne();
    return NextResponse.json({ success: true, message: 'Exam deleted' });
  } catch (error) {
    console.error('DELETE exam error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
