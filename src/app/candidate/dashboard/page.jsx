'use client';
// src/app/candidate/dashboard/page.jsx
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Clock, BookOpen, AlertTriangle, Play, Calendar, CheckCircle } from 'lucide-react';
import Topbar from '@/components/shared/Topbar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDate, formatDuration } from '@/lib/utils/helpers';

async function fetchAvailableExams() {
  const res = await axios.get('/api/exams', { withCredentials: true });
  return res.data.exams;
}

function ExamCard({ exam, onStart }) {
  const now = new Date();
  const start = new Date(exam.startTime);
  const end = new Date(exam.endTime);
  const isActive = now >= start && now <= end;
  const isUpcoming = now < start;
  const isEnded = now > end;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header stripe */}
      <div className={`h-1.5 ${isActive ? 'bg-emerald-500' : isUpcoming ? 'bg-blue-500' : 'bg-gray-300'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="font-semibold text-gray-900 text-base leading-snug">{exam.title}</h3>
          {isActive && <Badge variant="success" dot>Live</Badge>}
          {isUpcoming && <Badge variant="info" dot>Upcoming</Badge>}
          {isEnded && <Badge variant="gray" dot>Ended</Badge>}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{formatDuration(exam.duration)}</p>
              <p className="text-xs text-gray-400">Duration</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{exam.questionSets}</p>
              <p className="text-xs text-gray-400">Question Sets</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{exam.negativeMarking ? 'Yes' : 'No'}</p>
              <p className="text-xs text-gray-400">Negative Marks</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-xs leading-tight">{formatDate(exam.startTime).split(',')[0]}</p>
              <p className="text-xs text-gray-400">Start Date</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-50 pt-4">
          {isActive ? (
            <Button
              fullWidth
              size="md"
              icon={<Play className="w-4 h-4" />}
              onClick={() => onStart(exam._id)}
            >
              Start Exam
            </Button>
          ) : isUpcoming ? (
            <div className="text-center text-sm text-gray-500 py-1">
              Starts {formatDate(exam.startTime)}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-1">
              <CheckCircle className="w-4 h-4" /> Exam Ended
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CandidateDashboard() {
  const router = useRouter();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['candidate-exams'],
    queryFn: fetchAvailableExams,
    refetchInterval: 30000, // refresh every 30s to catch newly started exams
  });

  const handleStart = (examId) => {
    router.push(`/candidate/exam/${examId}`);
  };

  const active = exams.filter((e) => e.computedStatus === 'active');
  const upcoming = exams.filter((e) => e.computedStatus === 'upcoming');
  const ended = exams.filter((e) => e.computedStatus === 'ended');

  return (
    <div className="p-6 space-y-6">
      <Topbar title="My Exams" subtitle="View and take your assigned assessments" />

      <div className="pt-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-72 animate-pulse" />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No exams available</h3>
            <p className="text-gray-500 text-sm">Check back later for assigned assessments.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Live Now ({active.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {active.map((exam) => (
                    <ExamCard key={exam._id} exam={exam} onStart={handleStart} />
                  ))}
                </div>
              </section>
            )}

            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Upcoming ({upcoming.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {upcoming.map((exam) => (
                    <ExamCard key={exam._id} exam={exam} onStart={handleStart} />
                  ))}
                </div>
              </section>
            )}

            {ended.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Past Exams ({ended.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {ended.map((exam) => (
                    <ExamCard key={exam._id} exam={exam} onStart={handleStart} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
