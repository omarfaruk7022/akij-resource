"use client";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Maximize,
  Monitor,
  ShieldAlert,
} from "lucide-react";

const instructionItems = (exam) => [
  {
    icon: Clock,
    text: `Duration: ${exam.duration} minutes`,
    color: "text-amber-500 bg-amber-50",
  },
  {
    icon: CheckCircle,
    text: `${exam.questions?.length || 0} questions total`,
    color: "text-indigo-500 bg-indigo-50",
  },
  {
    icon: AlertTriangle,
    text: exam.negativeMarking
      ? "Negative marking enabled"
      : "No negative marking",
    color: "text-red-500 bg-red-50",
  },
  {
    icon: Monitor,
    text: "Exam requires fullscreen mode",
    color: "text-blue-500 bg-blue-50",
  },
  {
    icon: ShieldAlert,
    text: "Tab switching is monitored",
    color: "text-orange-500 bg-orange-50",
  },
];

export default function InstructionScreen({ exam, onStart }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-lg w-full">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-5">
          <Monitor className="w-7 h-7 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h1>
        <p className="text-gray-500 mb-6">
          Please read the instructions carefully before starting.
        </p>

        <div className="space-y-3 mb-8">
          {instructionItems(exam).map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}
              >
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          <Maximize className="w-5 h-5" />
          Enter Fullscreen & Start Exam
        </button>
      </div>
    </div>
  );
}
