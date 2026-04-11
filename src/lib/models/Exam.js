import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['radio', 'checkbox', 'text'], required: true },
  options: [{ type: String, trim: true }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed }, // string or array for checkbox
  marks: { type: Number, default: 1 },
  negativeMark: { type: Number, default: 0 },
});

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  totalCandidates: { type: Number, required: true, min: 1 },
  totalSlots: { type: Number, required: true, min: 1 },
  questionSets: { type: Number, required: true, default: 1 },
  questionType: {
    type: String,
    enum: ['radio', 'checkbox', 'text', 'mixed'],
    required: true,
    default: 'radio',
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true, min: 1 }, // in minutes
  questions: [QuestionSchema],
  negativeMark: { type: Number, default: 0, min: 0 },
  negativeMarking: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['draft', 'published', 'ended'],
    default: 'draft',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  enrolledCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

// Auto-update status based on time
ExamSchema.methods.getComputedStatus = function () {
  const now = new Date();
  if (now > this.endTime) return 'ended';
  if (now >= this.startTime) return 'published';
  return 'draft';
};

export default mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
