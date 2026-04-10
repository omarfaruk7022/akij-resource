// src/app/api/submissions/[id]/behavior/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Submission from '@/lib/models/Submission';
import { getTokenFromRequest } from '@/lib/utils/authMiddleware';
import { verifyToken } from '@/lib/utils/jwt';

// POST /api/submissions/[id]/behavior – log behavioral event
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
    const { event } = await request.json();

    if (!event) return NextResponse.json({ error: 'event is required' }, { status: 400 });

    const submission = await Submission.findById(id);
    if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    if (submission.candidate.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (submission.status === 'submitted') {
      return NextResponse.json({ success: true }); // silently ignore after submit
    }

    submission.behaviorLogs.push({ event, timestamp: new Date() });

    if (event === 'tab_switch') submission.tabSwitchCount += 1;
    if (event === 'fullscreen_exit') submission.fullscreenExitCount += 1;

    await submission.save();

    return NextResponse.json({
      success: true,
      tabSwitchCount: submission.tabSwitchCount,
      fullscreenExitCount: submission.fullscreenExitCount,
    });
  } catch (error) {
    console.error('Behavior log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
