// src/lib/models/Submission.js
import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answer: { type: mongoose.Schema.Types.Mixed }, // string or string[]
});

const BehaviorLogSchema = new mongoose.Schema({
  event: { type: String }, // 'tab_switch', 'fullscreen_exit', 'copy', 'paste'
  timestamp: { type: Date, default: Date.now },
  count: { type: Number, default: 1 },
});

const SubmissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [AnswerSchema],
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  autoSubmitted: { type: Boolean, default: false },
  score: { type: Number },
  totalMarks: { type: Number },
  percentage: { type: Number },
  status: {
    type: String,
    enum: ['in_progress', 'submitted'],
    default: 'in_progress',
  },
  behaviorLogs: [BehaviorLogSchema],
  tabSwitchCount: { type: Number, default: 0 },
  fullscreenExitCount: { type: Number, default: 0 },
  timeSpent: { type: Number }, // in seconds
}, { timestamps: true });

// Unique constraint: one submission per candidate per exam
SubmissionSchema.index({ exam: 1, candidate: 1 }, { unique: true });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
